import { Paragraph } from 'components/ui/Paragraphs'
import { getConfig } from 'config'
import { MedicationAdministration, MedicationRequest } from 'fhir/r4'
import { mapToDate } from 'mappers/dates'
import { getCodes, getMedicationDate } from 'mappers/medication'
import { fetchMedicationAdministration, fetchMedicationRequest } from 'services/aphp/callApi'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { PatientState } from 'state/patient'
import { CohortMedication } from 'types'
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
import { Direction, MedicationFilters, Order, SearchCriterias } from 'types/searchCriterias'
import { CellType, Column, Row, Table } from 'types/table'
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
  const config = getConfig().features
  const fetchersMap: Record<string, () => Promise<FhirItem[] | undefined>> = {
    encounterStatusList: () =>
      !additionalInfo.encounterStatusList
        ? fetchValueSet(getConfig().core.valueSets.encounterStatus.url)
        : Promise.resolve(undefined),
    prescriptionList: () =>
      !additionalInfo.prescriptionList
        ? getCodeList(config.medication.valueSets.medicationPrescriptionTypes.url).then((res) => res.results)
        : Promise.resolve(undefined),
    administrationList: () =>
      !additionalInfo.administrationList
        ? getCodeList(config.medication.valueSets.medicationAdministrations.url).then((res) => res.results)
        : Promise.resolve(undefined)
  }
  const resolved = await resolveAdditionalInfos(fetchersMap)
  const references: Reference[] = getValueSetsFromSystems([
    getConfig().features.medication.valueSets.medicationAtc.url,
    getConfig().features.medication.valueSets.medicationUcd.url
  ])
  const sourceType = SourceType.MEDICATION
  return { ...additionalInfo, references, sourceType, ...resolved }
}

