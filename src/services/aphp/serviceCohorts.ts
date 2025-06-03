import moment from 'moment'

import {
  CohortData,
  Cohort,
  AgeRepartitionType,
  GenderRepartitionType,
  ChartCode,
  CohortResults,
  CohortImaging,
  CohortComposition,
  FHIR_Bundle_Response,
  CohortPMSI,
  CohortMedication,
  CohortObservation,
  CohortQuestionnaireResponse
} from 'types'
import {
  getGenderRepartitionMapAphp,
  getEncounterRepartitionMapAphp,
  getAgeRepartitionMapAphp,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'
import { getApiResponseResource, getApiResponseResources } from 'utils/apiHelpers'

import {
  fetchPatient,
  fetchEncounter,
  fetchDocumentReference,
  fetchDocumentReferenceContent,
  fetchBinary,
  fetchCheckDocumentSearchInput,
  fetchCohortInfo,
  fetchCohortAccesses,
  fetchImaging,
  fetchCondition,
  fetchProcedure,
  fetchClaim,
  fetchMedicationRequest,
  fetchMedicationAdministration,
  fetchObservation,
  fetchForms
} from './callApi'

import apiBackend from '../apiBackend'
import {
  Binary,
  Claim,
  Condition,
  DocumentReference,
  ImagingStudy,
  MedicationAdministration,
  MedicationRequest,
  Observation,
  ParametersParameter,
  Patient,
  Procedure
} from 'fhir/r4'
import { AxiosError, AxiosResponse, CanceledError, isAxiosError } from 'axios'
import {
  VitalStatus,
  SearchCriterias,
  PatientsFilters,
  DocumentsFilters,
  SearchByTypes,
  ImagingFilters,
  PMSIFilters,
  MedicationFilters,
  BiologyFilters,
  MaternityFormFilters
} from 'types/searchCriterias'
import services from '.'
import { ErrorDetails, SearchInputError } from 'types/error'
import { getResourceInfos } from 'utils/fillElement'
import { substructAgeString } from 'utils/age'
import { getExtension } from 'utils/fhir'
import { PMSIResourceTypes, ResourceType } from 'types/requestCriterias'
import { mapToOrderByCode } from 'mappers/pmsi'
import { mapMedicationToOrderByCode } from 'mappers/medication'
import { linkToDiagnosticReport } from './serviceImaging'

export interface IServiceCohorts {
  /**
   * Retourne les informations d'une cohorte
   *
   * Argument:
   *   - cohortId: Identifiant de la cohorte
   *
   * Retourne:
   *   - name: Nom de la cohorte
   *   - description: Description de la cohorte
   *   - cohort: Objet Cohort lié a FHIR
   *   - totalPatients: Nombre total de la cohorte
   *   - originalPatients: Liste de patients de la cohorte
   *   - genderRepartitionMap: Données liées au graphique de la répartition par genre
   *   - visitTypeRepartitionData: Données liées au graphique de la répartition des visites
   *   - agePyramidData: Données liées au graphique de la pyramide des ages
   *   - monthlyVisitData: Données liées au graphique des visites par mois
   *   - requestId: Identifiant de la requête liée à la cohorte
   *   - favorite: = true si la cohorte est une cohorte favorite
   *   - uuid: Identifiant de la cohorte liée au back-end
   */
  fetchCohort: (cohortId: string) => Promise<CohortData | undefined>

  /**
   * Retourne la liste de patients liés à une cohorte
   *
   * Argument:
   *   - page: Permet la pagination (definit un offset + limit)
   *   - searchBy: Permet la recherche sur un champs précis (_text, family, given, identifier)
   *   - searchInput: Permet la recherche textuelle
   *   - gender: Permet le filtre par genre
   *   - birthdates: Permet le filtre par date de naissance
   *   - vitalStatus: Permet le filtre par statut vital
   *   - sortBy: Permet le tri
   *   - sortDirection: Permet le tri dans l'ordre croissant ou décroissant
   *   - deidentified: savoir si la liste de patients est pseudonymisée ou non
   *   - groupId: (optionnel) Périmètre auquel la cohorte est liée
   *   - includeFacets: = true si vous voulez inclure les graphique
   *   - signal: (optionnel) paramètre permettant d'identifier si une requête est déjà en cours et de l'annuler si besoin
   *
   * Retourne:
   *   - totalPatients: Nombre de patients (dépend des filtres)
   *   - originalPatients: Liste de patients
   *   - agePyramidData: Données liées au graphique de la pyramide des ages
   *   - genderRepartitionMap: Données liées au graphique de la répartition par genre
   */
  fetchPatientList: (
    options: {
      page: number
      searchCriterias: SearchCriterias<PatientsFilters | null>
    },
    deidentified: boolean,
    groupId?: string,
    includeFacets?: boolean,
    signal?: AbortSignal
  ) => Promise<
    | {
        totalPatients: number
        totalAllPatients: number
        originalPatients: Patient[] | undefined
        agePyramidData?: AgeRepartitionType
        genderRepartitionMap?: GenderRepartitionType
      }
    | undefined
  >

  /**
   * Retourne la liste de documents liés à une cohorte
   *
   * Argument:
   *   - deidentifiedBoolean: = true si la cohorte est pseudo. (permet un traitement particulier des éléments)
   *   - searchBy: Détermine si l'on recherche par contenu ou titre du document
   *   - sortBy: Permet le tri
   *   - sortDirection: Permet le tri dans l'ordre croissant ou décroissant
   *   - page: Permet la pagination (definit un offset + limit)
   *   - searchInput: Permet la recherche textuelle
   *   - selectedDocTypes: Permet de filtrer sur le type de documents
   *   - nda: Permet de filtrer les documents sur un NDA particulier (uniquement en nominatif)
   *   - onlyPdfAvailable: permet d'afficher ou non seulement les documents dont le PDF est disponible
   *   - startDate: Permet de filtrer sur une date
   *   - endDate: Permet de filtrer sur une date
   *   - groupId: (optionnel) Périmètre auquel la cohorte est liée
   *   - signal: (optionnel) paramètre permettant d'identifier si une requête est déjà en cours et de l'annuler si besoin
   */

  fetchDocuments: (
    options: {
      deidentified: boolean
      page: number
      searchCriterias: SearchCriterias<DocumentsFilters>
    },
    groupId?: string,
    signal?: AbortSignal
  ) => Promise<CohortResults<DocumentReference>> | Promise<SearchInputError>

  /**
   * Retourne la liste d'objets d'Imagerie liés à une cohorte
   */

  fetchImagingList: (
    options: {
      deidentified: boolean
      page: number
      searchCriterias: SearchCriterias<ImagingFilters>
    },
    groupId?: string,
    signal?: AbortSignal
  ) => Promise<CohortResults<CohortImaging>>

  /**
   * Retourne la liste d'objets PMSI liés à une cohorte
   */
  fetchPMSIList: (
    options: {
      selectedTab: PMSIResourceTypes
      deidentified: boolean
      page: number
      searchCriterias: SearchCriterias<PMSIFilters>
    },
    groupId?: string,
    signal?: AbortSignal
  ) => Promise<CohortResults<CohortPMSI>>

  /**
   * Retourne la liste d'objets Medication liés à une cohorte
   */
  fetchMedicationList: (
    options: {
      selectedTab: ResourceType.MEDICATION_REQUEST | ResourceType.MEDICATION_ADMINISTRATION
      deidentified: boolean
      page: number
      searchCriterias: SearchCriterias<MedicationFilters>
    },
    groupId?: string,
    signal?: AbortSignal
  ) => Promise<CohortResults<CohortMedication<MedicationRequest | MedicationAdministration>>>

  /**
   * Retourne la liste d'objets de biologie liés à une cohorte
   */
  fetchBiologyList: (
    options: {
      deidentified: boolean
      page: number
      searchCriterias: SearchCriterias<BiologyFilters>
    },
    groupId?: string,
    signal?: AbortSignal
  ) => Promise<CohortResults<CohortObservation>>

  /**
   * Retourne la liste de formulaires liés à une cohorte
   */
  fetchFormsList: (
    options: {
      page: number
      searchCriterias: SearchCriterias<MaternityFormFilters>
    },
    groupId?: string,
    signal?: AbortSignal
  ) => Promise<CohortResults<CohortQuestionnaireResponse>>

  /**
   * Permet de vérifier si le champ de recherche textuelle est correct
   *
   * Argument:
   *   - searchInput: champ de recherche textuelle
   *
   * Retourne:
   *   - searchInputError: objet décrivant la ou les erreurs du champ de recherche s'il y en a
   */
  checkDocumentSearchInput: (searchInput: string, signal?: AbortSignal) => Promise<SearchInputError>

  /**
   * Permet de récupérer le contenu d'un document
   *
   * Argument:
   *   - compositionId: Identifiant du document
   *
   * Retourne:
   *   - IComposition_Section: Contenu du document
   */
  fetchDocumentContent: (compositionId: string) => Promise<DocumentReference | undefined>

  /**
   * Permet de récupérer le contenu d'un document (/Binary)
   *
   * Argument:
   *   - documentId: Identifiant du document
   *
   * Retourne:
   *   - IComposition_Section: Contenu du document
   */
  fetchBinary: (documentId: string) => Promise<Binary | undefined>

  /**
   * Permet la récupération des droits liés à plusieurs cohortes
   *
   * Argument:
   *   - cohorts: Tableau de cohortes de type `Cohort[]`
   *
   * Retourne:
   *   - La liste de cohortes avec une extension liée au droit d'accès + export
   */
  fetchCohortsRights: (cohorts: Cohort[]) => Promise<Cohort[]>
}

const servicesCohorts: IServiceCohorts = {
  fetchCohort: async (cohortId) => {
    try {
      const fetchCohortsResults = await Promise.all([
        fetchCohortInfo(cohortId),
        fetchPatient({
          pivotFacet: ['age-month_gender', 'deceased_gender'],
          _list: [cohortId],
          size: 20,
          _sort: 'family',
          _elements: ['gender', 'name', 'birthDate', 'deceased', 'identifier', 'extension']
        }),
        fetchEncounter({
          facet: ['class', 'visit-year-month-gender-facet'],
          _list: [cohortId],
          size: 0,
          visit: true
        })
      ])

      const cohortInfo = fetchCohortsResults[0]
      const patientsResp = fetchCohortsResults[1]
      const encountersResp = fetchCohortsResults[2]

      let name = ''
      let isSample = false
      let description = ''
      let requestId = ''
      let snapshotId = ''
      let uuid = ''
      let favorite = false

      if (cohortInfo.data.results && cohortInfo.data.results.length >= 1) {
        name = cohortInfo.data.results[0].name ?? ''
        isSample = cohortInfo.data.results[0].parent_cohort !== null
        description = cohortInfo.data.results[0].description ?? ''
        requestId = cohortInfo.data.results[0].request?.uuid ?? ''
        snapshotId = cohortInfo.data.results[0].request_query_snapshot ?? ''
        favorite = cohortInfo.data.results[0].favorite ?? false
        uuid = cohortInfo.data.results[0].uuid ?? ''
      } else {
        throw new Error('This cohort is not yours or invalid')
      }

      const totalPatients = patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total : 0

      const originalPatients = getApiResponseResources(patientsResp)

      const agePyramidData =
        patientsResp.data.resourceType === 'Bundle'
          ? getAgeRepartitionMapAphp(getExtension(patientsResp.data.meta, ChartCode.AGE_PYRAMID)?.extension)
          : undefined

      const genderRepartitionMap =
        patientsResp.data.resourceType === 'Bundle'
          ? getGenderRepartitionMapAphp(getExtension(patientsResp.data.meta, ChartCode.GENDER_REPARTITION)?.extension)
          : undefined

      const monthlyVisitData =
        encountersResp.data.resourceType === 'Bundle'
          ? getVisitRepartitionMapAphp(getExtension(encountersResp.data.meta, ChartCode.MONTHLY_VISITS)?.extension)
          : undefined

      const visitTypeRepartitionData =
        encountersResp.data.resourceType === 'Bundle'
          ? getEncounterRepartitionMapAphp(
              getExtension(encountersResp.data.meta, ChartCode.VISIT_TYPE_REPARTITION)?.extension
            )
          : undefined

      return {
        name,
        description,
        totalPatients,
        originalPatients,
        genderRepartitionMap,
        visitTypeRepartitionData,
        agePyramidData,
        monthlyVisitData,
        requestId,
        snapshotId,
        favorite,
        uuid,
        isSample
      }
    } catch (error) {
      return {
        name: '',
        description: '',
        cohort: undefined,
        totalPatients: undefined,
        originalPatients: [],
        genderRepartitionMap: undefined,
        visitTypeRepartitionData: undefined,
        monthlyVisitData: undefined,
        agePyramidData: undefined,
        requestId: '',
        snapshotId: '',
        favorite: false,
        uuid: '',
        isSample: false
      }
    }
  },

  fetchPatientList: async (
    { page, searchCriterias: { orderBy, searchBy, searchInput, filters } },
    deidentified,
    groupId,
    includeFacets,
    signal
  ) => {
    try {
      // convert birthdates into days or months depending of if it's a deidentified perimeter or not
      const birthdates: [string, string] = [
        moment(substructAgeString(filters?.birthdatesRanges?.[0] || '')).format('MM/DD/YYYY'),
        moment(substructAgeString(filters?.birthdatesRanges?.[1] || '')).format('MM/DD/YYYY')
      ]
      const minBirthdate =
        birthdates && Math.abs(moment(birthdates[0]).diff(moment(), deidentified ? 'months' : 'days'))
      const maxBirthdate =
        birthdates && Math.abs(moment(birthdates[1]).diff(moment(), deidentified ? 'months' : 'days'))

      const atLeastAFilter =
        !!searchInput ||
        (filters?.genders && filters?.genders.length > 0) ||
        filters?.birthdatesRanges?.[0] ||
        filters?.birthdatesRanges?.[1] ||
        (filters?.vitalStatuses && filters?.vitalStatuses.length > 0)

      const [patientsResp, allPatientsResp] = await Promise.all([
        fetchPatient({
          size: 20,
          offset: page ? (page - 1) * 20 : 0,
          _sort: orderBy.orderBy,
          sortDirection: orderBy.orderDirection,
          pivotFacet: includeFacets ? ['age-month_gender', 'deceased_gender'] : [],
          _list: groupId ? [groupId] : [],
          gender: filters && filters.genders.join(','),
          searchBy,
          _text: searchInput.trim(),
          minBirthdate: minBirthdate,
          maxBirthdate: maxBirthdate,
          deceased:
            filters && filters.vitalStatuses && filters.vitalStatuses.length === 1
              ? filters.vitalStatuses.includes(VitalStatus.DECEASED)
                ? true
                : false
              : undefined,
          deidentified: deidentified,
          signal: signal,
          _elements: ['gender', 'name', 'birthDate', 'deceased', 'identifier', 'extension']
        }),
        atLeastAFilter
          ? fetchPatient({
              size: 0,
              _list: groupId ? [groupId] : [],
              signal: signal
            })
          : null
      ])

      const totalPatients = patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total : 0
      const totalAllPatients =
        allPatientsResp?.data?.resourceType === 'Bundle' ? allPatientsResp.data.total ?? totalPatients : totalPatients

      const originalPatients = getApiResponseResources(patientsResp)

      const agePyramidData =
        patientsResp.data.resourceType === 'Bundle'
          ? getAgeRepartitionMapAphp(getExtension(patientsResp.data.meta, ChartCode.AGE_PYRAMID)?.extension)
          : undefined

      const genderRepartitionMap =
        patientsResp.data.resourceType === 'Bundle'
          ? getGenderRepartitionMapAphp(getExtension(patientsResp.data.meta, ChartCode.GENDER_REPARTITION)?.extension)
          : undefined

      return {
        totalPatients: totalPatients ?? 0,
        totalAllPatients: totalAllPatients ?? 0,
        originalPatients,
        genderRepartitionMap,
        agePyramidData
      }
    } catch (error) {
      console.error(error)
      if (error instanceof CanceledError) {
        throw error
      }
    }
  },

  fetchPMSIList: async (options, groupId, signal) => {
    const {
      selectedTab,
      deidentified,
      page,
      searchCriterias: {
        orderBy,
        searchInput,
        filters: { ipp, nda, startDate, endDate, executiveUnits, encounterStatus, diagnosticTypes, code, source }
      }
    } = options
    const fetchers = {
      [ResourceType.CONDITION]: fetchCondition,
      [ResourceType.PROCEDURE]: fetchProcedure,
      [ResourceType.CLAIM]: fetchClaim
    }

    const commonFilters = () => ({
      _list: groupId ? [groupId] : [],
      size: 20,
      offset: page ? (page - 1) * 20 : 0,
      _sort: mapToOrderByCode(orderBy.orderBy, selectedTab),
      sortDirection: orderBy.orderDirection,
      _text: searchInput === '' ? '' : searchInput,
      'encounter-identifier': nda,
      'patient-identifier': ipp,
      signal: signal,
      executiveUnits: executiveUnits.map((unit) => unit.id),
      encounterStatus: encounterStatus.map(({ id }) => id)
    })

    // Filtres spécifiques par ressource
    const filtersMapper = {
      [ResourceType.CONDITION]: () => ({
        ...commonFilters(),
        code: code.map((e) => encodeURIComponent(`${e.system}|${e.id}`)).join(','),
        source: source,
        type: diagnosticTypes?.map((type) => type.id),
        'min-recorded-date': startDate ?? '',
        'max-recorded-date': endDate ?? '',
        uniqueFacet: ['subject']
      }),
      [ResourceType.PROCEDURE]: () => ({
        ...commonFilters(),
        code: code.map((e) => encodeURIComponent(`${e.system}|${e.id}`)).join(','),
        source: source,
        minDate: startDate ?? '',
        maxDate: endDate ?? '',
        uniqueFacet: ['subject']
      }),
      [ResourceType.CLAIM]: () => ({
        ...commonFilters(),
        diagnosis: code.map((e) => encodeURIComponent(`${e.system}|${e.id}`)).join(','),
        minCreated: startDate ?? '',
        maxCreated: endDate ?? '',
        uniqueFacet: ['patient']
      })
    }

    const fetcher = fetchers[selectedTab]
    const filters = filtersMapper[selectedTab]()

    const atLeastAFilter =
      !!searchInput ||
      !!ipp ||
      !!nda ||
      !!startDate ||
      !!endDate ||
      executiveUnits.length > 0 ||
      encounterStatus.length > 0 ||
      (diagnosticTypes && diagnosticTypes.length > 0) ||
      code.length > 0 ||
      !!source

    const [pmsiList, allPMSIList] = await Promise.all([
      fetcher(filters),
      atLeastAFilter
        ? fetcher({
            size: 0,
            signal: signal,
            _list: groupId ? [groupId] : [],
            uniqueFacet: [selectedTab === ResourceType.CLAIM ? 'patient' : 'subject']
          })
        : null
    ])

    const _pmsiList =
      getApiResponseResources(pmsiList as AxiosResponse<FHIR_Bundle_Response<Condition | Procedure | Claim>, any>) ?? []
    const filledPmsiList = await getResourceInfos(_pmsiList, deidentified, groupId, signal)

    const totalPMSI = pmsiList?.data?.resourceType === 'Bundle' ? pmsiList.data.total : 0
    const totalAllPMSI = allPMSIList?.data?.resourceType === 'Bundle' ? allPMSIList.data?.total ?? totalPMSI : totalPMSI

    const uniquePatientFacet = selectedTab === ResourceType.CLAIM ? 'unique-patient' : 'unique-subject'
    const totalPatientPMSI =
      pmsiList?.data?.resourceType === 'Bundle'
        ? (getExtension(pmsiList?.data?.meta, uniquePatientFacet) || { valueDecimal: 0 }).valueDecimal
        : 0
    const totalAllPatientsPMSI =
      allPMSIList !== null
        ? (getExtension(allPMSIList?.data?.meta, uniquePatientFacet) || { valueDecimal: 0 }).valueDecimal
        : totalPatientPMSI

    return {
      total: totalPMSI ?? 0,
      totalAllResults: totalAllPMSI ?? 0,
      totalPatients: totalPatientPMSI ?? 0,
      totalAllPatients: totalAllPatientsPMSI ?? 0,
      list: filledPmsiList as CohortPMSI[]
    }
  },

  fetchMedicationList: async (options, groupId, signal) => {
    const {
      selectedTab,
      deidentified,
      page,
      searchCriterias: {
        orderBy,
        searchInput,
        filters: {
          code,
          nda,
          ipp,
          startDate,
          endDate,
          executiveUnits,
          encounterStatus,
          administrationRoutes,
          prescriptionTypes
        }
      }
    } = options
    const fetchers = {
      [ResourceType.MEDICATION_REQUEST]: fetchMedicationRequest,
      [ResourceType.MEDICATION_ADMINISTRATION]: fetchMedicationAdministration
    }

    const commonFilters = () => ({
      _list: groupId ? [groupId] : [],
      size: 20,
      offset: page ? (page - 1) * 20 : 0,
      _sort: mapMedicationToOrderByCode(orderBy.orderBy, selectedTab),
      sortDirection: orderBy.orderDirection,
      _text: searchInput === '' ? '' : searchInput,
      encounter: nda,
      ipp: ipp,
      signal: signal,
      executiveUnits: executiveUnits.map((unit) => unit.id),
      encounterStatus: encounterStatus.map(({ id }) => id),
      minDate: startDate ?? '',
      maxDate: endDate ?? '',
      code: code.map((code) => encodeURI(`${code.system}|${code.id}`)).join(','),
      uniqueFacet: ['subject']
    })

    const filtersMapper = {
      [ResourceType.MEDICATION_REQUEST]: () => ({
        ...commonFilters(),
        type: prescriptionTypes?.map((type) => type.id)
      }),
      [ResourceType.MEDICATION_ADMINISTRATION]: () => ({
        ...commonFilters(),
        route: administrationRoutes?.map((route) => route.id)
      })
    }

    const fetcher = fetchers[selectedTab]
    const filters = filtersMapper[selectedTab]()

    const atLeastAFilter =
      !!searchInput ||
      !!ipp ||
      !!nda ||
      !!startDate ||
      !!endDate ||
      executiveUnits.length > 0 ||
      encounterStatus.length > 0 ||
      (administrationRoutes && administrationRoutes.length > 0) ||
      (prescriptionTypes && prescriptionTypes.length > 0) ||
      code.length

    const [medicationList, allMedicationList] = await Promise.all([
      fetcher(filters),
      atLeastAFilter
        ? fetcher({
            size: 0,
            signal: signal,
            _list: groupId ? [groupId] : [],
            uniqueFacet: ['subject'],
            minDate: null,
            maxDate: null
          })
        : null
    ])

    const _medicationList =
      getApiResponseResources(
        medicationList as AxiosResponse<FHIR_Bundle_Response<MedicationRequest | MedicationAdministration>, any>
      ) ?? []
    const filledMedicationList = await getResourceInfos(_medicationList, deidentified, groupId, signal)

    const totalMedication = medicationList?.data?.resourceType === 'Bundle' ? medicationList.data.total : 0
    const totalAllMedication =
      allMedicationList?.data?.resourceType === 'Bundle'
        ? allMedicationList.data?.total ?? totalMedication
        : totalMedication

    const totalPatientMedication =
      medicationList?.data?.resourceType === 'Bundle'
        ? (getExtension(medicationList?.data?.meta, 'unique-subject') || { valueDecimal: 0 }).valueDecimal
        : 0
    const totalAllPatientsMedication =
      allMedicationList !== null
        ? (getExtension(allMedicationList?.data?.meta, 'unique-subject') || { valueDecimal: 0 }).valueDecimal
        : totalPatientMedication

    return {
      total: totalMedication ?? 0,
      totalAllResults: totalAllMedication ?? 0,
      totalPatients: totalPatientMedication ?? 0,
      totalAllPatients: totalAllPatientsMedication ?? 0,
      list: filledMedicationList as CohortMedication<MedicationRequest | MedicationAdministration>[]
    }
  },

  fetchBiologyList: async (options, groupId, signal) => {
    const {
      deidentified,
      page,
      searchCriterias: {
        orderBy,
        searchInput,
        filters: { validatedStatus, nda, ipp, code, startDate, endDate, executiveUnits, encounterStatus }
      }
    } = options
    const atLeastAFilter =
      !!searchInput ||
      !!ipp ||
      !!nda ||
      !!startDate ||
      !!endDate ||
      executiveUnits.length > 0 ||
      encounterStatus.length > 0 ||
      code.length

    const [biologyList, allBiologyList] = await Promise.all([
      fetchObservation({
        _list: groupId ? [groupId] : [],
        size: 20,
        offset: page ? (page - 1) * 20 : 0,
        _sort: orderBy.orderBy,
        sortDirection: orderBy.orderDirection,
        _text: searchInput === '' ? '' : searchInput,
        encounter: nda,
        'patient-identifier': ipp,
        signal: signal,
        executiveUnits: executiveUnits.map((unit) => unit.id),
        encounterStatus: encounterStatus.map(({ id }) => id),
        uniqueFacet: ['subject'],
        minDate: startDate ?? '',
        maxDate: endDate ?? '',
        code: code.map((code) => encodeURI(`${code.system}|${code.id}`)).join(','),
        rowStatus: validatedStatus
      }),
      atLeastAFilter
        ? fetchObservation({
            size: 0,
            signal: signal,
            _list: groupId ? [groupId] : [],
            uniqueFacet: ['subject'],
            rowStatus: validatedStatus
          })
        : null
    ])

    const _biologyList =
      getApiResponseResources(biologyList as AxiosResponse<FHIR_Bundle_Response<Observation>, any>) ?? []
    const filledBiologyList = await getResourceInfos(_biologyList, deidentified, groupId, signal)

    const totalBiology = biologyList?.data?.resourceType === 'Bundle' ? biologyList.data.total : 0
    const totalAllBiology =
      allBiologyList?.data?.resourceType === 'Bundle' ? allBiologyList.data?.total ?? totalBiology : totalBiology

    const totalPatientBiology =
      biologyList?.data?.resourceType === 'Bundle'
        ? (getExtension(biologyList?.data?.meta, 'unique-subject') || { valueDecimal: 0 }).valueDecimal
        : 0
    const totalAllPatientsBiology =
      allBiologyList !== null
        ? (getExtension(allBiologyList?.data?.meta, 'unique-subject') || { valueDecimal: 0 }).valueDecimal
        : totalPatientBiology

    return {
      total: totalBiology ?? 0,
      totalAllResults: totalAllBiology ?? 0,
      totalPatients: totalPatientBiology ?? 0,
      totalAllPatients: totalAllPatientsBiology ?? 0,
      list: filledBiologyList as CohortObservation[]
    }
  },

  fetchFormsList: async (options, groupId, signal) => {
    const {
      page,
      searchCriterias: {
        orderBy,
        filters: { ipp, formName, executiveUnits, encounterStatus }
      }
    } = options

    const atLeastAFilter = !!ipp || executiveUnits.length > 0 || encounterStatus.length > 0 || formName.length > 0

    const [formsList, allFormsList] = await Promise.all([
      fetchForms({
        _list: groupId ? [groupId] : [],
        size: 20,
        offset: page ? (page - 1) * 20 : 0,
        order: orderBy.orderBy,
        orderDirection: orderBy.orderDirection,
        ipp: ipp,
        signal: signal,
        executiveUnits: executiveUnits.map((unit) => unit.id),
        encounterStatus: encounterStatus.map((status) => status.id),
        formName: formName.join(),
        uniqueFacet: ['subject']
      }),
      atLeastAFilter
        ? fetchForms({
            _list: groupId ? [groupId] : [],
            size: 0,
            signal: signal,
            uniqueFacet: ['subject']
          })
        : null
    ])

    const _formsList = getApiResponseResources(formsList) ?? []
    const filledFormsList = await getResourceInfos(_formsList, false, groupId, signal)

    const totalForms = formsList?.data?.resourceType === 'Bundle' ? formsList.data.total : 0
    const totalAllForms = allFormsList?.data?.resourceType === 'Bundle' ? allFormsList?.data?.total : totalForms

    const totalPatientForms =
      formsList?.data?.resourceType === 'Bundle'
        ? (getExtension(formsList?.data?.meta, 'unique-subject') || { valueDecimal: 0 }).valueDecimal
        : 0
    const totalAllPatientsForms =
      allFormsList !== null
        ? (getExtension(allFormsList?.data?.meta, 'unique-subject') || { valueDecimal: 0 }).valueDecimal
        : totalPatientForms

    return {
      total: totalForms ?? 0,
      totalAllResults: totalAllForms ?? 0,
      totalPatients: totalPatientForms ?? 0,
      totalAllPatients: totalAllPatientsForms ?? 0,
      list: filledFormsList as CohortQuestionnaireResponse[]
    }
  },

  fetchImagingList: async (options, groupId, signal) => {
    const {
      deidentified,
      page,
      searchCriterias: {
        orderBy,
        searchInput,
        filters: { ipp, nda, startDate, endDate, executiveUnits, modality, encounterStatus }
      }
    } = options
    const [imagingResponse, allImagingResponse] = await Promise.all([
      fetchImaging({
        size: 20,
        offset: page ? (page - 1) * 20 : 0,
        order: orderBy.orderBy,
        orderDirection: orderBy.orderDirection,
        _text: searchInput,
        encounter: nda,
        ipp,
        minDate: startDate ?? '',
        maxDate: endDate ?? '',
        _list: groupId ? [groupId] : [],
        signal,
        modalities: modality.map(({ id }) => id),
        executiveUnits: executiveUnits.map((unit) => unit.id),
        encounterStatus: encounterStatus.map(({ id }) => id),
        uniqueFacet: ['subject']
      }),
      !!searchInput || !!ipp || !!nda || !!startDate || !!endDate || executiveUnits.length > 0 || modality.length > 0
        ? fetchImaging({
            size: 0,
            _list: groupId ? [groupId] : [],
            signal: signal,
            uniqueFacet: ['subject']
          })
        : null
    ])

    const imagingList = getApiResponseResources(imagingResponse) ?? []
    const completeImagingList = await getResourceInfos<ImagingStudy, CohortImaging>(
      imagingList,
      deidentified,
      groupId,
      signal
    )
    const imagingListWithDiagnosticReport = await linkToDiagnosticReport(completeImagingList, signal)

    const totalImaging = imagingResponse.data?.resourceType === 'Bundle' ? imagingResponse.data?.total : 0
    const totalAllImaging =
      allImagingResponse?.data?.resourceType === 'Bundle' ? allImagingResponse.data.total : totalImaging

    const totalPatientImaging =
      imagingResponse.data?.resourceType === 'Bundle'
        ? (getExtension(imagingResponse?.data?.meta, 'unique-subject') || { valueDecimal: 0 }).valueDecimal
        : 0
    const totalAllPatientsImaging =
      allImagingResponse !== null
        ? (getExtension(allImagingResponse?.data?.meta, 'unique-subject') || { valueDecimal: 0 }).valueDecimal
        : totalPatientImaging

    return {
      total: totalImaging ?? 0,
      totalAllResults: totalAllImaging ?? 0,
      totalPatients: totalPatientImaging ?? 0,
      totalAllPatients: totalAllPatientsImaging ?? 0,
      list: imagingListWithDiagnosticReport ?? []
    }
  },

  fetchDocuments: async (options, groupId, signal) => {
    const {
      deidentified,
      page,
      searchCriterias: {
        orderBy,
        searchInput,
        searchBy,
        filters: {
          docStatuses,
          docTypes,
          endDate,
          executiveUnits,
          ipp,
          nda,
          onlyPdfAvailable,
          startDate,
          encounterStatus
        }
      }
    } = options
    if (searchInput) {
      const searchInputError = await services.cohorts.checkDocumentSearchInput(searchInput, signal)
      if (searchInputError && searchInputError.isError) {
        throw searchInputError
      }
    }
    const [docsList, allDocsList] = await Promise.all([
      fetchDocumentReference({
        size: 20,
        offset: page ? (page - 1) * 20 : 0,
        searchBy: searchBy,
        _sort: orderBy.orderBy,
        sortDirection: orderBy.orderDirection,
        docStatuses: docStatuses.map((obj) => obj.id),
        _elements: searchInput ? [] : undefined,
        _list: groupId ? [groupId] : [],
        _text: searchInput,
        highlight_search_results: searchBy === SearchByTypes.TEXT ? true : false,
        type:
          docTypes.map((docType) => docType.code).length > 0 ? docTypes.map((docType) => docType.code).join(',') : '',
        'encounter-identifier': nda,
        'patient-identifier': ipp,
        onlyPdfAvailable: onlyPdfAvailable,
        signal: signal,
        minDate: startDate ?? '',
        maxDate: endDate ?? '',
        uniqueFacet: ['subject'],
        executiveUnits: executiveUnits.map((eu) => eu.id),
        encounterStatus: encounterStatus.map(({ id }) => id)
      }),
      !!searchInput ||
      docTypes.length > 0 ||
      !!nda ||
      !!ipp ||
      !!startDate ||
      !!endDate ||
      executiveUnits.length > 0 ||
      docStatuses.length > 0 ||
      !!onlyPdfAvailable ||
      encounterStatus.length > 0
        ? fetchDocumentReference({
            signal: signal,
            _list: groupId ? [groupId] : [],
            size: 0,
            uniqueFacet: ['subject']
          })
        : null
    ])

    const totalDocs = docsList?.data?.resourceType === 'Bundle' ? docsList.data.total : 0
    const totalAllDocs =
      allDocsList !== null ? (allDocsList?.data?.resourceType === 'Bundle' ? allDocsList.data.total : 0) : totalDocs

    const totalPatientDocs =
      docsList?.data?.resourceType === 'Bundle'
        ? (
            getExtension(docsList?.data?.meta, 'unique-subject') || {
              valueDecimal: 0
            }
          ).valueDecimal
        : 0
    const totalAllPatientDocs =
      allDocsList !== null
        ? (
            getExtension(allDocsList?.data?.meta, 'unique-subject') || {
              valueDecimal: 0
            }
          ).valueDecimal
        : totalPatientDocs

    const documentsList = getApiResponseResources(docsList) ?? []
    const filledDocumentsList = await getResourceInfos<DocumentReference, CohortComposition>(
      documentsList,
      deidentified,
      groupId,
      signal
    )

    return {
      total: totalDocs ?? 0,
      totalAllResults: totalAllDocs ?? 0,
      totalPatients: totalPatientDocs ?? 0,
      totalAllPatients: totalAllPatientDocs ?? 0,
      list: filledDocumentsList ?? []
    }
  },

  checkDocumentSearchInput: async (searchInput, signal) => {
    if (!searchInput) {
      return {
        isError: false
      }
    }

    const checkDocumentSearchInput = await fetchCheckDocumentSearchInput(searchInput, signal)

    if (checkDocumentSearchInput) {
      const errors = checkDocumentSearchInput.find((parameter) => parameter.name === 'WARNING')?.part ?? []

      const parsedErrors: ErrorDetails[] = []

      errors.forEach((error: ParametersParameter) => {
        try {
          if (error.valueString) {
            const splitError = error.valueString.split(';')

            const errorPositions = splitError.find((errorPart) => errorPart.includes('Positions'))

            const cleanedErrorPositions = errorPositions
              ? errorPositions
                  .replaceAll(' ', '')
                  .replace('Positions:', '')
                  .split('char:')
                  .slice(1)
                  .map((el) => parseInt(el))
              : []

            const errorSolution = splitError.find((errorPart) => errorPart.includes('Solution'))
            const cleanedErrorSolution = errorSolution ? errorSolution.replace(' Solution: ', '') : ''

            const errorObject = {
              errorName: error.name,
              errorPositions: cleanedErrorPositions,
              errorSolution: cleanedErrorSolution
            }

            parsedErrors.push(errorObject)
          }
        } catch (e) {
          console.error('failed to parse int', e)
        }
      })

      return {
        isError: checkDocumentSearchInput.find((parameter) => parameter.name === 'VALIDÉ') ? false : true,
        errorsDetails: parsedErrors
      }
    } else {
      return {
        isError: true,
        errorsDetails: [
          {
            errorName: 'Erreur du serveur',
            errorSolution: 'Veuillez refaire votre recherche'
          }
        ]
      }
    }
  },

  fetchDocumentContent: async (compositionId) => {
    const documentContent = await fetchDocumentReferenceContent(compositionId)
    return getApiResponseResource(documentContent)
  },

  fetchBinary: async (documentId) => {
    const documentBinaryResponse = await fetchBinary({ _id: documentId })
    const documentBinaries = getApiResponseResources(documentBinaryResponse)
    return documentBinaries && documentBinaries.length > 0 ? documentBinaries[0] : undefined
  },

  fetchCohortsRights: async (cohorts): Promise<Cohort[]> => {
    try {
      const ids = cohorts
        .map((cohort) => cohort.group_id)
        .filter((id) => id !== undefined || id !== '')
        .filter((i): i is string => i !== '')
      if (ids.length === 0) return cohorts
      const rightsResponse = await fetchCohortAccesses(ids)
      return cohorts.map((cohort) => {
        return {
          ...cohort,
          rights: rightsResponse.data.find((right) => right.cohort_id == cohort.group_id)?.rights
        }
      })
    } catch (error) {
      console.error('Error (fetchCohortsRights) :', error)
      return []
    }
  }
}

export default servicesCohorts
