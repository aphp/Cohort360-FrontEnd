import {
  AccessExpiration,
  AccessExpirationsProps,
  CohortData,
  ScopePage,
  ScopeTreeRow,
  ScopeElement,
  ChartCode
} from 'types'
import {
  getAgeRepartitionMapAphp,
  getEncounterRepartitionMapAphp,
  getGenderRepartitionMapAphp,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'
import { getApiResponseResources } from 'utils/apiHelpers'

import { fetchEncounter, fetchGroup, fetchPatient, fetchScope, fetchAccessExpirations } from './callApi'

import apiBackend from '../apiBackend'
import { sortByQuantityAndName } from 'utils/scopeTree'
import { AxiosResponse } from 'axios'
import { Group } from 'fhir/r4'
import scopeType from '../../data/scope_type.json'

export const loadingItem: ScopeTreeRow = { id: 'loading', name: 'loading', quantity: 0, subItems: [] }

export interface IServicePerimeters {
  /**
   * Cette fonction récupère le droit de faire une recherche par IPP lié à un (ou plusieurs) périmètre(s)
   *
   * Argument:
   *   - selectedPopulation: Array composé des périmètres selectionnés pour une requête
   *
   * Retour:
   *   - booléen
   */
  allowSearchIpp: (selectedPopulation: ScopeTreeRow[]) => Promise<boolean>

  /**
   * Cette fonction retourne les informations lié à un (ou plusieurs) périmètre(s)
   *
   * Argument:
   *   - perimetersId: ID du périmètre (liste d'ID séparé par des virgules)
   *
   * Retour:
   *   - CohortData | undefined
   */
  fetchPerimetersInfos: (perimetersId: string) => Promise<CohortData | undefined>

  /**
   * Cette fonction retourne les informations lié à un périmètre
   * (Cette fonction n'est appelée que lors de la transformation du JSON en carte dans le requeteur)
   *
   * Argument:
   *   - perimeterId: ID du périmètre
   *
   * Retour:
   *   - ScopeTreeRow | undefined
   */
  fetchPerimeterInfoForRequeteur: (perimeterId: string) => Promise<ScopeTreeRow | undefined>

  /**
   * Cette fonction retourne l'ensemble des perimetres auquels un practitioner a le droit
   *
   * Argument:
   *   - practitionerId: Identifiant technique du practitioner
   *
   * Retour:
   *   - IOrganization[]
   */
  getPerimeters: (
    defaultPerimetersIds?: string[],
    cohortIds?: string[],
    noPerimetersIdsFetch?: boolean,
    type?: string,
    signal?: AbortSignal
  ) => Promise<ScopePage[]>

  getAccessExpirations: (accessExpirationsProps: AccessExpirationsProps) => Promise<AccessExpiration[]>

  /**
   * Cette fonction se base sur la fonction `getPerimeters` du service, et ré-organise la donnée sous forme d'un ScopeTreeRow[]
   *
   * Argument:
   *   - practitionerId: Identifiant technique du practitioner
   *
   * Retour:
   *   - ScopeTreeRow[]
   */
  getScopePerimeters: (practitionerId: string, type?: string, signal?: AbortSignal) => Promise<ScopeTreeRow[]>

  /**
   * Cette fonction retoune l'ensemble des périmètres enfant d'un périmètre passé en argument
   *
   * Argument:
   *   - perimeter: Périmètres parent (récupéré par `getScopePerimeters`)
   *   - getSubItem: = true si on demande à avoir les enfants des enfants
   *
   * Retour:
   *   - ScopeTreeRow[]
   */
  getScopesWithSubItems: (
    subScopesIds: string | null | undefined,
    getSubItem?: boolean,
    type?: string,
    signal?: AbortSignal
  ) => Promise<ScopeTreeRow[]>

  /**
   * Cette fonction retourne les droits de lecture d'un périmetre
   *
   * Arguments:
   *   - perimetersId: ID du périmètre (liste d'ID séparé par des virgules)
   */
  fetchPerimetersRights: (perimeters: Group[]) => Promise<Group[]>
  /**
   * effectuer une recherche textuelle dans la liste des périmètres
   * @param page : le numéro de la page qu'on veut récupérer, par défaut c'est la 1ière page.
   */
  findScope: (searchInput: string | undefined, page?: number | undefined, signal?: AbortSignal) => Promise<any>
  /**
   * construire une liste de ScopeTreeRow à travers une liste de ScopePage
   */
  buildScopeTreeRowList: (
    subScopes: ScopePage[],
    getSubItem?: boolean | undefined,
    type?: string,
    signal?: AbortSignal
  ) => Promise<ScopeTreeRow[]>

  buildScopeTreeRowItem: (scopeElement: ScopeElement, type?: string) => ScopeTreeRow

  /**
   * à travers un ScopePage on retourne 'Nominatif' ou 'Pseudonymisé' selon les droits d'accès
   * @param perimeterItem
   */
  getAccessFromScope: (perimeterItem: ScopePage) => string

  /**
   * constuire le nom du périmètre à travers l'id, le nom et la source_value
   * @param perimeter
   */
  getScopeName: (perimeter: any) => string

  /**
   * construire la liste des types des périmètres en haut du type. Sinon tous les types.
   * @param type
   */
  getHigherTypes: (type?: string) => string[]
}

const servicesPerimeters: IServicePerimeters = {
  allowSearchIpp: async (selectedPopulation) => {
    if (!selectedPopulation) {
      return false
    }

    const caresiteIds = selectedPopulation
      .map((perimeter) => perimeter?.id)
      .filter((item: any, index: number, array: any[]) => item && array.indexOf(item) === index)
      .join(',')

    const rightResponse = await apiBackend.get(`accesses/accesses/my-rights/?care-site-ids=${caresiteIds}`)
    const rightsData = (rightResponse.data as any[]) ?? []

    let allowSearchIpp = false

    rightsData.forEach((right) => {
      if (right.right_search_patient_with_ipp) {
        allowSearchIpp = true
      }
    })

    return allowSearchIpp
  },

  fetchPerimetersInfos: async (perimetersId) => {
    const [perimetersResp, patientsResp, encountersResp] = await Promise.all([
      fetchGroup({
        _id: perimetersId
      }),
      fetchPatient({
        pivotFacet: ['age-month_gender', 'deceased_gender'],
        _list: perimetersId.split(','),
        size: 20,
        _sort: 'family',
        _elements: ['gender', 'name', 'birthDate', 'deceased', 'identifier', 'extension']
      }),
      fetchEncounter({
        facet: ['class', 'visit-year-month-gender-facet'],
        _list: perimetersId.split(','),
        size: 0,
        type: 'VISIT'
      })
    ])

    const cohort = await servicesPerimeters.fetchPerimetersRights(getApiResponseResources(perimetersResp) ?? [])

    const totalPatients = patientsResp?.data?.resourceType === 'Bundle' ? patientsResp.data.total : 0

    const originalPatients = getApiResponseResources(patientsResp)

    const ageFacet = patientsResp.data.meta?.extension?.filter((facet: any) => facet.url === ChartCode.agePyramid)
    const deceasedFacet = patientsResp.data.meta?.extension?.filter(
      (facet: any) => facet.url === ChartCode.genderRepartition
    )
    const visitFacet = encountersResp.data.meta?.extension?.filter(
      (facet: any) => facet.url === ChartCode.monthlyVisits
    )
    const classFacet = encountersResp.data.meta?.extension?.filter(
      (facet: any) => facet.url === ChartCode.visitTypeRepartition
    )

    const agePyramidData =
      patientsResp?.data?.resourceType === 'Bundle'
        ? getAgeRepartitionMapAphp(ageFacet && ageFacet[0] && ageFacet[0].extension)
        : undefined
    const genderRepartitionMap =
      patientsResp?.data?.resourceType === 'Bundle'
        ? getGenderRepartitionMapAphp(deceasedFacet && deceasedFacet[0] && deceasedFacet[0].extension)
        : undefined
    const monthlyVisitData =
      encountersResp?.data?.resourceType === 'Bundle'
        ? getVisitRepartitionMapAphp(visitFacet && visitFacet[0] && visitFacet[0].extension)
        : undefined
    const visitTypeRepartitionData =
      encountersResp?.data?.resourceType === 'Bundle'
        ? getEncounterRepartitionMapAphp(classFacet && classFacet[0] && classFacet[0].extension)
        : undefined

    return {
      cohort,
      totalPatients,
      originalPatients,
      genderRepartitionMap,
      visitTypeRepartitionData,
      agePyramidData,
      monthlyVisitData
    }
  },

  fetchPerimeterInfoForRequeteur: async (cohortId) => {
    try {
      if (!cohortId) return undefined
      const scopeItemList: ScopePage[] = (await servicesPerimeters.getPerimeters(undefined, [cohortId], true)) ?? []
      const scopeTreeRowList: ScopeTreeRow[] = await servicesPerimeters.buildScopeTreeRowList(scopeItemList)
      return scopeTreeRowList && scopeTreeRowList.length > 0 ? scopeTreeRowList[0] : undefined
    } catch (error) {
      return undefined
    }
  },

  getPerimeters: async (
    defaultPerimetersIds?: string[],
    cohortIds?: string[],
    noPerimetersIdsFetch?: boolean,
    type?: string,
    signal?: AbortSignal
  ) => {
    try {
      let perimetersIds: string[] | undefined = []
      let perimetersList: ScopePage[] = []
      let rightsData: any = []
      if (!defaultPerimetersIds && !noPerimetersIdsFetch) {
        const rightResponse = await apiBackend.get('accesses/perimeters/read-patient/', { signal: signal })
        rightsData = rightResponse.status === 200 ? (rightResponse?.data as any) : ''

        if (rightResponse.status !== 200) {
          const backError: any = {
            errorType: 'back'
          }
          return backError
        } else if (rightsData && rightsData.length === 0) {
          return []
        }

        perimetersIds = rightsData.results.map((rightData: any) => rightData.perimeter.id)
      } else {
        perimetersIds = defaultPerimetersIds
      }

      const higherTypes: string[] = servicesPerimeters.getHigherTypes(type)

      const perimetersListReponse: any = await fetchScope({
        perimetersIds: perimetersIds,
        cohortIds: cohortIds,
        type: higherTypes
      })
      if (!perimetersListReponse || !perimetersListReponse.data || !perimetersListReponse.data.results) {
        console.error(
          'Error (getPerimeters) while fetching perimeter (from back) ! perimeters = {}, cohortIds = {}',
          perimetersIds ?? '',
          cohortIds ?? ''
        )
        return []
      }
      perimetersList = perimetersListReponse.data.results.map((perimeterItem: any) => {
        let read_access = undefined
        if (!defaultPerimetersIds) {
          const foundRight = rightsData?.results?.find(
            (rightData: any) => rightData.perimeter.id === +(perimeterItem.perimeter.id ?? '0')
          )
          read_access = foundRight?.right_read_patient_nominative ? 'DATA_NOMINATIVE' : 'DATA_PSEUDOANONYMISED'
        }
        const export_access = 'DATA_PSEUDOANONYMISED' // Impossible de faire un export de donnée sur un périmètre
        return { ...perimeterItem, ...{ read_access: read_access, export_access: export_access } }
      })
      return perimetersList
    } catch (error: any) {
      const fhirError: any = {
        errorType: 'fhir'
      }
      return fhirError
    }
  },

  getAccessExpirations: async (accessExpirationsProps: AccessExpirationsProps) => {
    let response: AxiosResponse<AccessExpiration[]> | undefined = undefined
    try {
      response = await fetchAccessExpirations(accessExpirationsProps)
    } catch (error) {
      console.error(error)
    }
    if (response?.data && response.data.length > 0) {
      return response?.data
    } else {
      console.error('Error while fetching access expirations (from Back)')
      return []
    }
  },

  getScopePerimeters: async (practitionerId, type?: string, signal?: AbortSignal) => {
    if (!practitionerId) return []

    const scopeItemList: ScopePage[] =
      (await servicesPerimeters.getPerimeters(undefined, undefined, undefined, type, signal)) ?? []
    const scopeTreeRowList: ScopeTreeRow[] = await servicesPerimeters.buildScopeTreeRowList(
      scopeItemList,
      undefined,
      type,
      signal
    )
    return scopeTreeRowList
  },

  getScopesWithSubItems: async (
    subScopesIds: string | null | undefined,
    getSubItem?: boolean,
    type?: string,
    signal?: AbortSignal
  ) => {
    if (!subScopesIds) return []
    const subScopes: ScopePage[] = await servicesPerimeters.getPerimeters(
      subScopesIds.trim().split(','),
      undefined,
      undefined,
      type,
      signal
    )
    const scopeRowList: ScopeTreeRow[] = await servicesPerimeters.buildScopeTreeRowList(
      subScopes,
      getSubItem,
      type,
      signal
    )
    return scopeRowList
  },

  fetchPerimetersRights: async (perimeters) => {
    const caresiteIds = perimeters
      .map((perimeter) =>
        perimeter.managingEntity?.display?.search('Organization/') !== -1
          ? perimeter.managingEntity?.display?.replace('Organization/', '')
          : ''
      )
      .filter((item: any, index: number, array: any[]) => item && array.indexOf(item) === index)
      .join(',')

    const rightResponse = await apiBackend.get(`accesses/accesses/my-rights/?care-site-ids=${caresiteIds}`)
    const rightsData = (rightResponse.data as any[]) ?? []

    return perimeters.map((perimeter) => {
      const caresiteId =
        perimeter.managingEntity?.display?.search('Organization/') !== -1
          ? perimeter.managingEntity?.display?.replace('Organization/', '')
          : ''
      const foundRight = rightsData.find((rightData) => rightData.care_site_id === +(caresiteId ?? '0'))

      return {
        ...perimeter,
        extension: [
          ...(perimeter.extension ?? []),
          {
            url: 'READ_ACCESS',
            valueString: foundRight?.right_read_patient_nominative ? 'DATA_NOMINATIVE' : 'DATA_PSEUDOANONYMISED'
          },
          {
            url: 'EXPORT_ACCESS',
            valueString: 'DATA_PSEUDOANONYMISED' // Impossible de faire un export de donnée sur un périmètre
          }
        ]
      }
    })
  },

  findScope: async (searchInput: string | undefined, page?: number | undefined, signal?: AbortSignal) => {
    let result: { scopeTreeRows: ScopeTreeRow[]; count: number; aborted?: boolean } = {
      scopeTreeRows: [],
      count: 0,
      aborted: false
    }
    if (!searchInput) {
      return result
    }
    const pageParam = page && page > 1 ? '&page=' + page : ''
    const backCohortResponse: any = await apiBackend.get(
      `accesses/perimeters/read-patient/?search=${searchInput}${pageParam}`,
      { signal: signal }
    )
    if (backCohortResponse && backCohortResponse.data && backCohortResponse.data.results) {
      const newPerimetersList: ScopeTreeRow[] = await servicesPerimeters.buildScopeTreeRowList(
        backCohortResponse.data.results
      )
      result = {
        scopeTreeRows: newPerimetersList,
        count: backCohortResponse.data.count
      }
    }
    result.aborted = signal?.aborted
    return result
  },

  buildScopeTreeRowList: async (
    subScopes: ScopePage[],
    getSubItem?: boolean | undefined,
    type?: string,
    signal?: AbortSignal
  ) => {
    let scopeRowList: ScopeTreeRow[] = []
    for (const scopeItem of subScopes) {
      const scopeRowItem = servicesPerimeters.buildScopeTreeRowItem(scopeItem.perimeter)
      scopeRowItem.access = servicesPerimeters.getAccessFromScope(scopeItem)
      scopeRowItem.subItems =
        getSubItem === true
          ? await servicesPerimeters.getScopesWithSubItems(
              scopeItem.perimeter.inferior_levels_ids,
              undefined,
              type,
              signal
            )
          : [loadingItem]
      scopeRowList.push(scopeRowItem)
    }
    scopeRowList = sortByQuantityAndName(scopeRowList)
    return scopeRowList
  },

  buildScopeTreeRowItem: (scopeElement: ScopeElement) => {
    const scopeRowItem: ScopeTreeRow = { id: '', name: '', quantity: 0, subItems: [loadingItem] }
    scopeRowItem.id = '' + scopeElement.id
    scopeRowItem.cohort_id = scopeElement.cohort_id
    scopeRowItem.name = servicesPerimeters.getScopeName(scopeElement)
    scopeRowItem.full_path = scopeElement.full_path
    scopeRowItem.quantity = +scopeElement.cohort_size
    scopeRowItem.above_levels_ids = scopeElement.above_levels_ids
    scopeRowItem.inferior_levels_ids = scopeElement.inferior_levels_ids
    scopeRowItem.type = scopeElement.type
    scopeRowItem.parentId = scopeElement.parent_id
    return scopeRowItem
  },

  getAccessFromScope: (perimeterItem: ScopePage) => {
    return perimeterItem.read_access === 'DATA_NOMINATIVE' || perimeterItem.right_read_patient_nominative === true
      ? 'Nominatif'
      : 'Pseudonymisé'
  },

  getScopeName: (perimeter: any) => {
    const perimeterID = perimeter ? perimeter.source_value : false
    if (!perimeterID) {
      return perimeter ? perimeter.name : ''
    }
    return `${perimeterID} - ${perimeter.name}`
  },

  getHigherTypes: (type?: string) => {
    const higherTypes: string[] = []
    if (type) {
      let isFoundValue = false
      for (const currentLevel of [...scopeType.typeLevel].reverse()) {
        for (const valueInTheSameLevel of currentLevel) {
          if (valueInTheSameLevel === type) {
            isFoundValue = true
          }
          if (isFoundValue) {
            higherTypes.push(valueInTheSameLevel)
          }
        }
      }
    }
    return higherTypes.length > 0 ? higherTypes : scopeType.typeLevel.flat()
  }
}

export default servicesPerimeters
