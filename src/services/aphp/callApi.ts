import apiFhir from '../apiFhir'
import apiDatamodel from 'services/apiDatamodel'
import {
  AccessExpiration,
  AccessExpirationsProps,
  BiologyStatus,
  FHIR_API_Promise_Response,
  FHIR_API_Response,
  FHIR_Bundle_Response,
  FHIR_Bundle_Promise_Response,
  Back_API_Response,
  Cohort,
  DataRights,
  CohortRights,
  UserAccesses
} from 'types'

import { ExportList } from 'types/export'

import { AxiosError, AxiosResponse } from 'axios'
import apiBackend from '../apiBackend'
import {
  Binary,
  CapabilityStatement,
  Claim,
  Condition,
  DiagnosticReport,
  DocumentReference,
  Encounter,
  ImagingStudy,
  Location,
  MedicationAdministration,
  MedicationRequest,
  Observation,
  OperationOutcome,
  Parameters,
  ParametersParameter,
  Patient,
  Procedure,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r4'
import {
  Direction,
  mapDocumentStatusesToRequestParam,
  Order,
  SavedFilter,
  SavedFiltersResults,
  SearchByTypes,
  Sources
} from 'types/searchCriterias'
import {
  AdministrationParamsKeys,
  ClaimParamsKeys,
  ConditionParamsKeys,
  DocumentsParamsKeys,
  ImagingParamsKeys,
  ObservationParamsKeys,
  PatientsParamsKeys,
  PrescriptionParamsKeys,
  ProcedureParamsKeys,
  QuestionnaireResponseParamsKeys,
  ResourceType
} from 'types/requestCriterias'
import { getConfig } from 'config'
import { hasSearchParam } from './serviceFhirConfig'

const paramValuesReducer = (accumulator: string, currentValue: string): string =>
  accumulator ? `${accumulator},${currentValue}` : currentValue ? currentValue : accumulator
const paramsReducer = (accumulator: string, currentValue: string): string =>
  accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator

const uniq = (item: string, index: number, array: string[]) => array.indexOf(item) === index && item

export const LOW_TOLERANCE_TAG = encodeURIComponent('https://terminology.eds.aphp.fr/text-fault-tolerant|LOW')

/**
 * Patient Resource
 *
 */

type fetchPatientProps = {
  _id?: string
  _list?: string[]
  size?: number
  offset?: number
  _sort?: string
  sortDirection?: Direction.ASC | Direction.DESC
  gender?: string | null
  minBirthdate?: number
  maxBirthdate?: number
  searchBy?: string
  _text?: string
  deceased?: boolean
  pivotFacet?: ('age-month_gender' | 'deceased_gender')[]
  _elements?: ('id' | 'gender' | 'name' | 'birthDate' | 'deceased' | 'identifier' | 'extension')[]
  deidentified?: boolean
  signal?: AbortSignal
}
export const fetchPatient = async (args: fetchPatientProps): FHIR_Bundle_Promise_Response<Patient> => {
  const {
    _id,
    size,
    offset,
    _sort,
    sortDirection,
    gender,
    _text,
    searchBy,
    deceased,
    minBirthdate,
    maxBirthdate,
    deidentified,
    signal
  } = args
  const _sortDirection = sortDirection === Direction.DESC ? '-' : ''
  let { _list, pivotFacet, _elements } = args
  const appConfig = getConfig()

  _list = _list ? _list.filter(uniq) : []
  pivotFacet = pivotFacet ? pivotFacet.filter(uniq) : []
  _elements = _elements ? _elements.filter(uniq) : []

  // By default, all the calls to `/Patient` will have 'active=true' in parameter
  let options: string[] = appConfig.core.fhir.filterActive ? ['active=true'] : []
  if (appConfig.core.fhir.totalCount) options = [...options, '_total=accurate']
  if (_id) options = [...options, `_id=${_id}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `_offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort}`]
  if (gender) options = [...options, `${PatientsParamsKeys.GENDERS}=${gender}`]
  if (_text) options = [...options, `${searchBy}=${_text}`]
  if (deceased !== undefined) options = [...options, `${PatientsParamsKeys.VITAL_STATUS}=${deceased}`]
  if (minBirthdate)
    options = [
      ...options,
      `${deidentified ? PatientsParamsKeys.DATE_DEIDENTIFIED : PatientsParamsKeys.DATE_IDENTIFIED}=ge${minBirthdate}`
    ]
  if (maxBirthdate)
    options = [
      ...options,
      `${deidentified ? PatientsParamsKeys.DATE_DEIDENTIFIED : PatientsParamsKeys.DATE_IDENTIFIED}=le${maxBirthdate}`
    ]

  if (!_id && _list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer, '')}`]
  if (appConfig.core.fhir.facetsExtensions && pivotFacet && pivotFacet.length > 0)
    options = [...options, `pivot-facet=${pivotFacet.reduce(paramValuesReducer, '')}`]
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(paramValuesReducer, '')}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<Patient>>(`/Patient?${options.reduce(paramsReducer, '')}`, {
    signal: signal
  })

  return response
}

/**
 * Encounter Resource
 *
 */

type fetchEncounterProps = {
  _id?: string
  _list?: string[]
  visit?: boolean
  size?: number
  offset?: number
  _sort?: string
  sortDirection?: Direction
  patient?: string
  status?: string[]
  facet?: ('class' | 'visit-year-month-gender-facet')[]
  _elements?: Array<keyof Encounter>
  signal?: AbortSignal
}
export const fetchEncounter = async (args: fetchEncounterProps): FHIR_Bundle_Promise_Response<Encounter> => {
  const { _id, size, offset, _sort, sortDirection, patient, visit, signal } = args
  const _sortDirection = sortDirection === Direction.DESC ? '-' : ''
  let { _list, _elements, status, facet } = args
  const appConfig = getConfig()

  _list = _list ? _list.filter(uniq) : []
  status = status ? status.filter(uniq) : []
  _elements = _elements ? _elements.filter(uniq) : []
  facet = facet ? facet.filter(uniq) : []

  // By default, all the calls to `/Encounter` will have 'subject.active=true' in parameter
  let options: string[] = appConfig.core.fhir.filterActive ? ['subject.active=true'] : []
  if (appConfig.core.fhir.totalCount) options = [...options, '_total=accurate']
  if (_id) options = [...options, `_id=${_id}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `_offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort}`]
  if (patient) options = [...options, `subject=${patient}`]

  if (!patient && _list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer, '')}`]
  if (status && status.length > 0) options = [...options, `status=${status.reduce(paramValuesReducer, '')}`]
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(paramValuesReducer, '')}`]
  if (appConfig.core.fhir.facetsExtensions && facet && facet.length > 0)
    options = [...options, `facet=${facet.reduce(paramValuesReducer, '')}`]
  if (visit !== undefined) options = [...options, `part-of:missing=${visit}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<Encounter>>(
    `/Encounter?${options.reduce(paramsReducer, '')}`,
    {
      signal: signal
    }
  )

  return response
}

