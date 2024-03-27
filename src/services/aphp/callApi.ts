import apiFhir from '../apiFhir'
import {
  AccessExpiration,
  AccessExpirationsProps,
  BiologyStatus,
  FHIR_API_Promise_Response,
  FHIR_API_Response,
  FHIR_Bundle_Promise_Response,
  HierarchyElement,
  HierarchyElementWithSystem,
  IScope,
  Back_API_Response,
  Cohort,
  DataRights,
  CohortRights
} from 'types'

import { FHIR_Bundle_Response } from 'types'
import { AxiosError, AxiosResponse } from 'axios'
import apiBackend from '../apiBackend'
import {
  Binary,
  Claim,
  Condition,
  DocumentReference,
  Encounter,
  Extension,
  ImagingStudy,
  MedicationAdministration,
  MedicationRequest,
  Observation,
  OperationOutcome,
  Parameters,
  ParametersParameter,
  Patient,
  Procedure,
  Questionnaire,
  QuestionnaireResponse,
  ValueSet
} from 'fhir/r4'
import { getApiResponseResourceOrThrow, getApiResponseResourcesOrThrow } from 'utils/apiHelpers'
import { idSort, labelSort } from 'utils/alphabeticalSort'
import { capitalizeFirstLetter } from 'utils/capitalize'
import {
  CODE_HIERARCHY_EXTENSION_NAME,
  CONDITION_STATUS,
  IMAGING_MODALITIES,
  MEDICATION_ADMINISTRATIONS,
  MEDICATION_PRESCRIPTION_TYPES,
  DOC_STATUS_CODE_SYSTEM
} from '../../constants'
import { Direction, Order, SavedFilter, SavedFiltersResults, SearchByTypes } from 'types/searchCriterias'
import { RessourceType } from 'types/requestCriterias'
import { mapDocumentStatusesToRequestParam } from '../../mappers/filters'

export const paramValuesReducerWithPrefix =
  (prefix: string): ((accumulator: string, currentValue: string) => string) =>
  (accumulator: string, currentValue: string) =>
    accumulator ? `${accumulator},${prefix}|${currentValue}` : `${prefix}|${currentValue}`
const paramValuesReducer = (accumulator: any, currentValue: any): any =>
  accumulator ? `${accumulator},${currentValue}` : currentValue ? currentValue : accumulator
const paramsReducer = (accumulator: string, currentValue: string): string =>
  accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator

