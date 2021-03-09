import apiBack from '../apiBackCohort'
import { CONTEXT } from '../../constants'

export const countCohort = async (requeteurJson?: string, snapshotId?: string, requestId?: string, uuid?: string) => {
  if (uuid) {
    const measureResult = await apiBack.get(`/explorations/dated-measures/${uuid}/`)

    return {
      status: measureResult?.data?.request_job_status,
      uuid: measureResult?.data?.uuid,
      includePatient: measureResult?.data?.measure,
      byrequest: 0,
      alive: 0,
      deceased: 0,
      female: 0,
      male: 0
    }
  } else {
    if (!requeteurJson || !snapshotId || !requestId) return null

    if (CONTEXT === 'arkhn') {
      // const request: Cohort_Count_API_Response = await api.post('QueryServer/api/count', requeteurJson)
      // const { data } = request
      return null
    } else if (CONTEXT === 'fakedata') {
      return null
    } else {
      const measureResult = await apiBack.post('/explorations/dated-measures/', {
        request_query_snapshot_id: snapshotId,
        request_id: requestId
      })

      return {
        status: measureResult?.data?.request_job_status,
        uuid: measureResult?.data?.uuid,
        includePatient: 0,
        byrequest: 0,
        alive: 0,
        deceased: 0,
        female: 0,
        male: 0
      }
    }
  }
}

export const createCohort = async (
  requeteurJson: string | undefined,
  datedMeasureId: string | undefined,
  snapshotId: string | undefined,
  requestId: string | undefined,
  cohortName: string | undefined,
  cohortDescription: string | undefined
) => {
  if (!requeteurJson || !datedMeasureId || !snapshotId || !requestId) return null

  if (CONTEXT === 'arkhn') {
    // const request: Cohort_Creation_API_Response = await api.post('QueryServer/api/count', requeteurJson)
    // const { data } = request
    return null
  } else if (CONTEXT === 'fakedata') {
    return null
  } else {
    const cohortResult = await apiBack.post('/explorations/cohorts/', {
      dated_measure_id: datedMeasureId,
      request_query_snapshot_id: snapshotId,
      request_id: requestId,
      name: cohortName,
      description: cohortDescription
    })

    return cohortResult
  }
}

export const createRequest = async () => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
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
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
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
