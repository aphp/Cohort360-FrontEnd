import moment from 'moment'

import {
  FHIR_API_Response,
  CohortData,
  SearchByTypes,
  VitalStatus,
  Back_API_Response,
  Cohort,
  CohortComposition,
  AgeRepartitionType,
  GenderRepartitionType
} from 'types'
import {
  IGroup,
  IPatient,
  IEncounter,
  IComposition,
  PatientGenderKind,
  IDocumentReference
} from '@ahryman40k/ts-fhir-types/lib/R4'
import {
  getGenderRepartitionMap,
  getGenderRepartitionMapAphp,
  getEncounterRepartitionMap,
  getEncounterRepartitionMapAphp,
  getAgeRepartitionMap,
  getAgeRepartitionMapAphp,
  getVisitRepartitionMap,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'
import { getApiResponseResources } from 'utils/apiHelpers'

import { fetchGroup, fetchPatient, fetchEncounter } from './callApi'
import apiBackend from '../apiBackend'

interface IServiceAphp {
  fetchCohort: (cohortId: string) => Promise<CohortData | undefined>
  fetchPatientList: (
    page: number,
    searchBy: SearchByTypes,
    searchInput: string,
    gender: PatientGenderKind,
    age: [number, number],
    vitalStatus: VitalStatus,
    sortBy: string,
    sortDirection: string,
    groupId?: string,
    includeFacets?: boolean
  ) => Promise<
    | {
        totalPatients: number
        originalPatients: IPatient[] | undefined
        agePyramidData?: AgeRepartitionType
        genderRepartitionMap?: GenderRepartitionType
      }
    | undefined
  >
}

const serviceAphp: IServiceAphp = {
  fetchCohort: async (cohortId) => {
    // eslint-disable-next-line
    let fetchCohortsResults = await Promise.all([
      apiBackend.get<Back_API_Response<Cohort>>(`/explorations/cohorts/?fhir_group_id=${cohortId}`),
      fetchGroup({ _id: cohortId }),
      fetchPatient({
        pivotFacet: ['age_gender', 'deceased_gender'],
        _list: [cohortId],
        size: 20,
        _sort: 'given',
        _elements: ['gender', 'name', 'birthDate', 'deceased', 'identifier', 'extension']
      }),
      fetchEncounter({
        facet: ['class', 'visit-year-month-gender-facet'],
        _list: [cohortId],
        size: 0,
        type: 'VISIT'
      })
    ])

    const cohortInfo = fetchCohortsResults[0]
    const cohortResp = fetchCohortsResults[1]
    const patientsResp = fetchCohortsResults[2]
    const encountersResp = fetchCohortsResults[3]

    let name = ''
    let description = ''
    let requestId = ''
    let uuid = ''
    let favorite = false

    if (cohortInfo.data.results && cohortInfo.data.results.length === 1) {
      name = cohortInfo.data.results[0].name ?? ''
      description = cohortInfo.data.results[0].description ?? ''
      requestId = cohortInfo.data.results[0].request ?? ''
      favorite = cohortInfo.data.results[0].favorite ?? false
      uuid = cohortInfo.data.results[0].uuid ?? ''
    } else {
      throw new Error('This cohort is not your or invalid')
    }

    if (!name) {
      name = cohortResp.data.resourceType === 'Bundle' ? cohortResp.data.entry?.[0].resource?.name ?? '-' : '-'
    }

    const cohort = cohortResp.data.resourceType === 'Bundle' ? cohortResp.data.entry?.[0].resource : undefined

    const totalPatients = patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total : 0

    const originalPatients = getApiResponseResources(patientsResp)

    const agePyramidData =
      patientsResp.data.resourceType === 'Bundle'
        ? getAgeRepartitionMapAphp(
            patientsResp.data.meta?.extension?.find((facet: any) => facet.url === 'facet-age-month')?.extension
          )
        : undefined

    const genderRepartitionMap =
      patientsResp.data.resourceType === 'Bundle'
        ? getGenderRepartitionMapAphp(
            patientsResp.data.meta?.extension?.find((facet: any) => facet.url === 'facet-deceased')?.extension
          )
        : undefined

    const monthlyVisitData =
      encountersResp.data.resourceType === 'Bundle'
        ? getVisitRepartitionMapAphp(
            encountersResp.data.meta?.extension?.find(
              (facet: any) => facet.url === 'facet-visit-year-month-gender-facet'
            )?.extension
          )
        : undefined

    const visitTypeRepartitionData =
      encountersResp.data.resourceType === 'Bundle'
        ? getEncounterRepartitionMapAphp(
            encountersResp.data.meta?.extension?.find((facet: any) => facet.url === 'facet-class-simple')?.extension
          )
        : undefined

    return {
      name,
      description,
      cohort,
      totalPatients,
      originalPatients,
      genderRepartitionMap,
      visitTypeRepartitionData,
      agePyramidData,
      monthlyVisitData,
      requestId,
      favorite,
      uuid
    }
  },
  fetchPatientList: async (
    page,
    searchBy,
    searchInput,
    gender,
    age,
    vitalStatus,
    sortBy,
    sortDirection,
    groupId,
    includeFacets
  ) => {
    let _searchInput = ''
    const searches = searchInput
      .trim() // Remove space before/after search
      .split(' ') // Split by space (= ['mot1', 'mot2' ...])
      .filter((elem: string) => elem) // Filter if you have ['mot1', '', 'mot2'] (double space)
    for (const _search of searches) {
      _searchInput = _searchInput ? `${_searchInput} AND "${_search}"` : `"${_search}"`
    }

    let date1 = ''
    let date2 = ''
    if (age[0] !== 0 || age[1] !== 130) {
      date1 = moment()
        .subtract(age[1] + 1, 'years')
        .add(1, 'days')
        .format('YYYY-MM-DD') //`${today.getFullYear() - age[1]}-${monthStr}-${dayStr}`
      date2 = moment().subtract(age[0], 'years').format('YYYY-MM-DD') //`${today.getFullYear() - age[0]}-${monthStr}-${dayStr}`
    }

    const patientsResp = await fetchPatient({
      size: 20,
      offset: page ? (page - 1) * 20 : 0,
      _sort: sortBy,
      sortDirection: sortDirection === 'desc' ? 'desc' : 'asc',
      pivotFacet: includeFacets ? ['age_gender', 'deceased_gender'] : [],
      _list: groupId ? [groupId] : [],
      gender,
      searchBy,
      _text: _searchInput,
      birthdate: [date1, date2],
      deceased: vitalStatus !== VitalStatus.all ? (vitalStatus === VitalStatus.deceased ? true : false) : undefined
    })

    const totalPatients = patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total : 0

    const originalPatients = getApiResponseResources(patientsResp)

    const agePyramidData =
      patientsResp.data.resourceType === 'Bundle'
        ? getAgeRepartitionMapAphp(
            patientsResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-age-month')?.[0].extension
          )
        : undefined

    const genderRepartitionMap =
      patientsResp.data.resourceType === 'Bundle'
        ? getGenderRepartitionMapAphp(
            patientsResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-deceased')?.[0].extension
          )
        : undefined

    return {
      totalPatients: totalPatients ?? 0,
      originalPatients,
      genderRepartitionMap,
      agePyramidData
    }
  }
}

export default serviceAphp

// ================================================================================

// abstract class IServiceInterface {
//   fetchCohort: (cohortId: string) => Promise<CohortData | undefined> = () => {
//     throw new Error('fetchCohort is not implemented')
//   }

//   fetchPatientList: (
//     page: number,
//     searchBy: SearchByTypes,
//     searchInput: string,
//     gender: PatientGenderKind,
//     age: [number, number],
//     vitalStatus: VitalStatus,
//     sortBy: string,
//     sortDirection: string,
//     groupId?: string,
//     includeFacets?: boolean
//   ) => Promise<
//     | {
//         totalPatients: number
//         originalPatients: IPatient[] | undefined
//         agePyramidData?: AgeRepartitionType
//         genderRepartitionMap?: GenderRepartitionType
//       }
//     | undefined
//   > = () => {
//     throw new Error('fetchPatientList is not implemented')
//   }
// }

// export class serviceAphp2 extends IServiceInterface {
//   fetchCohort = () => {
//     ...
//   }
// }
