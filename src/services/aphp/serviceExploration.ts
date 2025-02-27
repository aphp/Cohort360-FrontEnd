import { ResourceOptions } from 'types/exploration'
import {
  BiologyFilters,
  DocumentsFilters,
  Filters,
  FormNames,
  ImagingFilters,
  MaternityFormFilters,
  MedicationFilters,
  SearchByTypes
} from 'types/searchCriterias'
import services from '.'
import {
  fetchDocumentReference,
  fetchForms,
  fetchImaging,
  fetchMedicationAdministration,
  fetchMedicationRequest,
  fetchObservation
} from './callApi'
import { getApiResponseResources } from 'utils/apiHelpers'
import { linkElementWithEncounter } from 'state/patient'
import {
  Bundle,
  DocumentReference,
  FhirResource,
  ImagingStudy,
  MedicationAdministration,
  MedicationRequest,
  Observation,
  QuestionnaireResponse
} from 'fhir/r4'
import { CohortComposition, CohortImaging, ExplorationResults, FHIR_API_Response } from 'types'
import { SearchInputError } from 'types/error'
import { ResourceType } from 'types/requestCriterias'
import servicesCohorts from './serviceCohorts'
import servicesPatients from './servicePatients'
import { Data } from 'components/ExplorationBoard/useData'
import { getResourceInfos } from 'utils/fillElement'
import { getExtension } from 'utils/fhir'
import { AxiosResponse } from 'axios'
import { linkToDiagnosticReport } from './serviceImaging'
import { atLeastOneSearchCriteria } from 'utils/filters'
import { getFormName } from 'utils/formUtils'
import { sortByDateKey } from 'utils/formatDate'
import { mapMedicationToOrderByCode } from 'mappers/medication'

export const getExplorationFetcher = (
  resourceType: ResourceType,
  isPatient: boolean
): ((options: ResourceOptions<Filters>, signal?: AbortSignal) => Promise<Data>) => {
  switch (resourceType) {
    case ResourceType.PATIENT:
      return servicesCohorts.fetchPatientList
    case ResourceType.QUESTIONNAIRE_RESPONSE:
      return fetchFormsList
    case ResourceType.CONDITION:
    case ResourceType.CLAIM:
    case ResourceType.PROCEDURE: {
      if (isPatient) return servicesPatients.fetchPMSI
      return servicesCohorts.fetchPMSIList
    }
    case ResourceType.DOCUMENTS:
      return fetchDocumentsList
    case ResourceType.MEDICATION_ADMINISTRATION:
    case ResourceType.MEDICATION_REQUEST:
      return fetchMedicationList
    case ResourceType.IMAGING:
      return fetchImagingList
    case ResourceType.OBSERVATION:
      return fetchBiologyList
  }
  return servicesCohorts.fetchPatientList
}

const getPatientsCount = <T>(list: AxiosResponse<FHIR_API_Response<Bundle<T>>>) => {
  return list?.data?.resourceType === 'Bundle'
    ? (
        getExtension(list?.data?.meta, 'unique-subject') || {
          valueDecimal: 0
        }
      ).valueDecimal ?? 0
    : 0
}

