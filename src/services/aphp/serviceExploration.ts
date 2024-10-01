import { Data, ResourceOptions } from 'types/exploration'
import {
  BiologyFilters,
  DocumentsFilters,
  Filters,
  ImagingFilters,
  MaternityFormFilters,
  MedicationFilters,
  PMSIFilters,
  PatientsFilters,
  SearchByTypes,
  VitalStatus
} from 'types/searchCriterias'
import services from '.'
import {
  fetchClaim,
  fetchCondition,
  fetchDocumentReference,
  fetchForms,
  fetchImaging,
  fetchMedicationAdministration,
  fetchMedicationRequest,
  fetchObservation,
  fetchPatient,
  fetchProcedure
} from './callApi'
import { getApiResponseResources } from 'utils/apiHelpers'
import { linkElementWithEncounter } from 'state/patient'
import {
  Bundle,
  Claim,
  Condition,
  DocumentReference,
  ImagingStudy,
  MedicationAdministration,
  MedicationRequest,
  Observation,
  Procedure,
  QuestionnaireResponse
} from 'fhir/r4'
import { ChartCode, CohortComposition, CohortImaging, CohortPMSI, ExplorationResults, FHIR_API_Response } from 'types'
import { PMSIResourceTypes, ResourceType } from 'types/requestCriterias'
import { getResourceInfos } from 'utils/fillElement'
import { getExtension } from 'utils/fhir'
import { AxiosResponse } from 'axios'
import { linkToDiagnosticReport } from './serviceImaging'
import { atLeastOneSearchCriteria } from 'utils/filters'
import { getFormName } from 'utils/formUtils'
import { sortByDateKey } from 'utils/formatDate'
import { mapMedicationToOrderByCode } from 'mappers/medication'
import { PatientsResponse } from 'types/patient'
import { substructAgeString } from 'utils/age'
import moment from 'moment'
import { getAgeRepartitionMapAphp, getGenderRepartitionMapAphp } from 'utils/graphUtils'
import { mapToOrderByCode } from 'mappers/pmsi'

const getPatientsCount = <T>(list: AxiosResponse<FHIR_API_Response<Bundle<T>>>, facet = 'unique-subject') => {
  return list?.data?.resourceType === 'Bundle'
    ? (
        getExtension(list?.data?.meta, facet) || {
          valueDecimal: 0
        }
      ).valueDecimal ?? 0
    : 0
}

export const fetchDocumentsList = async (
  options: ResourceOptions<DocumentsFilters>,
  signal?: AbortSignal
): Promise<ExplorationResults<DocumentReference>> => {
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
      _list: groupId,
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
          _list: groupId,
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
    : await getResourceInfos<DocumentReference, CohortComposition>(docsResponse, deidentified, groupId?.[0], signal)
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
      _list: groupId,

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
          _list: groupId,
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
    : await getResourceInfos<ImagingStudy, CohortImaging>(imagingResponse, deidentified, groupId?.[0], signal)
  results.list = await linkToDiagnosticReport(completeList, signal)
  return results
}

export const fetchBiologyList = async (
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
      _list: groupId,
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
          _list: groupId,
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
    : await getResourceInfos(bioResponse, deidentified, groupId?.[0], signal)
  results.total = biologyList?.data?.resourceType === 'Bundle' ? biologyList.data.total ?? 0 : 0
  results.totalAllResults =
    allBiologyList && allBiologyList?.data?.resourceType === 'Bundle'
      ? allBiologyList.data.total ?? null
      : results.total
  results.totalPatients = getPatientsCount(biologyList)
  results.totalAllPatients = allBiologyList ? getPatientsCount(allBiologyList) : results.totalPatients
  return results
}