const uniq = (item: string, index: number, array: string[]) => array.indexOf(item) === index && item

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
  sortDirection?: 'asc' | 'desc'
  gender?: string | null
  minBirthdate?: number
  maxBirthdate?: number
  searchBy?: string
  _text?: string | string[]
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
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list, pivotFacet, _elements } = args

  _list = _list ? _list.filter(uniq) : []
  pivotFacet = pivotFacet ? pivotFacet.filter(uniq) : []
  _elements = _elements ? _elements.filter(uniq) : []

  // By default, all the calls to `/Patient` will have 'active=true' in parameter
  let options: string[] = ['active=true']
  if (_id) options = [...options, `_id=${_id}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `_offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort}`]
  if (gender) options = [...options, `gender=${gender}`]
  if (_text && _text.length > 0) {
    if (Array.isArray(_text)) {
      const searchInput = _text.map((text) => `${searchBy}=${encodeURIComponent(`"${text}"`)}`).join('&')
      options = [...options, searchInput]
    } else {
      options = [...options, `${searchBy}=${_text}`]
    }
  }
  if (deceased !== undefined) options = [...options, `deceased=${deceased}`]
  if (minBirthdate) options = [...options, `${deidentified ? 'age-month' : 'age-day'}=ge${minBirthdate}`]
  if (maxBirthdate) options = [...options, `${deidentified ? 'age-month' : 'age-day'}=le${maxBirthdate}`]

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`]
  if (pivotFacet && pivotFacet.length > 0)
    options = [...options, `pivot-facet=${pivotFacet.reduce(paramValuesReducer, '')}`]
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(paramValuesReducer, '')}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<Patient>>(`/Patient?${options.reduce(paramsReducer)}`, {
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
  type?: string
  'type:not'?: string
  size?: number
  offset?: number
  _sort?: string
  sortDirection?: 'asc' | 'desc'
  patient?: string
  status?: string[]
  facet?: ('class' | 'visit-year-month-gender-facet')[]
  _elements?: ('status' | 'serviceProvider' | 'identifier')[]
  signal?: AbortSignal
}
export const fetchEncounter = async (args: fetchEncounterProps): FHIR_Bundle_Promise_Response<Encounter> => {
  const { _id, size, offset, _sort, sortDirection, patient, type, signal } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list, _elements, status, facet } = args
  const typeNot = args['type:not']

  _list = _list ? _list.filter(uniq) : []
  status = status ? status.filter(uniq) : []
  _elements = _elements ? _elements.filter(uniq) : []
  facet = facet ? facet.filter(uniq) : []

  // By default, all the calls to `/Encounter` will have 'subject.active=true' in parameter
  let options: string[] = ['subject.active=true']
  if (_id) options = [...options, `_id=${_id}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`]
  if (patient) options = [...options, `subject=${patient}`]
  if (type) options = [...options, `type=${type}`]
  if (typeNot) options = [...options, `type:not=${typeNot}`]

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`]
  if (status && status.length > 0) options = [...options, `status=${status.reduce(paramValuesReducer)}`]
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(paramValuesReducer, '')}`]
  if (facet && facet.length > 0) options = [...options, `facet=${facet.reduce(paramValuesReducer, '')}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<Encounter>>(`/Encounter?${options.reduce(paramsReducer)}`, {
    signal: signal
  })

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
  sortDirection?: 'asc' | 'desc'
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
}
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
    executiveUnits
  } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list, facet, uniqueFacet, _elements } = args
  const encounterIdentifier = args['encounter-identifier']
  const patientIdentifier = args['patient-identifier']

  _list = _list ? _list.filter(uniq) : []
  facet = facet ? facet.filter(uniq) : []
  uniqueFacet = uniqueFacet ? uniqueFacet.filter(uniq) : []
  _elements = _elements ? _elements.filter(uniq) : []

  // By default, all the calls to `/DocumentReference` will have `type:not=https://terminology.eds.aphp.fr/aphp-orbis-document-textuel-hospitalier|doc-impor`, contenttype=text/plain, and patient.active=true in parameter
  let options: string[] = [
    `type:not=${encodeURIComponent(
      'https://terminology.eds.aphp.fr/aphp-orbis-document-textuel-hospitalier|doc-impor'
    )}`,
    `contenttype=${encodeURIComponent('text/plain')}`,
    'subject.active=true'
  ]
  if (_id) options = [...options, `_id=${_id}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`]
  if (type) options = [...options, `type=${type}`]
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
    const docStatusesUrl = DOC_STATUS_CODE_SYSTEM
    const urlString = docStatuses
      .map((status) => `${docStatusesUrl}|${mapDocumentStatusesToRequestParam(status)}`)
      .join(',')
    options = [...options, `docstatus=${encodeURIComponent(urlString)}`]
  }
  if (patient) options = [...options, `subject=${patient}`]
  if (patientIdentifier) options = [...options, `subject.identifier=${patientIdentifier}`]
  if (encounter) options = [...options, `encounter=${encounter}`]
  if (encounterIdentifier) options = [...options, `encounter.identifier=${encounterIdentifier}`]
  if (onlyPdfAvailable) options = [...options, `contenttype=${encodeURIComponent('application/pdf')}`]
  if (minDate) options = [...options, `date=ge${minDate}`]
  if (maxDate) options = [...options, `date=le${maxDate}`]
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `encounter.encounter-care-site=${executiveUnits}`]

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`]
  if (facet && facet.length > 0) options = [...options, `facet=${facet.reduce(paramValuesReducer, '')}`]
  if (uniqueFacet && uniqueFacet.length > 0)
    options = [...options, `unique-facet=${uniqueFacet.reduce(paramValuesReducer, '')}`]
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(paramValuesReducer, '')}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<DocumentReference>>(
    `/DocumentReference?${options.reduce(paramsReducer)}`,
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
  fhir_resource: RessourceType,
  name: string,
  filter: string
): Promise<AxiosResponse<SavedFilter>> => {
  const res = await apiBackend.post('/cohort/fhir-filters/', {
    fhir_resource,
    fhir_version: '4.0',
    name,
    filter
  })
  if (res instanceof AxiosError) throw "Le filtre n'a pas pu être sauvegardé."
  return res
}

export const getFilters = async (
  fhir_resource: RessourceType,
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
  const res = await apiBackend.get(`/cohort/fhir-filters/?${options.reduce(paramsReducer)}`)
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
  fhir_resource: RessourceType,
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
  if (res instanceof AxiosError) throw "Le filtre n'a pas pu être modifié."
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

  const documentResp = await apiFhir.get<FHIR_Bundle_Response<Binary>>(`/Binary?${options.reduce(paramsReducer)}`)

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
  sortDirection?: 'asc' | 'desc'
  subject?: string
  code?: string
  source?: string
  minDate?: string
  maxDate?: string
  _text?: string
  status?: string
  signal?: AbortSignal
  'encounter-identifier'?: string
  executiveUnits?: string[]
}
export const fetchProcedure = async (args: fetchProcedureProps): FHIR_Bundle_Promise_Response<Procedure> => {
  const { size, offset, _sort, sortDirection, subject, code, source, _text, status, minDate, maxDate, executiveUnits } =
    args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list } = args
  const encounterIdentifier = args['encounter-identifier']

  _list = _list ? _list.filter(uniq) : []

  // By default, all the calls to `/Procedure` will have 'patient.active=true' in parameter
  let options: string[] = ['subject.active=true']
  if (size !== undefined) options = [...options, `_count=${size}`] // eslint-disable-line
  if (offset) options = [...options, `offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`] // eslint-disable-line
  if (subject) options = [...options, `subject=${subject}`] // eslint-disable-line
  if (code) options = [...options, `code=${code}`] // eslint-disable-line
  if (source) options = [...options, `source=${source}`]
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`]
  if (status) options = [...options, `status=${encodeURIComponent(`${DOC_STATUS_CODE_SYSTEM}|${status}`)}`]
  if (encounterIdentifier) options = [...options, `encounter.identifier=${encounterIdentifier}`]
  if (minDate) options = [...options, `date=ge${minDate}`]
  if (maxDate) options = [...options, `date=le${maxDate}`]
  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`]
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `encounter.encounter-care-site=${executiveUnits}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<Procedure>>(`/Procedure?${options.reduce(paramsReducer)}`, {
    signal: args.signal
  })

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
  sortDirection?: 'asc' | 'desc'
  patient?: string
  diagnosis?: string
  minCreated?: string
  maxCreated?: string
  _text?: string
  status?: string
  'encounter-identifier'?: string
  signal?: AbortSignal
  executiveUnits?: string[]
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
    status,
    minCreated,
    maxCreated,
    executiveUnits
  } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list } = args
  const encounterIdentifier = args['encounter-identifier']

  _list = _list ? _list.filter(uniq) : []

  // By default, all the calls to `/Claim` will have 'patient.active=true' in parameter
  let options: string[] = ['patient.active=true']
  if (size !== undefined) options = [...options, `_count=${size}`] // eslint-disable-line
  if (offset) options = [...options, `offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`] // eslint-disable-line
  if (patient) options = [...options, `patient=${patient}`] // eslint-disable-line
  if (diagnosis) options = [...options, `diagnosis=${diagnosis}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (status)
    options = [
      ...options,
      `status=${encodeURIComponent('https://terminology.eds.aphp.fr/aphp-orbis-ghm-cost-status|') + status}`
    ]
  if (encounterIdentifier) options = [...options, `encounter.identifier=${encounterIdentifier}`]
  if (minCreated) options = [...options, `created=ge${minCreated}`]
  if (maxCreated) options = [...options, `created=le${maxCreated}`]
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `encounter.encounter-care-site=${executiveUnits}`]

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<Claim>>(`/Claim?${options.reduce(paramsReducer)}`, {
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
  type?: string[]
  _text?: string
  'min-recorded-date'?: string
  'max-recorded-date'?: string
  'encounter-identifier'?: string
  signal?: AbortSignal
  executiveUnits?: string[]
}
export const fetchCondition = async (args: fetchConditionProps): FHIR_Bundle_Promise_Response<Condition> => {
  const { size, offset, _sort, sortDirection, subject, code, _text, executiveUnits } = args
  const _sortDirection = sortDirection === Direction.DESC ? '-' : ''
  let { _list, type } = args
  const encounterIdentifier = args['encounter-identifier']
  const minRecordedDate = args['min-recorded-date']
  const maxRecordedDate = args['max-recorded-date']

  _list = _list ? _list.filter(uniq) : []
  type = type ? type.filter(uniq) : []

  // By default, all the calls to `/Condition` will have 'patient.active=true' in parameter
  let options: string[] = ['subject.active=true']
  if (size !== undefined) options = [...options, `_count=${size}`] // eslint-disable-line
  if (offset !== undefined) options = [...options, `offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`] // eslint-disable-line
  if (subject) options = [...options, `subject=${subject}`] // eslint-disable-line
  if (code) options = [...options, `code=${code}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (encounterIdentifier) options = [...options, `encounter.identifier=${encounterIdentifier}`] // eslint-disable-line
  if (minRecordedDate) options = [...options, `recorded-date=ge${minRecordedDate}`] // eslint-disable-line
  if (maxRecordedDate) options = [...options, `recorded-date=le${maxRecordedDate}`] // eslint-disable-line
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `encounter.encounter-care-site=${executiveUnits}`]

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`] // eslint-disable-line
  if (type && type.length > 0) {
    const diagnosticTypesUrl = `${CONDITION_STATUS}|`
    const urlString = type.map((id) => diagnosticTypesUrl + id).join(',')
    options = [...options, `orbis-status=${encodeURIComponent(urlString)}`]
  }

  const response = await apiFhir.get<FHIR_Bundle_Response<Condition>>(`/Condition?${options.reduce(paramsReducer)}`, {
    signal: args.signal
  })

  return response
}

type fetchObservationProps = {
  id?: string
  size?: number
  offset?: number
  _sort?: string
  sortDirection?: 'asc' | 'desc'
  _text?: string
  encounter?: string
  loinc?: string
  anabio?: string
  subject?: string
  minDate?: string
  maxDate?: string
  _list?: string[]
  rowStatus: boolean
  signal?: AbortSignal
  executiveUnits?: string[]
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
    loinc,
    anabio,
    subject,
    minDate,
    maxDate,
    rowStatus,
    signal,
    executiveUnits
  } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list } = args

  _list = _list ? _list.filter(uniq) : []

  // By default, all the calls to `/Observation` will have 'value-quantity-value=ge0,le0' and 'patient.active=true' in the parameters
  let options: string[] = ['value-quantity=ge0,le0', 'subject.active=true']
  if (id) options = [...options, `_id=${id}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort.includes('code') ? _sort : `${_sort},id`}`]
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`]
  if (encounter) options = [...options, `encounter.identifier=${encounter}`]
  if (anabio || loinc)
    options = [...options, `code=${anabio ? anabio : ''}${anabio && loinc ? ',' : ''}${loinc ? loinc : ''}`] // eslint-disable-line
  if (subject) options = [...options, `subject=${subject}`] // eslint-disable-line
  if (minDate) options = [...options, `date=ge${minDate}`] // eslint-disable-line
  if (maxDate) options = [...options, `date=le${maxDate}`] // eslint-disable-line
  if (rowStatus) options = [...options, `status=${BiologyStatus.VALIDATED}`] // eslint-disable-line
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `encounter.encounter-care-site=${executiveUnits}`]

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<Observation>>(
    `/Observation?${options.reduce(paramsReducer)}`,
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
  subject?: string
  type?: string[]
  minDate: string | null
  maxDate: string | null
  _list?: string[]
  signal?: AbortSignal
  executiveUnits?: string[]
}
export const fetchMedicationRequest = async (
  args: fetchMedicationRequestProps
): FHIR_Bundle_Promise_Response<MedicationRequest> => {
  const {
    id,
    size,
    offset,
    _sort,
    sortDirection,
    _text,
    encounter,
    subject,
    type,
    minDate,
    maxDate,
    signal,
    executiveUnits
  } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list } = args

  _list = _list ? _list.filter(uniq) : []

  // By default, all the calls to `/MedicationRequest` will have 'patient.active=true' in parameter
  let options: string[] = ['subject.active=true']
  if (id) options = [...options, `_id=${id}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset !== undefined) options = [...options, `offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`]
  if (subject) options = [...options, `subject=${subject}`]
  if (encounter) options = [...options, `encounter.identifier=${encounter}`]
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`]
  if (type && type.length > 0) {
    const routeUrl = `${MEDICATION_PRESCRIPTION_TYPES}|`
    const urlString = type.map((id) => routeUrl + id).join(',')
    options = [...options, `category=${encodeURIComponent(urlString)}`]
  }
  if (minDate) options = [...options, `validity-period-start=ge${minDate}`]
  if (maxDate) options = [...options, `validity-period-start=le${maxDate}`]
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `encounter.encounter-care-site=${executiveUnits}`]

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<MedicationRequest>>(
    `/MedicationRequest?${options.reduce(paramsReducer)}`,
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
  sortDirection?: 'asc' | 'desc'
  _text?: string
  encounter?: string
  subject?: string
  route?: string[]
  minDate: string | null
  maxDate: string | null
  _list?: string[]
  signal?: AbortSignal
  executiveUnits?: string[]
}
export const fetchMedicationAdministration = async (
  args: fetchMedicationAdministrationProps
): FHIR_Bundle_Promise_Response<MedicationAdministration> => {
  const {
    id,
    size,
    offset,
    _sort,
    sortDirection,
    _text,
    encounter,
    subject,
    route,
    minDate,
    maxDate,
    signal,
    executiveUnits
  } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list } = args

  _list = _list ? _list.filter(uniq) : []

  // By default, all the calls to `/MedicationAdministration` will have 'patient.active=true' in parameter
  let options: string[] = ['subject.active=true']
  if (id) options = [...options, `_id=${id}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`]
  if (subject) options = [...options, `subject=${subject}`]
  if (encounter) options = [...options, `context.identifier=${encounter}`]
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`]
  if (route && route.length > 0) {
    const routeUrl = `${MEDICATION_ADMINISTRATIONS}|`
    const urlString = route.map((id) => routeUrl + id).join(',')
    options = [...options, `dosage-route=${encodeURIComponent(urlString)}`]
  }
  if (minDate) options = [...options, `effective-time=ge${minDate}`] // eslint-disable-line
  if (maxDate) options = [...options, `effective-time=le${maxDate}`] // eslint-disable-line
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `context.encounter-care-site=${executiveUnits}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<MedicationAdministration>>(
    `/MedicationAdministration?${options.reduce(paramsReducer)}`,
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
  order?: Order
  orderDirection?: Direction
  _text?: string
  encounter?: string
  ipp?: string
  minDate?: string
  maxDate?: string
  _list?: string[]
  signal?: AbortSignal
  modalities?: string[]
  executiveUnits?: string[]
}
export const fetchImaging = async (args: fetchImagingProps): FHIR_Bundle_Promise_Response<ImagingStudy> => {
  const {
    patient,
    size,
    offset,
    order,
    orderDirection,
    _text,
    encounter,
    ipp,
    minDate,
    maxDate,
    signal,
    modalities,
    executiveUnits
  } = args
  const _orderDirection = orderDirection === Direction.DESC ? '-' : ''
  let { _list } = args
  _list = _list ? _list.filter(uniq) : []

  // By default, all the calls to `/ImagingStudy` will have 'patient.active=true' in parameter
  let options: string[] = ['patient.active=true']
  if (patient) options = [...options, `patient=${patient}`]
  if (size !== undefined) options = [...options, `_count=${size}`]
  if (offset) options = [...options, `offset=${offset}`]
  if (order) options = [...options, `_sort=${_orderDirection}${order}`]
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`]
  if (encounter) options = [...options, `encounter.identifier=${encounter}`]
  if (ipp) options = [...options, `patient.identifier=${ipp}`]
  if (minDate) options = [...options, `started=ge${minDate}`]
  if (maxDate) options = [...options, `started=le${maxDate}`]
  if (modalities && modalities.length > 0) {
    const modalitiesUrl = `${IMAGING_MODALITIES}|`
    const urlString = modalities.map((id) => modalitiesUrl + id).join(',')
    options = [...options, `modality=${encodeURIComponent(urlString)}`]
  }
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `encounter.encounter-care-site=${executiveUnits}`]
  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<ImagingStudy>>(
    `/ImagingStudy?${options.reduce(paramsReducer)}`,
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
}
export const fetchForms = async (args: fetchFormsProps) => {
  const { patient, formName, _list, startDate, endDate, executiveUnits } = args
  let options: string[] = ['status=in-progress,completed']
  if (patient) options = [...options, `subject=${patient}`]
  if (formName) options = [...options, `questionnaire.name=${formName}`]
  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`]
  if (startDate) options = [...options, `authored=ge${startDate}`]
  if (endDate) options = [...options, `authored=le${endDate}`]
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `encounter.encounter-care-site=${executiveUnits}`]

  const response = await apiFhir.get<FHIR_Bundle_Response<QuestionnaireResponse>>(
    `/QuestionnaireResponse?${options.reduce(paramsReducer)}`
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
    `/Questionnaire?${options.reduce(paramsReducer)}`
  )

  return response
}