/**
 * Composition Resource
 *
 */

type fetchDocumentReferenceProps = {
  signal?: AbortSignal
  _id?: string
  _list?: string[]
  size?: number
  offset?: number
  searchBy?: SearchByTypes
  _sort?: string
  sortDirection?: Direction
  type?: string
  minDate?: string
  maxDate?: string
  _text?: string
  highlight_search_results?: boolean
  docStatuses?: string[]
  patient?: string
  encounter?: string
  'encounter-identifier'?: string
  onlyPdfAvailable?: boolean
  'patient-identifier'?: string
  facet?: ('class' | 'visit-year-month-gender-facet')[]
  uniqueFacet?: 'subject'[]
  _elements?: (
    | 'docstatus'
    | 'status'
    | 'type'
    | 'subject'
    | 'encounter'
    | 'date'
    | 'title'
    | 'event'
    | 'identifier'
    | 'content'
    | 'context'
    | 'text'
    | 'description'
  )[]
  executiveUnits?: string[]
  encounterStatus?: string[]
}
// eslint-disable-next-line max-statements
export const fetchDocumentReference = async (
  args: fetchDocumentReferenceProps
): FHIR_Bundle_Promise_Response<DocumentReference> => {
  const {
    signal,
    _id,
    size,
    offset,
    searchBy,
    _sort,
    sortDirection,
    type,
    _text,
    highlight_search_results,
    docStatuses,
    patient,
    encounter,
    onlyPdfAvailable,
    minDate,
    maxDate,
    executiveUnits,
    encounterStatus
  } = args
  const docStatusCodeSystem = getConfig().core.codeSystems.docStatus
  const _sortDirection = sortDirection === Direction.DESC ? '-' : ''
  let { _list, facet, uniqueFacet, _elements } = args
  const encounterIdentifier = args['encounter-identifier']
  const patientIdentifier = args['patient-identifier']
  const appConfig = getConfig()

  _list = _list ? _list.filter(uniq) : []
  facet = facet ? facet.filter(uniq) : []
  uniqueFacet = uniqueFacet ? uniqueFacet.filter(uniq) : []
  _elements = _elements ? _elements.filter(uniq) : []

  // By default, all the calls to `/DocumentReference` will have `type:not=https://terminology.eds.aphp.fr/aphp-orbis-document-textuel-hospitalier|doc-impor`, contenttype=text/plain, and patient.active=true in parameter
  let options: string[] = [
    `type:not=${encodeURIComponent(
      'https://terminology.eds.aphp.fr/aphp-orbis-document-textuel-hospitalier|doc-impor'
    )}`,
    `contenttype=${encodeURIComponent('text/plain')}`
  ]
  if (appConfig.core.fhir.totalCount) options = [...options, '_total=accurate']
  if (appConfig.core.fhir.filterActive) options = [...options, 'patient.active=true']
  if (_id) options = [...options, `_id=${_id}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `_offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort}`]
  if (type) options = [...options, `${DocumentsParamsKeys.DOC_TYPES}=${type}`]
  if (_text)
    options = [...options, `${searchBy === SearchByTypes.TEXT ? `_text` : 'description'}=${encodeURIComponent(_text)}`]
  if (highlight_search_results)
    options = [
      ...options,
      `${
        searchBy === SearchByTypes.TEXT
          ? `_tag=${encodeURIComponent('https://terminology.eds.aphp.fr/misc|HIGHLIGHT_RESULTS')}`
          : ''
      }`
    ]
  if (docStatuses && docStatuses.length > 0) {
    const docStatusesUrl = docStatusCodeSystem
    const urlString = docStatuses
      .map((status) => `${docStatusesUrl}|${mapDocumentStatusesToRequestParam(status)}`)
      .join(',')
    options = [...options, `${DocumentsParamsKeys.DOC_STATUSES}=${encodeURIComponent(urlString)}`]
  }
  if (patient) options = [...options, `subject=${patient}`]
  if (patientIdentifier) options = [...options, `${DocumentsParamsKeys.IPP}=${patientIdentifier}`]
  if (encounter) options = [...options, `encounter=${encounter}`]
  if (encounterIdentifier) options = [...options, `${DocumentsParamsKeys.NDA}=${encounterIdentifier}`]
  if (onlyPdfAvailable) options = [...options, `contenttype=${encodeURIComponent('application/pdf')}`]
  if (minDate) options = [...options, `${DocumentsParamsKeys.DATE}=ge${minDate}`]
  if (maxDate) options = [...options, `${DocumentsParamsKeys.DATE}=le${maxDate}`]
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `${DocumentsParamsKeys.EXECUTIVE_UNITS}=${executiveUnits}`]
  if (encounterStatus && encounterStatus.length > 0)
    options = [...options, `${DocumentsParamsKeys.ENCOUNTER_STATUS}=${encounterStatus}`]

  if (!patient && _list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer, '')}`]
  if (appConfig.core.fhir.facetsExtensions && facet && facet.length > 0)
    options = [...options, `facet=${facet.reduce(paramValuesReducer, '')}`]
  if (appConfig.core.fhir.facetsExtensions && uniqueFacet && uniqueFacet.length > 0)
    options = [...options, `unique-facet=${uniqueFacet.reduce(paramValuesReducer, '')}`]
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(paramValuesReducer, '')}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<DocumentReference>>(
    `/DocumentReference?${options.reduce(paramsReducer, '')}`,
    { signal: signal }
  )

  return response
}