const fetchDocumentsList = async (
  options: ResourceOptions<DocumentsFilters>,
  signal?: AbortSignal
): Promise<ExplorationResults<DocumentReference> | SearchInputError> => {
  const {
    deidentified,
    page,
    searchCriterias: {
      orderBy,
      searchInput,
      searchBy,
      filters: { ipp, docStatuses, docTypes, executiveUnits, nda, onlyPdfAvailable, durationRange, encounterStatus }
    },
    groupId,
    patient
  } = options
  if (searchInput) {
    const searchInputError = await services.cohorts.checkDocumentSearchInput(searchInput, signal)
    if (searchInputError && searchInputError.isError) {
      throw searchInputError
    }
  }
  const size = 20
  const [docsList, allDocsList] = await Promise.all([
    fetchDocumentReference({
      size,
      offset: page ? (page - 1) * size : 0,
      searchBy: searchBy,
      _sort: orderBy.orderBy,
      sortDirection: orderBy.orderDirection,
      docStatuses: docStatuses.map((status) => status.id),
      _elements: searchInput ? [] : undefined,
      _list: groupId ? [groupId] : [],
      _text: searchInput,
      highlight_search_results: searchBy === SearchByTypes.TEXT ? true : false,
      type: docTypes.map((docType) => docType.code).join(','),
      patient: patient?.patientInfo?.id,
      'encounter-identifier': nda,
      'patient-identifier': ipp,
      onlyPdfAvailable,
      uniqueFacet: ['subject'],
      executiveUnits: executiveUnits.map((unit) => unit.id),
      encounterStatus: encounterStatus?.map(({ id }) => id),
      minDate: durationRange[0] ?? '',
      maxDate: durationRange[1] ?? '',
      signal: signal
    }),
    atLeastOneSearchCriteria(options.searchCriterias)
      ? fetchDocumentReference({
          patient: patient?.patientInfo?.id,
          signal: signal,
          _list: groupId ? [groupId] : [],
          size: 0,
          uniqueFacet: ['subject']
        })
      : null
  ])
  const results: ExplorationResults<DocumentReference> = {
    totalAllResults: null,
    total: null,
    totalAllPatients: null,
    totalPatients: null,
    list: []
  }
  const docsResponse = getApiResponseResources(docsList) ?? []
  results.total = docsList?.data?.resourceType === 'Bundle' ? docsList.data.total ?? 0 : 0
  results.totalAllResults =
    allDocsList && allDocsList?.data?.resourceType === 'Bundle' ? allDocsList.data.total ?? null : results.total
  results.totalPatients = getPatientsCount(docsList)
  results.totalAllPatients = allDocsList ? getPatientsCount(allDocsList) : results.totalPatients
  results.list = patient
    ? linkElementWithEncounter(docsResponse as DocumentReference[], patient?.hospits?.list ?? [], deidentified)
    : await getResourceInfos<DocumentReference, CohortComposition>(docsResponse, deidentified, groupId, signal)
  return results
}

const fetchImagingList = async (
  options: ResourceOptions<ImagingFilters>,
  signal?: AbortSignal
): Promise<ExplorationResults<ImagingStudy>> => {
  const {
    deidentified,
    page,
    searchCriterias: {
      orderBy,
      searchInput,
      filters: { ipp, nda, durationRange, executiveUnits, modality, encounterStatus }
    },
    groupId,
    patient
  } = options
  const size = 20
  const [imagingList, allImagingList] = await Promise.all([
    fetchImaging({
      size,
      offset: page ? (page - 1) * size : 0,
      order: orderBy.orderBy,
      orderDirection: orderBy.orderDirection,
      _text: searchInput,
      encounter: nda,
      ipp,
      minDate: durationRange[0] ?? '',
      maxDate: durationRange[1] ?? '',
      _list: groupId ? [groupId] : [],

      modalities: modality.map(({ id }) => id),
      executiveUnits: executiveUnits.map((unit) => unit.id),
      encounterStatus: encounterStatus.map(({ id }) => id),
      uniqueFacet: ['subject'],
      patient: patient?.patientInfo?.id,
      signal
    }),
    atLeastOneSearchCriteria(options.searchCriterias)
      ? fetchImaging({
          patient: patient?.patientInfo?.id,
          size: 0,
          _list: groupId ? [groupId] : [],
          signal: signal,
          uniqueFacet: ['subject']
        })
      : null
  ])
  const results: ExplorationResults<ImagingStudy> = {
    totalAllResults: null,
    total: null,
    totalAllPatients: null,
    totalPatients: null,
    list: []
  }
  const imagingResponse = getApiResponseResources(imagingList) ?? []
  results.total = imagingList?.data?.resourceType === 'Bundle' ? imagingList.data.total ?? 0 : 0
  results.totalAllResults =
    allImagingList && allImagingList?.data?.resourceType === 'Bundle'
      ? allImagingList.data.total ?? null
      : results.total
  results.totalPatients = getPatientsCount(imagingList)
  results.totalAllPatients = allImagingList ? getPatientsCount(allImagingList) : results.totalPatients
  const completeList = patient
    ? linkElementWithEncounter(imagingResponse, patient?.hospits?.list ?? [], deidentified)
    : await getResourceInfos<ImagingStudy, CohortImaging>(imagingResponse, deidentified, groupId, signal)
  results.list = await linkToDiagnosticReport(completeList, signal)
  return results
}

