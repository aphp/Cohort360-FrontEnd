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
      alive: measureResult?.data?.measure_alive,
      deceased: measureResult?.data?.measure_deceased,
      female: measureResult?.data?.measure_female,
      male: measureResult?.data?.measure_male,
      unknownPatient: measureResult?.data?.measure_unknown
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

export const createRequest = async (name: string, description: string, projectId: string | null) => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    console.log(`projectId`, projectId)
    return null
  } else {
    const request =
      (await apiBack.post('/explorations/requests/', {
        name,
        description,
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

export const fetchRequest = async (requestId: string, snapshotId: string | undefined) => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return null
  } else {
    const requestResult = (await apiBack.get(`/explorations/requests/${requestId}/query-snapshots/`)) || {}
    const data = requestResult?.data ? requestResult.data : {}

    const snapshotsHistoryFromQuery: {
      uuid: string
      serialized_query: string
      previous_snapshot_id: string
      created_at: string
    }[] = data.results

    const currentSnapshot = snapshotId
      ? snapshotsHistoryFromQuery.find(({ uuid }) => uuid === snapshotId)
      : snapshotsHistoryFromQuery
      ? snapshotsHistoryFromQuery[0]
      : null
    let result = null
    let snapshotsHistory: any[] = []

    if (currentSnapshot) {
      let nextSnap = currentSnapshot.uuid
      snapshotsHistory = snapshotsHistoryFromQuery
        .map(({ uuid, serialized_query, created_at, previous_snapshot_id }) => {
          if (nextSnap === uuid) {
            nextSnap = previous_snapshot_id
            return {
              uuid: uuid,
              json: serialized_query,
              date: created_at
            }
          } else {
            return {
              uuid: undefined,
              json: serialized_query,
              date: created_at
            }
          }
        })
        .filter(({ uuid }) => uuid !== undefined)
    }
    result = {
      json: currentSnapshot ? currentSnapshot.serialized_query : '',
      currentSnapshot: currentSnapshot ? currentSnapshot.uuid : '',
      snapshotsHistory: snapshotsHistory.filter(({ uuid }) => uuid !== undefined)
    }
    return result
  }
}