/**
 *
 * Retrieve the codeList from FHIR api either from expanding a code or fetching the roots of the valueSet
 * @param codeSystem
 * @param code
 * @param search
 * @param noStar
 * @param signal
 * @returns
 */
const getCodeList = async (
  codeSystem: string,
  expandCode?: string,
  search?: string,
  noStar = true,
  signal?: AbortSignal
): Promise<{ code?: string; display?: string; extension?: Extension[]; codeSystem?: string }[] | undefined> => {
  if (!expandCode) {
    if (search !== undefined && !search.trim()) {
      return []
    }
    let searchParam = '&only-roots=true'
    // if search is * then we fetch the roots of the valueSet
    if (search !== '*' && search !== undefined) {
      // if noStar is true then we search for the code, else we search for the display
      searchParam = noStar
        ? `&only-roots=false&code=${encodeURIComponent(
            search.trim().replace(/[\[\]\/\{\}\(\)\*\?\.\\\^\$\|]/g, '\\$&') //eslint-disable-line
          )}`
        : `&only-roots=false&_text=${encodeURIComponent(
            search.trim().replace(/[\[\]\/\{\}\(\)\*\?\.\\\^\$\|]/g, '\\$&') //eslint-disable-line
          )}*`
    }
    // TODO test if it returns all the codes without specifying the count
    const res = await apiFhir.get<FHIR_Bundle_Response<ValueSet>>(`/ValueSet?reference=${codeSystem}${searchParam}`, {
      signal: signal
    })
    const valueSetBundle = getApiResponseResourcesOrThrow(res)
    return valueSetBundle.length > 0
      ? valueSetBundle
          .map((entry) => {
            return (
              entry.compose?.include[0].concept?.map((code) => ({
                ...code,
                codeSystem: entry.compose?.include[0].system
              })) || []
            ) //eslint-disable-line
          })
          .filter((valueSetPerSystem) => !!valueSetPerSystem)
          .reduce((acc, val) => acc.concat(val), [])
      : []
  } else {
    const json = {
      resourceType: 'ValueSet',
      url: codeSystem,
      compose: {
        include: [
          {
            filter: [
              {
                op: 'is-a',
                value: expandCode
              }
            ]
          }
        ]
      }
    }
    const res = await apiFhir.post<FHIR_API_Response<ValueSet>>(`/ValueSet/$expand`, JSON.stringify(json))
    const valueSetExpansion = getApiResponseResourceOrThrow(res).expansion
    return valueSetExpansion?.contains?.map((code) => ({ ...code, codeSystem: codeSystem }))
  }
}

