import apiBack from '../apiBackend'
import { CONTEXT } from '../../constants'

import { CohortCreationCounterType } from 'types'

export const createCohort = async (
  requeteurJson: string | undefined,
  datedMeasureId: string | undefined,
  snapshotId: string | undefined,
  requestId: string | undefined,
  cohortName: string | undefined,
  cohortDescription: string | undefined,
  globalCount: boolean | undefined
) => {
  if (!requeteurJson || !datedMeasureId || !snapshotId || !requestId) return null
  if (globalCount === undefined) globalCount = false

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
      description: cohortDescription,
      global_estimate: globalCount
    })

    return cohortResult
  }
}

export const countCohort = async (requeteurJson?: string, snapshotId?: string, requestId?: string, uuid?: string) => {
  if (uuid) {
    const measureResult = await apiBack.get<any>(`/explorations/dated-measures/${uuid}/`)

    return {
      date: measureResult?.data?.created_at,
      status: measureResult?.data?.request_job_status,
      jobFailMsg: measureResult?.data?.request_job_fail_msg,
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
      const measureResult = await apiBack.post<any>('/explorations/dated-measures/create-unique/', {
        request_query_snapshot_id: snapshotId,
        request_id: requestId
      })

      return {
        date: measureResult?.data?.updated_at,
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
    const requestResponse = (await apiBack.get<any>(`/explorations/requests/${requestId}/`)) || {}
    const requestData = requestResponse?.data ? requestResponse.data : {}

    const requestName = requestData.name

    let snapshotsHistoryFromQuery: {
      uuid: string
      serialized_query: string
      previous_snapshot: string
      dated_measures: CohortCreationCounterType[]
      created_at: string
    }[] = requestData.query_snapshots

    snapshotsHistoryFromQuery = snapshotsHistoryFromQuery.sort(
      ({ created_at: a }, { created_at: b }) => new Date(b).valueOf() - new Date(a).valueOf()
    )

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
        .map(({ uuid, serialized_query, created_at, previous_snapshot, dated_measures }) => {
          if (nextSnap === uuid) {
            nextSnap = previous_snapshot
            return {
              uuid: uuid,
              json: serialized_query,
              date: created_at,
              dated_measures
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
      requestName,
      snapshotsHistory: snapshotsHistory ? snapshotsHistory.reverse() : [],
      json: currentSnapshot ? currentSnapshot.serialized_query : '',
      currentSnapshot: currentSnapshot ? currentSnapshot.uuid : '',
      count: currentSnapshot ? currentSnapshot.dated_measures[0] : {}
    }
    return result
  }
}
