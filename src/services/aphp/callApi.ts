import apiFhir from '../apiFhir'

import { CohortComposition, SearchByTypes, FHIR_API_Response, IScope } from 'types'
import {
  IBinary,
  IClaim,
  ICondition,
  IDocumentReference,
  IEncounter,
  IGroup,
  IMedicationAdministration,
  IMedicationRequest,
  IObservation,
  IPatient,
  IProcedure
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { AxiosResponse } from 'axios'
import apiBackend from '../apiBackend'

const reducer = (accumulator: any, currentValue: any) =>
  accumulator ? `${accumulator},${currentValue}` : currentValue ? currentValue : accumulator
const optionsReducer = (accumulator: any, currentValue: any) =>
  accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator

const uniq = (item: any, index: number, array: any[]) => array.indexOf(item) === index && item

/**
 * Group Resource
 *
 */

type fetchGroupProps = {
  _id?: string | (string | undefined)[] // ID of Group
  _list?: string[] // ID List of Groups
  provider?: string // Provider ID
  'managing-entity'?: string[] // ID List of organization
  _elements?: ('name' | 'managingEntity')[]
}
export const fetchGroup = async (args: fetchGroupProps) => {
  const { _id, provider } = args
  let { _list, _elements } = args
  let managingEntity = args['managing-entity']

  _list = _list ? _list.filter(uniq) : []
  _elements = _elements ? _elements.filter(uniq) : []
  managingEntity = managingEntity ? managingEntity.filter(uniq) : []

  let options: string[] = []
  if (_id) options = [...options, `_id=${_id}`] // eslint-disable-line
  if (provider) options = [...options, `provider=${provider}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(reducer)}`] // eslint-disable-line
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(reducer)}`] // eslint-disable-line
  if (managingEntity && managingEntity.length > 0)
    options = [...options, `managing-entity=${managingEntity.reduce(reducer)}`] // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IGroup>>(`/Group?${options.reduce(optionsReducer)}`)

  return response
}

export const deleteGroup = async (groupID: string) => {
  return await apiFhir.delete(`/Group/${groupID}`)
}

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
  gender?: string
  minBirthdate?: number
  maxBirthdate?: number
  searchBy?: string
  _text?: string
  family?: string
  given?: string
  identifier?: string
  deceased?: boolean
  pivotFacet?: ('age-month_gender' | 'deceased_gender')[]
  _elements?: ('id' | 'gender' | 'name' | 'birthDate' | 'deceased' | 'identifier' | 'extension')[]
  deidentified?: boolean
  signal?: AbortSignal
}
export const fetchPatient = async (args: fetchPatientProps) => {
  const {
    _id,
    size,
    offset,
    _sort,
    sortDirection,
    gender,
    _text,
    searchBy,
    family,
    given,
    identifier,
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
  if (_id) options = [...options, `_id=${_id}`] // eslint-disable-line
  if (size !== undefined) options = [...options, `_count=${size}`] // eslint-disable-line
  if (offset) options = [...options, `_offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort}`] // eslint-disable-line
  if (gender) options = [...options, `gender=${gender}`] // eslint-disable-line
  if (_text) options = [...options, `${searchBy ? searchBy : '_text'}=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (family) options = [...options, `family=${family}`] // eslint-disable-line
  if (given) options = [...options, `given=${given}`] // eslint-disable-line
  if (identifier) options = [...options, `identifier=${identifier}`] // eslint-disable-line
  if (deceased !== undefined) options = [...options, `deceased=${deceased}`] // eslint-disable-line
  if (minBirthdate) options = [...options, `${deidentified ? 'age-month' : 'age-day'}=le${minBirthdate}`] // eslint-disable-line
  if (maxBirthdate) options = [...options, `${deidentified ? 'age-month' : 'age-day'}=ge${maxBirthdate}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(reducer)}`] // eslint-disable-line
  if (pivotFacet && pivotFacet.length > 0) options = [...options, `pivot-facet=${pivotFacet.reduce(reducer)}`] // eslint-disable-line
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(reducer)}`] // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IPatient>>(`/Patient?${options.reduce(optionsReducer)}`, {
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
export const fetchEncounter = async (args: fetchEncounterProps) => {
  const { _id, size, offset, _sort, sortDirection, patient, type, signal } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list, _elements, status, facet } = args
  const typeNot = args['type:not']

  _list = _list ? _list.filter(uniq) : []
  status = status ? status.filter(uniq) : []
  _elements = _elements ? _elements.filter(uniq) : []
  facet = facet ? facet.filter(uniq) : []

  // By default, all the calls to `/Encounter` will have 'patient.active=true' in parameter
  let options: string[] = ['patient.active=true']
  if (_id) options = [...options, `_id=${_id}`] // eslint-disable-line
  if (size !== undefined) options = [...options, `size=${size}`] // eslint-disable-line
  if (offset) options = [...options, `offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`] // eslint-disable-line
  if (patient) options = [...options, `patient=${patient}`] // eslint-disable-line
  if (type) options = [...options, `type=${type}`] // eslint-disable-line
  if (typeNot) options = [...options, `type:not=${typeNot}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(reducer)}`] // eslint-disable-line
  if (status && status.length > 0) options = [...options, `status=${status.reduce(reducer)}`] // eslint-disable-line
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(reducer)}`] // eslint-disable-line
  if (facet && facet.length > 0) options = [...options, `facet=${facet.reduce(reducer)}`] // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IEncounter>>(`/Encounter?${options.reduce(optionsReducer)}`, {
    signal: signal
  })

  return response
}