export type FetchValueSetOptions = {
  valueSetTitle?: string
  code?: string
  sortingKey?: 'id' | 'label'
  search?: string
  noStar?: boolean
  joinDisplayWithCode?: boolean
  filterRoots?: (code: HierarchyElement) => boolean
  filterOut?: (code: HierarchyElement) => boolean
}

export const fetchValueSet = async (
  codeSystem: string,
  options?: FetchValueSetOptions,
  signal?: AbortSignal
): Promise<Array<HierarchyElementWithSystem>> => {
  const {
    code,
    valueSetTitle,
    sortingKey = 'label',
    search,
    noStar,
    joinDisplayWithCode = true,
    filterRoots = () => true,
    filterOut = (value: HierarchyElement) => value.id === 'APHP generated'
  } = options || {}
  const codeList = await getCodeList(codeSystem, code, search, noStar, signal)
  const sortingFunc = sortingKey === 'id' ? idSort : labelSort
  const formattedCodeList =
    codeList
      ?.map((code) => ({
        id: code.code || '',
        label: joinDisplayWithCode
          ? `${code.code} - ${capitalizeFirstLetter(code.display)}`
          : capitalizeFirstLetter(code.display),
        system: code.codeSystem,
        subItems: [{ id: 'loading', label: 'loading', subItems: [] as HierarchyElement[] }]
      }))
      .filter((code) => !filterOut(code))
      .sort(sortingFunc) || []
  if (!code && (search === undefined || search === '*') && valueSetTitle) {
    return [{ id: '*', label: valueSetTitle, subItems: formattedCodeList.filter((code) => filterRoots(code)) }]
  } else {
    return formattedCodeList
  }
}

