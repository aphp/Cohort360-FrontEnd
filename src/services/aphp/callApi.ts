import apiFhir from '../apiFhir'
import {
  BiologyStatus,
  FHIR_API_Promise_Response,
  FHIR_API_Response,
  FHIR_Bundle_Promise_Response,
  HierarchyElement
} from 'types'

import { SearchByTypes, FHIR_Bundle_Response, IScope, AccessExpiration, AccessExpirationsProps } from 'types'
import { AxiosResponse } from 'axios'
import apiBackend from '../apiBackend'
import {
  Binary,
  Claim,
  Condition,
  DocumentReference,
  Encounter,
  Group,
  MedicationAdministration,
  MedicationRequest,
  OperationOutcome,
  Parameters,
  ParametersParameter,
  Patient,
  Procedure,
  ValueSet
} from 'fhir/r4'
import { Observation } from 'fhir/r4'
import { getApiResponseResourceOrThrow, getApiResponseResourcesOrThrow } from 'utils/apiHelpers'
import { idSort, labelSort } from 'utils/alphabeticalSort'
import { capitalizeFirstLetter } from 'utils/capitalize'

const paramValuesReducerWithPrefix =
  (prefix: string): ((accumulator: string, currentValue: string) => string) =>
  (accumulator: string, currentValue: string) =>
    accumulator ? `${accumulator},${prefix + currentValue}` : currentValue ? prefix + currentValue : accumulator
const paramValuesReducer = (accumulator: any, currentValue: any): any =>
  accumulator ? `${accumulator},${currentValue}` : currentValue ? currentValue : accumulator
const paramsReducer = (accumulator: string, currentValue: string): string =>
  accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator

const uniq = (item: string, index: number, array: string[]) => array.indexOf(item) === index && item

/**
 * Group Resource
 *
 */

