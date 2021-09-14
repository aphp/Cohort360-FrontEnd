import apiFhir from '../apiFhir'

import { FHIR_API_Response } from 'types'
import {
  PatientGenderKind,
  IOrganization,
  IGroup,
  IPatient,
  IEncounter,
  IComposition,
  IPractitioner,
  IPractitionerRole,
  IProcedure,
  IClaim,
  ICondition
} from '@ahryman40k/ts-fhir-types/lib/R4'

// import { getApiResponseResources } from 'utils/apiHelpers'

const reducer = (accumulator: any, currentValue: any) =>
  accumulator ? `${accumulator},${currentValue}` : currentValue ? currentValue : accumulator
const optionsReducer = (accumulator: any, currentValue: any) =>
  accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator

const uniq = (item: any, index: number, array: any[]) => array.indexOf(item) === index

/**
 * Organization Resource
 *
 */

type fetchOrganizationProps = {
  _id?: string
  partof?: string
  _elements: ('name' | 'extension' | 'alias')[]
}
export const fetchOrganization = async (args: fetchOrganizationProps) => {
  const { _id, partof } = args
  let { _elements } = args

  _elements = _elements ? _elements.filter(uniq) : []

  let options: string[] = []
  if (_id)                                         options = [...options, `_id=${_id}`]                                                         // eslint-disable-line
  if (partof)                                      options = [...options, `partof=${partof}`]                                                   // eslint-disable-line

  if (_elements && _elements.length > 0)           options = [...options, `_elements=${_elements.reduce(reducer)}`]                             // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IOrganization>>(
    `/Organization?${options.reduce(optionsReducer)}`
  )
  // const data = getApiResponseResources(response)

  return response
}
/**
 * Group Resource
 *
 */