/**
 * Composition Resource
 *
 */

type fetchCompositionProps = {
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
  'encounter.identifier'?: string
  onlyPdfAvailable?: boolean
  'patient.identifier'?: string
  facet?: ('class' | 'visit-year-month-gender-facet')[]
  uniqueFacet?: 'patient'[]
  _elements?: (
    | 'docstatus'
    | 'status'
    | 'type'
    | 'subject'
    | 'encounter'
    | 'date'
    | 'title'
    | 'event'
    | 'content'
    | 'context'
    | 'text'
    | 'description'
  )[]
}
export const fetchComposition = async (args: fetchCompositionProps) => {
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
    maxDate
  } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list, facet, uniqueFacet, _elements } = args
  const encounterIdentifier = args['encounter.identifier']
  const patientIdentifier = args['patient.identifier']

  _list = _list ? _list.filter(uniq) : []
  facet = facet ? facet.filter(uniq) : []
  uniqueFacet = uniqueFacet ? uniqueFacet.filter(uniq) : []
  _elements = _elements ? _elements.filter(uniq) : []

  // By default, all the calls to `/Composition` will have `type:not=doc-impor`, empty=false, and patient.active=true in parameter
  let options: string[] = ['type:not=doc-impor', 'empty=false', 'patient.active=true']
  if (_id) options = [...options, `_id=${_id}`] // eslint-disable-line
  if (size !== undefined) options = [...options, `size=${size}`] // eslint-disable-line
  if (offset) options = [...options, `offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`] // eslint-disable-line
  if (type) options = [...options, `type=${type}`] // eslint-disable-line
  if (_text)
    options = [...options, `${searchBy === SearchByTypes.text ? `_text` : 'description'}=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (highlight_search_results)
    options = [
      ...options,
      `${searchBy === SearchByTypes.text ? `highlight_search_results=true` : 'highlight_search_results=false'}`
    ] // eslint-disable-line
  if (status) options = [...options, `docstatus=${status}`] // eslint-disable-line
  if (patient) options = [...options, `patient=${patient}`] // eslint-disable-line
  if (patientIdentifier) options = [...options, `patient.identifier=${patientIdentifier}`] // eslint-disable-line
  if (encounter) options = [...options, `encounter=${encounter}`] // eslint-disable-line
  if (encounterIdentifier) options = [...options, `encounter.identifier=${encounterIdentifier}`] // eslint-disable-line
  if (onlyPdfAvailable) options = [...options, `is_pdf_available=${onlyPdfAvailable}`] // eslint-disable-line
  if (minDate) options = [...options, `date=ge${minDate}`] // eslint-disable-line
  if (maxDate) options = [...options, `date=le${maxDate}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(reducer)}`] // eslint-disable-line
  if (facet && facet.length > 0) options = [...options, `facet=${facet.reduce(reducer)}`] // eslint-disable-line
  if (uniqueFacet && uniqueFacet.length > 0) options = [...options, `uniqueFacet=${uniqueFacet.reduce(reducer)}`] // eslint-disable-line
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(reducer)}`] // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IDocumentReference>>(
    `/DocumentReference?${options.reduce(optionsReducer)}`,
    { signal: signal }
  )

  return response
}

