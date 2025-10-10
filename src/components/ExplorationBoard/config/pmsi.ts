import { getConfig } from 'config'
import { plural } from 'utils/string'
import { Condition } from 'fhir/r4'
import { mapToDate } from 'mappers/dates'
import { getPmsiCodes, getPmsiDate } from 'mappers/pmsi'
import { fetchClaimList, fetchConditionList, fetchProcedureList } from 'services/aphp/servicePmsi'
import { PatientState } from 'state/patient'
import { CohortPMSI } from 'types'
import { AdditionalInfo, Data, DISPLAY_OPTIONS, ExplorationConfig, ExplorationResults } from 'types/exploration'
import { PMSIResourceTypes, ResourceType } from 'types/requestCriterias'
import { SourceType } from 'types/scope'
import { Direction, Order, PMSIFilters, SearchCriterias } from 'types/searchCriterias'
import { CellType, Column, Row, Table } from 'types/table'
import { FhirItem, Reference } from 'types/valueSet'
import { fetchValueSet, narrowSearchCriterias, resolveAdditionalInfos } from 'utils/exploration'
import { getCategory } from 'utils/fhir'
import { getValueSetsFromSystems } from 'utils/valueSets'

const fetchAdditionalInfos = async (additionalInfo: AdditionalInfo): Promise<AdditionalInfo> => {
  const fetchersMap: Record<string, () => Promise<FhirItem[] | undefined>> = {
    diagnosticTypesList: () =>
      !additionalInfo.diagnosticTypesList
        ? fetchValueSet(getConfig().features.condition.valueSets.conditionStatus.url)
        : Promise.resolve(undefined),
    encounterStatusList: () =>
      !additionalInfo.encounterStatusList
        ? fetchValueSet(getConfig().core.valueSets.encounterStatus.url)
        : Promise.resolve(undefined)
  }
  const resolved = await resolveAdditionalInfos(fetchersMap)
  return { ...additionalInfo, ...resolved }
}

const initSearchCriterias = (search: string): SearchCriterias<PMSIFilters> => ({
  orderBy: {
    orderBy: Order.DATE,
    orderDirection: Direction.DESC
  },
  searchInput: search,
  filters: {
    ipp: '',
    nda: '',
    code: [],
    diagnosticTypes: [],
    source: [],
    durationRange: [null, null],
    executiveUnits: [],
    encounterStatus: []
  }
})

