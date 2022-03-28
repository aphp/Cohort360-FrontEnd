import { AxiosResponse } from 'axios'
import apiBack from '../apiBackend'

import { CohortCreationCounterType } from 'types'

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
  fetchAdministrations
} from './cohortCreation/fetchMedication'
import { fetchBiologyData, fetchBiologyHierarchy } from './cohortCreation/fetchObservation'

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
  createSnapshot: (id: string, json: string, firstTime?: boolean) => Promise<any>

  /**
   * Permet de récupérer toutes les informations utiles pour l'utilisation du requeteur
   */
  fetchRequest: (requestId: string, snapshotId?: string) => Promise<any>

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
  fetchDocTypes: () => { id: string; label: string; type: string }[]
  fetchAtcData: () => Promise<any>
  fetchAtcHierarchy: (atcParent: string) => Promise<any>
  fetchPrescriptionTypes: () => Promise<any>
  fetchAdministrations: () => Promise<any>
  fetchBiologyData: () => Promise<any>
  fetchBiologyHierarchy: (biologyParent?: string) => Promise<any>
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
      const measureResult = await apiBack.get<any>(`/cohort/dated-measures/${uuid}/`)

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

      const measureResult = await apiBack.post<any>('/cohort/dated-measures/create-unique/', {
        request_query_snapshot_id: snapshotId,
        request_id: requestId
      })

      return {
        date: measureResult?.data?.updated_at,
        status: measureResult?.data?.request_job_status ?? 'error',
        uuid: measureResult?.data?.uuid
      }
    }
  },

  createSnapshot: async (id, json, firstTime) => {
    const data = {
      [firstTime ? 'request_id' : 'previous_snapshot_id']: id,
      serialized_query: json
    }
    const request = (await apiBack.post('/cohort/request-query-snapshots/', data)) || {}
    return request && request.data ? request.data : null
  },

  fetchRequest: async (requestId, snapshotId) => {
    const requestResponse = (await apiBack.get<any>(`/cohort/requests/${requestId}/`)) || {}
    const requestData = requestResponse?.data ? requestResponse.data : {}

    const querySnapshotResponse: AxiosResponse[] =
      requestData.query_snapshots && requestData.query_snapshots.length > 0
        ? await Promise.all(
            requestData.query_snapshots.map((query_snapshot: string) =>
              apiBack.get<AxiosResponse>(`/cohort/request-query-snapshots/${query_snapshot}/`)
            )
          )
        : []

    const query_snapshots = querySnapshotResponse.map((querySnapshot: any) => querySnapshot.data)

    const requestName = requestData.name

    let snapshotsHistoryFromQuery: {
      uuid: string
      serialized_query: string
      previous_snapshot: string
      dated_measures: CohortCreationCounterType[]
      created_at: string
    }[] = query_snapshots

    snapshotsHistoryFromQuery = snapshotsHistoryFromQuery.sort(
      ({ created_at: a }, { created_at: b }) => new Date(b).valueOf() - new Date(a).valueOf()
    )

    let currentSnapshot = snapshotId
      ? snapshotsHistoryFromQuery.find(({ uuid }) => uuid === snapshotId)
      : snapshotsHistoryFromQuery
      ? snapshotsHistoryFromQuery[0]
      : null
    let result = null
    let snapshotsHistory: any[] = []

    if (currentSnapshot) {
      // clean Global count
      currentSnapshot = {
        ...currentSnapshot,
        dated_measures: currentSnapshot.dated_measures.filter((dated_measure: any) => dated_measure.mode !== 'Global')
      }

      let nextSnap = currentSnapshot.uuid
      snapshotsHistory = snapshotsHistoryFromQuery
        .map(({ uuid, serialized_query, created_at, previous_snapshot, dated_measures }) => {
          if (nextSnap === uuid) {
            nextSnap = previous_snapshot
            return {
              uuid: uuid,
              json: serialized_query,
              date: created_at,
              // clean Global count
              dated_measures: dated_measures.filter((dated_measure: any) => dated_measure.mode !== 'Global')
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
  fetchAtcHierarchy: fetchAtcHierarchy,
  fetchPrescriptionTypes: fetchPrescriptionTypes,
  fetchAdministrations: fetchAdministrations,
  fetchBiologyData: fetchBiologyData,
  fetchBiologyHierarchy: fetchBiologyHierarchy
}

export default servicesCohortCreation