export const fetchCheckDocumentSearchInput = async (searchInput: string, signal?: AbortSignal) => {
  const checkDocumentSearchInput = await apiFhir.get<CohortComposition>(
    `/Composition/$text?_text=${encodeURIComponent(searchInput)}`,
    { signal: signal }
  )
  return checkDocumentSearchInput.data.parameter ?? null
}

export const fetchCompositionContent = async (compositionId: string) => {
  const documentResp = await apiFhir.get<IDocumentReference>(`/DocumentReference/${compositionId}`)

  return documentResp.data ?? []
}

/**
 * Binary Resource
 *
 */

type fetchBinaryProps = { _id?: string; _list?: string[] }
export const fetchBinary = async (args: fetchBinaryProps) => {
  const { _id } = args
  let { _list } = args
  let options: string[] = []

  _list = _list ? _list.filter(uniq) : []

  if (_id) options = [...options, `_id=${_id}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(reducer)}`] // eslint-disable-line

  const documentResp = await apiFhir.get<IBinary>(`/Binary?${options.reduce(optionsReducer)}`)

  return documentResp.data ?? []
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
  patient?: string
  code?: string
  minDate?: string
  maxDate?: string
  _text?: string
  status?: string
  'encounter.identifier'?: string
}
export const fetchProcedure = async (args: fetchProcedureProps) => {
  const { size, offset, _sort, sortDirection, subject, patient, code, _text, status, minDate, maxDate } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list } = args
  const encounterIdentifier = args['encounter.identifier']

  _list = _list ? _list.filter(uniq) : []

  // By default, all the calls to `/Procedure` will have 'patient.active=true' in parameter
  let options: string[] = ['patient.active=true']
  if (size !== undefined) options = [...options, `size=${size}`] // eslint-disable-line
  if (offset) options = [...options, `offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`] // eslint-disable-line
  if (subject) options = [...options, `subject=${subject}`] // eslint-disable-line
  if (patient) options = [...options, `patient=${patient}`] // eslint-disable-line
  if (code) options = [...options, `code=${code}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (status) options = [...options, `status=${status}`] // eslint-disable-line
  if (encounterIdentifier) options = [...options, `encounter.identifier=${encounterIdentifier}`] // eslint-disable-line
  if (minDate) options = [...options, `date=ge${minDate}`] // eslint-disable-line
  if (maxDate) options = [...options, `date=le${maxDate}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(reducer)}`] // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IProcedure>>(`/Procedure?${options.reduce(optionsReducer)}`)

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
  subject?: string
  patient?: string
  diagnosis?: string
  minCreated?: string
  maxCreated?: string
  _text?: string
  status?: string
  'encounter.identifier'?: string
}
export const fetchClaim = async (args: fetchClaimProps) => {
  const { size, offset, _sort, sortDirection, subject, patient, diagnosis, _text, status, minCreated, maxCreated } =
    args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list } = args
  const encounterIdentifier = args['encounter.identifier']

  _list = _list ? _list.filter(uniq) : []

  // By default, all the calls to `/Claim` will have 'patient.active=true' in parameter
  let options: string[] = ['patient.active=true']
  if (size !== undefined) options = [...options, `size=${size}`] // eslint-disable-line
  if (offset) options = [...options, `offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`] // eslint-disable-line
  if (subject) options = [...options, `subject=${subject}`] // eslint-disable-line
  if (patient) options = [...options, `patient=${patient}`] // eslint-disable-line
  if (diagnosis) options = [...options, `diagnosis=${diagnosis}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (status) options = [...options, `status=${status}`] // eslint-disable-line
  if (encounterIdentifier) options = [...options, `encounter.identifier=${encounterIdentifier}`] // eslint-disable-line
  if (minCreated) options = [...options, `created=ge${minCreated}`] // eslint-disable-line
  if (maxCreated) options = [...options, `created=le${maxCreated}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(reducer)}`] // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IClaim>>(`/Claim?${options.reduce(optionsReducer)}`)

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
  _sort?: string
  sortDirection?: 'asc' | 'desc'
  subject?: string
  patient?: string
  code?: string
  type?: string[]
  _text?: string
  status?: string
  'min-recorded-date'?: string
  'max-recorded-date'?: string
  'encounter.identifier'?: string
}
export const fetchCondition = async (args: fetchConditionProps) => {
  const { size, offset, _sort, sortDirection, subject, patient, code, _text, status } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list, type } = args
  const encounterIdentifier = args['encounter.identifier']
  const minRecordedDate = args['min-recorded-date']
  const maxRecordedDate = args['max-recorded-date']

  _list = _list ? _list.filter(uniq) : []
  type = type ? type.filter(uniq) : []

  // By default, all the calls to `/Condition` will have 'patient.active=true' in parameter
  let options: string[] = ['patient.active=true']
  if (size !== undefined) options = [...options, `size=${size}`] // eslint-disable-line
  if (offset) options = [...options, `offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`] // eslint-disable-line
  if (subject) options = [...options, `subject=${subject}`] // eslint-disable-line
  if (patient) options = [...options, `patient=${patient}`] // eslint-disable-line
  if (code) options = [...options, `code=${code}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (status) options = [...options, `status=${status}`] // eslint-disable-line
  if (encounterIdentifier) options = [...options, `encounter.identifier=${encounterIdentifier}`] // eslint-disable-line
  if (minRecordedDate) options = [...options, `recorded-date=ge${minRecordedDate}`] // eslint-disable-line
  if (maxRecordedDate) options = [...options, `recorded-date=le${maxRecordedDate}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(reducer)}`] // eslint-disable-line
  if (type && type.length > 0) options = [...options, `type=${type.reduce(reducer)}`] // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<ICondition>>(`/Condition?${options.reduce(optionsReducer)}`)

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
  patient?: string
  type?: string
  minDate?: string
  maxDate?: string
  _list?: string[]
}
export const fetchObservation = async (args: fetchObservationProps) => {
  const { id, size, offset, _sort, sortDirection, _text, encounter, loinc, anabio, patient, type, minDate, maxDate } =
    args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list } = args

  _list = _list ? _list.filter(uniq) : []

  // By default, all the calls to `/Observation` will have 'value-quantity-value=ge0,le0' and 'patient.active=true' in the parameters
  let options: string[] = ['value-quantity-value=ge0,le0', 'patient.active=true']
  if (id) options = [...options, `id=${id}`] // eslint-disable-line
  if (size !== undefined) options = [...options, `size=${size}`] // eslint-disable-line
  if (offset) options = [...options, `offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort.includes('code') ? _sort : `${_sort},id`}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (encounter) options = [...options, `encounter.identifier=${encounter}`] // eslint-disable-line
  if (anabio || loinc) options = [...options, `code=${anabio ? `${anabio},` : ''}${loinc}`] // eslint-disable-line
  if (patient) options = [...options, `patient=${patient}`] // eslint-disable-line
  if (type) options = [...options, `type=${type}`] // eslint-disable-line
  if (minDate) options = [...options, `effectiveDatetime=ge${minDate}`] // eslint-disable-line
  if (maxDate) options = [...options, `effectiveDatetime=le${maxDate}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(reducer)}`] // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IObservation>>(`/Observation?${options.reduce(optionsReducer)}`)

  return response
}