const initSearchCriterias = (search: string): SearchCriterias<MedicationFilters> => ({
  orderBy: {
    orderBy: Order.PERIOD_START,
    orderDirection: Direction.DESC
  },
  searchInput: search,
  filters: {
    ipp: '',
    nda: '',
    administrationRoutes: [],
    prescriptionTypes: [],
    code: [],
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
  type: ResourceType.MEDICATION_ADMINISTRATION | ResourceType.MEDICATION_REQUEST
): Table => {
  const rows: Row[] = []
  const columns: Column[] = [
    !isPatient && { label: `IPP${deidentified ? ' chiffré' : ''}` },
    { label: `NDA${deidentified ? ' chiffré' : ''}` },
    { label: 'Date', code: Order.PERIOD_START },
    { label: 'Code ATC', code: Order.MEDICATION_ATC, align: 'center' },
    { label: 'Code UCD', code: Order.MEDICATION_UCD, align: 'center' },
    type === ResourceType.MEDICATION_REQUEST && {
      label: 'Type de prescription',
      code: Order.PRESCRIPTION_TYPES
    },
    { label: "Voie d'administration", code: Order.ADMINISTRATION_MODE },
    type === ResourceType.MEDICATION_ADMINISTRATION && { label: 'Quantité', align: 'center' },
    { label: 'Unité exécutrice' },
    type === ResourceType.MEDICATION_ADMINISTRATION && !deidentified && { label: 'Commentaire' }
  ].filter((elem) => elem) as Column[]

  ;(data as ExplorationResults<CohortMedication<MedicationRequest | MedicationAdministration>>).list?.forEach(
    (elem) => {
      const date = getMedicationDate(type, elem)
      const [codeATC, displayATC, , codeATCSystem] = getCodes(
        elem,
        getConfig().features.medication.valueSets.medicationAtc.url,
        getConfig().features.medication.valueSets.medicationAtcOrbis.url
      )
      const atcDisplay: Paragraph[] = [
        { text: `${codeATC === 'No matching concept' || codeATC === 'Non Renseigné' ? '' : codeATC ?? ''}` },
        { text: `${displayATC === 'No matching concept' ? '-' : displayATC ?? '-'}`, sx: { fontWeight: 900 } },
        { text: `${codeATCSystem ?? 'Non renseigné'}` }
      ]
      const [codeUCD, displayUCD, , codeUCDSystem] = getCodes(
        elem,
        getConfig().features.medication.valueSets.medicationUcd.url,
        '.*-ucd'
      )
      const ucdDisplay: Paragraph[] = [
        { text: `${codeUCD === 'No matching concept' || codeUCD === 'Non Renseigné' ? '' : codeUCD ?? ''}` },
        { text: `${displayUCD === 'No matching concept' ? '-' : displayUCD ?? '-'}`, sx: { fontWeight: 900 } },
        { text: `${codeUCDSystem ?? 'Non renseigné'}` }
      ]
      const prescriptionType = (elem as MedicationRequest).category?.[0].coding?.[0].display ?? '-'
      const administrationRoute =
        (elem as MedicationRequest).dosageInstruction?.[0]?.route?.coding?.[0]?.display ??
        (elem as MedicationAdministration).dosage?.route?.coding?.[0]?.display
      const quantity = ` ${(elem as MedicationAdministration)?.dosage?.dose?.value ?? '-'} ${
        (elem as MedicationAdministration).dosage?.dose?.unit ?? '-'
      }`
      const comment = (elem as MedicationAdministration).dosage?.text ?? 'Non renseigné'
      const row: Row = [
        !isPatient && {
          id: `${elem}-ipp`,
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
          id: `${elem.id}-date`,
          value: date ? mapToDate(date) : 'Non renseigné',
          type: CellType.TEXT
        },
        {
          id: `${elem.id}-atc`,
          value: atcDisplay,
          type: CellType.PARAGRAPHS,
          align: 'center'
        },
        {
          id: `${elem.id}-ucd`,
          value: ucdDisplay,
          type: CellType.PARAGRAPHS,
          align: 'center'
        },
        type === ResourceType.MEDICATION_REQUEST && {
          id: `${elem.id}-prescription`,
          value: prescriptionType,
          type: CellType.TEXT
        },
        {
          id: `${elem.id}-administration`,
          value: administrationRoute === 'No matching concept' ? '-' : administrationRoute ?? '-',
          type: CellType.TEXT,
          align: 'center'
        },
        type === ResourceType.MEDICATION_ADMINISTRATION && {
          id: `${elem.id}-unit`,
          value: quantity,
          type: CellType.TEXT
        },
        {
          id: `${elem.id}-executiveUnits`,
          value: elem.serviceProvider ?? '-',
          type: CellType.TEXT
        },
        type === ResourceType.MEDICATION_ADMINISTRATION &&
          !deidentified && {
            id: `${elem.id}-comment`,
            value: comment.split('\n').map((elem) => ({ text: elem })),
            type: CellType.MODAL,
            align: 'center'
          }
      ].filter((elem) => elem) as Row
      rows.push(row)
    }
  )
  return { columns, rows }
}

const getMedicationFilters = (
  { nda, ipp, executiveUnits, encounterStatus, durationRange, code }: MedicationFilters,
  fetchParams: FetchParams,
  patient: PatientState,
  groupId: string[]
) => ({
  encounter: nda,
  ipp: ipp,
  executiveUnits: executiveUnits.map((unit) => unit.id),
  encounterStatus: encounterStatus.map(({ id }) => id),
  minDate: durationRange[0] ?? '',
  maxDate: durationRange[1] ?? '',
  code: code.map((code) => encodeURI(`${code.system}|${code.id}`)).join(','),
  uniqueFacet: ['subject'],
  subject: patient?.patientInfo?.id,
  ...getCommonParamsList(fetchParams, groupId)
})

const fetchAdministrationList = (
  fetchParams: FetchParams,
  { filters }: FetchOptions<MedicationFilters>,
  patient: PatientState,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal
): Promise<ExplorationResults<MedicationAdministration>> => {
  const { administrationRoutes } = filters
  const params = {
    type: administrationRoutes?.map((type) => type.id),
    ...getMedicationFilters(filters, fetchParams, patient, groupId),
    signal
  }
  const paramsFetchAll = {
    uniqueFacet: ['subject'],
    minDate: null,
    maxDate: null,
    subject: patient?.patientInfo?.id,
    ...getCommonParamsAll(groupId),
    signal
  }
  return fetcherWithParams(
    () => fetchMedicationAdministration(params),
    () => fetchMedicationAdministration(paramsFetchAll),
    { ...fetchParams, filters, deidentified, patient, groupId }
  )
}

const fetchRequestList = (
  fetchParams: FetchParams,
  { filters }: FetchOptions<MedicationFilters>,
  patient: PatientState,
  deidentified: boolean,
  groupId: string[],
  signal?: AbortSignal
): Promise<ExplorationResults<MedicationRequest>> => {
  const { prescriptionTypes } = filters
  const params = {
    type: prescriptionTypes?.map((type) => type.id),
    ...getMedicationFilters(filters, fetchParams, patient, groupId),
    signal
  }
  const paramsFetchAll = {
    uniqueFacet: ['subject'],
    minDate: null,
    maxDate: null,
    subject: patient?.patientInfo?.id,
    ...getCommonParamsAll(groupId),
    signal
  }
  return fetcherWithParams(
    () => fetchMedicationRequest(params),
    () => fetchMedicationRequest(paramsFetchAll),
    { ...fetchParams, filters, deidentified, patient, groupId }
  )
}

export const medicationRequestConfig = (
  deidentified: boolean,
  patient: PatientState,
  groupId: string[],
  displayOptions = DISPLAY_OPTIONS,
  search = ''
): ExplorationConfig<MedicationFilters> => ({
  type: ResourceType.MEDICATION_REQUEST,
  deidentified,
  displayOptions,
  initSearchCriterias: () => initSearchCriterias(search),
  fetchList: (fetchParams, options, signal) =>
    fetchRequestList(fetchParams, options, patient, deidentified, groupId, signal),
  mapToTable: (data) => mapToTable(data, deidentified, !!patient, groupId, ResourceType.MEDICATION_REQUEST),
  narrowSearchCriterias: (searchCriterias) =>
    narrowSearchCriterias(deidentified, searchCriterias, !!patient, ['administrationRoutes'], ['searchBy']),
  fetchAdditionalInfos,
  getCount: (counts) => [
    { label: 'prescription(s)', display: true, count: counts[0] },
    { label: 'patient(s)', display: !!!patient, count: counts[1] }
  ]
})

export const medicationAdministrationConfig = (
  deidentified: boolean,
  patient: PatientState,
  groupId: string[],
  displayOptions = DISPLAY_OPTIONS,
  search = ''
): ExplorationConfig<MedicationFilters> => ({
  type: ResourceType.MEDICATION_ADMINISTRATION,
  deidentified,
  displayOptions,
  initSearchCriterias: () => initSearchCriterias(search),
  fetchList: (fetchParams, options, signal) =>
    fetchAdministrationList(fetchParams, options, patient, deidentified, groupId, signal),
  mapToTable: (data) => mapToTable(data, deidentified, !!patient, groupId, ResourceType.MEDICATION_ADMINISTRATION),
  narrowSearchCriterias: (searchCriterias) =>
    narrowSearchCriterias(deidentified, searchCriterias, !!patient, ['prescriptionTypes'], ['searchBy']),
  fetchAdditionalInfos,
  getCount: (counts) => [
    { label: 'administration(s)', display: true, count: counts[0] },
    { label: 'patient(s)', display: !!!patient, count: counts[1] }
  ]
})