export const fetchSingleCodeHierarchy = async (codeSystem: string, code: string): Promise<string[]> => {
  const codeList = await getCodeList(codeSystem, undefined, code)
  if (!codeList || codeList.length === 0) {
    return []
  }
  return (
    codeList[0].extension
      ?.find((e) => e.url === CODE_HIERARCHY_EXTENSION_NAME)
      ?.valueCodeableConcept?.coding?.map((c) => c.code || '')
      .filter((c) => !!c) || []
  )
}

type fetchScopeProps = {
  perimetersIds?: string[]
  cohortIds?: string[]
  search?: string
  type: string[]
  isExecutiveUnit?: boolean
  offset?: number
  limit?: number
}
export const fetchScope: (args: fetchScopeProps, signal?: AbortSignal) => Promise<AxiosResponse<IScope>> = async (
  args: fetchScopeProps,
  signal?: AbortSignal
) => {
  const { perimetersIds, cohortIds, search, type, isExecutiveUnit, offset, limit } = args

  let options: string[] = []
  if (search) options = [...options, `search=${search}`]
  if (offset) options = [...options, `offset=${offset}`]
  if (limit) options = [...options, `limit=${limit}`]
  if (!search) options = [...options, `limit=-1`]
  if (perimetersIds && perimetersIds.length > 0) options = [...options, `local_id=${perimetersIds.join(',')}`]
  if (cohortIds && cohortIds.length > 0) options = [...options, `cohort_id=${cohortIds.join(',')}`]
  if (type && type.length > 0) options = [...options, `type_source_value=${type.join(',')}`]

  const url: string = isExecutiveUnit ? 'accesses/perimeters/?' : 'accesses/perimeters/patient-data/rights/?'
  const response: AxiosResponse<IScope> = await apiBackend.get(`${url}${options.reduce(paramsReducer)}`, {
    signal: signal
  })
  return response
}