const fetchBiologyList = async (
  options: ResourceOptions<BiologyFilters>,
  signal?: AbortSignal
): Promise<ExplorationResults<Observation>> => {
  const {
    deidentified,
    page,
    searchCriterias: {
      orderBy,
      searchInput,
      filters: { validatedStatus, nda, ipp, code, durationRange, executiveUnits, encounterStatus }
    },
    groupId,
    patient
  } = options
  const size = 20
  const [biologyList, allBiologyList] = await Promise.all([
    fetchObservation({
      _list: groupId ? [groupId] : [],
      size,
      offset: page ? (page - 1) * size : 0,
      _sort: orderBy.orderBy,
      sortDirection: orderBy.orderDirection,
      _text: searchInput === '' ? '' : searchInput,
      encounter: nda,
      'patient-identifier': ipp,
      executiveUnits: executiveUnits.map((unit) => unit.id),
      encounterStatus: encounterStatus.map(({ id }) => id),
      uniqueFacet: ['subject'],
      minDate: durationRange[0] ?? '',
      maxDate: durationRange[1] ?? '',
      code: code.map((code) => encodeURI(`${code.system}|${code.id}`)).join(','),
      rowStatus: validatedStatus,
      subject: patient?.patientInfo?.id,
      signal: signal
    }),
    atLeastOneSearchCriteria(options.searchCriterias)
      ? fetchObservation({
          subject: patient?.patientInfo?.id,
          size: 0,
          signal: signal,
          _list: groupId ? [groupId] : [],
          uniqueFacet: ['subject'],
          rowStatus: validatedStatus
        })
      : null
  ])
  const results: ExplorationResults<Observation> = {
    totalAllResults: null,
    total: null,
    totalAllPatients: null,
    totalPatients: null,
    list: []
  }
  const bioResponse = getApiResponseResources(biologyList) ?? []
  results.list = patient
    ? linkElementWithEncounter(bioResponse, patient?.hospits?.list ?? [], deidentified)
    : await getResourceInfos(bioResponse, deidentified, groupId, signal)
  results.total = biologyList?.data?.resourceType === 'Bundle' ? biologyList.data.total ?? 0 : 0
  results.totalAllResults =
    allBiologyList && allBiologyList?.data?.resourceType === 'Bundle'
      ? allBiologyList.data.total ?? null
      : results.total
  results.totalPatients = getPatientsCount(biologyList)
  results.totalAllPatients = allBiologyList ? getPatientsCount(allBiologyList) : results.totalPatients
  return results
}