export const fetchCheckDocumentSearchInput = async (
  searchInput: string,
  signal?: AbortSignal
): Promise<ParametersParameter[] | undefined> => {
  const checkDocumentSearchInput = await apiFhir.get<Parameters | OperationOutcome>(
    `/DocumentReference/$text?_text=${encodeURIComponent(searchInput)}`,
    { signal: signal }
  )
  return checkDocumentSearchInput.data.resourceType === 'OperationOutcome'
    ? undefined
    : (checkDocumentSearchInput.data as Parameters).parameter
}

export const fetchDocumentReferenceContent = async (docId: string): FHIR_API_Promise_Response<DocumentReference> => {
  const documentResp = await apiFhir.get<FHIR_API_Response<DocumentReference>>(`/DocumentReference/${docId}`)

  return documentResp
}

/**
 * Fhir_Filters
 */

export const postFilters = async (
  fhir_resource: ResourceType,
  name: string,
  filter: string,
  identifying: boolean
): Promise<AxiosResponse<SavedFilter>> => {
  const res = await apiBackend.post('/cohort/fhir-filters/', {
    fhir_resource,
    fhir_version: '4.0',
    name,
    filter,
    identifying
  })
  if (res instanceof AxiosError) throw { status: res.status }
  return res
}

export const getFilters = async (
  fhir_resource: ResourceType,
  limit: number,
  offset: number,
  next?: string | null
): Promise<AxiosResponse<SavedFiltersResults>> => {
  const urlParams = next ? new URLSearchParams(next) : null

  let options: string[] = []
  options = [...options, `fhir_resource=${urlParams?.get('fhir_resource') || fhir_resource}`]
  options = [...options, `ordering=${urlParams?.get('ordering') || '-' + Order.CREATED_AT}`]
  options = [...options, `limit=${urlParams?.get('limit') || limit}`]
  options = [...options, `offset=${urlParams?.get('offset') || offset}`]
  const res = await apiBackend.get(`/cohort/fhir-filters/?${options.reduce(paramsReducer, '')}`)
  return res
}

export const deleteFilter = async (fhir_resource_uuid: string): Promise<AxiosResponse<void>> => {
  const res = await apiBackend.delete(`/cohort/fhir-filters/${fhir_resource_uuid}/`)
  return res
}

export const deleteFilters = async (fhir_resource_uuids: string[]): Promise<AxiosResponse<void>> => {
  const res = await apiBackend.delete(`/cohort/fhir-filters/delete_multiple/`, { data: { uuids: fhir_resource_uuids } })
  return res
}

export const patchFilters = async (
  fhir_resource: ResourceType,
  uuid: string,
  name: string,
  filter: string
): Promise<AxiosResponse<SavedFilter>> => {
  const res = await apiBackend.patch(`/cohort/fhir-filters/${uuid}/`, {
    fhir_resource,
    fhir_version: '4.0',
    name,
    filter
  })
  if (res instanceof AxiosError) throw { status: res.status }
  return res
}

/**
 * Binary Resource
 *
 */

type fetchBinaryProps = { _id?: string }
export const fetchBinary = async (args: fetchBinaryProps): FHIR_Bundle_Promise_Response<Binary> => {
  const { _id } = args
  let options: string[] = []

  if (_id) options = [...options, `_id=${_id}`]

  const documentResp = await apiFhir.get<FHIR_Bundle_Response<Binary>>(`/Binary?${options.reduce(paramsReducer, '')}`)

  return documentResp
}

/**
 * Procedure Resource
 *
 */