const mapToTable = (
  data: Data,
  deidentified: boolean,
  isPatient: boolean,
  groupId: string[],
  type: PMSIResourceTypes
): Table => {
  const rows: Row[] = []
  const columns: Column[] = [
    !isPatient && { label: `IPP${deidentified ? ' chiffré' : ''}` },
    { label: `NDA${deidentified ? ' chiffré' : ''}` },
    { label: 'Codage le', code: Order.DATE },
    { label: 'source' },
    { label: 'Code', code: Order.CODE },
    { label: 'Libellé' },
    type === ResourceType.CONDITION && { label: 'Type' },
    { label: 'Unité exécutrice' }
  ].filter((elem) => elem) as Column[]
  ;(data as ExplorationResults<CohortPMSI>).list?.forEach((elem) => {
    const hasDiagnosticType = type === ResourceType.CONDITION
    const date = getPmsiDate(type, elem)
    const codes = getPmsiCodes(type, elem)
    const row: Row = [
      !isPatient && {
        id: `${elem.id}-ipp`,
        value: elem.IPP
          ? {
              label: elem.IPP,
              url: `/patients/${elem.idPatient}${groupId ? `?groupId=${groupId}` : ''}`
            }
          : 'Non renseigné',
        type: elem.IPP ? CellType.LINK : CellType.TEXT
      },
      {
        id: `${elem.id}-nda`,
        value: elem.NDA ?? 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-codage`,
        value: date ? mapToDate(date) : 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-source`,
        value: elem.meta?.source ?? 'Non renseigné',
        type: CellType.TEXT,
        sx: { fontWeight: 700, fontSize: 12 }
      },
      {
        id: `${elem.id}-code`,
        value: codes.code ?? 'Non renseigné',
        type: CellType.TEXT,
        sx: { fontWeight: 700, fontSize: 12 }
      },
      {
        id: `${elem.id}-display`,
        value: codes.display ?? 'Non renseigné',
        type: CellType.TEXT,
        sx: { fontWeight: 700, fontSize: 12 }
      },
      hasDiagnosticType && {
        id: `${elem.id}-type`,
        value:
          getCategory(
            elem as Condition,
            getConfig().features.condition.valueSets.conditionStatus.url
          )?.coding?.[0]?.code?.toUpperCase() ?? '-',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-executiveUnits`,
        value: elem.serviceProvider ?? '-',
        type: CellType.TEXT
      }
    ].filter((elem) => elem) as Row
    rows.push(row)
  })
  return { columns, rows }
}

const getMessages = () => [
  "Les données AREM sont disponibles pour la période du 07/12/2009 jusqu'à la dernière période validée pour l'année courante dans le Datalake et la base centrale de l'EDS, à savoir avec un décalage d’environ 1-2 mois. Contrairement à la source ORBIS, les données provenant d'AREM sont décalées. Ce décalage d’environ 2 mois est lié au temps de traitement pour la phase de codification et de vérification par l'équipe DIM (Département d'Information Médicale)."
]

export const conditionConfig = (
  deidentified: boolean,
  patient: PatientState,
  groupId: string[],
  displayOptions = DISPLAY_OPTIONS,
  search = ''
): ExplorationConfig<PMSIFilters> => ({
  type: ResourceType.CONDITION,
  deidentified,
  displayOptions,
  initSearchCriterias: () => initSearchCriterias(search),
  fetchList: (fetchParams, options, signal) =>
    fetchConditionList(fetchParams, options, patient, deidentified, groupId, signal),
  mapToTable: (data) => mapToTable(data, deidentified, !!patient, groupId, ResourceType.CONDITION),
  getMessages,
  narrowSearchCriterias: (searchCriterias) =>
    narrowSearchCriterias(deidentified, searchCriterias, !!patient, [], ['searchBy']),
  fetchAdditionalInfos: async (infos) => {
    const _infos = await fetchAdditionalInfos(infos)
    const references: Reference[] = getValueSetsFromSystems([
      getConfig().features.condition.valueSets.conditionHierarchy.url
    ])
    const sourceType = SourceType.CIM10
    return { ..._infos, references, sourceType }
  },
  getCount: (counts) => [
    { label: `diagnostic${plural(counts[0].total)} CIM10`, display: true, count: counts[0] },
    { label: `patient${plural(counts[1].total)}`, display: !!!patient, count: counts[1] }
  ]
})

export const procedureConfig = (
  deidentified: boolean,
  patient: PatientState,
  groupId: string[],
  displayOptions = DISPLAY_OPTIONS,
  search = ''
): ExplorationConfig<PMSIFilters> => ({
  type: ResourceType.PROCEDURE,
  deidentified,
  displayOptions,
  initSearchCriterias: () => initSearchCriterias(search),
  fetchList: (fetchParams, options, signal) =>
    fetchProcedureList(fetchParams, options, patient, deidentified, groupId, signal),
  mapToTable: (data) => mapToTable(data, deidentified, !!patient, groupId, ResourceType.PROCEDURE),
  getMessages,
  narrowSearchCriterias: (searchCriterias) =>
    narrowSearchCriterias(deidentified, searchCriterias, !!patient, ['diagnosticTypes'], ['searchBy']),
  fetchAdditionalInfos: async (infos) => {
    const _infos = await fetchAdditionalInfos(infos)
    const references: Reference[] = getValueSetsFromSystems([
      getConfig().features.procedure.valueSets.procedureHierarchy.url
    ])
    const sourceType = SourceType.CCAM
    return { ..._infos, references, sourceType }
  },
  getCount: (counts) => [
    { label: `acte${plural(counts[0].total)} CCAM`, display: true, count: counts[0] },
    { label: `patient${plural(counts[1].total)}`, display: !!!patient, count: counts[1] }
  ]
})

export const claimConfig = (
  deidentified: boolean,
  patient: PatientState,
  groupId: string[],
  displayOptions = DISPLAY_OPTIONS,
  search = ''
): ExplorationConfig<PMSIFilters> => ({
  type: ResourceType.CLAIM,
  deidentified,
  displayOptions,
  initSearchCriterias: () => initSearchCriterias(search),
  fetchList: (fetchParams, options, signal) =>
    fetchClaimList(fetchParams, options, patient, deidentified, groupId, signal),
  mapToTable: (data) => mapToTable(data, deidentified, !!patient, groupId, ResourceType.CLAIM),
  narrowSearchCriterias: (searchCriterias) =>
    narrowSearchCriterias(deidentified, searchCriterias, !!patient, ['diagnosticTypes', 'source'], ['searchBy']),
  fetchAdditionalInfos: async (infos) => {
    const _infos = await fetchAdditionalInfos(infos)
    const references: Reference[] = getValueSetsFromSystems([getConfig().features.claim.valueSets.claimHierarchy.url])
    const sourceType = SourceType.GHM
    return { ..._infos, references, sourceType }
  },
  getCount: (counts) => [
    { label: 'GHM', display: true, count: counts[0] },
    { label: `patient${plural(counts[1].total)}`, display: !!!patient, count: counts[1] }
  ]
})
