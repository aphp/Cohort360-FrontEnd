import { getConfig } from 'config'
import { plural } from 'utils/string'
import { Observation } from 'fhir/r4'
import { formatValueRange } from 'mappers/biology'
import { mapToDate } from 'mappers/dates'
import { fetchObservation } from 'services/aphp/callApi'
import { PatientState } from 'state/patient'
import { CohortObservation } from 'types'
import {
  AdditionalInfo,
  Data,
  DISPLAY_OPTIONS,
  ExplorationConfig,
  ExplorationResults,
  FetchOptions,
  FetchParams
} from 'types/exploration'
import { ResourceType } from 'types/requestCriterias'
import { SourceType } from 'types/scope'
import { BiologyFilters, Direction, Order, SearchByTypes, SearchCriterias } from 'types/searchCriterias'
import { Table, Row, CellType, Column } from 'types/table'
import { FhirItem, Reference } from 'types/valueSet'
import {
  fetcherWithParams,
  fetchValueSet,
  getCommonParamsAll,
  getCommonParamsList,
  narrowSearchCriterias,
  resolveAdditionalInfos
} from 'utils/exploration'
import { getValueSetsFromSystems } from 'utils/valueSets'

const fetchAdditionalInfos = async (additionalInfo: AdditionalInfo): Promise<AdditionalInfo> => {
  const fetchersMap: Record<string, () => Promise<FhirItem[] | undefined>> = {
    encounterStatusList: () =>
      !additionalInfo.encounterStatusList
        ? fetchValueSet(getConfig().core.valueSets.encounterStatus.url)
        : Promise.resolve(undefined)
  }
  const resolved = await resolveAdditionalInfos(fetchersMap)
  const references: Reference[] = getValueSetsFromSystems([
    getConfig().features.observation.valueSets.biologyHierarchyAnabio.url,
    getConfig().features.observation.valueSets.biologyHierarchyLoinc.url
  ])
  const sourceType = SourceType.BIOLOGY
  return { ...additionalInfo, references, sourceType, ...resolved }
}

const initSearchCriterias = (search: string): SearchCriterias<BiologyFilters> => ({
  orderBy: {
    orderBy: Order.DATE,
    orderDirection: Direction.ASC
  },
  searchInput: search,
  searchBy: SearchByTypes.TEXT,
  filters: {
    validatedStatus: getConfig().features.observation.useObservationDefaultValidated,
    ipp: '',
    nda: '',
    code: [],
    durationRange: [null, null],
    executiveUnits: [],
    encounterStatus: []
  }
})

const mapToTable = (data: Data, deidentified: boolean, groupId: string[], isPatient: boolean): Table => {
  const appConfig = getConfig()
  const rows: Row[] = []
  const columns: Column[] = [
    !isPatient && { label: `IPP${deidentified ? ' chiffré' : ''}` },
    { label: `NDA${deidentified ? ' chiffré' : ''}` },
    { label: 'Date de prélèvement', code: Order.DATE },
    { label: 'ANABIO', code: Order.ANABIO },
    { label: 'LOINC', code: Order.LOINC },
    { label: 'Résultat', align: 'center' },
    { label: 'Valeurs de référence', align: 'center' },
    { label: 'Unité exécutrice', align: 'center' }
  ].filter((elem) => elem) as Column[]
  ;(data as ExplorationResults<CohortObservation>).list.forEach((elem) => {
    const anabio = elem.code?.coding?.find(
      (code) =>
        code.system === getConfig().features.observation.valueSets.biologyHierarchyAnabio.url &&
        (!appConfig.core.fhir.selectedCodeOnly || code.userSelected)
    )?.display
    const codeLOINC = elem.code?.coding?.find(
      (code) =>
        code.system === getConfig().features.observation.valueSets.biologyHierarchyLoinc.url &&
        (!appConfig.core.fhir.selectedCodeOnly || code.userSelected)
    )?.code
    const libelleLOINC = elem.code?.coding?.find(
      (code) =>
        code.system === getConfig().features.observation.valueSets.biologyHierarchyLoinc.url &&
        (!appConfig.core.fhir.selectedCodeOnly || code.userSelected)
    )?.display
    const result =
      elem.valueQuantity && elem.valueQuantity?.value !== null
        ? `${elem.valueQuantity?.value} ${elem.valueQuantity?.unit ?? ''}`
        : '-'
    const valueUnit = elem.valueQuantity?.unit ?? ''
    const referenceRangeArray = elem.referenceRange?.[0]
    const referenceRange = referenceRangeArray
      ? `${formatValueRange(referenceRangeArray?.low?.value, valueUnit)} - ${formatValueRange(
          referenceRangeArray?.high?.value,
          valueUnit
        )}`
      : '-'
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
        id: `${elem.id}-effectiveDatetime`,
        value: elem.effectiveDateTime ? mapToDate(elem.effectiveDateTime) : 'Non renseigné',
        type: CellType.TEXT
      },
      {
        id: `${elem.id}-anabio`,
        value: anabio === 'No matching concept' ? '-' : (anabio ?? '-'),
        type: CellType.TEXT,
        sx: { fontWeight: 900 }
      },
      {
        id: `${elem.id}-loinc`,
        value: `${codeLOINC === 'No matching concept' || codeLOINC === 'Non Renseigné' ? '' : (codeLOINC ?? '')} - ${
          libelleLOINC === 'No matching concept' ? '-' : (libelleLOINC ?? '-')
        }`,
        type: CellType.TEXT,
        sx: { fontWeight: 900 }
      },
      {
        id: `${elem.id}-result`,
        value: result,
        type: CellType.TEXT,
        align: 'center'
      },
      {
        id: `${elem.id}-valueUnit`,
        value: referenceRange,
        type: CellType.TEXT,
        align: 'center'
      },
      {
        id: `${elem.id}-executiveUnits`,
        value: elem.serviceProvider ?? '-',
        type: CellType.TEXT,
        align: 'center'
      }
    ].filter((elem) => elem) as Row
    rows.push(row)
  })
  return { columns, rows }
}