type fetchProcedureProps = {
  _list?: string[]
  size?: number
  offset?: number
  _sort?: string
  sortDirection?: Direction
  subject?: string
  code?: string
  source?: Sources[]
  minDate?: string
  maxDate?: string
  _text?: string
  status?: string
  signal?: AbortSignal
  'encounter-identifier'?: string
  'patient-identifier'?: string
  executiveUnits?: string[]
  encounterStatus?: string[]
  uniqueFacet?: string[]
}
export const fetchProcedure = async (args: fetchProcedureProps): FHIR_Bundle_Promise_Response<Procedure> => {
  const {
    size,
    offset,
    _sort,
    sortDirection,
    subject,
    code,
    source,
    _text,
    status,
    minDate,
    maxDate,
    executiveUnits,
    encounterStatus
  } = args
  const docStatusCodeSystem = getConfig().core.codeSystems.docStatus
  const _sortDirection = sortDirection === Direction.DESC ? '-' : ''
  let { _list, uniqueFacet } = args
  const encounterIdentifier = args['encounter-identifier']
  const patientIdentifier = args['patient-identifier']
  const appConfig = getConfig()

  _list = _list ? _list.filter(uniq) : []
  uniqueFacet = uniqueFacet ? uniqueFacet.filter(uniq) : []

  // By default, all the calls to `/Procedure` will have 'patient.active=true' in parameter
  let options: string[] = appConfig.core.fhir.filterActive ? ['subject.active=true'] : []
  if (appConfig.core.fhir.totalCount) options = [...options, '_total=accurate']
  if (size !== undefined) options = [...options, `_count=${size}`] // eslint-disable-line
  if (offset) options = [...options, `_offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort}`] // eslint-disable-line
  if (subject) options = [...options, `subject=${subject}`] // eslint-disable-line
  if (code) options = [...options, `${ProcedureParamsKeys.CODE}=${code}`] // eslint-disable-line
  if (appConfig.core.fhir.useSource && source?.length)
    options = [...options, `${ProcedureParamsKeys.SOURCE}=${source.join(',')}`]
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}&_tag=${LOW_TOLERANCE_TAG}`]
  if (status) options = [...options, `status=${encodeURIComponent(`${docStatusCodeSystem}|${status}`)}`]
  if (encounterIdentifier) options = [...options, `${ProcedureParamsKeys.NDA}=${encounterIdentifier}`]
  if (patientIdentifier) options = [...options, `${ProcedureParamsKeys.IPP}=${patientIdentifier}`]
  if (minDate) options = [...options, `${ProcedureParamsKeys.DATE}=ge${minDate}`]
  if (maxDate) options = [...options, `${ProcedureParamsKeys.DATE}=le${maxDate}`]
  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer, '')}`]
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `${ProcedureParamsKeys.EXECUTIVE_UNITS}=${executiveUnits}`]
  if (encounterStatus && encounterStatus.length > 0)
    options = [...options, `${ProcedureParamsKeys.ENCOUNTER_STATUS}=${encounterStatus}`]
  if (appConfig.core.fhir.facetsExtensions && uniqueFacet && uniqueFacet.length > 0)
    options = [...options, `unique-facet=${uniqueFacet.reduce(paramValuesReducer, '')}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<Procedure>>(
    `/Procedure?${options.reduce(paramsReducer, '')}`,
    {
      signal: args.signal
    }
  )

  return response
}
/**
 * Claim Resource
 *
 */

type fetchClaimProps = {
  _list?: string[]
  size?: number
  offset?: number
  _sort?: string
  sortDirection?: Direction
  patient?: string
  diagnosis?: string
  minCreated?: string
  maxCreated?: string
  _text?: string
  'encounter-identifier'?: string
  'patient-identifier'?: string
  signal?: AbortSignal
  executiveUnits?: string[]
  encounterStatus?: string[]
  uniqueFacet?: string[]
}
export const fetchClaim = async (args: fetchClaimProps): FHIR_Bundle_Promise_Response<Claim> => {
  const {
    size,
    offset,
    _sort,
    sortDirection,
    patient,
    diagnosis,
    _text,
    minCreated,
    maxCreated,
    executiveUnits,
    encounterStatus
  } = args
  const _sortDirection = sortDirection === Direction.DESC ? '-' : ''
  let { _list, uniqueFacet } = args
  const encounterIdentifier = args['encounter-identifier']
  const patientIdentifier = args['patient-identifier']
  const appConfig = getConfig()

  _list = _list ? _list.filter(uniq) : []
  uniqueFacet = uniqueFacet ? uniqueFacet.filter(uniq) : []

  // By default, all the calls to `/Claim` will have 'patient.active=true' in parameter
  let options: string[] = appConfig.core.fhir.filterActive ? ['patient.active=true'] : []
  if (appConfig.core.fhir.totalCount) options = [...options, '_total=accurate']
  if (size !== undefined) options = [...options, `_count=${size}`] // eslint-disable-line
  if (offset) options = [...options, `_offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort}`] // eslint-disable-line
  if (patient) options = [...options, `patient=${patient}`] // eslint-disable-line
  if (diagnosis) options = [...options, `${ClaimParamsKeys.CODE}=${diagnosis}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}&_tag=${LOW_TOLERANCE_TAG}`] // eslint-disable-line
  if (encounterIdentifier) options = [...options, `${ClaimParamsKeys.NDA}=${encounterIdentifier}`]
  if (patientIdentifier) options = [...options, `${ClaimParamsKeys.IPP}=${patientIdentifier}`]
  if (minCreated) options = [...options, `${ClaimParamsKeys.DATE}=ge${minCreated}`]
  if (maxCreated) options = [...options, `${ClaimParamsKeys.DATE}=le${maxCreated}`]
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `${ClaimParamsKeys.EXECUTIVE_UNITS}=${executiveUnits}`]
  if (encounterStatus && encounterStatus.length > 0)
    options = [...options, `${ClaimParamsKeys.ENCOUNTER_STATUS}=${encounterStatus}`]
  if (appConfig.core.fhir.facetsExtensions && uniqueFacet && uniqueFacet.length > 0)
    options = [...options, `unique-facet=${uniqueFacet.reduce(paramValuesReducer, '')}`]

  if (!patient && _list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer, '')}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<Claim>>(`/Claim?${options.reduce(paramsReducer, '')}`, {
    signal: args.signal
  })

  return response
}

/**
 * Condition Resource
 *
 */

type fetchConditionProps = {
  _list?: string[]
  size?: number
  offset?: number
  _sort?: Order
  sortDirection?: Direction
  subject?: string
  code?: string
  source?: Sources[]
  type?: string[]
  _text?: string
  'min-recorded-date'?: string
  'max-recorded-date'?: string
  'encounter-identifier'?: string
  'patient-identifier'?: string
  signal?: AbortSignal
  executiveUnits?: string[]
  encounterStatus?: string[]
  uniqueFacet?: string[]
}
// eslint-disable-next-line max-statements
export const fetchCondition = async (args: fetchConditionProps): FHIR_Bundle_Promise_Response<Condition> => {
  const { size, offset, _sort, sortDirection, subject, code, source, _text, executiveUnits, encounterStatus } = args
  const _sortDirection = sortDirection === Direction.DESC ? '-' : ''
  let { _list, type, uniqueFacet } = args
  const encounterIdentifier = args['encounter-identifier']
  const patientIdentifier = args['patient-identifier']
  const minRecordedDate = args['min-recorded-date']
  const maxRecordedDate = args['max-recorded-date']
  const appConfig = getConfig()
  _list = _list ? _list.filter(uniq) : []
  uniqueFacet = uniqueFacet ? uniqueFacet.filter(uniq) : []
  type = type ? type.filter(uniq) : []

  // By default, all the calls to `/Condition` will have 'patient.active=true' in parameter
  let options: string[] = appConfig.core.fhir.filterActive ? ['subject.active=true'] : []
  if (appConfig.core.fhir.totalCount) options = [...options, '_total=accurate']
  if (size !== undefined) options = [...options, `_count=${size}`] // eslint-disable-line
  if (offset !== undefined) options = [...options, `_offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort}`] // eslint-disable-line
  if (subject) options = [...options, `subject=${subject}`] // eslint-disable-line
  if (code) options = [...options, `${ConditionParamsKeys.CODE}=${code}`] // eslint-disable-line
  if (appConfig.core.fhir.useSource && source?.length) options = [...options, `${ConditionParamsKeys.SOURCE}=${source}`]
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}&_tag=${LOW_TOLERANCE_TAG}`] // eslint-disable-line
  if (encounterIdentifier) options = [...options, `${ConditionParamsKeys.NDA}=${encounterIdentifier}`] // eslint-disable-line
  if (patientIdentifier) options = [...options, `${ConditionParamsKeys.IPP}=${patientIdentifier}`]
  if (minRecordedDate) options = [...options, `${ConditionParamsKeys.DATE}=ge${minRecordedDate}`] // eslint-disable-line
  if (maxRecordedDate) options = [...options, `${ConditionParamsKeys.DATE}=le${maxRecordedDate}`] // eslint-disable-line
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `${ConditionParamsKeys.EXECUTIVE_UNITS}=${executiveUnits}`]
  if (encounterStatus && encounterStatus.length > 0)
    options = [...options, `${ConditionParamsKeys.ENCOUNTER_STATUS}=${encounterStatus}`]
  if (appConfig.core.fhir.facetsExtensions && uniqueFacet && uniqueFacet.length > 0)
    options = [...options, `unique-facet=${uniqueFacet.reduce(paramValuesReducer, '')}`]

  if (!subject && _list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer, '')}`] // eslint-disable-line
  if (hasSearchParam(ResourceType.CONDITION, ConditionParamsKeys.DIAGNOSTIC_TYPES) && type && type.length > 0) {
    const diagnosticTypesUrl = appConfig.features.condition.valueSets.conditionStatus.url + '|'
    const urlString = type.map((id) => diagnosticTypesUrl + id).join(',')
    options = [...options, `${ConditionParamsKeys.DIAGNOSTIC_TYPES}=${encodeURIComponent(urlString)}`]
  }

  const response = await apiFhir.get<FHIR_Bundle_Response<Condition>>(
    `/Condition?${options.reduce(paramsReducer, '')}`,
    {
      signal: args.signal
    }
  )

  return response
}

type fetchObservationProps = {
  id?: string
  size?: number
  offset?: number
  _sort?: string
  sortDirection?: Direction
  _text?: string
  encounter?: string
  code?: string
  subject?: string
  minDate?: string
  maxDate?: string
  _list?: string[]
  rowStatus: boolean
  signal?: AbortSignal
  executiveUnits?: string[]
  encounterStatus?: string[]
  uniqueFacet?: 'subject'[]
  'patient-identifier'?: string
}
export const fetchObservation = async (args: fetchObservationProps): FHIR_Bundle_Promise_Response<Observation> => {
  const {
    id,
    size,
    offset,
    _sort,
    sortDirection,
    _text,
    encounter,
    code,
    minDate,
    subject,
    maxDate,
    rowStatus,
    signal,
    executiveUnits,
    encounterStatus
  } = args
  const _sortDirection = sortDirection === Direction.DESC ? '-' : ''
  let { _list, uniqueFacet } = args
  const patientIdentifier = args['patient-identifier']
  const appConfig = getConfig()

  _list = _list ? _list.filter(uniq) : []
  uniqueFacet = uniqueFacet ? uniqueFacet.filter(uniq) : []

  // By default, all the calls to `/Observation` will have 'value-quantity-value=ge0,le0' and 'patient.active=true' in the parameters
  let options: string[] = []
  if (appConfig.features.observation.useObservationValueRestriction)
    options = [...options, `${ObservationParamsKeys.VALUE}=ge0,le0`]
  if (appConfig.core.fhir.filterActive) options = [...options, 'subject.active=true']
  if (appConfig.core.fhir.totalCount) options = [...options, '_total=accurate']
  if (id) options = [...options, `_id=${id}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `_offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort.includes('code') ? _sort : `${_sort}`}`]
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}&_tag=${LOW_TOLERANCE_TAG}`]
  if (encounter) options = [...options, `${ObservationParamsKeys.NDA}=${encounter}`]
  if (code) options = [...options, `${ObservationParamsKeys.CODE}=${code}`] // eslint-disable-line
  if (subject) options = [...options, `subject=${subject}`] // eslint-disable-line
  if (minDate) options = [...options, `${ObservationParamsKeys.DATE}=ge${minDate}`] // eslint-disable-line
  if (maxDate) options = [...options, `${ObservationParamsKeys.DATE}=le${maxDate}`] // eslint-disable-line
  if (appConfig.features.observation.useObservationDefaultValidated && rowStatus)
    options = [...options, `${ObservationParamsKeys.VALIDATED_STATUS}=${BiologyStatus.VALIDATED}`] // eslint-disable-line
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `${ObservationParamsKeys.EXECUTIVE_UNITS}=${executiveUnits}`]
  if (encounterStatus && encounterStatus.length > 0)
    options = [...options, `${ObservationParamsKeys.ENCOUNTER_STATUS}=${encounterStatus}`]
  if (patientIdentifier) options = [...options, `${ObservationParamsKeys.IPP}=${patientIdentifier}`]
  if (appConfig.core.fhir.facetsExtensions && uniqueFacet && uniqueFacet.length > 0)
    options = [...options, `unique-facet=${uniqueFacet.reduce(paramValuesReducer, '')}`]

  if (!subject && _list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer, '')}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<Observation>>(
    `/Observation?${options.reduce(paramsReducer, '')}`,
    {
      signal: signal
    }
  )

  return response
}

type fetchMedicationRequestProps = {
  id?: string
  size?: number
  offset?: number
  _sort?: Order
  sortDirection?: Direction
  _text?: string
  encounter?: string
  ipp?: string
  patientIds?: string
  code?: string
  subject?: string
  type?: string[]
  minDate: string | null
  maxDate: string | null
  _list?: string[]
  signal?: AbortSignal
  executiveUnits?: string[]
  encounterStatus?: string[]
  uniqueFacet?: string[]
}
export const fetchMedicationRequest = async (
  args: fetchMedicationRequestProps
): FHIR_Bundle_Promise_Response<MedicationRequest> => {
  const {
    id,
    code,
    size,
    offset,
    _sort,
    sortDirection,
    _text,
    encounter,
    ipp,
    subject,
    type,
    minDate,
    maxDate,
    signal,
    executiveUnits,
    encounterStatus
  } = args
  const _sortDirection = sortDirection === Direction.DESC ? '-' : ''
  let { _list, uniqueFacet } = args
  const appConfig = getConfig()

  _list = _list ? _list.filter(uniq) : []
  uniqueFacet = uniqueFacet ? uniqueFacet.filter(uniq) : []

  // By default, all the calls to `/MedicationRequest` will have 'patient.active=true' in parameter
  let options: string[] = appConfig.core.fhir.filterActive ? ['subject.active=true'] : []
  if (appConfig.core.fhir.totalCount) options = [...options, '_total=accurate']
  if (id) options = [...options, `_id=${id}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset !== undefined) options = [...options, `_offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort}`]
  if (subject) options = [...options, `subject=${subject}`]
  if (ipp) options = [...options, `${PrescriptionParamsKeys.IPP}=${ipp}`]
  if (encounter) options = [...options, `${PrescriptionParamsKeys.NDA}=${encounter}`]
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}&_tag=${LOW_TOLERANCE_TAG}`]
  if (type && type.length > 0) {
    const routeUrl = `${getConfig().features.medication.valueSets.medicationPrescriptionTypes.url}|`
    const urlString = type.map((id) => routeUrl + id).join(',')
    options = [...options, `${PrescriptionParamsKeys.PRESCRIPTION_TYPES}=${encodeURIComponent(urlString)}`]
  }
  if (code) options = [...options, `${PrescriptionParamsKeys.CODE}=${code}`]
  if (minDate) options = [...options, `${PrescriptionParamsKeys.DATE}=ge${minDate}`]
  if (maxDate) options = [...options, `${PrescriptionParamsKeys.DATE}=le${maxDate}`]
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `${PrescriptionParamsKeys.EXECUTIVE_UNITS}=${executiveUnits}`]
  if (encounterStatus && encounterStatus.length > 0)
    options = [...options, `${PrescriptionParamsKeys.ENCOUNTER_STATUS}=${encounterStatus}`]
  if (appConfig.core.fhir.facetsExtensions && uniqueFacet && uniqueFacet.length > 0)
    options = [...options, `unique-facet=${uniqueFacet.reduce(paramValuesReducer, '')}`]

  if (!subject && _list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer, '')}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<MedicationRequest>>(
    `/MedicationRequest?${options.reduce(paramsReducer, '')}`,
    {
      signal: signal
    }
  )

  return response
}

type fetchMedicationAdministrationProps = {
  id?: string
  size?: number
  offset?: number
  _sort?: string
  code?: string
  sortDirection?: Direction
  _text?: string
  encounter?: string
  ipp?: string
  subject?: string
  route?: string[]
  minDate: string | null
  maxDate: string | null
  _list?: string[]
  signal?: AbortSignal
  executiveUnits?: string[]
  encounterStatus?: string[]
  uniqueFacet?: string[]
}
export const fetchMedicationAdministration = async (
  args: fetchMedicationAdministrationProps
): FHIR_Bundle_Promise_Response<MedicationAdministration> => {
  const {
    id,
    code,
    size,
    offset,
    _sort,
    sortDirection,
    _text,
    encounter,
    ipp,
    subject,
    route,
    minDate,
    maxDate,
    signal,
    executiveUnits,
    encounterStatus
  } = args
  const _sortDirection = sortDirection === Direction.DESC ? '-' : ''
  let { _list, uniqueFacet } = args
  const appConfig = getConfig()

  _list = _list ? _list.filter(uniq) : []
  uniqueFacet = uniqueFacet ? uniqueFacet.filter(uniq) : []

  // By default, all the calls to `/MedicationAdministration` will have 'patient.active=true' in parameter
  let options: string[] = appConfig.core.fhir.filterActive ? ['subject.active=true'] : []
  if (appConfig.core.fhir.totalCount) options = [...options, '_total=accurate']
  if (id) options = [...options, `_id=${id}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `_offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort}`]
  if (subject) options = [...options, `subject=${subject}`]
  if (ipp) options = [...options, `${AdministrationParamsKeys.IPP}=${ipp}`]
  if (encounter) options = [...options, `${AdministrationParamsKeys.NDA}=${encounter}`]
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}&_tag=${LOW_TOLERANCE_TAG}`]
  if (route && route.length > 0) {
    const routeUrl = `${getConfig().features.medication.valueSets.medicationAdministrations.url}|`
    const urlString = route.map((id) => routeUrl + id).join(',')
    options = [...options, `${AdministrationParamsKeys.ADMINISTRATION_ROUTES}=${encodeURIComponent(urlString)}`]
  }
  if (code) if (code) options = [...options, `${AdministrationParamsKeys.CODE}=${code}`]
  if (minDate) options = [...options, `${AdministrationParamsKeys.DATE}=ge${minDate}`] // eslint-disable-line
  if (maxDate) options = [...options, `${AdministrationParamsKeys.DATE}=le${maxDate}`] // eslint-disable-line
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `${AdministrationParamsKeys.EXECUTIVE_UNITS}=${executiveUnits}`] // eslint-disable-line
  if (encounterStatus && encounterStatus.length > 0)
    options = [...options, `${AdministrationParamsKeys.ENCOUNTER_STATUS}=${encounterStatus}`]
  if (appConfig.core.fhir.facetsExtensions && uniqueFacet && uniqueFacet.length > 0)
    options = [...options, `unique-facet=${uniqueFacet.reduce(paramValuesReducer, '')}`]

  if (!subject && _list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer, '')}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<MedicationAdministration>>(
    `/MedicationAdministration?${options.reduce(paramsReducer, '')}`,
    {
      signal: signal
    }
  )

  return response
}

type fetchImagingProps = {
  patient?: string
  size?: number
  offset?: number
  _sort?: string
  sortDirection?: Direction
  _text?: string
  encounter?: string
  ipp?: string
  minDate?: string
  maxDate?: string
  _list?: string[]
  signal?: AbortSignal
  modalities?: string[]
  bodySite?: string
  executiveUnits?: string[]
  encounterStatus?: string[]
  uniqueFacet?: string[]
}
export const fetchImaging = async (args: fetchImagingProps): FHIR_Bundle_Promise_Response<ImagingStudy> => {
  const {
    patient,
    size,
    offset,
    _sort,
    sortDirection,
    _text,
    encounter,
    ipp,
    bodySite,
    minDate,
    maxDate,
    signal,
    modalities,
    executiveUnits,
    encounterStatus
  } = args
  const _sortDirection = sortDirection === Direction.DESC ? '-' : ''
  let { _list, uniqueFacet } = args
  const appConfig = getConfig()

  _list = _list ? _list.filter(uniq) : []
  uniqueFacet = uniqueFacet ? uniqueFacet.filter(uniq) : []

  // By default, all the calls to `/ImagingStudy` will have 'patient.active=true' in parameter
  let options: string[] = appConfig.core.fhir.filterActive ? ['patient.active=true'] : []
  if (appConfig.core.fhir.totalCount) options = [...options, '_total=accurate']
  if (patient) options = [...options, `patient=${patient}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `_offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort}`]
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}&_tag=${LOW_TOLERANCE_TAG}`]
  if (encounter) options = [...options, `${ImagingParamsKeys.NDA}=${encounter}`]
  if (ipp) options = [...options, `${ImagingParamsKeys.IPP}=${ipp}`]
  if (bodySite) options = [...options, `${ImagingParamsKeys.BODYSITE}=${bodySite}`]
  if (minDate) options = [...options, `${ImagingParamsKeys.DATE}=ge${minDate}`]
  if (maxDate) options = [...options, `${ImagingParamsKeys.DATE}=le${maxDate}`]
  if (modalities && modalities.length > 0) {
    const modalitiesUrl = `${getConfig().features.imaging.valueSets.imagingModalities.url}|`
    const urlString = modalities.map((id) => modalitiesUrl + id).join(',')
    options = [...options, `${ImagingParamsKeys.MODALITY}=${encodeURIComponent(urlString)}`]
  }
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `${ImagingParamsKeys.EXECUTIVE_UNITS}=${executiveUnits}`]
  if (encounterStatus && encounterStatus.length > 0)
    options = [...options, `${ImagingParamsKeys.ENCOUNTER_STATUS}=${encounterStatus}`]
  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer, '')}`]
  if (appConfig.core.fhir.facetsExtensions && uniqueFacet && uniqueFacet.length > 0)
    options = [...options, `unique-facet=${uniqueFacet.reduce(paramValuesReducer, '')}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<ImagingStudy>>(
    `/ImagingStudy?${options.reduce(paramsReducer, '')}`,
    {
      signal: signal
    }
  )

  return response
}

type fetchFormsProps = {
  patient?: string
  formName?: string
  _list?: string[]
  startDate?: string | null
  endDate?: string | null
  executiveUnits?: string[]
  encounterStatus?: string[]
  size?: number
  offset?: number
  _sort?: Order
  sortDirection?: Direction
  ipp?: string
  signal?: AbortSignal
  uniqueFacet?: string[]
}
export const fetchForms = async (args: fetchFormsProps) => {
  const {
    patient,
    formName,
    _list,
    startDate,
    endDate,
    executiveUnits,
    encounterStatus,
    size,
    offset,
    _sort,
    sortDirection,
    ipp,
    signal
  } = args
  let { uniqueFacet } = args
  const appConfig = getConfig()
  uniqueFacet = uniqueFacet ? uniqueFacet.filter(uniq) : []
  const _sortDirection = sortDirection === Direction.DESC ? '-' : ''
  const config = getConfig()
  const formNames = formName || config.features.questionnaires.defaultFilterFormNames?.join(',')

  let options: string[] = ['subject.active=true&status=in-progress,completed']
  if (appConfig.core.fhir.totalCount) options = [...options, '_total=accurate']
  if (patient) options = [...options, `subject=${patient}`]
  if (formNames) options = [...options, `${QuestionnaireResponseParamsKeys.NAME}=${formNames}`]
  if (!patient && _list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer, '')}`]
  if (startDate) options = [...options, `${QuestionnaireResponseParamsKeys.DATE}=ge${startDate}`]
  if (endDate) options = [...options, `${QuestionnaireResponseParamsKeys.DATE}=le${endDate}`]
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `${QuestionnaireResponseParamsKeys.EXECUTIVE_UNITS}=${executiveUnits}`]
  if (encounterStatus && encounterStatus.length > 0)
    options = [...options, `${QuestionnaireResponseParamsKeys.ENCOUNTER_STATUS}=${encounterStatus}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `_offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort}`]
  if (ipp) options = [...options, `${QuestionnaireResponseParamsKeys.IPP}=${ipp}`]

  if (appConfig.core.fhir.facetsExtensions && uniqueFacet && uniqueFacet.length > 0)
    options = [...options, `unique-facet=${uniqueFacet.reduce(paramValuesReducer, '')}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<QuestionnaireResponse>>(
    `/QuestionnaireResponse?${options.reduce(paramsReducer, '')}`,
    { signal: signal }
  )

  return response
}