type fetchGroupProps = {
  _id?: string // ID of Group
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
  if (_id)                                         options = [...options, `_id=${_id}`]                                                         // eslint-disable-line
  if (provider)                                    options = [...options, `provider=${provider}`]                                               // eslint-disable-line

  if (_list && _list.length > 0)                   options = [...options, `_list=${_list.reduce(reducer)}`]                                     // eslint-disable-line
  if (_elements && _elements.length > 0)           options = [...options, `_elements=${_elements.reduce(reducer)}`]                             // eslint-disable-line
  if (managingEntity && managingEntity.length > 0) options = [...options, `managingEntity=${managingEntity.reduce(reducer)}`]                   // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IGroup>>(`/Group?${options.reduce(optionsReducer)}`)
  // const data = getApiResponseResources(response)

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
  gender?: PatientGenderKind
  birthdate?: string[]
  searchBy?: string
  _text?: string
  family?: string
  given?: string
  identifier?: string
  deceased?: boolean
  pivotFacet?: ('age_gender' | 'deceased_gender')[]
  _elements?: ('id' | 'gender' | 'name' | 'birthDate' | 'deceased' | 'identifier' | 'extension')[]
}
export const fetchPatient = async (args: fetchPatientProps) => {
  const { _id, size, offset, _sort, sortDirection, gender, _text, searchBy, family, given, identifier, deceased } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list, birthdate, pivotFacet, _elements } = args

  _list = _list ? _list.filter(uniq) : []
  birthdate = birthdate ? birthdate.filter(uniq) : []
  pivotFacet = pivotFacet ? pivotFacet.filter(uniq) : []
  _elements = _elements ? _elements.filter(uniq) : []

  let options: string[] = []
  if (_id)                                         options = [...options, `_id=${_id}`]                                                         // eslint-disable-line
  if (size)                                        options = [...options, `size=${size}`]                                                       // eslint-disable-line
  if (offset)                                      options = [...options, `offset=${offset}`]                                                   // eslint-disable-line
  if (_sort)                                       options = [...options, `_sort=${_sortDirection}${_sort}`]                                    // eslint-disable-line
  if (gender)                                      options = [...options, `gender=${gender}`]                                                   // eslint-disable-line
  if (_text)                                       options = [...options, `${searchBy ? searchBy : '_text'}=${_text}`]                          // eslint-disable-line
  if (family)                                      options = [...options, `family=${family}`]                                                   // eslint-disable-line
  if (given)                                       options = [...options, `given=${given}`]                                                     // eslint-disable-line
  if (identifier)                                  options = [...options, `identifier=${identifier}`]                                           // eslint-disable-line
  if (deceased)                                    options = [...options, `deceased=${deceased}`]                                               // eslint-disable-line

  if (_list && _list.length > 0)                   options = [...options, `_list=${_list.reduce(reducer)}`]                                     // eslint-disable-line
  if (pivotFacet && pivotFacet.length > 0)         options = [...options, `pivotFacet=${pivotFacet.reduce(reducer)}`]                           // eslint-disable-line
  if (_elements && _elements.length > 0)           options = [...options, `_elements=${_elements.reduce(reducer)}`]                             // eslint-disable-line
  // Warning : birthdate key it's not :
  //    birthdate=${birthdate[0]},${birthdate[1]}
  // but
  //    birthdate=${birthdate[0]}&birthdate=${birthdate[1]}
  if (birthdate && birthdate.length > 0)           options = [...options, `birthdate=${birthdate.reduce(optionsReducer)}`]                      // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IPatient>>(`/Patient?${options.reduce(optionsReducer)}`)
  // const data = getApiResponseResources(response)

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
  size?: number
  offset?: number
  _sort?: string
  sortDirection?: 'asc' | 'desc'
  patient?: string
  status?: string[]
  facet?: ('class' | 'visit-year-month-gender-facet')[]
  _elements?: ('status' | 'serviceProvider' | 'identifier')[]
}
export const fetchEncounter = async (args: fetchEncounterProps) => {
  console.log(`args`, args)
  const { _id, size, offset, _sort, sortDirection, patient, type } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list, _elements, status, facet } = args

  _list = _list ? _list.filter(uniq) : []
  status = status ? status.filter(uniq) : []
  _elements = _elements ? _elements.filter(uniq) : []
  facet = facet ? facet.filter(uniq) : []

  let options: string[] = []
  if (_id)                                         options = [...options, `_id=${_id}`]                                                         // eslint-disable-line
  if (size !== undefined)                          options = [...options, `size=${size}`]                                                       // eslint-disable-line
  if (offset)                                      options = [...options, `offset=${offset}`]                                                   // eslint-disable-line
  if (_sort)                                       options = [...options, `_sort=${_sortDirection}${_sort}`]                                    // eslint-disable-line
  if (patient)                                     options = [...options, `patient=${patient}`]                                                 // eslint-disable-line
  if (type)                                        options = [...options, `type=${type}`]                                                       // eslint-disable-line

  if (_list && _list.length > 0)                   options = [...options, `_list=${_list.reduce(reducer)}`]                                     // eslint-disable-line
  if (status && status.length > 0)                 options = [...options, `status=${status.reduce(reducer)}`]                                   // eslint-disable-line
  if (_elements && _elements.length > 0)           options = [...options, `_elements=${_elements.reduce(reducer)}`]                             // eslint-disable-line
  if (facet && facet.length > 0)                   options = [...options, `facet=${facet.reduce(reducer)}`]                                     // eslint-disable-line


  const response = await apiFhir.get<FHIR_API_Response<IEncounter>>(`/Encounter?${options.reduce(optionsReducer)}`)
  // const data = getApiResponseResources(response)

  return response
}

/**
 * Composition Resource
 *
 */