type fetchMedicationRequestProps = {
  id?: string
  size?: number
  offset?: number
  _sort?: string
  sortDirection?: 'asc' | 'desc'
  _text?: string
  encounter?: string
  patient?: string
  type?: string
  minDate?: string
  maxDate?: string
  _list?: string[]
}
export const fetchMedicationRequest = async (args: fetchMedicationRequestProps) => {
  const { id, size, offset, _sort, sortDirection, _text, encounter, patient, type, minDate, maxDate } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list } = args

  _list = _list ? _list.filter(uniq) : []

  // By default, all the calls to `/MedicationRequest` will have 'patient.active=true' in parameter
  let options: string[] = ['patient.active=true']
  if (id) options = [...options, `id=${id}`] // eslint-disable-line
  if (size !== undefined) options = [...options, `size=${size}`] // eslint-disable-line
  if (offset) options = [...options, `offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`] // eslint-disable-line
  if (patient) options = [...options, `patient=${patient}`] // eslint-disable-line
  if (encounter) options = [...options, `encounter.identifier=${encounter}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (type) options = [...options, `type=${type}`] // eslint-disable-line
  if (minDate) options = [...options, `Period-start=ge${minDate}`] // eslint-disable-line
  if (maxDate) options = [...options, `Period-start=le${maxDate}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(reducer)}`] // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IMedicationRequest>>(
    `/MedicationRequest?${options.reduce(optionsReducer)}`
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
  patient?: string
  route?: string
  minDate?: string
  maxDate?: string
  _list?: string[]
}
export const fetchMedicationAdministration = async (args: fetchMedicationAdministrationProps) => {
  const { id, size, offset, _sort, sortDirection, _text, encounter, patient, route, minDate, maxDate } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list } = args

  _list = _list ? _list.filter(uniq) : []

  // By default, all the calls to `/MedicationAdministration` will have 'patient.active=true' in parameter
  let options: string[] = ['patient.active=true']
  if (id) options = [...options, `id=${id}`] // eslint-disable-line
  if (size !== undefined) options = [...options, `size=${size}`] // eslint-disable-line
  if (offset) options = [...options, `offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`] // eslint-disable-line
  if (patient) options = [...options, `patient=${patient}`] // eslint-disable-line
  if (encounter) options = [...options, `encounter.identifier=${encounter}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (route) options = [...options, `route=${route}`] // eslint-disable-line
  if (minDate) options = [...options, `Period-start=ge${minDate}`] // eslint-disable-line
  if (maxDate) options = [...options, `Period-start=le${maxDate}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(reducer)}`] // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IMedicationAdministration>>(
    `/MedicationAdministration?${options.reduce(optionsReducer)}`
  )

  return response
}

type fetchScopeProps = {
  perimetersIds?: string[]
  cohortIds?: string[]
  types?: string[]
}
export const fetchScope: (args: fetchScopeProps) => Promise<AxiosResponse<IScope | unknown>> = async (
  args: fetchScopeProps
) => {
  const { perimetersIds, cohortIds, types } = args

  let options: string[] = []
  if (perimetersIds && perimetersIds.length > 0) options = [...options, `local_id=${perimetersIds.join(',')}`] // eslint-disable-line
  if (cohortIds && cohortIds.length > 0) options = [...options, `cohort_id=${cohortIds.join(',')}`] // eslint-disable-line
  if (types && types.length > 0) options = [...options, `type_source_value=${types.join(',')}`] // eslint-disable-line

  const response: AxiosResponse<IScope | unknown> = await apiBackend.get(
    `accesses/perimeters/read-patient/?${options.reduce(optionsReducer)}`
  )
  return response
}
