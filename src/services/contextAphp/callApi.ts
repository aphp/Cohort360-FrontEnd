import apiFhir from '../apiFhir'

import { FHIR_API_Response } from 'types'
import { PatientGenderKind, IGroup, IPatient, IEncounter } from '@ahryman40k/ts-fhir-types/lib/R4'

import { getApiResponseResources } from 'utils/apiHelpers'

const reducer = (accumulator: any, currentValue: any) =>
  accumulator ? `${accumulator},${currentValue}` : currentValue ? currentValue : accumulator
const optionsReducer = (accumulator: any, currentValue: any) =>
  accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator

const uniq = (item: any, index: number, array: any[]) => array.indexOf(item) === index

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

  let options = ['?']
  if (_id) options = [...options, `_id=${_id}`]
  if (provider) options = [...options, `provider=${provider}`]
  if (_list && _list.length > 0) options = [...options, `_list=${_list.reduce(reducer)}`]
  if (_elements && _elements.length > 0) options = [...options, `_elements=${_elements.reduce(reducer)}`]
  if (managingEntity && managingEntity.length > 0)
    options = [...options, `managingEntity=${managingEntity.reduce(reducer)}`]

  const response = await apiFhir.get<FHIR_API_Response<IGroup>>(`/Groups${options.reduce(optionsReducer)}`)
  const data = getApiResponseResources(response)

  return data
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
  offset: number
  _sort?: string
  sortDirection: 'asc' | 'desc'
  gender: PatientGenderKind
  birthdate?: string[]
  _text?: string
  family?: string
  given?: string
  identifier?: string
  deceased?: boolean
  pivotFacet?: ('age_gender' | 'deceased_gender')[]
  _elements?: ('id' | 'gender' | 'name' | 'birthDate' | 'deceased' | 'identifier' | 'extension')[]
}
export const fetchPatient = async (args: fetchPatientProps) => {
  const { _id, size, offset, _sort, sortDirection, gender, _text, family, given, identifier, deceased } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list, birthdate, pivotFacet, _elements } = args

  _list = _list ? _list.filter(uniq) : []
  birthdate = birthdate ? birthdate.filter(uniq) : []
  pivotFacet = pivotFacet ? pivotFacet.filter(uniq) : []
  _elements = _elements ? _elements.filter(uniq) : []

  let options = ['?']
  if (_id) options = [...options, `_id=${_id}`]
  if (size) options = [...options, `size=${size}`]
  if (offset) options = [...options, `offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort}`]
  if (gender) options = [...options, `gender=${gender}`]
  if (_text) options = [...options, `_text=${_text}`]
  if (family) options = [...options, `family=${family}`]
  if (given) options = [...options, `given=${given}`]
  if (identifier) options = [...options, `identifier=${identifier}`]
  if (deceased) options = [...options, `deceased=${deceased}`]

  if (_list) options = [...options, `_list=${_list.reduce(reducer)}`]
  if (pivotFacet) options = [...options, `pivotFacet=${pivotFacet.reduce(reducer)}`]
  if (_elements) options = [...options, `_elements=${_elements.reduce(reducer)}`]
  // Warning : birthdate key it's not :
  //    birthdate=${birthdate[0]},${birthdate[1]}
  // but
  //    birthdate=${birthdate[0]}&birthdate=${birthdate[1]}
  if (birthdate) options = [...options, `birthdate=${birthdate.reduce(optionsReducer)}`]

  const response = await apiFhir.get<FHIR_API_Response<IPatient>>(`/Patient${options.reduce(optionsReducer)}`)
  const data = getApiResponseResources(response)

  return data
}

type fetchEncounterProps = {
  _id?: string
  _list?: string[]
  type?: string
  facet?: ('class' | 'visit-year-month-gender-facet')[]
  size?: number
  offset: number
  _sort?: string
  sortDirection: 'asc' | 'desc'
  patient?: string
  status?: string[]
  _elements?: ('status' | 'serviceProvider' | 'identifier')[]
}
export const fetchEncounter = async (args: fetchEncounterProps) => {
  const { _id, size, offset, _sort, sortDirection, patient } = args
  const _sortDirection = sortDirection === 'desc' ? '-' : ''
  let { _list, status, _elements } = args

  _list = _list ? _list.filter(uniq) : []
  status = status ? status.filter(uniq) : []
  _elements = _elements ? _elements.filter(uniq) : []

  let options = ['?']
  if (_id) options = [...options, `_id=${_id}`]
  if (size) options = [...options, `size=${size}`]
  if (offset) options = [...options, `offset=${offset}`]
  if (_sort) options = [...options, `_sort=${_sortDirection}${_sort}`]
  if (patient) options = [...options, `patient=${patient}`]

  if (_list) options = [...options, `_list=${_list.reduce(reducer)}`]
  if (status) options = [...options, `status=${status.reduce(reducer)}`]
  if (_elements) options = [...options, `_elements=${_elements.reduce(reducer)}`]

  const response = await apiFhir.get<FHIR_API_Response<IEncounter>>(`/Encounter${options.reduce(optionsReducer)}`)
  const data = getApiResponseResources(response)

  return data
}
