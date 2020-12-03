import moment from 'moment'

import api from './apiRequest'
import apiBack from './apiBackCohort'
import { CONTEXT } from '../constants'

import { Cohort_Creation_API_Response } from 'types'

export const countCohort = async (
  requeteurJson: string | undefined,
  snapshotId: string | undefined,
  requestId: string | undefined
) => {
  if (!requeteurJson || !snapshotId || !requestId) return null

  if (CONTEXT === 'arkhn') {
    // const request: Cohort_Count_API_Response = await api.post('QueryServer/api/count', requeteurJson)
    // const { data } = request
    return null
  } else {
    const countResult = (await api.post('QueryServer/api/count', requeteurJson)) || {}
    const { data } = countResult
    const measure = data && data.result && data.result[0] ? data.result && data.result[0].count : null

    const measureResult = await apiBack.post('/explorations/dated-measures/', {
      request_query_snapshot_id: snapshotId,
      request_id: requestId,
      fhir_datetime: moment().format('YYYY-MM-DD[T]HH:mm:ss'),
      measure
    })

    return { count: measure, uuid: measureResult && measureResult.data ? measureResult.data.uuid : null }
  }
}

export const createCohort = async (
  requeteurJson: string | undefined,
  datedMeasureId: string | undefined,
  snapshotId: string | undefined,
  requestId: string | undefined
) => {
  if (!requeteurJson || !datedMeasureId || !snapshotId || !requestId) return null

  if (CONTEXT === 'arkhn') {
    // const request: Cohort_Creation_API_Response = await api.post('QueryServer/api/count', requeteurJson)
    // const { data } = request
    return null
  } else {
    const fihrResult: Cohort_Creation_API_Response = (await api.post('QueryServer/api/create', requeteurJson)) || {}
    const { data } = fihrResult
    const fhir_group_id = data && data.result && data.result[0] ? data.result[0]['group.id'] : ''

    console.log('requeteurJson', requeteurJson)
    console.log('datedMeasureId', datedMeasureId)
    console.log('snapshotId', snapshotId)
    console.log('requestId', requestId)
    console.log('fhir_group_id', fhir_group_id)

    const cohortResult = await apiBack.post('/explorations/cohorts/', {
      dated_measure_id: datedMeasureId,
      request_query_snapshot_id: snapshotId,
      request_id: requestId,
      fhir_group_id,
      name: 'Création de cohorte par vmariot',
      description: 'Ceci est la première cohorte créer via Cohort360'
    })

    return cohortResult && cohortResult.data && cohortResult.data.result ? cohortResult.data.result[0] : null
  }
}

type CreatedRequestType = {
  created_at: string
  data_type_of_query: string
  description: string
  favorite: boolean
  modified_at: string
  name: string
  owner_id: string
  uuid: string
}

export const createRequest = async () => {
  if (CONTEXT === 'arkhn') {
    return null
  } else {
    const request =
      (await apiBack.post('/explorations/requests/', {
        // owner_id: 'string',
        name: 'Création de cohorte',
        description: 'Cohorte créer depuis le front Cohort360',
        favorite: false,
        data_type_of_query: 'PATIENT'
      })) || {}
    return request && request.data ? request.data : null
  }
}

export const createSnapshot = async (id: string, json: string, firstTime?: boolean) => {
  if (!id || !json) return null

  if (CONTEXT === 'arkhn') {
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