type fetchQuestionnairesProps = {
  name?: string
  _elements?: string[]
}
export const fetchQuestionnaires = async (args: fetchQuestionnairesProps) => {
  const { name } = args
  let { _elements } = args
  _elements = _elements ? _elements.filter(uniq) : []

  let options: string[] = []
  if (name) options = [...options, `name=${name}`]
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(paramValuesReducer, '')}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<Questionnaire>>(
    `/Questionnaire?${options.reduce(paramsReducer, '')}`
  )

  return response
}

type fetchLocationProps = {
  _elements?: string[]
  size?: number
  offset?: number
  near?: string
  _list?: string[]
  signal?: AbortSignal
}
export const fetchLocation = async (args: fetchLocationProps) => {
  const { _list, _elements, near, size, offset, signal } = args
  const appConfig = getConfig()
  let options: string[] = []
  if (appConfig.core.fhir.totalCount) options = [...options, '_total=accurate']
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `_offset=${offset}`]
  if (near) options = [...options, `near=${encodeURIComponent(near)}`]
  if (_elements && _elements.length > 0)
    options = [...options, `_elements=${_elements.filter(uniq).reduce(paramValuesReducer, '')}`]

  if (_list && _list.length > 0) options = [...options, `_list=${_list.filter(uniq).reduce(paramValuesReducer, '')}`]

  const queryString = options.length > 0 ? `?${options.reduce(paramsReducer, '')}` : ''
  const response = await apiFhir.get<FHIR_Bundle_Response<Location>>(`/Location${queryString}`, {
    signal
  })

  return response
}