export const fetchMedicationList = async (
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
    _list: groupId,
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
          _list: groupId,
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
    : await getResourceInfos(medicationResponse, deidentified, groupId?.[0], signal)
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

export const fetchFormsList = async (
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
      _list: groupId,
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
          _list: groupId,
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
  const filledFormsList = await getResourceInfos(formsResponse, false, groupId?.[0], signal)
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

export const fetchPMSIList = async (
  options: ResourceOptions<PMSIFilters>,
  signal?: AbortSignal
): Promise<ExplorationResults<CohortPMSI>> => {
  const {
    type,
    deidentified,
    page,
    searchCriterias: {
      orderBy,
      searchInput,
      filters: { ipp, nda, durationRange, executiveUnits, encounterStatus, diagnosticTypes, code, source }
    },
    groupId,
    patient
  } = options
  const _type = type as PMSIResourceTypes
  const fetchers = {
    [ResourceType.CONDITION]: fetchCondition,
    [ResourceType.PROCEDURE]: fetchProcedure,
    [ResourceType.CLAIM]: fetchClaim
  }

  const commonFilters = () => ({
    _list: groupId,
    subject: patient?.patientInfo?.id,
    size: 20,
    offset: page ? (page - 1) * 20 : 0,
    _sort: mapToOrderByCode(orderBy.orderBy, _type),
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
      'min-recorded-date': (durationRange && durationRange[0]) ?? '',
      'max-recorded-date': (durationRange && durationRange[1]) ?? '',
      uniqueFacet: ['subject'],
      subject: patient?.patientInfo?.id
    }),
    [ResourceType.PROCEDURE]: () => ({
      ...commonFilters(),
      code: code.map((e) => encodeURIComponent(`${e.system}|${e.id}`)).join(','),
      source: source,
      minDate: (durationRange && durationRange[0]) ?? '',
      maxDate: (durationRange && durationRange[1]) ?? '',
      uniqueFacet: ['subject'],
      subject: patient?.patientInfo?.id
    }),
    [ResourceType.CLAIM]: () => ({
      ...commonFilters(),
      diagnosis: code.map((e) => encodeURIComponent(`${e.system}|${e.id}`)).join(','),
      minCreated: (durationRange && durationRange[0]) ?? '',
      maxCreated: (durationRange && durationRange[1]) ?? '',
      uniqueFacet: ['patient'],
      patient: patient?.patientInfo?.id
    })
  }

  const fetcher = fetchers[_type]
  const filters = filtersMapper[_type]()

  const [pmsiList, allPMSIList] = await Promise.all([
    fetcher(filters),
    atLeastOneSearchCriteria(options.searchCriterias)
      ? fetcher({
          size: 0,
          signal: signal,
          _list: groupId,
          uniqueFacet: [type === ResourceType.CLAIM ? 'patient' : 'subject'],
          subject: patient?.patientInfo?.id,
          patient: patient?.patientInfo?.id
        })
      : null
  ])
  const results: ExplorationResults<Condition | Procedure | Claim> = {
    totalAllResults: null,
    total: null,
    totalAllPatients: null,
    totalPatients: null,
    list: []
  }
  const pmsiResponse = getApiResponseResources<Condition | Procedure | Claim>(pmsiList) ?? []
  results.list = patient
    ? linkElementWithEncounter(pmsiResponse, patient?.hospits?.list ?? [], deidentified)
    : await getResourceInfos(pmsiResponse, deidentified, groupId?.[0], signal)
  const facet = type === ResourceType.CLAIM ? 'unique-patient' : 'unique-subject'
  results.total = pmsiList?.data?.resourceType === 'Bundle' ? pmsiList.data.total ?? 0 : 0
  results.totalAllResults =
    allPMSIList && allPMSIList?.data?.resourceType === 'Bundle' ? allPMSIList.data.total ?? null : results.total
  results.totalPatients = getPatientsCount<Condition | Procedure | Claim>(pmsiList, facet)
  results.totalAllPatients = allPMSIList
    ? getPatientsCount<Condition | Procedure | Claim>(allPMSIList, facet)
    : results.totalPatients
  return results
}

export const fetchPatientList = async (
  options: ResourceOptions<PatientsFilters>,
  signal?: AbortSignal
): Promise<PatientsResponse> => {
  const {
    deidentified,
    page,
    searchCriterias: {
      searchBy,
      searchInput,
      orderBy,
      filters: { birthdatesRanges, genders, vitalStatuses }
    },
    groupId,
    includeFacets
  } = options
  const birthdates: [string, string] = [
    moment(substructAgeString(birthdatesRanges?.[0] || '')).format('MM/DD/YYYY'),
    moment(substructAgeString(birthdatesRanges?.[1] || '')).format('MM/DD/YYYY')
  ]
  const minBirthdate = birthdates && Math.abs(moment(birthdates[0]).diff(moment(), deidentified ? 'months' : 'days'))
  const maxBirthdate = birthdates && Math.abs(moment(birthdates[1]).diff(moment(), deidentified ? 'months' : 'days'))
  const size = 20
  const [patientsList, allPatientsList] = await Promise.all([
    fetchPatient({
      size,
      offset: page ? (page - 1) * size : 0,
      _sort: orderBy.orderBy,
      sortDirection: orderBy.orderDirection,
      pivotFacet: includeFacets ? ['age-month_gender', 'deceased_gender'] : [],
      _list: groupId,
      gender: genders.join(','),
      searchBy,
      _text: (searchInput || '').trim(),
      minBirthdate: minBirthdate,
      maxBirthdate: maxBirthdate,
      deceased: vitalStatuses.length === 1 ? (vitalStatuses.includes(VitalStatus.DECEASED) ? true : false) : undefined,
      deidentified: deidentified,
      signal: signal,
      _elements: ['gender', 'name', 'birthDate', 'deceased', 'identifier', 'extension']
    }),
    atLeastOneSearchCriteria(options.searchCriterias)
      ? fetchPatient({
          size: 0,
          _list: groupId,
          signal: signal
        })
      : null
  ])
  const originalPatients = getApiResponseResources(patientsList) ?? []
  const totalPatients = patientsList.data.resourceType === 'Bundle' ? patientsList.data.total ?? 0 : 0
  const totalAllPatients =
    allPatientsList?.data?.resourceType === 'Bundle' ? allPatientsList.data.total ?? totalPatients : totalPatients
  const agePyramidData =
    patientsList.data.resourceType === 'Bundle'
      ? getAgeRepartitionMapAphp(getExtension(patientsList.data.meta, ChartCode.AGE_PYRAMID)?.extension)
      : undefined
  const genderRepartitionMap =
    patientsList.data.resourceType === 'Bundle'
      ? getGenderRepartitionMapAphp(getExtension(patientsList.data.meta, ChartCode.GENDER_REPARTITION)?.extension)
      : undefined
  return {
    totalPatients: totalPatients,
    totalAllPatients: totalAllPatients,
    originalPatients,
    genderRepartitionMap,
    agePyramidData
  }
}
