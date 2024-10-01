/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AccessExpiration,
  AccessExpirationsProps,
  Back_API_Response,
  ChartCode,
  CohortData,
  ReadRightPerimeter,
  UserAccesses
} from 'types'
import { getApiResponseResources } from 'utils/apiHelpers'
import {
  getAgeRepartitionMapAphp,
  getEncounterRepartitionMapAphp,
  getGenderRepartitionMapAphp,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'

import { fetchAccessExpirations, fetchEncounter, fetchPatient, fetchPerimeterAccesses } from './callApi'

import { AxiosResponse } from 'axios'
import apiBackend from '../apiBackend'
import { FetchScopeOptions, Rights, ScopeElement, SourceType, System } from 'types/scope'
import { scopeLevelsToRequestParam } from 'utils/perimeters'
import { mapParamsToNetworkParams } from 'utils/url'
import { Hierarchy } from 'types/hierarchy'
import { getExtension } from 'utils/fhir'

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
  allowSearchIpp: (selectedPopulation: Hierarchy<ScopeElement>[]) => Promise<boolean>

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
  fetchPopulationForRequeteur: (perimeterId: string[] | undefined) => Promise<Hierarchy<ScopeElement>[]>

  /**
   * Cette fonction retourne l'ensemble des perimetres auquels un practitioner a le droit
   *
   * Argument:
   *   - practitionerId: Identifiant technique du practitioner
   *
   * Retour:
   *   - IOrganization[]
   */

  mapRightsToScopeElement: (item: ReadRightPerimeter) => Hierarchy<ScopeElement>

  mapPerimeterToScopeElement: (item: ScopeElement) => Hierarchy<ScopeElement>

  getRights: (options: FetchScopeOptions, signal?: AbortSignal) => Promise<Back_API_Response<Hierarchy<ScopeElement>>>

  getPerimeters: (
    options?: FetchScopeOptions,
    signal?: AbortSignal
  ) => Promise<Back_API_Response<Hierarchy<ScopeElement>>>

  getAccessExpirations: (accessExpirationsProps: AccessExpirationsProps) => Promise<AccessExpiration[]>

  getAccesses: () => Promise<UserAccesses[]>

  /**
   * Cette fonction retourne les droits de lecture d'un périmetre
   *
   * Arguments:
   *   - perimetersId: ID du périmètre (liste d'ID séparé par des virgules)
   */
  fetchPerimetersRights: (perimetersResponse: ScopeElement[]) => Promise<ScopeElement[]>

  /**
   * à travers un ScopePage on retourne 'Nominatif' ou 'Pseudonymisé' selon les droits d'accès
   * @param perimeterItem
   */
  getAccessFromRights: (item: ReadRightPerimeter) => 'Nominatif' | 'Pseudonymisé'
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
      servicesPerimeters.getPerimeters({ cohortIds: perimetersId }),
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

    const perimeters = djangoResponse.results

    const cohort = await servicesPerimeters.fetchPerimetersRights(perimeters)

    const totalPatients = patientsResp?.data?.resourceType === 'Bundle' ? patientsResp.data.total : 0

    const originalPatients = getApiResponseResources(patientsResp)

    const ageFacet = getExtension(patientsResp.data.meta, ChartCode.AGE_PYRAMID)
    const deceasedFacet = getExtension(patientsResp.data.meta, ChartCode.GENDER_REPARTITION)

    const visitFacet = getExtension(encountersResp.data.meta, ChartCode.MONTHLY_VISITS)
    const classFacet = getExtension(encountersResp.data.meta, ChartCode.VISIT_TYPE_REPARTITION)

    const agePyramidData =
      patientsResp?.data?.resourceType === 'Bundle'
        ? getAgeRepartitionMapAphp(ageFacet && ageFacet.extension)
        : undefined
    const genderRepartitionMap =
      patientsResp?.data?.resourceType === 'Bundle'
        ? getGenderRepartitionMapAphp(deceasedFacet && deceasedFacet.extension)
        : undefined
    const monthlyVisitData =
      encountersResp?.data?.resourceType === 'Bundle'
        ? getVisitRepartitionMapAphp(visitFacet && visitFacet.extension)
        : undefined
    const visitTypeRepartitionData =
      encountersResp?.data?.resourceType === 'Bundle'
        ? getEncounterRepartitionMapAphp(classFacet && classFacet.extension)
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

  fetchPopulationForRequeteur: async (cohortIds) => {
    let population: Hierarchy<ScopeElement>[] = []
    const ids = cohortIds?.join(',')
    if (ids) {
      const response = (await servicesPerimeters.getRights({ limit: -1, cohortIds: ids, sourceType: SourceType.ALL }))
        .results
      if (!response.length)
        population = [
          {
            id: Rights.EXPIRED,
            name: '',
            label: '',
            source_value: '',
            above_levels_ids: '',
            inferior_levels_ids: '',
            parent_id: '',
            type: '',
            cohort_id: '',
            cohort_size: '',
            full_path: '',
            system: System.ScopeTree
          }
        ]
      else population = response
    }
    return population
  },

  mapRightsToScopeElement: (item: ReadRightPerimeter): Hierarchy<ScopeElement> => {
    const {
      perimeter,
      read_role,
      right_read_patient_nominative,
      right_read_patient_pseudonymized,
      right_search_patients_by_ipp
    } = item
    const rights = {
      perimeter,
      read_role,
      right_read_patient_nominative,
      right_read_patient_pseudonymized,
      right_search_patients_by_ipp,
      read_access: right_read_patient_nominative ? 'DATA_NOMINATIVE' : 'DATA_PSEUDOANONYMISED',
      export_access: 'DATA_PSEUDOANONYMISED'
    }
    return {
      ...perimeter,
      id: perimeter.id.toString(),
      system: System.ScopeTree,
      label: `${perimeter.source_value} - ${perimeter.name}`,
      access: servicesPerimeters.getAccessFromRights(rights),
      rights
    }
  },

  mapPerimeterToScopeElement: (item: ScopeElement): Hierarchy<ScopeElement> => {
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
      system: System.ScopeTree,
      label: `${source_value} - ${name}`,
      source_value,
      type,
      parent_id,
      above_levels_ids,
      inferior_levels_ids,
      cohort_id,
      cohort_size,
      full_path
    }
  },

  getRights: async (
    options?: FetchScopeOptions,
    signal?: AbortSignal
  ): Promise<Back_API_Response<Hierarchy<ScopeElement>>> => {
    const response: Back_API_Response<Hierarchy<ScopeElement>> = { results: [], count: 0 }
    try {
      let baseUrl = 'accesses/perimeters/patient-data/rights/'
      const params = []
      if (options) {
        if (options.limit) params.push(`limit=${options.limit}`)
        if (options.sourceType !== undefined)
          params.push(`type_source_value=${scopeLevelsToRequestParam(options.sourceType)}`)
        if (options.ids) params.push(`local_id=${options.ids}`)
        if (options.cohortIds) params.push(`cohort_id=${options.cohortIds}`)
        if (options.search) params.push(`search=${options.search}`)
        if (options.page !== undefined && options.limit) params.push(`offset=${options.page * options.limit}`)
      }
      baseUrl += mapParamsToNetworkParams(params)
      const backendResponse = await apiBackend.get<Back_API_Response<ReadRightPerimeter>>(baseUrl, { signal: signal })
      if (backendResponse.status !== 200 || Object.keys(backendResponse.data).length === 0) return response
      const mappedElement = backendResponse.data.results.map((item) => servicesPerimeters.mapRightsToScopeElement(item))
      return {
        ...backendResponse.data,
        results: mappedElement
      }
    } catch (error) {
      return response
    }
  },

  getPerimeters: async (
    options?: FetchScopeOptions,
    signal?: AbortSignal
  ): Promise<Back_API_Response<Hierarchy<ScopeElement>>> => {
    const response: Back_API_Response<Hierarchy<ScopeElement>> = { results: [], count: 0 }
    try {
      let baseUrl = 'accesses/perimeters/'
      const params = []
      if (options) {
        if (options.sourceType !== undefined)
          params.push(`type_source_value=${scopeLevelsToRequestParam(options.sourceType)}`)
        if (options.limit) params.push(`limit=${options.limit}`)
        if (options.ids) params.push(`local_id=${options.ids}`)
        if (options.cohortIds) params.push(`cohort_id=${options.cohortIds}`)
        if (options.search) params.push(`search=${options.search}`)
        if (options.page !== undefined && options.limit) params.push(`offset=${options.page * options.limit}`)
      }
      baseUrl += mapParamsToNetworkParams(params)
      const backendResponse = await apiBackend.get<Back_API_Response<ScopeElement>>(baseUrl, { signal: signal })
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

  fetchPerimetersRights: async (perimeters) => {
    const perimetersIds = perimeters.map((perimeter) => perimeter.id).join(',')
    const rightResponse = await fetchPerimeterAccesses(perimetersIds)
    const rightsData = rightResponse.data ?? []

    return perimeters.map((perimeter) => {
      const foundRight = rightsData.find((rightData) => rightData.perimeter_id === +(perimeter.id ?? '0'))

      return {
        ...perimeter,
        extension: [
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

  getAccessFromRights: (rights: ReadRightPerimeter) => {
    return rights.read_access === 'DATA_NOMINATIVE' || rights.right_read_patient_nominative === true
      ? 'Nominatif'
      : 'Pseudonymisé'
  }
}

export default servicesPerimeters
