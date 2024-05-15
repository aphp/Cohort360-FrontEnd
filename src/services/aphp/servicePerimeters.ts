import {
  AccessExpiration,
  AccessExpirationsProps,
  Back_API_Response,
  ChartCode,
  CohortData,
  CustomError,
  FindScope,
  ScopeElement,
  ReadRightPerimeter,
  ScopeTreeRow,
  ScopeType,
  PerimeterRights
} from 'types'
import { getApiResponseResources } from 'utils/apiHelpers'
import {
  getAgeRepartitionMapAphp,
  getEncounterRepartitionMapAphp,
  getGenderRepartitionMapAphp,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'

import {
  fetchAccessExpirations,
  fetchEncounter,
  fetchPatient,
  fetchPerimeterAccesses,
  fetchPerimeterFromCohortId,
  fetchScope
} from './callApi'

import { AxiosResponse } from 'axios'
import { Group } from 'fhir/r4'
import scopeTypes from '../../data/scope_type.json'
import apiBackend from '../apiBackend'
import { isCustomError } from 'utils/perimeters'
import { Hierarchy } from '../../types/hierarchy'
import { FetchScopeOptions } from 'types/scope'

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
   *   - ScopeTreeTableRow | undefined
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

  mapRightsToScopeElement: (item: ReadRightPerimeter) => ScopeElement

  mapPerimeterToScopeElement: (item: ScopeElement) => ScopeElement

  getRights: (options: FetchScopeOptions, signal?: AbortSignal) => Promise<Back_API_Response<ScopeElement>>

  getPerimeters: (options?: FetchScopeOptions, signal?: AbortSignal) => Promise<Back_API_Response<ScopeElement>>

  getAccessExpirations: (accessExpirationsProps: AccessExpirationsProps) => Promise<AccessExpiration[]>

  /**
   * Cette fonction se base sur la fonction `getPerimeters` du service, et ré-organise la donnée sous forme d'un ScopeTreeTableRow[]
   *
   * Argument:
   *   - practitionerId: Identifiant technique du practitioner
   *
   * Retour:
   *   - ScopeTreeTableRow[]
   */
  getScopePerimeters: (
    practitionerId: string,
    type?: ScopeType,
    isExecutiveUnit?: boolean,
    signal?: AbortSignal
  ) => Promise<Back_API_Response<ReadRightPerimeter>>

  /**
   * Cette fonction retoune l'ensemble des périmètres enfant d'un périmètre passé en argument
   *
   * Argument:
   *   - perimeter: Périmètres parent (récupéré par `getScopePerimeters`)
   *   - getSubItem: = true si on demande à avoir les enfants des enfants
   *
   * Retour:
   *   - ScopeTreeTableRow[]
   */
  getScopesWithSubItems: (
    subScopesIds: string | null | undefined,
    getSubItem?: boolean,
    type?: ScopeType,
    isExecutiveUnit?: boolean,
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
  findScope: (
    searchInput: string | undefined,
    page?: number | undefined,
    signal?: AbortSignal,
    scopeType?: ScopeType,
    isExecutiveUnit?: boolean
  ) => Promise<FindScope>
  /**
   * construire une liste de ScopeTreeTableRow à travers une liste de ScopePage
   */
  buildScopeTreeRowList: (
    subScopes: ReadRightPerimeter[],
    getSubItem?: boolean | undefined,
    type?: ScopeType,
    isExecutiveUnit?: boolean,
    signal?: AbortSignal
  ) => Promise<Hierarchy<ReadRightPerimeter, string>[]>

  buildPerimeter: (scopeElement: ScopeElement) => ScopeElement

  /**
   * à travers un ScopePage on retourne 'Nominatif' ou 'Pseudonymisé' selon les droits d'accès
   * @param perimeterItem
   */
  getAccessFromScope: (perimeterItem: ScopeElement) => string

  /**
   * constuire le nom du périmètre à travers l'id, le nom et la source_value
   * @param perimeter
   */
  getScopeName: (perimeter: ScopeElement) => string

  /**
   * construire la liste des types des périmètres en haut du type. Sinon tous les types.
   * @param type
   */
  getHigherTypes: (type?: ScopeType) => string[]
}

const servicesPerimeters: IServicePerimeters = {
  allowSearchIpp: async (selectedPopulation) => {
    if (!selectedPopulation) {
      return false
    }

    const perimetersIds = selectedPopulation
      .map((perimeter) => perimeter?.id)
      .filter((item, index, array) => item && array.indexOf(item) === index)
      .join(',')

    const rightResponse = await fetchPerimeterAccesses(perimetersIds)
    const rightsData = rightResponse.data ?? []

    let allowSearchIpp = false

    rightsData.forEach((right) => {
      if (right.right_search_patients_by_ipp) {
        allowSearchIpp = true
      }
    })

    return allowSearchIpp
  },

  fetchPerimetersInfos: async (perimetersId) => {
    const [djangoResponse, patientsResp, encountersResp] = await Promise.all([
      fetchPerimeterFromCohortId(perimetersId),
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
        visit: true
      })
    ])

    const perimeters = djangoResponse.data.results

    const cohort = await servicesPerimeters.fetchPerimetersRights(perimeters)

    const totalPatients = patientsResp?.data?.resourceType === 'Bundle' ? patientsResp.data.total : 0

    const originalPatients = getApiResponseResources(patientsResp)

    const ageFacet = patientsResp.data.meta?.extension?.filter((facet) => facet.url === ChartCode.agePyramid)
    const deceasedFacet = patientsResp.data.meta?.extension?.filter(
      (facet) => facet.url === ChartCode.genderRepartition
    )
    const visitFacet = encountersResp.data.meta?.extension?.filter((facet) => facet.url === ChartCode.monthlyVisits)
    const classFacet = encountersResp.data.meta?.extension?.filter(
      (facet) => facet.url === ChartCode.visitTypeRepartition
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
      const scopeItemList = await servicesPerimeters.getPerimeters(undefined, [cohortId], true)

      if (!isCustomError(scopeItemList)) {
        const scopeTreeRowList = await servicesPerimeters.buildScopeTreeRowList(scopeItemList.results)
        return scopeTreeRowList && scopeTreeRowList.length > 0 ? scopeTreeRowList[0] : undefined
      } else {
        return undefined
      }
    } catch (error) {
      return undefined
    }
  },

  mapRightsToScopeElement: (item: ReadRightPerimeter): ScopeElement => {
    const {
      perimeter,
      read_role,
      right_read_patient_nominative,
      right_read_patient_pseudonymized,
      right_search_patients_by_ipp
    } = item

    return {
      ...perimeter,
      id: perimeter.id.toString(),
      rights: {
        read_role,
        right_read_patient_nominative,
        right_read_patient_pseudonymized,
        right_search_patients_by_ipp,
        read_access: right_read_patient_nominative ? 'DATA_NOMINATIVE' : 'DATA_PSEUDOANONYMISED',
        export_access: 'DATA_PSEUDOANONYMISED'
      }
    }
  },

  mapPerimeterToScopeElement: (item: ScopeElement): ScopeElement => {
    const {
      id,
      name,
      source_value,
      parent_id,
      type,
      above_levels_ids,
      inferior_levels_ids,
      cohort_id,
      cohort_size,
      full_path
    } = item

    return {
      id: id.toString(),
      name,
      source_value,
      parent_id,
      type,
      above_levels_ids,
      inferior_levels_ids,
      cohort_id,
      cohort_size,
      full_path
    }
  },

  getRights: async (options?: FetchScopeOptions, signal?: AbortSignal): Promise<Back_API_Response<ScopeElement>> => {
    const response: Back_API_Response<ScopeElement> = { results: [], count: 0 }
    if (options && options.practitionerId) {
      try {
        let url = 'accesses/perimeters/patient-data/rights/'
        if (options.ids) url += `?local_id=${options.ids}`
        if (options.search) url += `?search=${options.search}`
        if (options.limit) url += `&limit=${options.limit}`
        if (options.page !== undefined && options.limit) url += `&offset=${options.page * options.limit}`
        const backendResponse = await apiBackend.get<Back_API_Response<ReadRightPerimeter>>(url, { signal: signal })
        if (backendResponse.status !== 200 || Object.keys(backendResponse.data).length === 0) return response
        const mappedElement = backendResponse.data.results.map((item) =>
          servicesPerimeters.mapRightsToScopeElement(item)
        )
        return {
          ...backendResponse.data,
          results: mappedElement
        }
      } catch (error) {
        return response
      }
    }
    return response
  },

  getPerimeters: async (
    options?: FetchScopeOptions,
    signal?: AbortSignal
  ): Promise<Back_API_Response<ScopeElement>> => {
    const response: Back_API_Response<ScopeElement> = { results: [], count: 0 }
    if (options && options.practitionerId) {
      try {
        let url: string = 'accesses/perimeters/?type_source_value=' + servicesPerimeters.getHigherTypes()[0]
        if (options.ids) url += `local_id=${options.ids}`
        if (options.search) url += `?search=${options.search}`
        if (options.limit) url += `&limit=${options.limit}`
        if (options.page !== undefined && options.limit) url += `&offset=${options.page * options.limit}`
        const backendResponse = await apiBackend.get<Back_API_Response<ScopeElement>>(url, { signal: signal })
        if (backendResponse.status !== 200 || Object.keys(backendResponse.data).length === 0) return response
        const mappedElement = backendResponse.data.results.map((item) =>
          servicesPerimeters.mapPerimeterToScopeElement(item)
        )
        return {
          ...backendResponse.data,
          results: mappedElement
        }
      } catch (error) {
        return response
      }
    }
    return response
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

  /*getScopePerimeters: async (practitionerId, type?: ScopeType, isExecutiveUnit?: boolean, signal?: AbortSignal) => {
    if (practitionerId && !isExecutiveUnit) {
      const response = await servicesPerimeters.getPerimeters(signal)
      if (!isCustomError(response)) {
        response.results = response.results.map((item) => ({
          ...item,
          id: item.id,
          perimeter: servicesPerimeters.buildPerimeter(item)
        }))
        return response
      }
    }
    return { results: [], count: 0 }
  },*/

  getScopesWithSubItems: async (
    subScopesIds: string | null | undefined,
    getSubItem?: boolean,
    type?: ScopeType,
    isExecutiveUnit?: boolean,
    signal?: AbortSignal
  ): Promise<ScopeTreeRow[]> => {
    if (!subScopesIds) return []
    // const subScopes = await servicesPerimeters.getPerimeters(
    //   subScopesIds.trim().split(','),
    //   undefined,
    //   undefined,
    //   type,
    //   isExecutiveUnit,
    //   signal
    // )

    // if (!isCustomError(subScopes)) {
    //   const scopeRowList: ScopeTreeRow[] = await servicesPerimeters.buildScopeTreeRowList(
    //     subScopes.results,
    //     getSubItem,
    //     type,
    //     isExecutiveUnit,
    //     signal
    //   )
    //   return scopeRowList
    // }

    return []
  },

  fetchPerimetersRights: async (perimeters) => {
    const perimetersIds = perimeters.map((perimeter) => perimeter.id).join(',')

    const rightResponse = await fetchPerimeterAccesses(perimetersIds)
    const rightsData = rightResponse.data ?? []

    return perimeters.map((perimeter) => {
      const foundRight = rightsData.find((rightData) => rightData.perimeter_id === +(perimeter.id ?? '0'))

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

  findScope: async (
    searchInput: string | undefined,
    page?: number | undefined,
    signal?: AbortSignal,
    scopeType?: ScopeType,
    isExecutiveUnit?: boolean
  ): Promise<FindScope> => {
    let result: FindScope = {
      scopeTreeRows: [],
      count: 0,
      aborted: false
    }
    if (!searchInput) {
      return result
    }
    const higherTypes: string[] = servicesPerimeters.getHigherTypes(scopeType)
    const limit = 20
    const offset = ((page ?? 1) - 1) * limit
    const backCohortResponse = await fetchScope(
      {
        search: searchInput,
        type: higherTypes,
        isExecutiveUnit: isExecutiveUnit,
        limit: limit,
        offset: offset
      },
      signal
    )
    if (backCohortResponse && backCohortResponse.data && backCohortResponse.data.results) {
      const newPerimetersList = await servicesPerimeters.buildScopeTreeRowList(
        backCohortResponse.data.results,
        undefined,
        scopeType,
        isExecutiveUnit,
        signal
      )
      result = {
        scopeTreeRows: newPerimetersList,
        count: backCohortResponse.data.count ?? 0
      }
    }
    result.aborted = signal?.aborted
    return result
  },

  /*buildScopeTreeRowList: async (
    subScopes: (ScopePage | ScopeElement)[],
    getSubItem?: boolean | undefined,
    type?: ScopeType,
    isExecutiveUnit?: boolean,
    signal?: AbortSignal
  ) => {
    let scopeRowList: Hierarchy<ScopePage, string>[] = []
    for (const scopeItem of subScopes) {
      const itemScopeElement: ScopeElement = isExecutiveUnit
        ? (scopeItem as ScopeElement)
        : (scopeItem as ScopePage).perimeter
      const scopeRowItem = servicesPerimeters.buildPerimeter(itemScopeElement)
      scopeRowItem.access = isExecutiveUnit ? undefined : servicesPerimeters.getAccessFromScope(scopeItem as ScopePage)
      scopeRowItem.subItems =
        getSubItem === true
          ? await servicesPerimeters.getScopesWithSubItems(
              itemScopeElement.inferior_levels_ids,
              undefined,
              type,
              isExecutiveUnit,
              signal
            )
          : [LOADING]
      scopeRowList.push(scopeRowItem)
    }
    scopeRowList = sortByQuantityAndName(scopeRowList)
    return scopeRowList
  },*/

  buildPerimeter: (scopeElement: ScopeElement) => {
    return {
      ...scopeElement,
      name: servicesPerimeters.getScopeName(scopeElement),
      above_levels_ids: scopeElement.above_levels_ids?.replace(/\s/g, ''),
      inferior_levels_ids: scopeElement.inferior_levels_ids?.replace(/\s/g, ''),
      parent_id: scopeElement.parent_id?.replace(/\s/g, '')
    }
  },

  getAccessFromScope: (perimeterItem: ScopeElement) => {
    return perimeterItem.rights?.read_access === 'DATA_NOMINATIVE' ||
      perimeterItem.rights?.right_read_patient_nominative === true
      ? 'Nominatif'
      : 'Pseudonymisé'
  },

  getScopeName: (perimeter: ScopeElement) => {
    const perimeterID = perimeter ? perimeter.source_value : false
    if (!perimeterID) {
      return perimeter ? perimeter.name : ''
    }
    return `${perimeterID} - ${perimeter.name}`
  },

  getHigherTypes: (type?: ScopeType) => {
    if (!type) {
      return scopeTypes.typeLevel.flat()
    }

    const higherTypes: string[] = []
    if (type) {
      let isFoundValue = false
      for (const currentLevel of [...scopeTypes.typeLevel].reverse()) {
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
    return higherTypes.length > 0 ? higherTypes : scopeTypes.typeLevel.flat()
  }
}

export default servicesPerimeters
