import {
  AccessExpiration,
  AccessExpirationsProps,
  ChartCode,
  CohortData,
  CustomError,
  FindScope,
  ScopeElement,
  ScopePage,
  ScopeTreeRow,
  ScopeType,
  UserAccesses
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
import { LOADING, sortByQuantityAndName } from 'utils/scopeTree'
import scopeTypes from '../../data/scope_type.json'
import apiBackend from '../apiBackend'
import { isCustomError } from 'utils/perimeters'

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
  getPerimeters: (
    defaultPerimetersIds?: string[],
    cohortIds?: string[],
    noPerimetersIdsFetch?: boolean,
    type?: ScopeType,
    isExecutiveUnit?: boolean,
    signal?: AbortSignal
  ) => Promise<ScopePage[] | CustomError>

  getAccessExpirations: (accessExpirationsProps: AccessExpirationsProps) => Promise<AccessExpiration[]>

  getAccesses: () => Promise<UserAccesses[]>

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
  ) => Promise<ScopeTreeRow[]>

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
    subScopes: ScopePage[],
    getSubItem?: boolean | undefined,
    type?: ScopeType,
    isExecutiveUnit?: boolean,
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

    const ageFacet = patientsResp.data.meta?.extension?.filter((facet) => facet.url === ChartCode.AGE_PYRAMID)
    const deceasedFacet = patientsResp.data.meta?.extension?.filter(
      (facet) => facet.url === ChartCode.GENDER_REPARTITION
    )
    const visitFacet = encountersResp.data.meta?.extension?.filter((facet) => facet.url === ChartCode.MONTHLY_VISITS)
    const classFacet = encountersResp.data.meta?.extension?.filter(
      (facet) => facet.url === ChartCode.VISIT_TYPE_REPARTITION
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
        const scopeTreeRowList = await servicesPerimeters.buildScopeTreeRowList(scopeItemList)
        return scopeTreeRowList && scopeTreeRowList.length > 0 ? scopeTreeRowList[0] : undefined
      } else {
        return undefined
      }
    } catch (error) {
      return undefined
    }
  },

  getPerimeters: async (
    defaultPerimetersIds?: string[],
    cohortIds?: string[],
    noPerimetersIdsFetch?: boolean,
    type?: ScopeType,
    isExecutiveUnit?: boolean,
    signal?: AbortSignal
  ): Promise<ScopePage[] | CustomError> => {
    try {
      const noRightsMessage = 'No accesses with read patient right found'
      let perimetersIds: string[] | undefined = []
      let rightsData: any
      if (!defaultPerimetersIds && !noPerimetersIdsFetch) {
        const url: string = isExecutiveUnit
          ? 'accesses/perimeters/?type_source_value=' + servicesPerimeters.getHigherTypes()[0]
          : 'accesses/perimeters/patient-data/rights/'
        const rightResponse = await apiBackend.get(url, { signal: signal })
        if (
          rightResponse.status === 200 &&
          (rightResponse.data.message === noRightsMessage || Object.keys(rightResponse.data).length === 0)
        ) {
          const noRightError: CustomError = {
            errorType: 'noRight'
          }
          return noRightError
        }
        rightsData = rightResponse.status === 200 ? rightResponse?.data : ''

        if (rightResponse.status !== 200) {
          const backError: CustomError = {
            errorType: 'back'
          }
          return backError
        } else if (rightsData && rightsData.length === 0) {
          return []
        }

        perimetersIds = rightsData.results.map((rightData: any) =>
          isExecutiveUnit ? rightData.id : rightData.perimeter.id
        )
      } else {
        perimetersIds = defaultPerimetersIds
      }

      const higherTypes: string[] = servicesPerimeters.getHigherTypes(type)

      const perimetersListResponse = await fetchScope({
        perimetersIds: perimetersIds,
        cohortIds: cohortIds,
        isExecutiveUnit,
        type: higherTypes
      })

      if (!perimetersListResponse || !perimetersListResponse.data || !perimetersListResponse.data.results) {
        console.error(
          'Error (getPerimeters) while fetching perimeter (from back) ! perimeters = {}, cohortIds = {}',
          perimetersIds ?? '',
          cohortIds ?? ''
        )
        return []
      }
      const perimetersList = perimetersListResponse.data.results.map((perimeterItem) => {
        let read_access = undefined
        if (!defaultPerimetersIds && !isExecutiveUnit) {
          const foundRight = rightsData?.results?.find(
            (rightData: any) => rightData.perimeter.id === +(perimeterItem.perimeter.id ?? '0')
          )
          read_access = foundRight?.right_read_patient_nominative ? 'DATA_NOMINATIVE' : 'DATA_PSEUDOANONYMISED'
        }
        const export_access = 'DATA_PSEUDOANONYMISED' // Impossible de faire un export de donnée sur un périmètre

        // perimeterItem.perimeter = removeSpace(perimeterItem.perimeter)

        return {
          ...perimeterItem,
          ...{ read_access: read_access, export_access: export_access }
        }
      })

      return perimetersList
    } catch (error) {
      const fhirError: CustomError = {
        errorType: 'fhir'
      }
      return fhirError
    }
  },

  getAccessExpirations: async (accessExpirationsProps: AccessExpirationsProps) => {
    let response: AxiosResponse<AccessExpiration[]> | undefined = undefined
    try {
      response = (await fetchAccessExpirations(accessExpirationsProps)) as AxiosResponse<AccessExpiration[]>
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

  getAccesses: async () => {
    let response: AxiosResponse<UserAccesses[]> | undefined = undefined
    try {
      response = (await fetchAccessExpirations({ expiring: undefined })) as AxiosResponse<UserAccesses[]>
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

  getScopePerimeters: async (practitionerId, type?: ScopeType, isExecutiveUnit?: boolean, signal?: AbortSignal) => {
    if (!practitionerId) return []

    const scopeItemList = await servicesPerimeters.getPerimeters(
      undefined,
      undefined,
      undefined,
      type,
      isExecutiveUnit,
      signal
    )

    if (!isCustomError(scopeItemList)) {
      const scopeTreeRowList: ScopeTreeRow[] = await servicesPerimeters.buildScopeTreeRowList(
        scopeItemList,
        undefined,
        type,
        isExecutiveUnit,
        signal
      )
      return scopeTreeRowList
    }

    return []
  },

  getScopesWithSubItems: async (
    subScopesIds: string | null | undefined,
    getSubItem?: boolean,
    type?: ScopeType,
    isExecutiveUnit?: boolean,
    signal?: AbortSignal
  ): Promise<ScopeTreeRow[]> => {
    if (!subScopesIds) return []
    const subScopes = await servicesPerimeters.getPerimeters(
      subScopesIds.trim().split(','),
      undefined,
      undefined,
      type,
      isExecutiveUnit,
      signal
    )

    if (!isCustomError(subScopes)) {
      const scopeRowList: ScopeTreeRow[] = await servicesPerimeters.buildScopeTreeRowList(
        subScopes,
        getSubItem,
        type,
        isExecutiveUnit,
        signal
      )
      return scopeRowList
    }

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
        count: backCohortResponse.data.count
      }
    }
    result.aborted = signal?.aborted
    return result
  },

  buildScopeTreeRowList: async (
    subScopes: (ScopePage | ScopeElement)[],
    getSubItem?: boolean | undefined,
    type?: ScopeType,
    isExecutiveUnit?: boolean,
    signal?: AbortSignal
  ) => {
    let scopeRowList: ScopeTreeRow[] = []
    for (const scopeItem of subScopes) {
      const itemScopeElement: ScopeElement = isExecutiveUnit
        ? (scopeItem as ScopeElement)
        : (scopeItem as ScopePage).perimeter
      const scopeRowItem = servicesPerimeters.buildScopeTreeRowItem(itemScopeElement)
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
  },

  buildScopeTreeRowItem: (scopeElement: ScopeElement) => {
    const scopeRowItem: ScopeTreeRow = { id: '', name: '', quantity: 0, subItems: [LOADING] }
    scopeRowItem.id = scopeElement.id?.toString().replace(/\s/g, '')
    scopeRowItem.cohort_id = scopeElement.cohort_id?.replace(/\s/g, '')
    scopeRowItem.name = servicesPerimeters.getScopeName(scopeElement)
    scopeRowItem.full_path = scopeElement.full_path
    scopeRowItem.quantity = +scopeElement.cohort_size
    scopeRowItem.above_levels_ids = scopeElement.above_levels_ids?.replace(/\s/g, '')
    scopeRowItem.inferior_levels_ids = scopeElement.inferior_levels_ids?.replace(/\s/g, '')
    scopeRowItem.type = scopeElement.type
    scopeRowItem.parentId = scopeElement.parent_id?.replace(/\s/g, '')
    return scopeRowItem
  },

  getAccessFromScope: (perimeterItem: ScopePage) => {
    return perimeterItem.read_access === 'DATA_NOMINATIVE' || perimeterItem.right_read_patient_nominative === true
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
