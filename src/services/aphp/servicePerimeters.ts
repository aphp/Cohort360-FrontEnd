import { CohortData, ScopePage, ScopeTreeRow } from 'types'
import { IGroup } from '@ahryman40k/ts-fhir-types/lib/R4'
import {
  getAgeRepartitionMapAphp,
  getEncounterRepartitionMapAphp,
  getGenderRepartitionMapAphp,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'
import { getApiResponseResources } from 'utils/apiHelpers'

import { fetchEncounter, fetchGroup, fetchPatient, fetchScope } from './callApi'

import apiBackend from '../apiBackend'
import { sortByQuantityAndName } from 'utils/scopeTree'

const loadingItem: ScopeTreeRow = { id: 'loading', name: 'loading', quantity: 0, subItems: [] }

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
    noPerimetersIdsFetch?: boolean
  ) => Promise<ScopePage[]>

  /**
   * Cette fonction se base sur la fonction `getPerimeters` du service, et ré-organise la donnée sous forme d'un ScopeTreeRow[]
   *
   * Argument:
   *   - practitionerId: Identifiant technique du practitioner
   *
   * Retour:
   *   - ScopeTreeRow[]
   */
  getScopePerimeters: (practitionerId: string) => Promise<ScopeTreeRow[]>

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
  getScopeSubItems: (subScopesIds: string | null | undefined, getSubItem?: boolean) => Promise<ScopeTreeRow[]>

  /**
   * Cette fonction retourne les droits de lecture d'un périmetre
   *
   * Arguments:
   *   - perimetersId: ID du périmètre (liste d'ID séparé par des virgules)
   */
  fetchPerimetersRights: (perimeters: IGroup[]) => Promise<IGroup[]>
}

const servicesPerimeters: IServicePerimeters = {
  allowSearchIpp: async (selectedPopulation) => {
    if (!selectedPopulation) {
      return false
    }

    const caresiteIds = selectedPopulation
      .map((perimeter) => perimeter.id)
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
        pivotFacet: ['age_gender', 'deceased_gender'],
        _list: perimetersId.split(','),
        size: 20,
        _sort: 'given',
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

    const ageFacet = patientsResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-age-month')
    const deceasedFacet = patientsResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-deceased')
    const visitFacet = encountersResp.data.meta?.extension?.filter(
      (facet: any) => facet.url === 'facet-visit-year-month-gender-facet'
    )
    const classFacet = encountersResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-class-simple')

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
      const scopeTreeRowList: ScopeTreeRow[] = await buildScopeTreeRow(scopeItemList)
      return scopeTreeRowList && scopeTreeRowList.length > 0 ? scopeTreeRowList[0] : undefined
    } catch (error) {
      return undefined
    }
  },

  getPerimeters: async (defaultPerimetersIds?: string[], cohortIds?: string[], noPerimetersIdsFetch?: boolean) => {
    try {
      let perimetersIds: string[] | undefined = []
      let perimetersList: ScopePage[] = []
      let rightsData: any[] = []
      if (!defaultPerimetersIds && !noPerimetersIdsFetch) {
        const rightResponse = await apiBackend.get('accesses/accesses/my-rights/?pop-children')
        rightsData = rightResponse.status === 200 ? (rightResponse?.data as any[]) : []

        if (rightResponse.status !== 200) {
          const backError: any = {
            errorType: 'back'
          }
          return backError
        } else if (rightsData && rightsData.length === 0) {
          return []
        }

        perimetersIds = rightsData.map((rightData) => rightData.care_site_id)
      } else {
        perimetersIds = defaultPerimetersIds
      }

      const perimetersListReponse: any = await fetchScope({ perimetersIds: perimetersIds, cohortIds: cohortIds })
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
          const foundRight = rightsData.find(
            (rightData) => rightData.care_site_id === +(perimeterItem.perimeter.id ?? '0')
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

  getScopePerimeters: async (practitionerId) => {
    if (!practitionerId) return []

    const scopeItemList: ScopePage[] = (await servicesPerimeters.getPerimeters()) ?? []
    const scopeTreeRowList: ScopeTreeRow[] = await buildScopeTreeRow(scopeItemList)
    return scopeTreeRowList
  },

  getScopeSubItems: async (subScopesIds: string | null | undefined, getSubItem?: boolean) => {
    if (!subScopesIds) return []
    const subScopes: ScopePage[] = await servicesPerimeters.getPerimeters(subScopesIds.trim().split(','))
    const scopeRowList: ScopeTreeRow[] = await buildScopeTreeRow(subScopes, getSubItem)
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
  }
}

export default servicesPerimeters

export const getScopeName = (perimeter: any) => {
  const perimeterID = perimeter ? perimeter.source_value : false
  if (!perimeterID) {
    return perimeter ? perimeter.name : ''
  }
  return `${perimeterID} - ${perimeter.name}`
}
export const getAccessFromScope = (perimeterItem: ScopePage) => {
  return perimeterItem.read_access === 'DATA_NOMINATIVE' || perimeterItem.right_read_patient_nominative === true
    ? 'Nominatif'
    : 'Pseudonymisé'
}
export const buildScopeTreeRow: (
  subScopes: ScopePage[],
  getSubItem?: boolean | undefined
) => Promise<ScopeTreeRow[]> = async (subScopes: ScopePage[], getSubItem?: boolean | undefined) => {
  let scopeRowList: ScopeTreeRow[] = []
  for (const scopeItem of subScopes) {
    const scopeRowItem: ScopeTreeRow = { id: '', name: '', quantity: 0, subItems: [] }
    scopeRowItem.id = '' + scopeItem.perimeter.id
    scopeRowItem.cohort_id = scopeItem.perimeter.cohort_id
    scopeRowItem.name = getScopeName(scopeItem.perimeter)
    scopeRowItem.quantity = +scopeItem.perimeter.cohort_size
    scopeRowItem.access = getAccessFromScope(scopeItem)
    scopeRowItem.inferior_levels_ids = scopeItem.perimeter.inferior_levels_ids
    scopeRowItem.subItems =
      getSubItem === true
        ? await servicesPerimeters.getScopeSubItems(scopeItem.perimeter.inferior_levels_ids)
        : [loadingItem]
    scopeRowList = [...scopeRowList, scopeRowItem]
  }
  scopeRowList = sortByQuantityAndName(scopeRowList)
  return scopeRowList
}