type fetchDiagnosticReportProps = {
  _elements?: string[]
  size?: number
  offset?: number
  code?: string
  date?: string
  patient?: string[]
  study?: string[]
  encounter?: string[]
  _list?: string[]
  signal?: AbortSignal
}
export const fetchDiagnosticReport = async (args: fetchDiagnosticReportProps) => {
  const { _list, _elements, code, date, patient, study, encounter, size, offset, signal } = args
  const config = getConfig()

  let options: string[] = []
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `_offset=${offset}`]
  if (config.features.diagnosticReport.useStudyParam && study)
    options = [...options, `study=${study.reduce(paramValuesReducer, '')}`]
  if (encounter) options = [...options, `encounter=${encounter.reduce(paramValuesReducer, '')}`]
  if (patient) options = [...options, `patient=${patient.reduce(paramValuesReducer, '')}`]
  if (date) options = [...options, `date=${date}`]
  if (code) options = [...options, `code=${code}`]
  if (_elements && _elements.length > 0)
    options = [...options, `_elements=${_elements.filter(uniq).reduce(paramValuesReducer, '')}`]

  if (_list && _list.length > 0) options = [...options, `_list=${_list.filter(uniq).reduce(paramValuesReducer, '')}`]

  const queryString = options.length > 0 ? `?${options.reduce(paramsReducer, '')}` : ''
  const response = await apiFhir.get<FHIR_Bundle_Response<DiagnosticReport>>(`/DiagnosticReport${queryString}`, {
    signal
  })

  return response
}