type fetchCompositionProps = {
  _id?: string
  _list?: string[]
  size?: number
  offset?: number
  _sort?: string
  sortDirection?: 'asc' | 'desc'
  type?: string
  date?: string[]
  _text?: string
  status?: string
  patient?: string
  encounter?: string
  'encounter.identifier'?: string
  facet?: ('class' | 'visit-year-month-gender-facet')[]
  _elements?: ('status' | 'type' | 'subject' | 'encounter' | 'date' | 'title')[]
}
export const fetchComposition = async (args: fetchCompositionProps) => {
  const { _id, size, offset, _sort, sortDirection, type, _text, status, patient, encounter } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list, date, facet, _elements } = args
  const encounterIdentifier = args['encounter.identifier']

  _list = _list ? _list.filter(uniq) : []
  date = date ? date.filter(uniq) : []
  facet = facet ? facet.filter(uniq) : []
  _elements = _elements ? _elements.filter(uniq) : []

  // By default, all the calls to `/Composition` will have `type:not=doc-impor in parameter
  let options: string[] = ['type:not=doc-impor']
  if (_id)                                         options = [...options, `_id=${_id}`]                                                         // eslint-disable-line
  if (size)                                        options = [...options, `size=${size}`]                                                       // eslint-disable-line
  if (offset)                                      options = [...options, `offset=${offset}`]                                                   // eslint-disable-line
  if (_sort)                                       options = [...options, `_sort=${_sortDirection}${_sort}`]                                    // eslint-disable-line
  if (type)                                        options = [...options, `type=${type}`]                                                       // eslint-disable-line
  if (_text)                                       options = [...options, `_text=${_text}`]                                                     // eslint-disable-line
  if (status)                                      options = [...options, `status=${status}`]                                                   // eslint-disable-line
  if (patient)                                     options = [...options, `patient=${patient}`]                                                 // eslint-disable-line
  if (encounter)                                   options = [...options, `encounter=${encounter}`]                                             // eslint-disable-line
  if (encounterIdentifier)                         options = [...options, `encounter.identifier=${encounterIdentifier}`]                        // eslint-disable-line

  if (_list && _list.length > 0)                   options = [...options, `_list=${_list.reduce(reducer)}`]                                     // eslint-disable-line
  if (facet && facet.length > 0)                   options = [...options, `facet=${facet.reduce(reducer)}`]                                     // eslint-disable-line
  if (_elements && _elements.length > 0)           options = [...options, `_elements=${_elements.reduce(reducer)}`]                             // eslint-disable-line
  // Warning : date key it's not :
  //    date=${date[0]},${date[1]}
  // but
  //    date=${date[0]}&date=${date[1]}
  if (date && date.length > 0)                     options = [...options, `date=${date.reduce(optionsReducer)}`]                                // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IComposition>>(`/Composition?${options.reduce(optionsReducer)}`)
  // const data = getApiResponseResources(response)

  return response
}

export const fetchCompositionContent = async (compositionId: string) => {
  const documentResp = await apiFhir.get<IComposition>(`/Composition/${compositionId}`)

  return documentResp.data.section ?? []
}

/**
 * Practitioner Resource
 *
 */

type fetchPractitionerProps = {
  identifier: string
}
export const fetchPractitioner = async (args: fetchPractitionerProps) => {
  const { identifier } = args

  let options: string[] = []
  if (identifier)                                  options = [...options, `identifier=${identifier}`]                                           // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IPractitioner>>(
    `/Practitioner?${options.reduce(optionsReducer)}`
  )
  // const data = getApiResponseResources(response)

  return response
}

/**
 * PractitionerRole Resource
 *
 */