type fetchGroupProps = {
  _id?: string | (string | undefined)[] // ID of Group
  managingEntity?: string[] // ID List of organization
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchGroup = async (args: fetchGroupProps): FHIR_Bundle_Promise_Response<Group> => {
  const { _id, managingEntity } = args

  let options: string[] = []
  if (_id) options = [...options, `_id=${_id}`] // eslint-disable-line
  if (managingEntity && managingEntity.length > 0)
    options = [...options, `managing-entity=${managingEntity.filter(uniq).reduce(paramValuesReducer)}`] // eslint-disable-line

  const response = await apiFhir.get<FHIR_Bundle_Response<Group>>(`/Group?${options.reduce(paramsReducer)}`)

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
  gender?: string | null
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

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`] // eslint-disable-line
  if (pivotFacet && pivotFacet.length > 0) options = [...options, `pivot-facet=${pivotFacet.reduce(paramValuesReducer)}`] // eslint-disable-line
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(paramValuesReducer)}`] // eslint-disable-line

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
  if (_id) options = [...options, `_id=${_id}`] // eslint-disable-line
  if (size !== undefined) options = [...options, `_count=${size}`] // eslint-disable-line
  if (offset) options = [...options, `offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`] // eslint-disable-line
  if (patient) options = [...options, `subject=${patient}`] // eslint-disable-line
  if (type) options = [...options, `type=${type}`] // eslint-disable-line
  if (typeNot) options = [...options, `type:not=${typeNot}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`] // eslint-disable-line
  if (status && status.length > 0) options = [...options, `status=${status.reduce(paramValuesReducer)}`] // eslint-disable-line
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(paramValuesReducer)}`] // eslint-disable-line
  if (facet && facet.length > 0) options = [...options, `facet=${facet.reduce(paramValuesReducer)}`] // eslint-disable-line

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
  if (_id) options = [...options, `_id=${_id}`] // eslint-disable-line
  if (size !== undefined) options = [...options, `_count=${size}`] // eslint-disable-line
  if (offset) options = [...options, `offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`] // eslint-disable-line
  if (type) options = [...options, `type=${type}`] // eslint-disable-line
  if (_text)
    options = [...options, `${searchBy === SearchByTypes.text ? `_text` : 'description'}=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (highlight_search_results)
    options = [
      ...options,
      `${
        searchBy === SearchByTypes.text
          ? `_tag=${encodeURIComponent('https://terminology.eds.aphp.fr/misc|HIGHLIGHT_RESULTS')}`
          : ''
      }`
    ] // eslint-disable-line
  if (status) options = [...options, `docstatus=${encodeURIComponent('http://hl7.org/fhir/CodeSystem/composition-status|')+status}`] // eslint-disable-line
  if (patient) options = [...options, `subject=${patient}`] // eslint-disable-line
  if (patientIdentifier) options = [...options, `subject.identifier=${patientIdentifier}`] // eslint-disable-line
  if (encounter) options = [...options, `encounter=${encounter}`] // eslint-disable-line
  if (encounterIdentifier) options = [...options, `encounter.identifier=${encounterIdentifier}`] // eslint-disable-line
  if (onlyPdfAvailable) options = [...options, `contenttype=${encodeURIComponent('http://terminology.hl7.org/CodeSystem/v3-mediatypes|application/pdf')}`] // eslint-disable-line
  if (minDate) options = [...options, `date=ge${minDate}`] // eslint-disable-line
  if (maxDate) options = [...options, `date=le${maxDate}`] // eslint-disable-line
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `encounter.encounter-care-site=${executiveUnits}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`] // eslint-disable-line
  if (facet && facet.length > 0) options = [...options, `facet=${facet.reduce(paramValuesReducer)}`] // eslint-disable-line
  if (uniqueFacet && uniqueFacet.length > 0) options = [...options, `unique-facet=${uniqueFacet.reduce(paramValuesReducer)}`] // eslint-disable-line
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(paramValuesReducer)}`] // eslint-disable-line

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
 * Binary Resource
 *
 */

type fetchBinaryProps = { _id?: string }
export const fetchBinary = async (args: fetchBinaryProps): FHIR_Bundle_Promise_Response<Binary> => {
  const { _id } = args
  let options: string[] = []

  if (_id) options = [...options, `_id=${_id}`] // eslint-disable-line

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
  minDate?: string
  maxDate?: string
  _text?: string
  status?: string
  signal?: AbortSignal
  'encounter-identifier'?: string
  executiveUnits?: string[]
}
export const fetchProcedure = async (args: fetchProcedureProps): FHIR_Bundle_Promise_Response<Procedure> => {
  const { size, offset, _sort, sortDirection, subject, code, _text, status, minDate, maxDate, executiveUnits } = args
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
  if (code) options = [...options, `code=${encodeURIComponent('https://terminology.eds.aphp.fr/aphp-orbis-ccam|') + code}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (status) options = [...options, `status=${encodeURIComponent('http://hl7.org/fhir/CodeSystem/event-status|') + status}`] // eslint-disable-line
  if (encounterIdentifier) options = [...options, `encounter.identifier=${encounterIdentifier}`] // eslint-disable-line
  if (minDate) options = [...options, `date=ge${minDate}`] // eslint-disable-line
  if (maxDate) options = [...options, `date=le${maxDate}`] // eslint-disable-line
  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`] // eslint-disable-line
  if (executiveUnits && executiveUnits.length > 0)
    options = [...options, `encounter.encounter-care-site=${executiveUnits}`] // eslint-disable-line

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
  if (diagnosis) options = [...options, `diagnosis=${encodeURIComponent('https://terminology.eds.aphp.fr/aphp-orbis-ghm|') + diagnosis}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (status) options = [...options, `status=${encodeURIComponent('https://terminology.eds.aphp.fr/aphp-orbis-ghm-cost-status|') + status}`] // eslint-disable-line
  if (encounterIdentifier) options = [...options, `encounter.identifier=${encounterIdentifier}`] // eslint-disable-line
  if (minCreated) options = [...options, `created=ge${minCreated}`] // eslint-disable-line
  if (maxCreated) options = [...options, `created=le${maxCreated}`] // eslint-disable-line
  if (executiveUnits && executiveUnits.length > 0) options = [...options, `encounter.encounter-care-site=${executiveUnits}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`] // eslint-disable-line

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
  _sort?: string
  sortDirection?: 'asc' | 'desc'
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
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
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
  if (code) options = [...options, `code=${encodeURIComponent('https://terminology.eds.aphp.fr/aphp-orbis-cim10|') + code}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (encounterIdentifier) options = [...options, `encounter.identifier=${encounterIdentifier}`] // eslint-disable-line
  if (minRecordedDate) options = [...options, `recorded-date=ge${minRecordedDate}`] // eslint-disable-line
  if (maxRecordedDate) options = [...options, `recorded-date=le${maxRecordedDate}`] // eslint-disable-line
  if (executiveUnits && executiveUnits.length > 0) options = [...options, `encounter.encounter-care-site=${executiveUnits}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`] // eslint-disable-line
  if (type && type.length > 0) options = [...options, `orbis-status=${type.reduce(paramValuesReducerWithPrefix(encodeURIComponent('https://terminology.eds.aphp.fr/aphp-orbis-condition-status|')))}`] // eslint-disable-line

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
  if (id) options = [...options, `_id=${id}`] // eslint-disable-line
  if (size !== undefined) options = [...options, `_count=${size}`] // eslint-disable-line
  if (offset) options = [...options, `offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort.includes('code') ? _sort : `${_sort},id`}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (encounter) options = [...options, `encounter.identifier=${encounter}`] // eslint-disable-line
  if (anabio || loinc) options = [...options, `code=${anabio ? encodeURIComponent('https://terminology.eds.aphp.fr/aphp-itm-anabio|') + anabio + ',' : ''}${encodeURIComponent('https://terminology.eds.aphp.fr/aphp-itm-loinc|') + loinc}`] // eslint-disable-line
  if (subject) options = [...options, `subject=${subject}`] // eslint-disable-line
  if (minDate) options = [...options, `date=ge${minDate}`] // eslint-disable-line
  if (maxDate) options = [...options, `date=le${maxDate}`] // eslint-disable-line
  if (rowStatus) options = [...options, `status=${BiologyStatus.VALIDATED}`] // eslint-disable-line
  if (executiveUnits && executiveUnits.length > 0) options = [...options, `encounter.encounter-care-site=${executiveUnits}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`] // eslint-disable-line

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
  _sort?: string
  sortDirection?: 'asc' | 'desc'
  _text?: string
  encounter?: string
  subject?: string
  type?: string
  minDate?: string
  maxDate?: string
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
  if (id) options = [...options, `_id=${id}`] // eslint-disable-line
  if (size !== undefined) options = [...options, `_count=${size}`] // eslint-disable-line
  if (offset !== undefined) options = [...options, `offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`] // eslint-disable-line
  if (subject) options = [...options, `subject=${subject}`] // eslint-disable-line
  if (encounter) options = [...options, `encounter.identifier=${encounter}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (type) options = [...options, `medication=*${encodeURIComponent('|')}${type}`] // eslint-disable-line
  if (minDate) options = [...options, `validity-period-start=ge${minDate}`] // eslint-disable-line
  if (maxDate) options = [...options, `validity-period-start=le${maxDate}`] // eslint-disable-line
  if (executiveUnits && executiveUnits.length > 0) options = [...options, `encounter.encounter-care-site=${executiveUnits}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`] // eslint-disable-line

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
  minDate?: string
  maxDate?: string
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
  if (id) options = [...options, `_id=${id}`] // eslint-disable-line
  if (size !== undefined) options = [...options, `_count=${size}`] // eslint-disable-line
  if (offset) options = [...options, `offset=${offset}`] // eslint-disable-line
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort},id`] // eslint-disable-line
  if (subject) options = [...options, `subject=${subject}`] // eslint-disable-line
  if (encounter) options = [...options, `encounter.identifier=${encounter}`] // eslint-disable-line
  if (_text) options = [...options, `_text=${encodeURIComponent(_text)}`] // eslint-disable-line
  if (route) options = [...options, `dosage-route=${encodeURIComponent('https://terminology.eds.aphp.fr/aphp-orbis-medicament-voie-administration|') + route}`] // eslint-disable-line
  if (minDate) options = [...options, `effective-time=ge${minDate}`] // eslint-disable-line
  if (maxDate) options = [...options, `effective-time=le${maxDate}`] // eslint-disable-line
  if (executiveUnits && executiveUnits.length > 0) options = [...options, `encounter.encounter-care-site=${executiveUnits}`] // eslint-disable-line

  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(paramValuesReducer)}`] // eslint-disable-line

  const response = await apiFhir.get<FHIR_Bundle_Response<MedicationAdministration>>(
    `/MedicationAdministration?${options.reduce(paramsReducer)}`,
    {
      signal: signal
    }
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
 * @returns
 */
const getCodeList = async (
  codeSystem: string,
  expandCode?: string,
  search?: string,
  noStar = true
): Promise<{ code?: string; display?: string }[] | undefined> => {
  if (!expandCode) {
    if (search !== undefined && !search.trim()) {
      return []
    }
    let searchParam = ''
    // if search is * then we fetch the roots of the valueSet
    if (search !== '*' && search !== undefined) {
      // if noStar is true then we search for the code, else we search for the display
      searchParam = noStar
        ? `&only-roots=false&code=${search.trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}` //eslint-disable-line
        : `&only-roots=false&_text=${encodeURIComponent(search.trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'))}*` //eslint-disable-line  
    }
    // TODO test if it returns all the codes without specifying the count
    const res = await apiFhir.get<FHIR_Bundle_Response<ValueSet>>(`/ValueSet?reference=${codeSystem}${searchParam}`)
    const valueSetBundle = getApiResponseResourcesOrThrow(res)
    return valueSetBundle.length > 0 ? valueSetBundle[0].compose?.include?.[0].concept : []
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
    return valueSetExpansion?.contains
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
  options?: FetchValueSetOptions
): Promise<Array<HierarchyElement>> => {
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
  const codeList = await getCodeList(codeSystem, code, search, noStar)
  const sortingFunc = sortingKey === 'id' ? idSort : labelSort
  const formattedCodeList =
    codeList
      ?.map((code) => ({
        id: code.code || '',
        label: joinDisplayWithCode
          ? `${code.code} - ${capitalizeFirstLetter(code.display)}`
          : capitalizeFirstLetter(code.display),
        subItems: [{ id: 'loading', label: 'loading', subItems: [] as HierarchyElement[] }]
      }))
      .filter((code) => !filterOut(code))
      .sort(sortingFunc) || []
  if ((!code || search === '*') && valueSetTitle) {
    return [{ id: '*', label: valueSetTitle, subItems: formattedCodeList.filter((code) => filterRoots(code)) }]
  } else {
    return formattedCodeList
  }
}