const fetchMedicationList = async (
  options: ResourceOptions<MedicationFilters>,
  signal?: AbortSignal
): Promise<ExplorationResults<MedicationRequest | MedicationAdministration>> => {
  const {
    type,
    deidentified,
    page,
    searchCriterias: {
      orderBy,
      searchInput,
      filters: {
        code,
        nda,
        ipp,
        durationRange,
        executiveUnits,
        encounterStatus,
        administrationRoutes,
        prescriptionTypes
      }
    },
    groupId,
    patient
  } = options
  const fetchers = {
    [ResourceType.MEDICATION_REQUEST]: fetchMedicationRequest,
    [ResourceType.MEDICATION_ADMINISTRATION]: fetchMedicationAdministration
  }
  const _type = type as ResourceType.MEDICATION_REQUEST | ResourceType.MEDICATION_ADMINISTRATION
  const commonFilters = () => ({
    _list: groupId ? [groupId] : [],
    size: 20,
    offset: page ? (page - 1) * 20 : 0,
    _sort: mapMedicationToOrderByCode(orderBy.orderBy, _type),
    sortDirection: orderBy.orderDirection,
    _text: searchInput,
    encounter: nda,
    ipp: ipp,
    signal: signal,
    executiveUnits: executiveUnits.map((unit) => unit.id),
    encounterStatus: encounterStatus.map(({ id }) => id),
    minDate: durationRange[0] ?? '',
    maxDate: durationRange[1] ?? '',
    code: code.map((code) => encodeURI(`${code.system}|${code.id}`)).join(','),
    uniqueFacet: ['subject'],
    subject: patient?.patientInfo?.id
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

  const fetcher = fetchers[_type]
  const filters = filtersMapper[_type]()

  const [medicationList, allMedicationList] = await Promise.all([
    fetcher(filters),
    atLeastOneSearchCriteria(options.searchCriterias)
      ? fetcher({
          size: 0,
          signal: signal,
          _list: groupId ? [groupId] : [],
          uniqueFacet: ['subject'],
          minDate: null,
          maxDate: null,
          subject: patient?.patientInfo?.id
        })
      : null
  ])
  const results: ExplorationResults<MedicationAdministration | MedicationRequest> = {
    totalAllResults: null,
    total: null,
    totalAllPatients: null,
    totalPatients: null,
    list: []
  }
  const medicationResponse = getApiResponseResources<MedicationAdministration | MedicationRequest>(medicationList) ?? []
  results.list = patient
    ? linkElementWithEncounter(medicationResponse, patient?.hospits?.list ?? [], deidentified)
    : await getResourceInfos(medicationResponse, deidentified, groupId, signal)
  results.total = medicationList?.data?.resourceType === 'Bundle' ? medicationList.data.total ?? 0 : 0
  results.totalAllResults =
    allMedicationList && allMedicationList?.data?.resourceType === 'Bundle'
      ? allMedicationList.data.total ?? null
      : results.total
  results.totalPatients = getPatientsCount<MedicationAdministration | MedicationRequest>(medicationList)
  results.totalAllPatients = allMedicationList
    ? getPatientsCount<MedicationAdministration | MedicationRequest>(allMedicationList)
    : results.totalPatients
  return results
}

const fetchFormsList = async (
  options: ResourceOptions<MaternityFormFilters>,
  signal?: AbortSignal
): Promise<ExplorationResults<QuestionnaireResponse>> => {
  const {
    page,
    searchCriterias: {
      orderBy,
      filters: { ipp, formName, durationRange, executiveUnits, encounterStatus }
    },
    groupId,
    patient
  } = options
  const size = 20
  const [formsList, allFormsList] = await Promise.all([
    fetchForms({
      _list: groupId ? [groupId] : [],
      size,
      offset: page ? (page - 1) * size : 0,
      order: orderBy.orderBy,
      orderDirection: orderBy.orderDirection,
      ipp,
      startDate: durationRange?.[0] ?? '',
      endDate: durationRange?.[1] ?? '',
      signal: signal,
      executiveUnits: executiveUnits.map((unit) => unit.id),
      encounterStatus: encounterStatus.map((status) => status.id),
      formName: formName.join(','),
      uniqueFacet: ['subject'],
      patient: patient?.patientInfo?.id
    }),
    atLeastOneSearchCriteria(options.searchCriterias)
      ? fetchForms({
          _list: groupId ? [groupId] : [],
          size: 0,
          signal: signal,
          uniqueFacet: ['subject'],
          patient: patient?.patientInfo?.id
        })
      : null
  ])
  const results: ExplorationResults<QuestionnaireResponse> = {
    totalAllResults: null,
    total: null,
    totalAllPatients: null,
    totalPatients: null,
    list: []
  }
  const formsResponse = getApiResponseResources(formsList) ?? []
  const filledFormsList = await getResourceInfos(formsResponse, false, groupId, signal)
  const questionnaires = await services.patients.fetchQuestionnaires()
  results.list = patient
    ? sortByDateKey(linkElementWithEncounter(formsResponse, patient?.hospits?.list ?? [], false), 'authored')
    : (filledFormsList.map((elem) => ({
        ...elem,
        formName: getFormName(elem as QuestionnaireResponse, questionnaires)
      })) as QuestionnaireResponse[])
  results.total = formsList?.data?.resourceType === 'Bundle' ? formsList.data.total ?? 0 : 0
  results.totalAllResults =
    allFormsList && allFormsList?.data?.resourceType === 'Bundle' ? allFormsList.data.total ?? null : results.total
  results.totalPatients = getPatientsCount(formsList)
  results.totalAllPatients = allFormsList ? getPatientsCount(allFormsList) : results.totalPatients
  return results
}