export const fetchFhirMetadata = async () => {
  const response = await apiFhir.get<CapabilityStatement>('/metadata')
  return response
}

export const fetchAccessExpirations: (
  args: AccessExpirationsProps
) => Promise<AxiosResponse<Array<AccessExpiration | UserAccesses>>> = async (args: AccessExpirationsProps) => {
  const { expiring } = args

  let options: string[] = []
  if (expiring === true || expiring === false) options = [...options, `expiring=${expiring}`]

  let queryParams = ''
  if (options.length != 0) {
    queryParams = `?${options.reduce(paramsReducer, '')}`
  }

  const response: AxiosResponse<Array<AccessExpiration | UserAccesses>> = await apiBackend.get(
    `accesses/accesses/my-accesses/${queryParams}`
  )
  return response
}

export const fetchPerimeterAccesses = async (perimeter: string): Promise<AxiosResponse<DataRights[]>> => {
  const response = await apiBackend.get<DataRights[]>(`accesses/accesses/my-data-rights/?perimeters_ids=${perimeter}`)
  return response
}

export const fetchCohortAccesses = async (cohortIds: string[]) => {
  const response = await apiBackend.get<CohortRights[]>(`cohort/cohorts/cohort-rights/?group_id=${cohortIds}`)
  return response
}

