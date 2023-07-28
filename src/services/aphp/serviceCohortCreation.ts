import { AxiosResponse } from 'axios'
import apiBack from '../apiBackend'

import { DatedMeasure, DocType, QuerySnapshotInfo, RequestType, Snapshot } from 'types'

import {
  fetchAdmissionModes,
  fetchEntryModes,
  fetchExitModes,
  fetchPriseEnChargeType,
  fetchTypeDeSejour,
  fetchFileStatus,
  fetchReason,
  fetchDestination,
  fetchProvenance,
  fetchAdmission
} from './cohortCreation/fetchEncounter'
import { fetchGender, fetchStatus } from './cohortCreation/fetchDemographic'
import {
  fetchStatusDiagnostic,
  fetchDiagnosticTypes,
  fetchCim10Diagnostic,
  fetchCim10Hierarchy
} from './cohortCreation/fetchCondition'
import { fetchCcamData, fetchCcamHierarchy } from './cohortCreation/fetchProcedure'
import { fetchGhmData, fetchGhmHierarchy } from './cohortCreation/fetchClaim'
import { fetchDocTypes } from './cohortCreation/fetchComposition'
import {
  fetchAtcData,
  fetchAtcHierarchy,
  fetchPrescriptionTypes,
  fetchAdministrations,
  fetchSignleCode
} from './cohortCreation/fetchMedication'
import { fetchBiologySearch, fetchBiologyData, fetchBiologyHierarchy } from './cohortCreation/fetchObservation'
import { SHORT_COHORT_LIMIT } from '../../constants'

export interface IServiceCohortCreation {
  /**
   * Cette fornction permet de créer une cohorte à partir d'une requete dans le requeteur
   */
  createCohort: (
    requeteurJson?: string,
    datedMeasureId?: string,
    snapshotId?: string,
    requestId?: string,
    cohortName?: string,
    cohortDescription?: string,
    globalCount?: boolean
  ) => Promise<any>

  /**
   * Cette fonction permet de récupérer le count d'une requête
   */
  countCohort: (requeteurJson?: string, snapshotId?: string, requestId?: string, uuid?: string) => Promise<any>

  /**
   * Cette fonction permet de créer un état de `snapshot` pour l'historique d'une requête
   */
  createSnapshot: (id: string, json: string, firstTime?: boolean) => Promise<Snapshot | null>

  /**
   * Permet de récupérer toutes les informations utiles pour l'utilisation du requeteur
   */
  fetchRequest: (requestId: string, snapshotId?: string) => Promise<any>

  fetchSnapshot: (snapshotId: string) => Promise<Snapshot>

  fetchAdmissionModes: () => Promise<any>
  fetchEntryModes: () => Promise<any>
  fetchExitModes: () => Promise<any>
  fetchPriseEnChargeType: () => Promise<any>
  fetchTypeDeSejour: () => Promise<any>
  fetchFileStatus: () => Promise<any>
  fetchReason: () => Promise<any>
  fetchDestination: () => Promise<any>
  fetchProvenance: () => Promise<any>
  fetchAdmission: () => Promise<any>
  fetchGender: () => Promise<any>
  fetchStatus: () => Promise<any>
  fetchStatusDiagnostic: () => Promise<any>
  fetchDiagnosticTypes: () => Promise<any>
  fetchCim10Diagnostic: () => Promise<any>
  fetchCim10Hierarchy: (cim10Parent: string) => Promise<any>
  fetchCcamData: () => Promise<any>
  fetchCcamHierarchy: (ccamParent: string) => Promise<any>
  fetchGhmData: () => Promise<any>
  fetchGhmHierarchy: (ghmParent: string) => Promise<any>
  fetchDocTypes: () => DocType[]
  fetchAtcData: () => Promise<any>
  fetchSingleMedication: (code: string) => Promise<string[]>
  fetchAtcHierarchy: (atcParent: string) => Promise<any>
  fetchPrescriptionTypes: () => Promise<any>
  fetchAdministrations: () => Promise<any>
  fetchBiologyData: () => Promise<any>
  fetchBiologyHierarchy: (biologyParent?: string) => Promise<any>
  fetchBiologySearch: (searchInput: string) => Promise<{ anabio: any; loinc: any }>
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