const fetchList = (
  fetchParams: FetchParams,
  { filters }: FetchOptions<BiologyFilters>,
  patient: PatientState,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal
): Promise<ExplorationResults<Observation>> => {
  const { nda, ipp, executiveUnits, encounterStatus, durationRange, code, validatedStatus } = filters
  const params = {
    encounter: nda,
    'patient-identifier': ipp,
    executiveUnits: executiveUnits.map((unit) => unit.id),
    encounterStatus: encounterStatus.map(({ id }) => id),
    uniqueFacet: ['subject'] as 'subject'[],
    minDate: durationRange[0] ?? '',
    maxDate: durationRange[1] ?? '',
    code: code.map((code) => encodeURI(`${code.system}|${code.id}`)).join(','),
    rowStatus: validatedStatus,
    subject: patient?.patientInfo?.id,
    ...getCommonParamsList(fetchParams, groupId),
    signal
  }
  const paramsFetchAll = {
    subject: patient?.patientInfo?.id,
    rowStatus: validatedStatus,
    uniqueFacet: ['subject'] as 'subject'[],
    ...getCommonParamsAll(groupId),
    signal
  }
  return fetcherWithParams(
    () => fetchObservation(params),
    () => fetchObservation(paramsFetchAll),
    { ...fetchParams, filters, deidentified, groupId, patient }
  )
}

export const biologyConfig = (
  deidentified: boolean,
  patient: PatientState,
  groupId: string[],
  displayOptions = DISPLAY_OPTIONS,
  search = ''
): ExplorationConfig<BiologyFilters> => ({
  type: ResourceType.OBSERVATION,
  displayOptions,
  deidentified,
  initSearchCriterias: () => initSearchCriterias(search),
  fetchList: (fetchParams, options, signal) => fetchList(fetchParams, options, patient, deidentified, groupId, signal),
  mapToTable: (data) => mapToTable(data, deidentified, groupId, !!patient),
  narrowSearchCriterias: (searchCriterias) =>
    narrowSearchCriterias(deidentified, searchCriterias, !!patient, [], ['searchBy']),
  fetchAdditionalInfos,
  getMessages: () => [
    "Les mesures de biologies correspondent aux codes dont l'utilisation à l'AP-HP est supérieure à 3 analyses biologiques. De plus, les résultats concernent uniquement les analyses quantitatives enregistrées sur GLIMS, qui ont été validées et mises à jour depuis mars 2020."
  ],
  getCount: (counts) => [
    { label: `résultat${plural(counts[0].total)}`, display: true, count: counts[0] },
    { label: `patient${plural(counts[1].total)}`, display: !!!patient, count: counts[1] }
  ]
})
