import {
  MEDICATION_ADMINISTRATIONS,
  MEDICATION_ATC,
  MEDICATION_PRESCRIPTION_TYPES,
  VALUE_SET_SIZE
} from '../../../constants'
import { cleanValueSet } from 'utils/cleanValueSet'
import { codeSort } from 'utils/alphabeticalSort'
import { capitalizeFirstLetter } from 'utils/capitalize'
import apiFhir from '../../apiFhir'
import { getApiResponseResources } from 'utils/apiHelpers'
import { FHIR_API_Response } from 'types'
import { ValueSet, ValueSetComposeIncludeConcept } from 'fhir/r4'

export const fetchAtcData = async (searchValue?: string, noStar?: boolean) => {
  noStar = noStar === undefined ? true : noStar

  if (!searchValue) {
    return []
  }

  if (searchValue === '*') {
    return [{ id: '*', label: 'Toute la hiérarchie', subItems: [{ id: 'loading', label: 'loading', subItems: [] }] }]
  }

  const _searchValue = noStar
    ? searchValue
      ? `&code=${searchValue.trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}` //eslint-disable-line
      : ''
    : searchValue
    ? `&_text=${encodeURIComponent(searchValue.trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'))}*` //eslint-disable-line
    : ''

  const res = await apiFhir.get<FHIR_API_Response<ValueSet>>(
    `/ValueSet?url=${MEDICATION_ATC}${_searchValue}&_count=${VALUE_SET_SIZE ?? 9999}`
  )

  const resources = getApiResponseResources(res)
  const data = resources?.length ? resources[0].compose?.include[0].concept || [] : []

  return data && data.length > 0
    ? data.sort(codeSort).map((_data: ValueSetComposeIncludeConcept) => ({
        id: _data.code,
        label: `${_data.code} - ${capitalizeFirstLetter(_data.display)}`,
        subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
      }))
    : []
}

export const fetchAtcHierarchy = async (atcParent: string) => {
  if (!atcParent) {
    const res = await apiFhir.get<FHIR_API_Response<ValueSet>>(`/ValueSet?url=${MEDICATION_ATC}`)

    const resources = getApiResponseResources(res)
    const atcList = resources?.length ? resources[0].compose?.include[0].concept || [] : []

    const atcDataList =
      atcList && atcList.length > 0
        ? atcList
            .sort(codeSort)
            .map((atcData: ValueSetComposeIncludeConcept) => ({
              id: atcData.code,
              label: `${atcData.code} - ${atcData.display}`,
              subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
            }))
            // V--[ @TODO: This is a hot fix, remove this after a clean of data ]--V
            .filter((atcData: any) => atcData.label.search(new RegExp(/^[A-Z] - /, 'gi')) !== -1)
            .filter((atcData: any) => atcData.label.search(new RegExp(/^[X-Y] - /, 'gi')) !== 0)
        : []

    return [{ id: '*', label: 'Toute la hiérarchie Médicament', subItems: [...atcDataList] }]
  } else {
    const json = {
      resourceType: 'ValueSet',
      url: MEDICATION_ATC,
      compose: {
        include: [
          {
            filter: [
              {
                op: 'is-a',
                value: atcParent ?? ''
              }
            ]
          }
        ]
      }
    }

    const res = await apiFhir.post<any>(`/ValueSet/$expand`, JSON.stringify(json))

    const data =
      res && res.data && res.data.expansion && res.data.expansion.contains && res.data.resourceType === 'ValueSet'
        ? res.data.expansion.contains
        : []

    return data && data.length > 0
      ? data.sort(codeSort).map((atcData: any) => ({
          id: atcData.code,
          label: `${atcData.code} - ${atcData.display}`,
          subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
        }))
      : []
  }
}

export const fetchSignleCode: (code: string) => Promise<string[]> = async (code: string) => {
  if (!code) return []
  const response = await apiFhir.get<any>(`/ConceptMap?_count=100&context=Descendant-leaf&source-code=${code}`)

  const data = getApiResponseResources(response)
  const codeList: string[] = []
  data?.forEach((resource: any) =>
    resource?.group?.forEach((group: { element: any[] }) =>
      group.element?.forEach((element) =>
        element?.target?.forEach((target: { code: any }) => codeList.push(target.code))
      )
    )
  )
  return codeList
}

export const fetchPrescriptionTypes = async () => {
  try {
    const res = await apiFhir.get<any>(`/ValueSet?url=${MEDICATION_PRESCRIPTION_TYPES}`)
    const data =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return cleanValueSet(data)
  } catch (error) {
    return []
  }
}

export const fetchAdministrations = async () => {
  try {
    const res = await apiFhir.get<any>(`/ValueSet?url=${MEDICATION_ADMINISTRATIONS}`)
    const data =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return cleanValueSet(data)
  } catch (error) {
    return []
  }
}
