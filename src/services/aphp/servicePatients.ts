import { AxiosResponse } from 'axios'
import { CohortData, FHIR_Bundle_Response, CohortEncounter, CohortComposition, MedicationEntry, ChartCode } from 'types'
import {
  getGenderRepartitionMapAphp,
  getEncounterRepartitionMapAphp,
  getAgeRepartitionMapAphp,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'
import { getApiResponseResources } from 'utils/apiHelpers'
import {
  fetchPatient,
  fetchEncounter,
  fetchClaim,
  fetchCondition,
  fetchProcedure,
  fetchDocumentReference,
  fetchMedicationRequest,
  fetchMedicationAdministration,
  fetchObservation,
  fetchImaging,
  postFilters,
  getFilters,
  deleteFilters,
  patchFilters,
  deleteFilter,
  fetchForms,
  fetchQuestionnaires
} from './callApi'

import servicesPerimeters from './servicePerimeters'
import servicesCohorts from './serviceCohorts'
import {
  Claim,
  Condition,
  DocumentReference,
  Encounter,
  Identifier,
  ImagingStudy,
  MedicationAdministration,
  MedicationRequest,
  Observation,
  Patient,
  Procedure,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r4'
import { Direction, FormNames, Filters, Order, SearchByTypes, SearchCriterias } from 'types/searchCriterias'
import { PMSIResourceTypes, ResourceType } from 'types/requestCriterias'
import { mapSearchCriteriasToRequestParams } from 'mappers/filters'
import { getExtension } from 'utils/fhir'

export interface IServicePatients {
  /*
   ** Cette fonction permet de récupérer un nombre de patient totale lié à un utilisateur
   **
   ** Elle ne prend aucun argument, et un nombre de patient
   */
  fetchPatientsCount: (signal?: AbortSignal) => Promise<number | null>

  /*
   ** Cette fonction permet de récupérer l'ensemble des patients lié à un utilisateur
   **
   ** Elle ne prend aucun argument, et retourne un object CohortData ou undefined en cas d'erreur
   */
  fetchMyPatients: () => Promise<CohortData | undefined>

  /*
   ** Cette fonction permet de récupérer les informations necessaire a l'affichage de la page "Aperçu patient" (state/patient)
   **
   ** Argument:
   **   - patientId: identifiant technique d'un patient
   **   - groupId: (optionnel) Périmètre auquel le patient est lié
   **
   ** Retourne une partie du type du store Redux lié au patient (state/patient) ou undefined en cas d'erreur
   */
  fetchPatientInfo: (
    patientId: string,
    groupId?: string
  ) => Promise<
    | {
        patientInfo: Patient & {
          lastEncounter?: Encounter
          lastGhm?: Claim
          lastProcedure?: Procedure
          mainDiagnosis?: Condition[]
        }
        hospits?: (CohortEncounter | Encounter)[]
      }
    | undefined
  >

  /*
   ** Cette fonction permet de récupérer les élèments de PMSI lié à un patient
   **
   ** Argument:
   **   - page: permet la pagination des éléments
   **   - patientId: identifiant technique d'un patient
   **   - selectedTab: permet de selectionner la collection Condition, Procedure, ou Claim
   **   - searchInput: permet la recherche textuelle
   **   - nda: permet de filtrer sur un NDA précis
   **   - code: permet de filtrer un code
   **   - diagnosticTypes: permet de filtrer par un type de diagnostic (uniquement pour les CIM10)
   **   - sortBy: permet le tri
   **   - sortDirection: permet le tri dans l'ordre croissant ou décroissant
   **   - groupId: (optionnel) Périmètre auquel le patient est lié
   **   - startDate: (optionnel) permet le filtre par date
   **   - endDate: (optionnel) permet le filtre par date
   **
   ** Retour:
   **   - pmsiData: Liste de 20 éléments de PMSI lié à un patient et au "selectedTab", donc soit un élément de Condition, Procedure ou Claim
   **   - pmsiTotal: Nombre d'élément totale par rapport au filtre indiqué
   */
  fetchPMSI: (
    page: number,
    patientId: string,
    selectedTab: PMSIResourceTypes,
    searchInput: string,
    nda: string,
    code: string,
    source: string,
    diagnosticTypes: string[],
    sortBy: Order,
    sortDirection: Direction,
    startDate: string | null,
    endDate: string | null,
    executiveUnits?: string[],
    groupId?: string,
    signal?: AbortSignal,
    encounterStatus?: string[]
  ) => Promise<{
    pmsiData?: (Claim | Condition | Procedure)[]
    pmsiTotal?: number
  }>

  /**
   * Cette fonction retourne la totalité des Procedures d'un patient donné
   *
   *
   */
  fetchAllProcedures: (patientId: string, groupId: string, size?: number) => Promise<Procedure[]>

  /**
   * Cette fonction retourne la totalité des Conditions d'un patient donné
   *
   *
   */
  fetchAllConditions: (patientId: string, groupId: string, size?: number) => Promise<Condition[]>

  /*
   ** Cette fonction permet de récupérer les élèments de Medication lié à un patient
   **
   ** Argument:
   **   - deidentified: permet certaine anonymisation de la donnée
   **   - page: permet la pagination des éléments
   **   - patientId: identifiant technique d'un patient
   **   - selectedTab: permet de selectionner la collection MedicationRequest ou MedicationAdministration
   **   - searchInput: permet la recherche textuelle
   **   - nda: permet de filtrer sur un NDA précis
   **   - sortBy: permet le tri
   **   - sortDirection: permet le tri dans l'ordre croissant ou décroissant
   **   - selectedPrescriptionTypeIds: permet le filtre par type de prescription
   **   - selectedAdministrationRouteIds: permet le filtre par la voie d'administration
   **   - groupId: (optionnel) Périmètre auquel le patient est lié
   **   - startDate: (optionnel) permet le filtre par date
   **   - endDate: (optionnel) permet le filtre par date
   **
   ** Retour:
   **   - medicationData: Liste de 20 éléments de Medication lié à un patient et à "selectedTab", donc soit un élément de MedicationRequest ou MedicationAdministration
   **   - medicationTotal: Nombre d'élément totale par rapport au filtre indiqué
   */

  fetchMedication: (
    page: number,
    patientId: string,
    selectedTab: ResourceType.MEDICATION_ADMINISTRATION | ResourceType.MEDICATION_REQUEST,
    sortBy: Order,
    sortDirection: Direction,
    searchInput: string,
    nda: string,
    code: string,
    selectedPrescriptionTypeIds: string[],
    selectedAdministrationRouteIds: string[],
    startDate: string | null,
    endDate: string | null,
    executiveUnits?: string[],
    groupId?: string,
    signal?: AbortSignal,
    encounterStatus?: string[]
  ) => Promise<{
    medicationData?: MedicationEntry<MedicationAdministration | MedicationRequest>[]
    medicationTotal?: number
  }>

  /*
   ** Cette fonction permet de récupérer les élèments de Observation lié à un patient
   **
   ** Arguments:
   **   - deidentified: permet certaine anonymisation de la donnée
   **   - sortBy: permet le tri
   **   - sortDirection: permet le tri dans l'ordre croissant ou décroissant
   **   - page: permet la pagination des éléments
   **   - patientId: identifiant technique d'un patient
   **   - searchInput: permet la recherche textuelle
   **   - nda: permet de filtrer sur un NDA précis
   **   - loinc: permet de filtrer sur un code LOINC précis
   **   - anabio: permet de filtrer sur un code ANABIO précis
   **   - startDate: (optionnel) permet le filtre par date
   **   - endDate: (optionnel) permet le filtre par date
   **   - groupId: (optionnel) Périmètre auquel le patient est lié
   **
   ** Retour:
   **   - biologyList: Liste de 20 éléments de Observation lié à un patient
   **   - biologyTotal: Nombre d'élément total par rapport au filtre indiqué
   */
  fetchObservation: (
    sortBy: Order,
    sortDirection: Direction,
    page: number,
    patientId: string,
    rowStatus: boolean,
    searchInput: string,
    nda: string,
    code: string,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string,
    signal?: AbortSignal,
    executiveUnits?: string[],
    encounterStatus?: string[]
  ) => Promise<{
    biologyList: Observation[]
    biologyTotal: number
  }>

  /*
   ** Cette fonction permet de récupérer les élèments de ImagingStudy liés à un patient
   **
   ** Arguments:
   **   - orderBy: permet le tri
   **   - orderDirection: permet le tri dans l'ordre croissant ou décroissant
   **   - page: permet la pagination des éléments
   **   - patientId: identifiant technique d'un patient
   **   - nda: permet de filtrer sur un NDA précis
   **   - searchInput (optionnel): permet la recherche textuelle
   **   - startDate: (optionnel) permet le filtre par date
   **   - endDate: (optionnel) permet le filtre par date
   **   - groupId: (optionnel) périmètre auquel le patient est lié
   **   - signal: (optionnel) permet de savoir si une requête est déjà en cours pour l'interrompre
   **   - executiveUnits: (optionnel) permet de filtrer par unité exécutrice
   **
   ** Retour:
   **   - imagingList: Liste de 20 éléments de ImagingStudy liés à un patient
   **   - imagingTotal: Nombre d'élément total par rapport au(x) filtre(s) indiqué(s)
   */
  fetchImaging: (
    orderBy: Order,
    orderDirection: Direction,
    page: number,
    patientId: string,
    nda: string,
    searchInput?: string,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string,
    signal?: AbortSignal,
    modalities?: string[],
    executiveUnits?: string[],
    encounterStatus?: string[]
  ) => Promise<{
    imagingList: ImagingStudy[]
    imagingTotal: number
  }>

  /*
   ** Cette fonction permet de récupérer les Dossiers de Spécialité liés à un patient
   **
   ** Arguments:
   **   - patientId: identifiant technique d'un patient
   **   - formName: permet de requêter le bon type de dossier de spécialité
   **   - groupId: (optionnel) périmètre auquel le patient est lié
   **   - episodeOfCare: (optionnel) permet de requêter les Dossiers de Spécialité liés à un certain épisode de soin
   **   - startDate: (optionnel) permet le filtre par date
   **   - endDate: (optionnel) permet le filtre par date
   **   - executiveUnits: (optionnel) permet de filtrer par unité exécutrice
   **
   ** Retour:
   **   - formsList: liste des Dossiers de Spécialité liés à un patient
   */
  fetchMaternityForms: (
    patientId: string,
    formName: string,
    groupId?: string,
    startDate?: string | null,
    endDate?: string | null,
    executiveUnits?: string[],
    encounterStatus?: string[]
  ) => Promise<QuestionnaireResponse[]>

  /*
   ** Cette fonction permet de récupérer les ids des Dossiers de Spécialité
   **
   ** Retour:
   **   - questionnairesList: liste des ids des Dossiers de Spécialité
   */
  fetchQuestionnaires: () => Promise<Questionnaire[]>

  /*
   ** Cette fonction permet de récupérer les élèments de Composition lié à un patient
   **
   ** Argument:
   **   - deidentified: permet certaine anonymisation de la donnée
   **   - sortBy: permet le tri
   **   - sortDirection: permet le tri dans l'ordre croissant ou décroissant
   **   - searchBy: Détermine si l'on recherche par contenu ou titre du document
   **   - page: permet la pagination des éléments
   **   - patientId: identifiant technique d'un patient
   **   - searchInput: permet la recherche textuelle
   **   - selectedDocTypes: permet de filtrer par un type de documents
   **   - nda: permet de filtrer sur un NDA précis
   **   - onlyPdfAvailable: permet d'afficher ou non seulement les documents dont le PDF est disponible
   **   - startDate: (optionnel) permet le filtre par date
   **   - endDate: (optionnel) permet le filtre par date
   **   - groupId: (optionnel) Périmètre auquel le patient est lié
   **   - signal: (optionnel) paramètre permettant d'identifier si une requête est déjà en cours et de l'annuler si besoin
   **
   ** Retour:
   **   - docsList: Liste de 20 éléments de Composition lié à un patient
   **   - docsTotal: Nombre d'élément total par rapport au filtre indiqué
   */
  fetchDocuments: (
    sortBy: Order,
    sortDirection: Direction,
    searchBy: SearchByTypes,
    page: number,
    patientId: string,
    searchInput: string,
    selectedDocTypes: string[],
    docStatuses: string[],
    nda: string,
    onlyPdfAvailable: boolean,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string,
    signal?: AbortSignal,
    executiveUnits?: string[],
    encounterStatus?: string[]
  ) => Promise<{
    docsList: DocumentReference[]
    docsTotal: number
  }>

  /**
   * Retourne le droit de la vue d'un patient
   *
   * Arguments:
   *   - groupId: (optionnel) Périmètre auquel le patient est lié
   *
   * Retour :
   *   - Retourne true si les droits de vision sont en pseudo / false si c'est en nomi
   */
  fetchRights: (groupId: string) => Promise<boolean>
}

const servicesPatients: IServicePatients = {
  fetchPatientsCount: async (signal?: AbortSignal) => {
    try {
      const response = await fetchPatient({ size: 0, signal })
      if (response?.data?.resourceType === 'OperationOutcome') return null
      return response.data.total ?? 0
    } catch (error) {
      console.error(error)
      return null
    }
  },

  fetchMyPatients: async () => {
    const [myPatientsResp, myPatientsEncounters] = await Promise.all([
      fetchPatient({
        pivotFacet: ['age-month_gender', 'deceased_gender'],
        size: 20,
        _sort: 'family',
        _elements: ['gender', 'name', 'birthDate', 'deceased', 'identifier', 'extension']
      }),
      fetchEncounter({
        facet: ['class', 'visit-year-month-gender-facet'],
        size: 0,
        visit: true
      })
    ])

    const totalPatients = myPatientsResp.data.resourceType === 'Bundle' ? myPatientsResp.data.total : 0

    const originalPatients = getApiResponseResources(myPatientsResp)

    const agePyramidData =
      myPatientsResp.data.resourceType === 'Bundle'
        ? getAgeRepartitionMapAphp(getExtension(myPatientsResp.data.meta, ChartCode?.AGE_PYRAMID)?.extension)
        : undefined

    const genderRepartitionMap =
      myPatientsResp.data.resourceType === 'Bundle'
        ? getGenderRepartitionMapAphp(getExtension(myPatientsResp.data.meta, ChartCode?.GENDER_REPARTITION)?.extension)
        : undefined

    const monthlyVisitData =
      myPatientsEncounters.data.resourceType === 'Bundle'
        ? getVisitRepartitionMapAphp(getExtension(myPatientsEncounters.data.meta, ChartCode?.MONTHLY_VISITS)?.extension)
        : undefined

    const visitTypeRepartitionData =
      myPatientsEncounters.data.resourceType === 'Bundle'
        ? getEncounterRepartitionMapAphp(
            getExtension(myPatientsEncounters.data.meta, ChartCode?.VISIT_TYPE_REPARTITION)?.extension
          )
        : undefined

    return {
      cohort: undefined,
      totalPatients,
      originalPatients,
      genderRepartitionMap,
      visitTypeRepartitionData,
      agePyramidData,
      monthlyVisitData
    }
  },

  fetchPMSI: async (
    page,
    patientId,
    selectedTab,
    searchInput,
    nda,
    code,
    source,
    diagnosticTypes,
    sortBy,
    sortDirection,
    startDate,
    endDate,
    executiveUnits,
    groupId,
    signal,
    encounterStatus
  ) => {
    let pmsiResp: AxiosResponse<FHIR_Bundle_Response<Condition | Procedure | Claim>> | null = null

    switch (selectedTab) {
      case ResourceType.CONDITION:
        pmsiResp = await fetchCondition({
          offset: page ? (page - 1) * 20 : 0,
          size: 20,
          _list: groupId ? [groupId] : [],
          subject: patientId,
          _text: searchInput,
          _sort: sortBy === Order.CODE ? Order.CODE : Order.RECORDED_DATE,
          sortDirection: sortDirection,
          'encounter-identifier': nda,
          code,
          source: source,
          type: diagnosticTypes,
          'min-recorded-date': startDate ?? '',
          'max-recorded-date': endDate ?? '',
          signal,
          executiveUnits,
          encounterStatus
        })
        break
      case ResourceType.PROCEDURE:
        pmsiResp = await fetchProcedure({
          offset: page ? (page - 1) * 20 : 0,
          size: 20,
          _list: groupId ? [groupId] : [],
          subject: patientId,
          _text: searchInput,
          _sort: sortBy === Order.CODE ? Order.CODE : Order.DATE,
          sortDirection: sortDirection,
          'encounter-identifier': nda,
          code,
          source: source,
          minDate: startDate ?? '',
          maxDate: endDate ?? '',
          signal,
          executiveUnits,
          encounterStatus
        })
        break
      case ResourceType.CLAIM:
        pmsiResp = await fetchClaim({
          offset: page ? (page - 1) * 20 : 0,
          size: 20,
          _list: groupId ? [groupId] : [],
          patient: patientId,
          _text: searchInput,
          _sort: sortBy === Order.CODE ? Order.DIAGNOSIS : Order.CREATED,
          sortDirection: sortDirection,
          'encounter-identifier': nda,
          diagnosis: code,
          minCreated: startDate ?? '',
          maxCreated: endDate ?? '',
          signal,
          executiveUnits,
          encounterStatus
        })
        break
      default:
        pmsiResp = null
        break
    }

    if (pmsiResp === null) return {}

    const pmsiData: (Claim | Condition | Procedure)[] | undefined = getApiResponseResources(pmsiResp)
    const pmsiTotal = pmsiResp.data.resourceType === 'Bundle' ? pmsiResp.data.total : 0

    return {
      pmsiData,
      pmsiTotal
    }
  },

  fetchAllProcedures: async (patientId, groupId, size) => {
    const proceduresResp = await fetchProcedure({
      offset: 20,
      size,
      _list: groupId ? [groupId] : [],
      subject: patientId,
      _sort: 'date',
      sortDirection: Direction.DESC
    })

    const proceduresData: Procedure[] = getApiResponseResources(proceduresResp) ?? []
    return proceduresData
  },

  fetchAllConditions: async (patientId, groupId, size) => {
    const diagnosticsResp = await fetchCondition({
      offset: 20,
      size,
      _list: groupId ? [groupId] : [],
      subject: patientId,
      _sort: Order.RECORDED_DATE,
      sortDirection: Direction.DESC
    })

    const diagnosticsData: Condition[] = getApiResponseResources(diagnosticsResp) ?? []
    return diagnosticsData
  },

  fetchMedication: async (
    page,
    patientId,
    selectedTab,
    sortBy,
    sortDirection,
    searchInput,
    nda,
    code,
    selectedPrescriptionTypeIds,
    selectedAdministrationRouteIds,
    startDate,
    endDate,
    executiveUnits,
    groupId,
    signal,
    encounterStatus
  ) => {
    let medicationResp: AxiosResponse<FHIR_Bundle_Response<MedicationRequest | MedicationAdministration>> | null = null

    switch (selectedTab) {
      case ResourceType.MEDICATION_REQUEST:
        medicationResp = await fetchMedicationRequest({
          offset: page ? (page - 1) * 20 : 0,
          size: 20,
          _list: groupId ? [groupId] : [],
          encounter: nda,
          subject: patientId,
          _text: searchInput,
          _sort: sortBy,
          sortDirection,
          type: selectedPrescriptionTypeIds,
          code,
          minDate: startDate,
          maxDate: endDate,
          signal,
          executiveUnits,
          encounterStatus
        })
        break
      case ResourceType.MEDICATION_ADMINISTRATION:
        medicationResp = await fetchMedicationAdministration({
          offset: page ? (page - 1) * 20 : 0,
          size: 20,
          _list: groupId ? [groupId] : [],
          encounter: nda,
          subject: patientId,
          _text: searchInput,
          _sort: sortBy,
          sortDirection,
          route: selectedAdministrationRouteIds,
          minDate: startDate,
          maxDate: endDate,
          signal,
          executiveUnits,
          encounterStatus,
          code
        })
        break
      default:
        medicationResp = null
        break
    }

    if (medicationResp === null) return {}

    const medicationData: (MedicationAdministration | MedicationRequest)[] | undefined =
      getApiResponseResources(medicationResp)
    const medicationTotal = medicationResp.data.resourceType === 'Bundle' ? medicationResp.data.total : 0

    return { medicationData, medicationTotal }
  },

  fetchObservation: async (
    sortBy: Order,
    sortDirection: Direction,
    page: number,
    patientId: string,
    rowStatus: boolean,
    searchInput: string,
    nda: string,
    code: string,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string,
    signal?: AbortSignal,
    executiveUnits?: string[],
    encounterStatus?: string[]
  ) => {
    const observationResp = await fetchObservation({
      subject: patientId,
      _list: groupId ? [groupId] : [],
      _sort: sortBy,
      sortDirection,
      size: 20,
      offset: page ? (page - 1) * 20 : 0,
      _text: searchInput,
      encounter: nda,
      code,
      minDate: startDate ?? '',
      maxDate: endDate ?? '',
      rowStatus,
      signal,
      executiveUnits,
      encounterStatus
    })

    const biologyTotal = observationResp.data.resourceType === 'Bundle' ? observationResp.data.total : 0

    return {
      biologyList: getApiResponseResources(observationResp) ?? [],
      biologyTotal: biologyTotal ?? 0
    }
  },

  fetchImaging: async (
    orderBy: Order,
    orderDirection: Direction,
    page: number,
    patientId: string,
    nda: string,
    searchInput?: string,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string,
    signal?: AbortSignal,
    modalities?: string[],
    executiveUnits?: string[],
    encounterStatus?: string[]
  ) => {
    const imagingResp = await fetchImaging({
      patient: patientId,
      size: 20,
      offset: page ? (page - 1) * 20 : 0,
      order: orderBy,
      orderDirection,
      _text: searchInput,
      encounter: nda,
      minDate: startDate ?? '',
      maxDate: endDate ?? '',
      _list: groupId ? [groupId] : [],
      signal,
      modalities,
      executiveUnits,
      encounterStatus
    })

    const imagingTotal = imagingResp.data.resourceType === 'Bundle' ? imagingResp.data.total : 0

    return {
      imagingList: getApiResponseResources(imagingResp) ?? [],
      imagingTotal: imagingTotal ?? 0
    }
  },

  fetchMaternityForms: async (
    patientId: string,
    formName: string,
    groupId?: string,
    startDate?: string | null,
    endDate?: string | null,
    executiveUnits?: string[],
    encounterStatus?: string[]
  ) => {
    const formsResp = await fetchForms({
      patient: patientId,
      formName,
      _list: groupId ? [groupId] : [],
      startDate,
      endDate,
      executiveUnits,
      encounterStatus
    })

    return getApiResponseResources(formsResp) ?? []
  },

  fetchQuestionnaires: async () => {
    const maternityQuestionnaires = `${FormNames.PREGNANCY},${FormNames.HOSPIT}`
    const questionnaireList = await fetchQuestionnaires({ name: maternityQuestionnaires, _elements: ['id', 'name'] })

    return getApiResponseResources(questionnaireList) ?? []
  },

  fetchDocuments: async (
    sortBy: Order,
    sortDirection: Direction,
    searchBy: SearchByTypes,
    page: number,
    patientId: string,
    searchInput: string,
    selectedDocTypes: string[],
    docStatuses: string[],
    nda: string,
    onlyPdfAvailable?: boolean,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string,
    signal?: AbortSignal,
    executiveUnits?: string[],
    encounterStatus?: string[]
  ) => {
    const documentLines = 20 // Number of desired lines in the document array

    const docsList = await fetchDocumentReference({
      patient: patientId,
      _list: groupId ? [groupId] : [],
      searchBy: searchBy,
      _sort: sortBy,
      sortDirection,
      size: documentLines,
      offset: page ? (page - 1) * documentLines : 0,
      docStatuses: docStatuses,
      _text: searchInput,
      highlight_search_results: searchBy === SearchByTypes.TEXT ? true : false,
      type: selectedDocTypes.join(','),
      'encounter-identifier': nda,
      onlyPdfAvailable: onlyPdfAvailable,
      minDate: startDate ?? '',
      maxDate: endDate ?? '',
      signal: signal,
      executiveUnits,
      encounterStatus
    })

    if (docsList.data.resourceType !== 'Bundle' || !docsList.data.total) {
      return {
        docsTotal: 0,
        docsList: []
      }
    }

    return {
      docsTotal: docsList.data.total,
      docsList: getApiResponseResources(docsList) ?? []
    }
  },

  fetchPatientInfo: async (patientId, groupId) => {
    const [patientResponse, encounterResponse] = await Promise.all([
      fetchPatient({ _id: patientId, _list: groupId ? [groupId] : [] }),
      fetchEncounter({
        patient: patientId,
        _sort: 'period-start',
        sortDirection: Direction.DESC,
        _list: groupId ? [groupId] : [],
        size: 1000
      })
    ])

    const patientDataList = getApiResponseResources(patientResponse)
    if (patientDataList === undefined || (patientDataList && patientDataList.length === 0)) return undefined
    const patientData = patientDataList[0]

    const cleanedEncounters: Encounter[] = getApiResponseResources(encounterResponse) || []
    const encounters = cleanedEncounters.filter((encounter) => !encounter.partOf)
    const encountersDetails = cleanedEncounters.filter((encounter) => encounter.partOf)

    const hospits = await getEncounterDocuments(encounters, encountersDetails, groupId)

    const patientInfo = {
      ...patientData,
      lastEncounter: encounters && encounters.length > 0 ? encounters[0] : undefined
    }

    return {
      patientInfo,
      hospits
    }
  },

  fetchRights: async (groupId) => {
    const perimetersResponse = await servicesPerimeters.getPerimeters({ cohortIds: groupId })

    if (perimetersResponse.results.length > 0) {
      const perimeterRights = await servicesPerimeters.fetchPerimetersRights(perimetersResponse.results)
      return perimeterRights.some(
        (right) => getExtension(right, 'READ_ACCESS')?.valueString === 'DATA_PSEUDOANONYMISED'
      )
    } else {
      const cohortRights = await servicesCohorts.fetchCohortsRights([{ group_id: groupId }])
      return cohortRights?.[0]?.rights?.read_patient_pseudo
        ? cohortRights?.[0]?.rights?.read_patient_nomi
          ? false
          : true
        : false
    }
  }
}

export default servicesPatients

export const getEncounterDocuments = async (
  encounters?: CohortEncounter[],
  encountersDetail?: CohortEncounter[],
  groupId?: string
) => {
  if (!encounters) return undefined
  if (encounters.length === 0) return encounters

  const _encounters = encounters
  const encountersIdList: string[] = []

  _encounters.forEach((encounter) => {
    encounter.documents = []
    encountersIdList.push(encounter.id ?? '')
  })

  const documentsResp = await fetchDocumentReference({
    encounter: encountersIdList.join(','),
    _list: groupId ? groupId.split(',') : []
  })

  const documents: CohortComposition[] = getApiResponseResources(documentsResp) ?? []

  for (const encounter of _encounters) {
    const currentDocuments = documents?.filter(
      (document) => encounter.id === document.context?.encounter?.[0].reference?.replace('Encounter/', '')
    )
    const currentDetails = encountersDetail?.filter(
      (encounterDetail) => encounter.id === encounterDetail?.partOf?.reference?.replace('Encounter/', '')
    )

    encounter.documents = currentDocuments
    encounter.details = currentDetails

    if (!currentDocuments || (currentDocuments && currentDocuments.length === 0)) continue

    for (const currentDocument of currentDocuments) {
      currentDocument.serviceProvider = encounter?.serviceProvider?.display ?? 'Non renseigné'

      currentDocument.NDA = encounter.id ?? 'Inconnu'
      if (encounter.identifier) {
        const nda = encounter.identifier.find((identifier: Identifier) => {
          return identifier.type?.coding?.[0].code === 'NDA'
        })
        if (nda) {
          currentDocument.NDA = nda?.value
        }
      }
    }
  }

  return _encounters
}

export const postFiltersService = async (
  fhir_resource: ResourceType,
  name: string,
  criterias: SearchCriterias<Filters>,
  deidentified: boolean
) => {
  const criteriasString = mapSearchCriteriasToRequestParams(criterias, fhir_resource, deidentified)
  const response = await postFilters(fhir_resource, name, criteriasString)

  return response.data
}

export const getFiltersService = async (fhir_resource: ResourceType, next?: string | null, limit = 10) => {
  const LIMIT = limit
  const OFFSET = 0
  try {
    const response = await getFilters(fhir_resource, LIMIT, OFFSET, next)
    return response.data
  } catch {
    throw "Les filtres sauvegardés n'ont pas pu être récupérés."
  }
}

export const deleteFilterService = async (fhir_resource_uuid: string) => {
  try {
    const response = await deleteFilter(fhir_resource_uuid)
    return response
  } catch {
    throw "Le filtre n'a pas pu être supprimé."
  }
}

export const deleteFiltersService = async (fhir_resource_uuids: string[]) => {
  try {
    const response = await deleteFilters(fhir_resource_uuids)
    return response
  } catch {
    throw "Les filtres n'ont pas pu être supprimés."
  }
}

export const patchFiltersService = async (
  fhir_resource: ResourceType,
  uuid: string,
  name: string,
  criterias: SearchCriterias<Filters>,
  deidentified: boolean
) => {
  const criteriasString = mapSearchCriteriasToRequestParams(criterias, fhir_resource, deidentified)
  const response = await patchFilters(fhir_resource, uuid, name, criteriasString)

  return response
}
