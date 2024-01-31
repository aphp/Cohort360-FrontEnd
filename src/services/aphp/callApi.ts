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
  QuestionnaireResponse,
  ValueSet
} from 'fhir/r4'
import { getApiResponseResourceOrThrow, getApiResponseResourcesOrThrow } from 'utils/apiHelpers'
import { idSort, labelSort } from 'utils/alphabeticalSort'
import { capitalizeFirstLetter } from 'utils/capitalize'
import { CODE_HIERARCHY_EXTENSION_NAME } from '../../constants'
import { Direction, Order, SavedFilter, SavedFiltersResults, SearchByTypes } from 'types/searchCriterias'
import { RessourceType } from 'types/requestCriterias'

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
  status?: string
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
    status,
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

  // By default, all the calls to `/DocumentReference` will have `type:not=https://terminology.eds.aphp.fr/aphp-orbis-document-textuel-hospitalier|doc-impor`, contenttype=http://terminology.hl7.org/CodeSystem/v3-mediatypes|text/plain, and patient.active=true in parameter
  let options: string[] = [
    `type:not=${encodeURIComponent(
      'https://terminology.eds.aphp.fr/aphp-orbis-document-textuel-hospitalier|doc-impor'
    )}`,
    `contenttype=${encodeURIComponent('http://terminology.hl7.org/CodeSystem/v3-mediatypes|text/plain')}`,
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
  if (status)
    options = [
      ...options,
      `docstatus=${encodeURIComponent('http://hl7.org/fhir/CodeSystem/composition-status|') + status}`
    ]
  if (patient) options = [...options, `subject=${patient}`]
  if (patientIdentifier) options = [...options, `subject.identifier=${patientIdentifier}`]
  if (encounter) options = [...options, `encounter=${encounter}`]
  if (encounterIdentifier) options = [...options, `encounter.identifier=${encounterIdentifier}`]
  if (onlyPdfAvailable)
    options = [
      ...options,
      `contenttype=${encodeURIComponent('http://terminology.hl7.org/CodeSystem/v3-mediatypes|application/pdf')}`
    ]
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
  if (status)
    options = [...options, `status=${encodeURIComponent('http://hl7.org/fhir/CodeSystem/event-status|') + status}`]
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
    const diagnosticTypesUrl = encodeURIComponent('https://terminology.eds.aphp.fr/aphp-orbis-condition-status|')
    const urlString = type.map((id) => diagnosticTypesUrl + id).join(',')
    options = [...options, `orbis-status=${urlString}`]
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
  type?: string
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
  if (type) options = [...options, `category=*${encodeURIComponent('|')}${type}`]
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
  route?: string
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
  if (route)
    options = [
      ...options,
      `dosage-route=${
        encodeURIComponent('https://terminology.eds.aphp.fr/aphp-orbis-medicament-voie-administration|') + route
      }`
    ] // eslint-disable-line
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
  modalities?: string
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
  if (modalities) options = [...options, `modality=*${encodeURIComponent('|')}${modalities}`]
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
  episodeOfCare?: string
  _list?: string[]
}
export const fetchForms = async (args: fetchFormsProps) => {
  const { patient, formName, episodeOfCare, _list } = args
  let options: string[] = []
  if (patient) options = [...options, `subject=${patient}`]
  if (formName) options = [...options, `questionnaire=${formName}`]
  if (episodeOfCare) options = [...options, `episodeOfCare=${episodeOfCare}`]
  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`]

  // const response = await apiFhir.get<FHIR_Bundle_Promise_Response<QuestionnaireResponse>>(
  //   `/QuestionnaireResponse?${options.reduce(paramsReducer)}`
  // )

  return {
    resourceType: 'Bundle',
    id: '04f34bc0-4136-44fe-80f4-57ed45cce499',
    meta: {
      lastUpdated: '2024-01-25T15:54:53.569+00:00'
    },
    type: 'searchset',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'https://fhir-r4-develop-ext-k8s.eds.aphp.fr/fhir/QuestionnaireResponse?subject=6407723973'
      }
    ],
    entry: [
      {
        resource: {
          resourceType: 'QuestionnaireResponse',
          id: '6996719133',
          meta: {
            source: 'ORBIS'
          },
          status: 'in-progress',
          subject: {
            reference: 'Patient/6407723973'
          },
          encounter: {
            reference: 'Encounter/10054087714'
          },
          authored: '2022-08-03T07:01:17+00:00',
          item: [
            {
              linkId: 'F_MATER_111115',
              answer: [
                {
                  valueString: '../EpisodeOfCare/337343'
                }
              ]
            },
            {
              linkId: 'F_MATER_001024',
              answer: [
                {
                  valueString: 'Grossesse unique'
                }
              ]
            },
            {
              linkId: 'F_MATER_001101',
              answer: [
                {
                  valueInteger: 28
                }
              ]
            },
            {
              linkId: 'F_MATER_111114',
              answer: [
                {
                  valueString: 'Thu Aug 03 07:01:17 GMT 2023'
                }
              ]
            },
            {
              linkId: 'F_MATER_001102',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-origine-geo-vs|APH_MAT_ORIGINE_GEO_UE_SUD'
                }
              ]
            },
            {
              linkId: 'F_MATER_111113',
              answer: [
                {
                  valueString: 'Wed Aug 03 07:01:17 GMT 2022'
                }
              ]
            },
            {
              linkId: 'F_MATER_001301',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-groupe-sang-vs|APH_MAT_GROUPE_SANG_O'
                }
              ]
            },
            {
              linkId: 'F_MATER_111112',
              answer: [
                {
                  valueString: '../EpisodeOfCare/337343'
                }
              ]
            },
            {
              linkId: 'F_MATER_001302',
              answer: [
                {
                  valueString: 'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-rhesus-vs|APH_MAT_RHESUS_NEG'
                }
              ]
            },
            {
              linkId: 'F_MATER_001104',
              answer: [
                {
                  valueInteger: 172
                }
              ]
            },
            {
              linkId: 'F_MATER_001262',
              answer: [
                {
                  valueString: 'RAS'
                }
              ]
            },
            {
              linkId: 'F_MATER_001100',
              answer: [
                {
                  valueString: 'MEIRA Cyril'
                }
              ]
            },
            {
              linkId: 'F_MATER_001506',
              answer: [
                {
                  valueDecimal: 54.0
                }
              ]
            },
            {
              linkId: 'F_MATER_001507',
              answer: [
                {
                  valueDecimal: 1.0
                }
              ]
            },
            {
              linkId: 'F_MATER_001347',
              answer: [
                {
                  valueString: 'GAJ 0.79 au T1'
                }
              ]
            },
            {
              linkId: 'F_MATER_001106',
              answer: [
                {
                  valueString: 'aucun'
                }
              ]
            },
            {
              linkId: 'F_MATER_111117',
              answer: [
                {
                  valueString: 'Thu Aug 03 07:01:17 GMT 2023'
                }
              ]
            },
            {
              linkId: 'F_MATER_001503',
              answer: [
                {
                  valueString: 'Mon Oct 10 22:00:00 GMT 2022'
                }
              ]
            },
            {
              linkId: 'F_MATER_111116',
              answer: [
                {
                  valueString: 'Wed Aug 03 07:01:17 GMT 2022'
                }
              ]
            },
            {
              linkId: 'F_MATER_001504',
              answer: [
                {
                  valueString: '11 SA + 6 jour(s)'
                }
              ]
            },
            {
              linkId: 'F_MATER_001306',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-genotypage-rhes-vs|APH_MAT_GENOTYPAGE_RHES_POS'
                }
              ]
            },
            {
              linkId: 'F_MATER_001192',
              answer: [
                {
                  valueInteger: 1
                }
              ]
            },
            {
              linkId: 'F_MATER_001194',
              answer: [
                {
                  valueString: '../QuestionnaireResponse/6996932819'
                }
              ]
            },
            {
              linkId: 'F_MATER_001195',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-clot-issue-vs|APH_MAT_CLOT_ISSUE_ACC'
                }
              ]
            },
            {
              linkId: 'F_MATER_001591',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-portage-streptob-vs|APH_MAT_PORTAGE_STREPTOB_POS'
                }
              ]
            },
            {
              linkId: 'F_MATER_001191',
              answer: [
                {
                  valueInteger: 2
                }
              ]
            },
            {
              linkId: 'F_MATER_001235',
              answer: [
                {
                  valueString: 'normal'
                }
              ]
            },
            {
              linkId: 'F_MATER_001555',
              answer: [
                {
                  valueString: 'ECHO T1'
                },
                {
                  valueString: 'ECHO T3'
                },
                {
                  valueString: 'ECHO T2'
                }
              ]
            },
            {
              linkId: 'F_MATER_001152',
              answer: [
                {
                  valueString:
                    "Allergies : \n- VANCOMYCINE : Bronchospasme, Eruption\n\nAntécédents médicaux : \n- Diverticules coliques\n\nAntécédents chirurgicaux : \n- Appendicectomie et occlusion digestive par laparotomie médiane sus ombilicale et sous costale gauche à l'âge de 6ans en Espagne\nLobectomie inférieure pulmonaire gauche pendant l'enfance pour une malformation pulmonaire en Espagne (séquestration pulmonaire / pas de CR)\n\nAntécédents gynéco-obstétriques : \n- G1P1, 1 AVB le 03/11/2020 normal\nEndométriose suivie à Tenon, pas d'atteinte digestive ou endométriome"
                }
              ]
            },
            {
              linkId: 'F_MATER_001592',
              answer: [
                {
                  valueString: 'Tue Feb 21 23:00:00 GMT 2023'
                }
              ]
            },
            {
              linkId: 'F_MATER_001593',
              answer: [
                {
                  valueString: 'PV + SB et candida albicans 22/02/2023'
                }
              ]
            },
            {
              linkId: 'F_MATER_001032',
              answer: [
                {
                  valueInteger: 156
                }
              ]
            },
            {
              linkId: 'F_MATER_001033',
              answer: [
                {
                  valueDecimal: 90.0
                }
              ]
            },
            {
              linkId: 'F_MATER_001198',
              answer: [
                {
                  valueString: 'Mon Nov 02 23:00:00 GMT 2020'
                }
              ]
            },
            {
              linkId: 'F_MATER_001034',
              answer: [
                {
                  valueDecimal: 36.98225402832031
                }
              ]
            },
            {
              linkId: 'F_MATER_001556',
              answer: [
                {
                  valueString: 'Sun Mar 13 23:00:00 GMT 2022'
                },
                {
                  valueString: 'Sun Dec 25 23:00:00 GMT 2022'
                },
                {
                  valueString: 'Mon Oct 10 22:00:00 GMT 2022'
                }
              ]
            },
            {
              linkId: 'F_MATER_001557',
              answer: [
                {
                  valueString: '6996753747'
                },
                {
                  valueString: '7885609177'
                },
                {
                  valueString: '7547868092'
                }
              ]
            },
            {
              linkId: 'F_MATER_001558',
              answer: [
                {
                  valueString: '22 + 6 SA \nEPF 537g 45èmep\nPlacenta normalement inséré\nMorpho normale'
                },
                {
                  valueString: '33 + 6 SA \nEPF 2371g 70ème\nPlacenta normalement inséré\nMorpho normale\nPC'
                }
              ]
            },
            {
              linkId: 'F_MATER_001200',
              answer: [
                {
                  valueString: '40'
                }
              ]
            },
            {
              linkId: 'F_MATER_001321',
              answer: [
                {
                  valueString: 'Hépatite C'
                },
                {
                  valueString: 'Cytomégalovirus (CMV)'
                },
                {
                  valueString: 'Syphilis'
                },
                {
                  valueString: 'VIH 1 et 2'
                },
                {
                  valueString: 'Rubéole'
                },
                {
                  valueString: 'Hépatite B (AgHBs)'
                },
                {
                  valueString: 'Toxoplasmose'
                }
              ]
            },
            {
              linkId: 'F_MATER_001002',
              answer: [
                {
                  valueString: 'Wed Oct 19 22:00:00 GMT 2022'
                }
              ]
            },
            {
              linkId: 'F_MATER_001003',
              answer: [
                {
                  valueString: '../Practitioner/124530'
                }
              ]
            },
            {
              linkId: 'F_MATER_001201',
              answer: [
                {
                  valueString: 'PR'
                }
              ]
            },
            {
              linkId: 'F_MATER_001322',
              answer: [
                {
                  valueString: 'Négatif'
                },
                {
                  valueString: 'Immunisée'
                },
                {
                  valueString: 'Non immunisée'
                },
                {
                  valueString: 'Négatif'
                },
                {
                  valueString: 'Négatif'
                },
                {
                  valueString: 'Négatif'
                }
              ]
            },
            {
              linkId: 'F_MATER_001047',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-situation-fam-vs|APH_MAT_SITUATION_FAM_CELIB'
                }
              ]
            },
            {
              linkId: 'F_MATER_001202',
              answer: [
                {
                  valueString: 'Grossesse normale'
                }
              ]
            },
            {
              linkId: 'F_MATER_001048',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-origine-geo-vs|APH_MAT_ORIGINE_GEO_UE_SUD'
                }
              ]
            },
            {
              linkId: 'F_MATER_001521',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-marqueur-t21-vs|APH_MAT_MARQUEUR_T21_1ER_TRI'
                }
              ]
            },
            {
              linkId: 'F_MATER_001565',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-diab-gest-exam-vs|APH_MAT_DIAB_GEST_EXAM_FAIT'
                }
              ]
            },
            {
              linkId: 'F_MATER_001005',
              answer: [
                {
                  valueString: 'FERNANDES DA SILVA Mariana'
                }
              ]
            },
            {
              linkId: 'F_MATER_001566',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-depist-diabete-ges-vs|APH_MAT_DEPIST_DIABETE_GES_HGP'
                },
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-depist-diabete-ges-vs|APH_MAT_DEPIST_DIABETE_GES_GLY'
                }
              ]
            },
            {
              linkId: 'F_MATER_001522',
              answer: [
                {
                  valueInteger: 10000
                }
              ]
            },
            {
              linkId: 'F_MATER_001361',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-risq-atcd-mat-vs|APH_MAT_RISQ_ATCD_MAT_AUTRES'
                },
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-risq-atcd-mat-vs|APH_MAT_RISQ_ATCD_MAT_OBESITE'
                }
              ]
            },
            {
              linkId: 'F_MATER_001362',
              answer: [
                {
                  valueString: 'Lobectomie inférieure pulmonaire gauche'
                }
              ]
            },
            {
              linkId: 'F_MATER_001208',
              answer: [
                {
                  valueString: "Forceps de Tarnier pour ARCF\nAPD \nELD\nPas d'HPP"
                }
              ]
            },
            {
              linkId: 'F_MATER_001604',
              answer: [
                {
                  valueString: '300 ug'
                }
              ]
            },
            {
              linkId: 'F_MATER_001607',
              answer: [
                {
                  valueString: 'Tue Nov 22 23:00:00 GMT 2022'
                }
              ]
            },
            {
              linkId: 'F_MATER_001006',
              answer: [
                {
                  valueString: 'FERNANDES DA SILVA'
                }
              ]
            },
            {
              linkId: 'F_MATER_001204',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-mode-travail-vs|APH_MAT_MODE_TRAVAIL_SPONTANE'
                }
              ]
            },
            {
              linkId: 'F_MATER_001568',
              answer: [
                {
                  valueDecimal: 0.7899999618530273
                }
              ]
            },
            {
              linkId: 'F_MATER_001007',
              answer: [
                {
                  valueString: 'Fri Jun 06 22:00:00 GMT 1997'
                }
              ]
            },
            {
              linkId: 'F_MATER_001205',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-mode-acc-vs|APH_MAT_MODE_ACC_VOIE_BASS_INS'
                }
              ]
            },
            {
              linkId: 'F_MATER_001008',
              answer: [
                {
                  valueString: '0612656043'
                }
              ]
            },
            {
              linkId: 'F_MATER_001206',
              answer: [
                {
                  valueString: 'Garçon 3640g, va bien'
                }
              ]
            },
            {
              linkId: 'F_MATER_001569',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-unites-diabete-vs|APH_MAT_UNITES_DIABETE_GDL'
                }
              ]
            },
            {
              linkId: 'F_MATER_001009',
              answer: [
                {
                  valueString: 'marianacosta03@outlook.fr'
                }
              ]
            },
            {
              linkId: 'F_MATER_001603',
              answer: [
                {
                  valueString: 'Tue Jan 24 23:00:00 GMT 2023'
                }
              ]
            },
            {
              linkId: 'F_MATER_001608',
              answer: [
                {
                  valueString: '18 SA 0 J '
                }
              ]
            },
            {
              linkId: 'F_MATER_001609',
              answer: [
                {
                  valueString: 'Bras gauche, lot W3E041V, fait à 11h30 par IDE Bourgetel'
                }
              ]
            },
            {
              linkId: 'F_MATER_001050',
              answer: [
                {
                  valueString: 'Vendeuse en boulangerie'
                }
              ]
            },
            {
              linkId: 'F_MATER_001530',
              answer: [
                {
                  valueString: 'hcg 0.46 MoM, PAPP-A 0.71 MoM'
                }
              ]
            },
            {
              linkId: 'F_MATER_001574',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-unites-diabete-vs|APH_MAT_UNITES_DIABETE_GDL'
                }
              ]
            },
            {
              linkId: 'F_MATER_001575',
              answer: [
                {
                  valueDecimal: 0.9700000286102295
                }
              ]
            },
            {
              linkId: 'F_MATER_001014',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-obt-gross-vs|APH_MAT_OBT_GROSS_SPONTANEE'
                }
              ]
            },
            {
              linkId: 'F_MATER_001576',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-unites-diabete-vs|APH_MAT_UNITES_DIABETE_GDL'
                }
              ]
            },
            {
              linkId: 'F_MATER_001610',
              answer: [
                {
                  valueString: 'Vaccination coqueluche le 12/01/2023'
                }
              ]
            },
            {
              linkId: 'F_MATER_001570',
              answer: [
                {
                  valueString: 'Mon Sep 26 22:00:00 GMT 2022'
                }
              ]
            },
            {
              linkId: 'F_EVOL_000031',
              answer: [
                {
                  valueString: "Cette patiente n'a pas été incluse dans un protocole de recherche."
                }
              ]
            },
            {
              linkId: 'F_MATER_001571',
              answer: [
                {
                  valueDecimal: 0.8300000429153442
                }
              ]
            },
            {
              linkId: 'F_MATER_001010',
              answer: [
                {
                  valueString: 'Tue Aug 02 22:00:00 GMT 2022'
                }
              ]
            },
            {
              linkId: 'F_MATER_001011',
              answer: [
                {
                  valueString: '39 SA + 1'
                }
              ]
            },
            {
              linkId: 'F_MATER_001572',
              answer: [
                {
                  valueString:
                    'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-unites-diabete-vs|APH_MAT_UNITES_DIABETE_GDL'
                }
              ]
            },
            {
              linkId: 'F_MATER_001573',
              answer: [
                {
                  valueDecimal: 0.9900000095367432
                }
              ]
            },
            {
              linkId: 'F_MATER_001012',
              answer: [
                {
                  valueString: 'https://aphp.fr/ig/fhir/sdc/ValueSet/aphp-sdc-aph-mat-ddg-vs|APH_MAT_DDG_ECHO_11_14_SA'
                }
              ]
            },
            {
              linkId: 'F_MATER_001259',
              answer: [
                {
                  valueString: 'RAS'
                }
              ]
            },
            {
              linkId: 'F_MATER_001017',
              answer: [
                {
                  valueInteger: 1
                }
              ]
            }
          ]
        }
      }
    ]
  }

  // return response
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
        ? `&only-roots=false&code=${search.trim().replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}` //eslint-disable-line
        : `&only-roots=false&_text=${encodeURIComponent(
            search.trim().replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') //eslint-disable-line
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
