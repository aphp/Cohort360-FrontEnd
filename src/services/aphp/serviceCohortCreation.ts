import { AxiosResponse } from 'axios'
import apiBack from '../apiBackend'
import { Cohort, CohortCount, DatedMeasure, FetchRequest, QuerySnapshotInfo, RequestType, Snapshot } from 'types'
import { getConfig } from 'config'

export interface IServiceCohortCreation {
  /**
   * Cette fonction permet de créer une cohorte à partir d'une requete dans le requeteur
   */
  createCohort: (
    requeteurJson?: string,
    datedMeasureId?: string,
    snapshotId?: string,
    requestId?: string,
    cohortName?: string,
    cohortDescription?: string,
    globalCount?: boolean
  ) => Promise<AxiosResponse<Cohort> | null>

  /**
   * Cette fonction permet de récupérer le count d'une requête
   */
  countCohort: (
    requeteurJson?: string,
    snapshotId?: string,
    requestId?: string,
    uuid?: string,
    stageDetails?: string | null
  ) => Promise<CohortCount | null>
  /**
   * Cette fonction permet de créer un état de `snapshot` pour l'historique d'une requête
   */
  createSnapshot: (id: string, json: string, firstTime?: boolean) => Promise<Snapshot | null>
  /**
   * Cette fonction permet de faire une demande de rapport de faisabilité
   */
  createReport: (id: string) => Promise<AxiosResponse>
  /**
   * Permet de récupérer toutes les informations utiles pour l'utilisation du requeteur
   */
  fetchRequest: (requestId: string, snapshotId?: string) => Promise<FetchRequest>
  fetchSnapshot: (snapshotId: string) => Promise<Snapshot>
}

const servicesCohortCreation: IServiceCohortCreation = {
  createCohort: async (
    requeteurJson,
    datedMeasureId,
    snapshotId,
    requestId,
    cohortName,
    cohortDescription,
    globalCount
  ) => {
    if (!requeteurJson || !datedMeasureId || !snapshotId || !requestId) return null
    if (globalCount === undefined) globalCount = false

    const cohortResult = await apiBack.post<Cohort>('/cohort/cohorts/', {
      dated_measure_id: datedMeasureId,
      request_query_snapshot_id: snapshotId,
      request_id: requestId,
      name: cohortName,
      description: cohortDescription,
      global_estimate: globalCount
    })

    return cohortResult
  },

  countCohort: async (
    requeteurJson?: string,
    snapshotId?: string,
    requestId?: string,
    uuid?: string,
    stageDetails?: string | null
  ) => {
    if (uuid) {
      const measureResult = await apiBack.get<DatedMeasure>(`/cohort/dated-measures/${uuid}/`)

      return {
        date: measureResult?.data?.created_at,
        status: measureResult?.data?.request_job_status,
        jobFailMsg: measureResult?.data?.request_job_fail_msg,
        uuid: measureResult?.data?.uuid,
        includePatient: measureResult?.data?.measure,
        byrequest: 0,
        count_outdated: measureResult?.data?.count_outdated,
        shortCohortLimit: measureResult?.data?.cohort_limit,
        extra: measureResult?.data?.extra
      } as CohortCount
    } else {
      if (!requeteurJson || !snapshotId || !requestId) return null

      const measureResult = await apiBack.post<DatedMeasure>('/cohort/dated-measures/', {
        request_query_snapshot_id: snapshotId,
        request_id: requestId,
        stageDetails
      })

      return {
        date: measureResult?.data?.created_at,
        status: measureResult?.data?.request_job_status ?? 'error',
        uuid: measureResult?.data?.uuid,
        count_outdated: measureResult?.data?.count_outdated,
        shortCohortLimit: measureResult?.data?.cohort_limit,
        extra: measureResult?.data?.extra
      } as CohortCount
    }
  },

  createSnapshot: async (id, json, firstTime) => {
    const data = {
      [firstTime ? 'request_id' : 'previous_snapshot_id']: id,
      serialized_query: json
    }
    const snapshot = (await apiBack.post<Snapshot>('/cohort/request-query-snapshots/', data)) || {}
    return snapshot && snapshot.data ? snapshot.data : null
  },

  createReport: async (id) => {
    const data = { request_query_snapshot_id: id }

    const reportResponse = (await apiBack.post('/cohort/feasibility-studies/', data)) || {}
    return reportResponse
  },

  fetchRequest: async (requestId, snapshotId) => {
    const requestResponse: AxiosResponse = (await apiBack.get<RequestType>(`/cohort/requests/${requestId}/`)) || {}
    const requestData: RequestType = requestResponse?.data ? requestResponse.data : {}

    const query_snapshots: QuerySnapshotInfo[] = requestData.query_snapshots ? requestData.query_snapshots : []

    const requestName = requestData.name

    let snapshotsHistoryFromQuery: QuerySnapshotInfo[] = query_snapshots

    snapshotsHistoryFromQuery = snapshotsHistoryFromQuery.sort(
      ({ created_at: a }, { created_at: b }) => new Date(b).valueOf() - new Date(a).valueOf()
    )

    let currentSnapshotResponse: AxiosResponse | null = null

    if (snapshotId || snapshotsHistoryFromQuery?.length > 0) {
      currentSnapshotResponse = await apiBack.get<Snapshot>(
        `/cohort/request-query-snapshots/${snapshotId ? snapshotId : snapshotsHistoryFromQuery?.[0].uuid}/`
      )
    }

    let currentSnapshot: Snapshot | null = currentSnapshotResponse?.data ? currentSnapshotResponse?.data : null

    let result = null
    let shortCohortLimit = getConfig().features.cohort.shortCohortLimit
    let count_outdated = false

    if (currentSnapshot) {
      // clean Global count
      currentSnapshot = {
        ...currentSnapshot,
        dated_measures: currentSnapshot.dated_measures.filter(
          (dated_measure: DatedMeasure) => dated_measure.mode !== 'Global'
        )
      }

      shortCohortLimit =
        currentSnapshot.dated_measures.length > 0 ? currentSnapshot.dated_measures?.[0].cohort_limit ?? 0 : 0

      count_outdated =
        currentSnapshot.dated_measures.length > 0 ? currentSnapshot.dated_measures?.[0].count_outdated ?? false : false
    }

    result = {
      requestName,
      snapshotsHistory: snapshotsHistoryFromQuery ? snapshotsHistoryFromQuery : [],
      json: currentSnapshot ? currentSnapshot.serialized_query : '',
      currentSnapshot: currentSnapshot ? currentSnapshot : {},
      count: currentSnapshot ? currentSnapshot.dated_measures[0] : {},
      shortCohortLimit,
      count_outdated
    } as FetchRequest
    return result
  },

  fetchSnapshot: async (snapshotId) => {
    const snapshotResponse: AxiosResponse =
      (await apiBack.get<Snapshot>(`/cohort/request-query-snapshots/${snapshotId}/`)) || {}

    return snapshotResponse.data || {}
  }
}

export default servicesCohortCreation
