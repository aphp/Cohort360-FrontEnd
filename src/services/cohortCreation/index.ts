import moment from 'moment'
import { intersection } from 'lodash'

import apiFhir from '../api'
import apiRequest from '../apiRequest'
import apiBack from '../apiBackCohort'
import { CONTEXT } from '../../constants'

import { Cohort_Creation_API_Response, FHIR_API_Response } from 'types'
import { GroupTypeKind, IGroup, IGroup_Member, IPatient } from '@ahryman40k/ts-fhir-types/lib/R4'
import { getApiResponseResources } from '../../utils/apiHelpers'

type SourcePopulation = {
  caresiteCohortList: number[]
}

type QueryRequest = {
  _type: 'andGroup' | 'orGroup'
  _id: number
  resourceType: 'Patient' | 'Condition'
  isInclusive: boolean
  criteria: QueryRequest[]
  filterSolr: string
}

type Query = {
  version: string
  sourcePopulation: SourcePopulation
  request: QueryRequest[]
}

const PATIENT_COUNT = 500

const createCohortGroup = async (json_query: string): Promise<IGroup> => {
  const query: Query = JSON.parse(json_query)
  const criteria_groups = query.request[0].criteria

  const criteria_groups_type = query.request[0]._type
  const patient_ids = await criteria_groups.reduce(async (patient_ids_acc, group) => {
    const group_patient_ids = await group.criteria.reduce(async (group_patients_ids_acc, criteria) => {
      const acc = await group_patients_ids_acc
      const query_filter = criteria.filterSolr
      const resource_type = criteria.resourceType

      let query = ''
      switch (resource_type) {
        case 'Condition':
          query = `/Patient?_count=${PATIENT_COUNT}&${query_filter}`
          break
        case 'Patient':
          query = `/Patient?_count=${PATIENT_COUNT}&_has:Condition:patient:${query_filter}`
          break
        default:
          break
      }
      const response = await apiFhir.get<FHIR_API_Response<IPatient>>(query)
      const patients = getApiResponseResources(response)
      if (!patients) return [...acc]

      const criteria_patient_ids = patients.map((patient) => patient.id)
      const group_type = group._type
      switch (group_type) {
        case 'andGroup':
          return [...intersection(acc, criteria_patient_ids)]
        case 'orGroup':
          return [...acc, ...criteria_patient_ids]
        default:
          return [...acc]
      }
    }, Promise.resolve<(string | undefined)[]>([]))

    const acc = await patient_ids_acc
    switch (criteria_groups_type) {
      case 'andGroup':
        return [...intersection(acc, group_patient_ids)]
      case 'orGroup':
        return [...acc, ...group_patient_ids]
      default:
        return [...acc]
    }
  }, Promise.resolve<(string | undefined)[]>([]))

  return {
    resourceType: 'Group',
    type: GroupTypeKind._person,
    actual: true,
    quantity: patient_ids.length,
    member: patient_ids.map(
      (id): IGroup_Member => ({
        entity: {
          reference: `Patient/${id}`
        }
      })
    )
  }
}

export const countCohort = async (
  requeteurJson: string | undefined,
  snapshotId: string | undefined,
  requestId: string | undefined
) => {
  if (!requeteurJson || !snapshotId || !requestId) return null

  if (CONTEXT === 'arkhn') {
    const patients_group = await createCohortGroup(requeteurJson)
    const count = patients_group.quantity
    const measureResult = await apiBack.post('/explorations/dated-measures/', {
      request_query_snapshot_id: snapshotId,
      request_id: requestId,
      fhir_datetime: moment().format('YYYY-MM-DD[T]HH:mm:ss'),
      measure: count ?? 0
    })
    return {
      count,
      uuid: measureResult && measureResult.data ? measureResult.data.uuid : null
    }
  } else if (CONTEXT === 'fakedata') {
    return null
  } else {
    const countResult = (await apiRequest.post('QueryServer/api/count', requeteurJson)) || {}

    const { data } = countResult
    const count = data && data.result && data.result[0] ? data.result && data.result[0].count : null

    const measureResult = await apiBack.post('/explorations/dated-measures/', {
      request_query_snapshot_id: snapshotId,
      request_id: requestId,
      fhir_datetime: moment().format('YYYY-MM-DD[T]HH:mm:ss'),
      measure: count ?? 0
    })

    return {
      count,
      uuid: measureResult && measureResult.data ? measureResult.data.uuid : null
    }
  }
}

export const createCohort = async (
  json_query: string | undefined,
  datedMeasureId: string | undefined,
  snapshotId: string | undefined,
  requestId: string | undefined,
  cohortName: string | undefined,
  cohortDescription: string | undefined
) => {
  if (!json_query || !datedMeasureId || !snapshotId || !requestId) return null

  if (CONTEXT === 'arkhn') {
    const patients_group = await createCohortGroup(json_query)
    const response = await apiFhir.post('/Group', patients_group)
    const group: IGroup = response.data
    const fhir_group_id = group.id

    const cohortResult = await apiBack.post('/explorations/cohorts/', {
      dated_measure_id: datedMeasureId,
      request_query_snapshot_id: snapshotId,
      request_id: requestId,
      fhir_group_id,
      name: cohortName,
      description: cohortDescription
    })

    return {
      ...cohortResult,
      fhir_group_id
    }
  } else {
    const fihrResult: Cohort_Creation_API_Response = (await apiRequest.post('QueryServer/api/create', json_query)) || {}
    const { data } = fihrResult
    const fhir_group_id = data && data.result && data.result[0] ? data.result[0]['group.id'] : ''

    const cohortResult = await apiBack.post('/explorations/cohorts/', {
      dated_measure_id: datedMeasureId,
      request_query_snapshot_id: snapshotId,
      request_id: requestId,
      fhir_group_id,
      name: cohortName,
      description: cohortDescription
    })

    return {
      ...cohortResult,
      fhir_group_id
    }
  }
}

export const createRequest = async () => {
  if (CONTEXT === 'fakedata') {
    return null
  } else {
    const request =
      (await apiBack.post('/explorations/requests/', {
        name: 'Nouvelle requête',
        description: 'Requête créée depuis le front Cohort360',
        favorite: false,
        data_type_of_query: 'PATIENT'
      })) || {}
    return request && request.data ? request.data : null
  }
}

export const createSnapshot = async (id: string, json: string, firstTime?: boolean) => {
  if (CONTEXT === 'fakedata') {
    return null
  } else {
    const data = {
      [firstTime ? 'request_id' : 'previous_snapshot_id']: id,
      serialized_query: json
    }
    const request = (await apiBack.post('/explorations/request-query-snapshots/', data)) || {}
    return request && request.data ? request.data : null
  }
}
