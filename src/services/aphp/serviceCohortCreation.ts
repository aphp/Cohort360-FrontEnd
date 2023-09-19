import { AxiosResponse } from 'axios'
import apiBack from '../apiBackend'

import { DatedMeasure, DocType, QuerySnapshotInfo, RequestType, Snapshot } from 'types'
import docTypes from 'assets/docTypes.json'
import { fetchSignleCode } from './cohortCreation/fetchMedication'
import { fetchBiologySearch } from './cohortCreation/fetchObservation'
import {
  BIOLOGY_HIERARCHY_ITM_ANABIO,
  BIOLOGY_HIERARCHY_ITM_LOINC,
  CLAIM_HIERARCHY,
  CONDITION_HIERARCHY,
  CONDITION_STATUS,
  DEMOGRAPHIC_GENDER,
  ENCOUNTER_ADMISSION,
  ENCOUNTER_ADMISSION_MODE,
  ENCOUNTER_DESTINATION,
  ENCOUNTER_ENTRY_MODE,
  ENCOUNTER_EXIT_MODE,
  ENCOUNTER_EXIT_TYPE,
  ENCOUNTER_FILE_STATUS,
  ENCOUNTER_PROVENANCE,
  ENCOUNTER_SEJOUR_TYPE,
  ENCOUNTER_VISIT_TYPE,
  MEDICATION_ADMINISTRATIONS,
  MEDICATION_ATC,
  MEDICATION_PRESCRIPTION_TYPES,
  PROCEDURE_HIERARCHY,
  SHORT_COHORT_LIMIT
} from '../../constants'
import { fetchValueSet } from './callApi'

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
  fetchCim10Hierarchy: (cim10Parent?: string) => Promise<any>
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

  fetchAdmissionModes: async () =>
    fetchValueSet(ENCOUNTER_ADMISSION_MODE, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchEntryModes: async () => fetchValueSet(ENCOUNTER_ENTRY_MODE, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchExitModes: async () => fetchValueSet(ENCOUNTER_EXIT_MODE, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchPriseEnChargeType: async () =>
    fetchValueSet(ENCOUNTER_VISIT_TYPE, {
      joinDisplayWithCode: false,
      filterOut: (value) => value.id === 'nachstationär' || value.id === 'z.zt. verlegt'
    }),
  fetchTypeDeSejour: async () => fetchValueSet(ENCOUNTER_SEJOUR_TYPE, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchFileStatus: async () => fetchValueSet(ENCOUNTER_FILE_STATUS, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchReason: async () => fetchValueSet(ENCOUNTER_EXIT_TYPE, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchDestination: async () => fetchValueSet(ENCOUNTER_DESTINATION, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchProvenance: async () => fetchValueSet(ENCOUNTER_PROVENANCE, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchAdmission: async () => fetchValueSet(ENCOUNTER_ADMISSION, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchGender: async () => fetchValueSet(DEMOGRAPHIC_GENDER, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchStatus: async () => {
    return [
      {
        id: false,
        label: 'Vivant(e)'
      },
      {
        id: true,
        label: 'Décédé(e)'
      }
    ]
  },
  fetchStatusDiagnostic: async () => {
    return [
      {
        id: 'actif',
        label: 'Actif'
      },
      {
        id: 'supp',
        label: 'Supprimé'
      }
    ]
  },
  fetchDiagnosticTypes: async () => fetchValueSet(CONDITION_STATUS),
  fetchCim10Diagnostic: async (searchValue?: string, noStar?: boolean) =>
    fetchValueSet(CONDITION_HIERARCHY, {
      valueSetTitle: 'Toute la hiérarchie',
      search: searchValue || '',
      noStar
    }),
  fetchCim10Hierarchy: async (cim10Parent?: string) =>
    fetchValueSet(CONDITION_HIERARCHY, { valueSetTitle: 'Toute la hiérarchie CIM10', code: cim10Parent }),
  fetchCcamData: async (searchValue?: string, noStar?: boolean) =>
    fetchValueSet(PROCEDURE_HIERARCHY, { valueSetTitle: 'Toute la hiérarchie', search: searchValue || '', noStar }),
  fetchCcamHierarchy: async (ccamParent?: string) =>
    fetchValueSet(PROCEDURE_HIERARCHY, { valueSetTitle: 'Toute la hiérarchie CCAM', code: ccamParent }),
  fetchGhmData: async (searchValue?: string, noStar?: boolean) =>
    fetchValueSet(CLAIM_HIERARCHY, { valueSetTitle: 'Toute la hiérarchie', search: searchValue || '', noStar }),
  fetchGhmHierarchy: async (ghmParent?: string) =>
    fetchValueSet(CLAIM_HIERARCHY, { valueSetTitle: 'Toute la hiérarchie GHM', code: ghmParent }),
  fetchDocTypes: () => (docTypes && docTypes.docTypes.length > 0 ? docTypes.docTypes : []),
  fetchAtcData: async (searchValue?: string, noStar?: boolean) =>
    fetchValueSet(MEDICATION_ATC, {
      valueSetTitle: 'Toute la hiérarchie',
      search: searchValue || '',
      noStar
    }),
  fetchSingleMedication: fetchSignleCode,
  fetchAtcHierarchy: async (atcParent?: string) =>
    fetchValueSet(MEDICATION_ATC, {
      valueSetTitle: 'Toute la hiérarchie Médicament',
      code: atcParent,
      sortingKey: 'id',
      filterRoots: (atcData) =>
        // V--[ @TODO: This is a hot fix, remove this after a clean of data ]--V
        atcData.label.search(new RegExp(/^[A-Z] - /, 'gi')) !== -1 &&
        atcData.label.search(new RegExp(/^[X-Y] - /, 'gi')) !== 0
    }),
  fetchPrescriptionTypes: async () => fetchValueSet(MEDICATION_PRESCRIPTION_TYPES, { joinDisplayWithCode: false }),
  fetchAdministrations: async () => fetchValueSet(MEDICATION_ADMINISTRATIONS, { joinDisplayWithCode: false }),
  fetchBiologyData: async (searchValue?: string, noStar?: boolean) =>
    fetchValueSet(`${BIOLOGY_HIERARCHY_ITM_ANABIO},${BIOLOGY_HIERARCHY_ITM_LOINC}`, {
      valueSetTitle: 'Toute la hiérarchie',
      search: searchValue || '',
      noStar,
      joinDisplayWithCode: false
    }),
  fetchBiologyHierarchy: async (biologyParent?: string) =>
    fetchValueSet(BIOLOGY_HIERARCHY_ITM_ANABIO, {
      valueSetTitle: 'Toute la hiérarchie de Biologie',
      code: biologyParent,
      joinDisplayWithCode: false,
      filterRoots: (biologyItem) =>
        biologyItem.id !== '527941' &&
        biologyItem.id !== '547289' &&
        biologyItem.id !== '528247' &&
        biologyItem.id !== '981945' &&
        biologyItem.id !== '834019' &&
        biologyItem.id !== '528310' &&
        biologyItem.id !== '528049' &&
        biologyItem.id !== '527570' &&
        biologyItem.id !== '527614'
    }),
  fetchBiologySearch: fetchBiologySearch
}

export default servicesCohortCreation