export const fetchAccessExpirations: (
  args: AccessExpirationsProps
) => Promise<AxiosResponse<AccessExpiration[]>> = async (args: AccessExpirationsProps) => {
  const { expiring } = args

  let options: string[] = []
  if (expiring === true || expiring === false) options = [...options, `expiring=${expiring}`]

  const response: AxiosResponse<AccessExpiration[]> = await apiBackend.get(
    `accesses/accesses/my-accesses/?${options.reduce(paramsReducer)}`
  )
  return response
}

export const fetchPerimeterAccesses = async (perimeter: string): Promise<AxiosResponse<DataRights[]>> => {
  const response = await apiBackend.get<DataRights[]>(`accesses/accesses/my-data-rights/?perimeters_ids=${perimeter}`)
  return response
}

export const fetchCohortAccesses = async (cohortIds: string[]) => {
  const response = await apiBackend.get<CohortRights[]>(`cohort/cohorts/cohort-rights/?fhir_group_id=${cohortIds}`)
  return response
}

export const fetchPerimeterFromCohortId = async (cohortId: string) => {
  const response = await apiBackend.get(`accesses/perimeters/?cohort_id=${cohortId}`)
  return response
}

export const fetchPerimeterFromId = async (perimeterId: string) => {
  const response = await apiBackend.get(`accesses/perimeters/${perimeterId}/`)
  return response
}

export const fetchCohortInfo = async (cohortId: string) => {
  const response = await apiBackend.get<Back_API_Response<Cohort>>(`/cohort/cohorts/?fhir_group_id=${cohortId}`)
  return response
}