    const cohortResult = await apiBack.post('/cohort/cohorts/', {
      dated_measure_id: datedMeasureId,
      request_query_snapshot_id: snapshotId,
      request_id: requestId,
      name: cohortName,
      description: cohortDescription,
      global_estimate: globalCount
    })

    return cohortResult
  },

  countCohort: async (requeteurJson?: string, snapshotId?: string, requestId?: string, uuid?: string) => {
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
        shortCohortLimit: measureResult?.data?.cohort_limit
      }
    } else {
      if (!requeteurJson || !snapshotId || !requestId) return null

      const measureResult = await apiBack.post<DatedMeasure>('/cohort/dated-measures/', {
        request_query_snapshot_id: snapshotId,
        request_id: requestId
      })

      return {
        date: measureResult?.data?.created_at,
        status: measureResult?.data?.request_job_status ?? 'error',
        uuid: measureResult?.data?.uuid,
        count_outdated: measureResult?.data?.count_outdated,
        shortCohortLimit: measureResult?.data?.cohort_limit
      }
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

  fetchRequest: async (requestId, snapshotId) => {
    const requestResponse: AxiosResponse = (await apiBack.get<RequestType>(`/cohort/requests/${requestId}/`)) || {}
    const requestData: RequestType = requestResponse?.data ? requestResponse.data : {}

    const query_snapshots: QuerySnapshotInfo[] = requestData.query_snapshots ? requestData.query_snapshots : []

    const requestName = requestData.name

    let snapshotsHistoryFromQuery: QuerySnapshotInfo[] = query_snapshots

    snapshotsHistoryFromQuery = snapshotsHistoryFromQuery.sort(
      ({ created_at: a }, { created_at: b }) => new Date(b).valueOf() - new Date(a).valueOf()
    )

    const currentSnapshotResponse: AxiosResponse = await apiBack.get<Snapshot>(
      `/cohort/request-query-snapshots/${snapshotId ? snapshotId : snapshotsHistoryFromQuery?.[0].uuid}/`
    )

    let currentSnapshot: Snapshot | null = currentSnapshotResponse?.data ? currentSnapshotResponse?.data : null

    let result = null
    let shortCohortLimit = SHORT_COHORT_LIMIT
    let count_outdated = false

    if (currentSnapshot) {
      // clean Global count
      currentSnapshot = {
        ...currentSnapshot,
        dated_measures: currentSnapshot.dated_measures.filter((dated_measure: any) => dated_measure.mode !== 'Global')
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
    }
    return result
  },

  fetchSnapshot: async (snapshotId) => {
    const snapshotResponse: AxiosResponse =
      (await apiBack.get<Snapshot>(`/cohort/request-query-snapshots/${snapshotId}/`)) || {}

    return snapshotResponse.data || {}
  },

  fetchAdmissionModes: fetchAdmissionModes,
  fetchEntryModes: fetchEntryModes,
  fetchExitModes: fetchExitModes,
  fetchPriseEnChargeType: fetchPriseEnChargeType,
  fetchTypeDeSejour: fetchTypeDeSejour,
  fetchFileStatus: fetchFileStatus,
  fetchReason: fetchReason,
  fetchDestination: fetchDestination,
  fetchProvenance: fetchProvenance,
  fetchAdmission: fetchAdmission,
  fetchGender: fetchGender,
  fetchStatus: fetchStatus,
  fetchStatusDiagnostic: fetchStatusDiagnostic,
  fetchDiagnosticTypes: fetchDiagnosticTypes,
  fetchCim10Diagnostic: fetchCim10Diagnostic,
  fetchCim10Hierarchy: fetchCim10Hierarchy,
  fetchCcamData: fetchCcamData,
  fetchCcamHierarchy: fetchCcamHierarchy,
  fetchGhmData: fetchGhmData,
  fetchGhmHierarchy: fetchGhmHierarchy,
  fetchDocTypes: fetchDocTypes,
  fetchAtcData: fetchAtcData,
  fetchSingleMedication: fetchSignleCode,
  fetchAtcHierarchy: fetchAtcHierarchy,
  fetchPrescriptionTypes: fetchPrescriptionTypes,
  fetchAdministrations: fetchAdministrations,
  fetchBiologyData: fetchBiologyData,
  fetchBiologyHierarchy: fetchBiologyHierarchy,
  fetchBiologySearch: fetchBiologySearch
}

export default servicesCohortCreation
