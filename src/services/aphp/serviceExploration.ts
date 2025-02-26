import { ResourceOptions } from 'types/exploration'
import { DocumentsFilters, Filters, ImagingFilters, SearchByTypes } from 'types/searchCriterias'
import services from '.'
import { fetchDocumentReference, fetchImaging } from './callApi'
import { getApiResponseResources } from 'utils/apiHelpers'
import { linkElementWithEncounter } from 'state/patient'
import { Bundle, DocumentReference, FhirResource, ImagingStudy } from 'fhir/r4'
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

export const getExplorationFetcher = (
  resourceType: ResourceType,
  isPatient: boolean
): ((options: ResourceOptions<Filters>, signal?: AbortSignal) => Promise<Data>) => {
  switch (resourceType) {
    case ResourceType.PATIENT:
      return servicesCohorts.fetchPatientList
    case ResourceType.QUESTIONNAIRE_RESPONSE: {
      if (isPatient) return servicesPatients.fetchMaternityForms
      return servicesCohorts.fetchFormsList
    }
    case ResourceType.CONDITION:
    case ResourceType.CLAIM:
    case ResourceType.PROCEDURE: {
      if (isPatient) return servicesPatients.fetchPMSI
      return servicesCohorts.fetchPMSIList
    }
    case ResourceType.DOCUMENTS:
      return fetchDocumentsList
    case ResourceType.MEDICATION_ADMINISTRATION:
    case ResourceType.MEDICATION_REQUEST: {
      if (isPatient) return servicesPatients.fetchMedication
      return servicesCohorts.fetchMedicationList
    }
    case ResourceType.IMAGING:
      return fetchImagingList
    case ResourceType.OBSERVATION: {
      if (isPatient) return servicesPatients.fetchObservation
      return servicesCohorts.fetchBiologyList
    }
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

export const fetchDocumentsList = async (
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
    !!searchInput ||
    ipp ||
    docTypes.length > 0 ||
    !!nda ||
    !!durationRange[0] ||
    !!durationRange[1] ||
    executiveUnits.length > 0 ||
    docStatuses.length > 0 ||
    !!onlyPdfAvailable ||
    encounterStatus.length > 0
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
  if (patient) {
    results.list = linkElementWithEncounter(
      docsResponse as DocumentReference[],
      patient?.hospits?.list ?? [],
      deidentified
    )
  } else {
    results.list = await getResourceInfos<DocumentReference, CohortComposition>(
      docsResponse,
      deidentified,
      groupId,
      signal
    )
  }
  return results
}

export const fetchImagingList = async (
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
    !!searchInput ||
    !!ipp ||
    !!nda ||
    !!durationRange[0] ||
    !!durationRange[1] ||
    executiveUnits.length > 0 ||
    modality.length > 0
      ? fetchImaging({
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