type fetchScopeProps = {
  perimetersIds?: string[]
  cohortIds?: string[]
  search?: string
  page?: number
  type: string[]
}
export const fetchScope: (
  args: fetchScopeProps,
  signal?: AbortSignal
) => Promise<AxiosResponse<IScope | unknown>> = async (args: fetchScopeProps, signal?: AbortSignal) => {
  const { perimetersIds, cohortIds, search, page, type } = args

  let options: string[] = []
  if (search) options = [...options, `search=${search}`] // eslint-disable-line
  if (page) options = [...options, `page=${page}`] // eslint-disable-line
  if (perimetersIds && perimetersIds.length > 0) options = [...options, `local_id=${perimetersIds.join(',')}`] // eslint-disable-line
  if (cohortIds && cohortIds.length > 0) options = [...options, `cohort_id=${cohortIds.join(',')}`] // eslint-disable-line
  if (type && type.length > 0) options = [...options, `type_source_value=${type.join(',')}`] // eslint-disable-line

  const response: AxiosResponse<IScope | unknown> = await apiBackend.get(
    `accesses/perimeters/read-patient/?${options.reduce(paramsReducer)}`,
    { signal: signal }
  )
  return response
}

export const fetchAccessExpirations: (
  args: AccessExpirationsProps
) => Promise<AxiosResponse<AccessExpiration[]>> = async (args: AccessExpirationsProps) => {
  const { expiring } = args

  let options: string[] = []
  if (expiring === true || expiring === false) options = [...options, `expiring=${expiring}`] // eslint-disable-line

  const response: AxiosResponse<AccessExpiration[]> = await apiBackend.get(
    `accesses/accesses/my-accesses/?${options.reduce(paramsReducer)}`
  )
  return response
}