export const fetchCohortInfo = async (cohortId: string) => {
  const response = await apiBackend.get<Back_API_Response<Cohort>>(`/cohort/cohorts/?group_id=${cohortId}`)
  return response
}

export const fetchExportableCohorts = async () => {
  const response = await apiBackend.get<Back_API_Response<Cohort>>(`/cohort/cohorts/?exportable=true&limit=-1`)
  return response.data.results
}

export const fetchExportableCohort = async (cohortId: string) => {
  const response = await apiBackend.get<Back_API_Response<Cohort>>(`/cohort/cohorts/?group_id=${cohortId}`)
  return response.data.results
}

type fetchExportTableInfoProps = {
  tableNames?: string
  columnCategory?: string[]
}

export const fetchExportTableInfo = async (args: fetchExportTableInfoProps) => {
  const { tableNames, columnCategory } = args

  let options: string[] = []
  if (tableNames) options = [...options, `tables=${tableNames}`]
  if (columnCategory) options = [...options, `columnCategory=${columnCategory}`]

  let queryParams = ''
  if (options.length != 0) {
    queryParams = `${options.reduce(paramsReducer, '')}`
  }

  const response = await apiDatamodel.get(`/models?${queryParams}`)

  return response.data
}

export const fetchExportTableRelationInfo = async (args: fetchExportTableInfoProps) => {
  const { tableNames, columnCategory } = args

  let options: string[] = []
  if (tableNames) options = [...options, `tables=${tableNames}`]
  if (columnCategory) options = [...options, `columnCategory=${columnCategory}`]

  let queryParams = ''
  if (options.length != 0) {
    queryParams = `${options.reduce(paramsReducer, '')}`
  }

  const response = await apiDatamodel.get(`/models/relations?${queryParams}`)

  return response.data
}

type fetchExportListProps = {
  user: string
  offset?: number
  search?: string | null
  ordering?: string
  signal?: AbortSignal
}

export const fetchExportList = async (args: fetchExportListProps) => {
  const { offset, user, search, ordering, signal } = args
  let options: string[] = [`output_format=${encodeURIComponent('csv,xlsx')}`]
  if (offset !== undefined) options = [...options, `offset=${offset}`]
  if (user !== undefined) options = [...options, `owner=${user}`]
  if (search && search !== undefined) options = [...options, `search=${encodeURIComponent(search)}`]
  if (ordering !== undefined) options = [...options, `ordering=${ordering}`]
  let queryParams = ''
  if (options.length != 0) {
    queryParams = `?${options.reduce(paramsReducer, '')}`
  }
  const response = await apiBackend.get<Back_API_Response<ExportList>>(`/exports/${queryParams}`, { signal })
  return response.data
}

export type WebContent = {
  id: number
  created_at: string
  modified_at: string
  title: string
  content: string
  content_type: string
  page: string
  metadata: Record<string, string>
}

export const listStaticContents = async (contentTypes?: Array<string>, ordering?: string): Promise<WebContent[]> => {
  try {
    const contentTypeFilter = contentTypes ? `&content_type=${contentTypes.join(',')}` : ''
    const orderFilter = ordering ? `ordering=${ordering}` : 'ordering=-created_at'
    const contents = await apiBackend.get<Back_API_Response<WebContent>>(
      `/webcontent/contents/?${orderFilter}${contentTypeFilter}`
    )

    if (contents.status !== 200) {
      throw new Error('Error while fetching contents')
    }
    return contents.data?.results ?? undefined
  } catch (error) {
    console.error('Error while fetching contents', error)
    throw new Error('Error while fetching contents')
  }
}
