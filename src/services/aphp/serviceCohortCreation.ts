import { AxiosResponse } from 'axios'
import apiBack from '../apiBackend'

import {
  Cohort,
  CountCohort,
  DatedMeasure,
  FetchRequest,
  HierarchyElementWithSystem,
  QuerySnapshotInfo,
  RequestType,
  SimpleCodeType,
  Snapshot
} from 'types'
import docTypes from 'assets/docTypes.json'
import { ValueSetWithHierarchy, fetchBiologySearch } from './cohortCreation/fetchObservation'
import { fetchSingleCodeHierarchy, fetchValueSet } from './callApi'
import { VitalStatusLabel } from 'types/searchCriterias'
import { birthStatusData, booleanFieldsData, booleanOpenChoiceFieldsData, vmeData } from 'data/questionnaire_data'
import { Hierarchy } from 'types/hierarchy'
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
    uuid?: string
  ) => Promise<CountCohort | null>

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

  fetchAdmissionModes: () => Promise<Hierarchy<any, any>[]>
  fetchEntryModes: () => Promise<Hierarchy<any, any>[]>
  fetchExitModes: () => Promise<Hierarchy<any, any>[]>
  fetchPriseEnChargeType: () => Promise<Hierarchy<any, any>[]>
  fetchTypeDeSejour: () => Promise<Hierarchy<any, any>[]>
  fetchFileStatus: () => Promise<Hierarchy<any, any>[]>
  fetchReason: () => Promise<Hierarchy<any, any>[]>
  fetchDestination: () => Promise<Hierarchy<any, any>[]>
  fetchProvenance: () => Promise<Hierarchy<any, any>[]>
  fetchAdmission: () => Promise<Hierarchy<any, any>[]>
  fetchGender: () => Promise<Hierarchy<any, any>[]>
  fetchStatus: () => Promise<Hierarchy<any, any>[]>
  fetchStatusDiagnostic: () => Promise<Hierarchy<any, any>[]>
  fetchDiagnosticTypes: () => Promise<Hierarchy<any, any>[]>
  fetchCim10Diagnostic: (searchValue?: string, noStar?: boolean, signal?: AbortSignal) => Promise<Hierarchy<any, any>[]>
  fetchCim10Hierarchy: (cim10Parent?: string) => Promise<Hierarchy<any, any>[]>
  fetchCcamData: (searchValue?: string, noStar?: boolean, signal?: AbortSignal) => Promise<Hierarchy<any, any>[]>
  fetchCcamHierarchy: (ccamParent: string) => Promise<Hierarchy<any, any>[]>
  fetchGhmData: (searchValue?: string, noStar?: boolean, signal?: AbortSignal) => Promise<Hierarchy<any, any>[]>
  fetchGhmHierarchy: (ghmParent: string) => Promise<Hierarchy<any, any>[]>
  fetchDocTypes: () => Promise<SimpleCodeType[]>
  fetchMedicationData: (
    searchValue?: string,
    noStar?: boolean,
    signal?: AbortSignal
  ) => Promise<HierarchyElementWithSystem[]>
  fetchSingleCodeHierarchy: (resourceType: string, code: string) => Promise<string[]>
  fetchAtcHierarchy: (atcParent: string) => Promise<Hierarchy<any, any>[]>
  fetchUCDList: (ucd?: string) => Promise<Hierarchy<any, any>[]>
  fetchPrescriptionTypes: () => Promise<Hierarchy<any, any>[]>
  fetchAdministrations: () => Promise<Hierarchy<any, any>[]>
  fetchBiologyData: () => Promise<Hierarchy<any, any>[]>
  fetchBiologyHierarchy: (biologyParent?: string) => Promise<Hierarchy<any, any>[]>
  fetchBiologySearch: (
    searchInput: string
  ) => Promise<{ anabio: ValueSetWithHierarchy[]; loinc: ValueSetWithHierarchy[] }>
  fetchModalities: () => Promise<Hierarchy<any, any>[]>
  fetchPregnancyMode: () => Promise<Hierarchy<any, any>[]>
  fetchMaternalRisks: () => Promise<Hierarchy<any, any>[]>
  fetchRisksRelatedToObstetricHistory: () => Promise<Hierarchy<any, any>[]>
  fetchRisksOrComplicationsOfPregnancy: () => Promise<Hierarchy<any, any>[]>
  fetchCorticotherapie: () => Promise<Hierarchy<any, any>[]>
  fetchPrenatalDiagnosis: () => Promise<Hierarchy<any, any>[]>
  fetchUltrasoundMonitoring: () => Promise<Hierarchy<any, any>[]>
  fetchInUteroTransfer: () => Promise<Hierarchy<any, any>[]>
  fetchPregnancyMonitoring: () => Promise<Hierarchy<any, any>[]>
  fetchMaturationCorticotherapie: () => Promise<Hierarchy<any, any>[]>
  fetchChirurgicalGesture: () => Promise<Hierarchy<any, any>[]>
  fetchVme: () => Promise<Hierarchy<any, any>[]>
  fetchChildbirth: () => Promise<Hierarchy<any, any>[]>
  fetchHospitalChildBirthPlace: () => Promise<Hierarchy<any, any>[]>
  fetchOtherHospitalChildBirthPlace: () => Promise<Hierarchy<any, any>[]>
  fetchHomeChildBirthPlace: () => Promise<Hierarchy<any, any>[]>
  fetchChildbirthMode: () => Promise<Hierarchy<any, any>[]>
  fetchMaturationReason: () => Promise<Hierarchy<any, any>[]>
  fetchMaturationModality: () => Promise<Hierarchy<any, any>[]>
  fetchImgIndication: () => Promise<Hierarchy<any, any>[]>
  fetchLaborOrCesareanEntry: () => Promise<Hierarchy<any, any>[]>
  fetchPathologyDuringLabor: () => Promise<Hierarchy<any, any>[]>
  fetchObstetricalGestureDuringLabor: () => Promise<Hierarchy<any, any>[]>
  fetchAnalgesieType: () => Promise<Hierarchy<any, any>[]>
  fetchBirthDeliveryWay: () => Promise<Hierarchy<any, any>[]>
  fetchInstrumentType: () => Promise<Hierarchy<any, any>[]>
  fetchCSectionModality: () => Promise<Hierarchy<any, any>[]>
  fetchPresentationAtDelivery: () => Promise<Hierarchy<any, any>[]>
  fetchBirthStatus: () => Promise<Hierarchy<any, any>[]>
  fetchSetPostpartumHemorrhage: () => Promise<Hierarchy<any, any>[]>
  fetchConditionPerineum: () => Promise<Hierarchy<any, any>[]>
  fetchExitPlaceType: () => Promise<Hierarchy<any, any>[]>
  fetchFeedingType: () => Promise<Hierarchy<any, any>[]>
  fetchComplication: () => Promise<Hierarchy<any, any>[]>
  fetchExitFeedingMode: () => Promise<Hierarchy<any, any>[]>
  fetchExitDiagnostic: () => Promise<Hierarchy<any, any>[]>
  fetchEncounterStatus: () => Promise<Hierarchy<any, any>[]>
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
      } as CountCohort
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
      } as CountCohort
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
  },

  fetchAdmissionModes: async () =>
    fetchValueSet(getConfig().core.valueSets.encounterAdmissionMode.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchEntryModes: async () =>
    fetchValueSet(getConfig().core.valueSets.encounterEntryMode.url, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchExitModes: async () =>
    fetchValueSet(getConfig().core.valueSets.encounterExitMode.url, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchPriseEnChargeType: async () =>
    fetchValueSet(getConfig().core.valueSets.encounterVisitType.url, {
      joinDisplayWithCode: false,
      filterOut: (value) => value.id === 'nachstationär' || value.id === 'z.zt. verlegt'
    }),
  fetchTypeDeSejour: async () =>
    fetchValueSet(getConfig().core.valueSets.encounterSejourType.url, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchFileStatus: async () =>
    fetchValueSet(getConfig().core.valueSets.encounterFileStatus.url, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchReason: async () =>
    fetchValueSet(getConfig().core.valueSets.encounterExitType.url, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchDestination: async () =>
    fetchValueSet(getConfig().core.valueSets.encounterDestination.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchProvenance: async () =>
    fetchValueSet(getConfig().core.valueSets.encounterProvenance.url, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchAdmission: async () =>
    fetchValueSet(getConfig().core.valueSets.encounterAdmission.url, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchGender: async () =>
    fetchValueSet(getConfig().core.valueSets.demographicGender.url, { joinDisplayWithCode: false, sortingKey: 'id' }),
  fetchStatus: async () => {
    return [
      {
        id: 'false',
        label: VitalStatusLabel.ALIVE
      },
      {
        id: 'true',
        label: VitalStatusLabel.DECEASED
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
  fetchDiagnosticTypes: async () => fetchValueSet(getConfig().features.condition.valueSets.conditionStatus.url),
  fetchCim10Diagnostic: async (searchValue?: string, noStar?: boolean, signal?: AbortSignal) =>
    fetchValueSet(
      getConfig().features.condition.valueSets.conditionHierarchy.url,
      {
        valueSetTitle: 'Toute la hiérarchie',
        search: searchValue || '',
        noStar
      },
      signal
    ),
  fetchCim10Hierarchy: async (cim10Parent?: string) =>
    fetchValueSet(getConfig().features.condition.valueSets.conditionHierarchy.url, {
      valueSetTitle: 'Toute la hiérarchie CIM10',
      code: cim10Parent
    }),
  fetchCcamData: async (searchValue?: string, noStar?: boolean, signal?: AbortSignal) =>
    fetchValueSet(
      getConfig().features.procedure.valueSets.procedureHierarchy.url,
      { valueSetTitle: 'Toute la hiérarchie', search: searchValue || '', noStar },
      signal
    ),
  fetchCcamHierarchy: async (ccamParent?: string) =>
    fetchValueSet(getConfig().features.procedure.valueSets.procedureHierarchy.url, {
      valueSetTitle: 'Toute la hiérarchie CCAM',
      code: ccamParent
    }),
  fetchGhmData: async (searchValue?: string, noStar?: boolean, signal?: AbortSignal) =>
    fetchValueSet(
      getConfig().features.claim.valueSets.claimHierarchy.url,
      { valueSetTitle: 'Toute la hiérarchie', search: searchValue || '', noStar },
      signal
    ),
  fetchGhmHierarchy: async (ghmParent?: string) =>
    fetchValueSet(getConfig().features.claim.valueSets.claimHierarchy.url, {
      valueSetTitle: 'Toute la hiérarchie GHM',
      code: ghmParent
    }),
  fetchDocTypes: () => Promise.resolve(docTypes && docTypes.docTypes.length > 0 ? docTypes.docTypes : []),
  fetchMedicationData: async (searchValue?: string, noStar?: boolean, signal?: AbortSignal) =>
    fetchValueSet(
      `${getConfig().features.medication.valueSets.medicationAtc.url},${
        getConfig().features.medication.valueSets.medicationUcd.url
      }`,
      {
        valueSetTitle: 'Toute la hiérarchie',
        search: searchValue || '',
        noStar
      },
      signal
    ),
  fetchSingleCodeHierarchy: async (resourceType: string, code: string) => {
    const codeSystemPerResourceType: { [type: string]: string } = {
      Claim: getConfig().features.claim.valueSets.claimHierarchy.url,
      Condition: getConfig().features.condition.valueSets.conditionHierarchy.url,
      MedicationAdministration: `${getConfig().features.medication.valueSets.medicationAtc.url},${
        getConfig().features.medication.valueSets.medicationUcd.url
      }`,
      MedicationRequest: `${getConfig().features.medication.valueSets.medicationAtc.url},${
        getConfig().features.medication.valueSets.medicationUcd.url
      }`,
      Observation: `${getConfig().features.observation.valueSets.biologyHierarchyAnabio.url},${
        getConfig().features.observation.valueSets.biologyHierarchyLoinc.url
      }`,
      Procedure: getConfig().features.procedure.valueSets.procedureHierarchy.url
    }
    if (!(resourceType in codeSystemPerResourceType)) {
      // TODO log error
      return Promise.resolve([] as string[])
    }
    return fetchSingleCodeHierarchy(codeSystemPerResourceType[resourceType], code)
  },
  fetchAtcHierarchy: async (atcParent?: string) =>
    fetchValueSet(getConfig().features.medication.valueSets.medicationAtc.url, {
      valueSetTitle: 'Toute la hiérarchie Médicament',
      code: atcParent,
      sortingKey: 'id',
      filterRoots: (atcData) =>
        // V--[ @TODO: This is a hot fix, remove this after a clean of data ]--V
        atcData.label.search(new RegExp(/^[A-Z] - /, 'gi')) !== -1 &&
        atcData.label.search(new RegExp(/^[X-Y] - /, 'gi')) !== 0
    }),
  fetchUCDList: async (ucd?: string) =>
    fetchValueSet(getConfig().features.medication.valueSets.medicationUcd.url, { code: ucd }),
  fetchPrescriptionTypes: async () =>
    fetchValueSet(getConfig().features.medication.valueSets.medicationPrescriptionTypes.url, {
      joinDisplayWithCode: false
    }),
  fetchAdministrations: async () => {
    const administrations = await fetchValueSet(
      getConfig().features.medication.valueSets.medicationAdministrations.url,
      {
        joinDisplayWithCode: false
      }
    )
    return administrations.map((administration) =>
      administration.id === 'GASTROTOMIE.' ? { ...administration, label: 'Gastrotomie.' } : administration
    )
  },
  fetchBiologyData: async (searchValue?: string, noStar?: boolean) =>
    fetchValueSet(
      `${getConfig().features.observation.valueSets.biologyHierarchyAnabio.url},${
        getConfig().features.observation.valueSets.biologyHierarchyLoinc.url
      }`,
      {
        valueSetTitle: 'Toute la hiérarchie',
        search: searchValue || '',
        noStar,
        joinDisplayWithCode: false
      }
    ),
  fetchBiologyHierarchy: async (biologyParent?: string) =>
    fetchValueSet(getConfig().features.observation.valueSets.biologyHierarchyAnabio.url, {
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
  fetchBiologySearch: fetchBiologySearch,
  fetchModalities: async () => {
    const modalities = await fetchValueSet(getConfig().features.imaging.valueSets.imagingModalities.url, {
      joinDisplayWithCode: false
    })
    return modalities.map((modality) => ({ ...modality, label: `${modality.id} - ${modality.label}` }))
  },
  fetchPregnancyMode: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.pregnancyMode.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchMaternalRisks: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.maternalRisks.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchRisksRelatedToObstetricHistory: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.risksRelatedToObstetricHistory.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchRisksOrComplicationsOfPregnancy: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.risksOrComplicationsOfPregnancy.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchCorticotherapie: async () => {
    return booleanFieldsData
  },
  fetchPrenatalDiagnosis: async () => {
    return booleanFieldsData
  },
  fetchUltrasoundMonitoring: async () => {
    return booleanFieldsData
  },
  fetchInUteroTransfer: async () => {
    return booleanOpenChoiceFieldsData
  },
  fetchPregnancyMonitoring: async () => {
    return booleanFieldsData
  },
  fetchMaturationCorticotherapie: async () => {
    return booleanOpenChoiceFieldsData
  },
  fetchChirurgicalGesture: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.chirurgicalGesture.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchVme: async () => {
    return vmeData
  },
  fetchChildbirth: async () => {
    return booleanOpenChoiceFieldsData
  },
  fetchHospitalChildBirthPlace: async () => {
    return booleanFieldsData
  },
  fetchOtherHospitalChildBirthPlace: async () => {
    return booleanFieldsData
  },
  fetchHomeChildBirthPlace: async () => {
    return booleanFieldsData
  },
  fetchChildbirthMode: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.childBirthMode.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchMaturationReason: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.maturationReason.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),

  fetchMaturationModality: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.maturationModality.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchImgIndication: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.imgIndication.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchLaborOrCesareanEntry: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.laborOrCesareanEntry.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchPathologyDuringLabor: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.pathologyDuringLabor.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchObstetricalGestureDuringLabor: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.obstetricalGestureDuringLabor.url, {
      joinDisplayWithCode: false
    }),
  fetchAnalgesieType: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.analgesieType.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchBirthDeliveryWay: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.birthDeliveryWay.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchInstrumentType: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.instrumentType.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchCSectionModality: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.cSectionModality.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchPresentationAtDelivery: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.presentationAtDelivery.url, {
      joinDisplayWithCode: false
    }),
  fetchBirthStatus: async () => {
    return birthStatusData
  },
  fetchSetPostpartumHemorrhage: async () => {
    return booleanOpenChoiceFieldsData
  },
  fetchConditionPerineum: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.conditionPerineum.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchExitPlaceType: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.exitPlaceType.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchFeedingType: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.feedingType.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchComplication: async () => {
    return booleanFieldsData
  },
  fetchExitFeedingMode: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.exitFeedingMode.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchExitDiagnostic: async () =>
    fetchValueSet(getConfig().features.questionnaires.valueSets.exitDiagnostic.url, {
      joinDisplayWithCode: false,
      sortingKey: 'id'
    }),
  fetchEncounterStatus: async () =>
    fetchValueSet(getConfig().core.valueSets.encounterStatus.url, { joinDisplayWithCode: false, sortingKey: 'id' })
}

export default servicesCohortCreation