type fetchPractitionerRoleProps = {
  practitioner?: string
  _elements?: ('extension' | 'organization')[]
}
export const fetchPractitionerRole = async (args: fetchPractitionerRoleProps) => {
  const { practitioner } = args
  let { _elements } = args

  _elements = _elements ? _elements.filter(uniq) : []

  let options: string[] = []
  if (practitioner)                                options = [...options, `practitioner=${practitioner}`]                                       // eslint-disable-line

  if (_elements && _elements.length > 0)           options = [...options, `_elements=${_elements.reduce(reducer)}`]                             // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IPractitionerRole>>(
    `/PractitionerRole?${options.reduce(optionsReducer)}`
  )
  // const data = getApiResponseResources(response)

  return response
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
  date?: string[]
  _text?: string
  status?: string
  'encounter.identifier'?: string
}
export const fetchProcedure = async (args: fetchProcedureProps) => {
  const { size, offset, _sort, sortDirection, subject, patient, code, _text, status } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list, date } = args
  const encounterIdentifier = args['encounter.identifier']

  _list = _list ? _list.filter(uniq) : []
  date = date ? date.filter(uniq) : []

  let options: string[] = []
  if (size)                                        options = [...options, `size=${size}`]                                                       // eslint-disable-line
  if (offset)                                      options = [...options, `offset=${offset}`]                                                   // eslint-disable-line
  if (_sort)                                       options = [...options, `_sort=${_sortDirection}${_sort}`]                                    // eslint-disable-line
  if (subject)                                     options = [...options, `subject=${subject}`]                                                 // eslint-disable-line
  if (patient)                                     options = [...options, `patient=${patient}`]                                                 // eslint-disable-line
  if (code)                                        options = [...options, `code=${code}`]                                                       // eslint-disable-line
  if (_text)                                       options = [...options, `_text=${_text}`]                                                     // eslint-disable-line
  if (status)                                      options = [...options, `status=${status}`]                                                   // eslint-disable-line
  if (encounterIdentifier)                         options = [...options, `encounter.identifier=${encounterIdentifier}`]                        // eslint-disable-line

  if (_list && _list.length > 0)                   options = [...options, `_list=${_list.reduce(reducer)}`]                                     // eslint-disable-line
  // Warning : date key it's not :
  //    date=${date[0]},${date[1]}
  // but
  //    date=${date[0]}&date=${date[1]}
  if (date && date.length > 0)                     options = [...options, `date=${date.reduce(optionsReducer)}`]                                // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IProcedure>>(`/Procedure?${options.reduce(optionsReducer)}`)
  // const data = getApiResponseResources(response)

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
  created?: string[]
  _text?: string
  status?: string
  'encounter.identifier'?: string
}
export const fetchClaim = async (args: fetchClaimProps) => {
  const { size, offset, _sort, sortDirection, subject, patient, diagnosis, _text, status } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list, created } = args
  const encounterIdentifier = args['encounter.identifier']

  _list = _list ? _list.filter(uniq) : []
  created = created ? created.filter(uniq) : []

  let options: string[] = []
  if (size)                                        options = [...options, `size=${size}`]                                                       // eslint-disable-line
  if (offset)                                      options = [...options, `offset=${offset}`]                                                   // eslint-disable-line
  if (_sort)                                       options = [...options, `_sort=${_sortDirection}${_sort}`]                                    // eslint-disable-line
  if (subject)                                     options = [...options, `subject=${subject}`]                                                 // eslint-disable-line
  if (patient)                                     options = [...options, `patient=${patient}`]                                                 // eslint-disable-line
  if (diagnosis)                                   options = [...options, `diagnosis=${diagnosis}`]                                             // eslint-disable-line
  if (_text)                                       options = [...options, `_text=${_text}`]                                                     // eslint-disable-line
  if (status)                                      options = [...options, `status=${status}`]                                                   // eslint-disable-line
  if (encounterIdentifier)                         options = [...options, `encounter.identifier=${encounterIdentifier}`]                        // eslint-disable-line

  if (_list && _list.length > 0)                   options = [...options, `_list=${_list.reduce(reducer)}`]                                     // eslint-disable-line
  // Warning : created key it's not :
  //    created=${created[0]},${created[1]}
  // but
  //    created=${created[0]}&created=${created[1]}
  if (created)                                     options = [...options, `created=${created.reduce(optionsReducer)}`]                          // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<IClaim>>(`/Claim?${options.reduce(optionsReducer)}`)
  // const data = getApiResponseResources(response)

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
  'recorded-date'?: string[]
  _text?: string
  status?: string
  'encounter.identifier'?: string
}
export const fetchCondition = async (args: fetchConditionProps) => {
  const { size, offset, _sort, sortDirection, subject, patient, code, _text, status } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list } = args
  let recordedDate = args['recorded-date']
  const encounterIdentifier = args['encounter.identifier']

  _list = _list ? _list.filter(uniq) : []
  recordedDate = recordedDate ? recordedDate.filter(uniq) : []

  let options: string[] = []
  if (size)                                        options = [...options, `size=${size}`]                                                       // eslint-disable-line
  if (offset)                                      options = [...options, `offset=${offset}`]                                                   // eslint-disable-line
  if (_sort)                                       options = [...options, `_sort=${_sortDirection}${_sort}`]                                    // eslint-disable-line
  if (subject)                                     options = [...options, `subject=${subject}`]                                                 // eslint-disable-line
  if (patient)                                     options = [...options, `patient=${patient}`]                                                 // eslint-disable-line
  if (code)                                        options = [...options, `code=${code}`]                                                       // eslint-disable-line
  if (_text)                                       options = [...options, `_text=${_text}`]                                                     // eslint-disable-line
  if (status)                                      options = [...options, `status=${status}`]                                                   // eslint-disable-line
  if (encounterIdentifier)                         options = [...options, `encounter.identifier=${encounterIdentifier}`]                        // eslint-disable-line

  if (_list && _list.length > 0)                   options = [...options, `_list=${_list.reduce(reducer)}`]                                     // eslint-disable-line
  // Warning : recordedDate key it's not :
  //    recordedDate=${recordedDate[0]},${recordedDate[1]}
  // but
  //    recordedDate=${recordedDate[0]}&recordedDate=${recordedDate[1]}
  if (recordedDate && recordedDate.length > 0)     options = [...options, `recorded-date=${recordedDate.reduce(optionsReducer)}`]               // eslint-disable-line

  const response = await apiFhir.get<FHIR_API_Response<ICondition>>(`/Condition?${options.reduce(optionsReducer)}`)
  // const data = getApiResponseResources(response)

  return response
}
