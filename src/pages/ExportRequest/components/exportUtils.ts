import { getConfig } from 'config'
import { mapRequestParamsToSearchCriteria } from 'mappers/filters'
import moment from 'moment'
import {
  fetchClaim,
  fetchCondition,
  fetchDocumentReference,
  fetchImaging,
  fetchMedicationAdministration,
  fetchMedicationRequest,
  fetchObservation,
  fetchPatient,
  fetchProcedure,
  fetchForms
} from 'services/aphp/callApi'
import { TableInfo } from 'types/export'
import { ResourceType } from 'types/requestCriterias'
import {
  BiologyFilters,
  DocumentsFilters,
  ImagingFilters,
  MedicationFilters,
  PMSIFilters,
  PatientsFilters,
  SearchCriterias,
  VitalStatus
} from 'types/searchCriterias'
import { substructAgeString } from 'utils/age'
import { getApiResponseResourceOrThrow } from 'utils/apiHelpers'

const fetchPatientCount = async (cohortId: string, patientsFilters?: SearchCriterias<PatientsFilters>) => {
  try {
    let patientsResp
    if (patientsFilters && patientsFilters !== null) {
      const { birthdatesRanges, genders, vitalStatuses } = patientsFilters.filters
      const birthdates: [string, string] = [
        moment(substructAgeString(birthdatesRanges?.[0] || '')).format('MM/DD/YYYY'),
        moment(substructAgeString(birthdatesRanges?.[1] || '')).format('MM/DD/YYYY')
      ]
      const minBirthdate = birthdates && Math.abs(moment(birthdates[0]).diff(moment(), 'days'))
      const maxBirthdate = birthdates && Math.abs(moment(birthdates[1]).diff(moment(), 'days'))
      patientsResp = await fetchPatient({
        size: 0,
        _list: [cohortId],
        gender: genders.join(),
        searchBy: patientsFilters.searchBy,
        _text: patientsFilters.searchInput,
        minBirthdate: minBirthdate,
        maxBirthdate: maxBirthdate,
        deceased:
          vitalStatuses && vitalStatuses.length === 1
            ? vitalStatuses.includes(VitalStatus.DECEASED)
              ? true
              : false
            : undefined
      })
    } else {
      patientsResp = await fetchPatient({ size: 0, _list: [cohortId] })
    }
    const count = patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total : 0
    return count
  } catch (error) {
    console.error('Erreur lors de fetchPatientCount', error)
    throw error
  }
}

const fetchConditionCount = async (cohortId: string, conditionFilters?: SearchCriterias<PMSIFilters>) => {
  try {
    let conditionResp
    if (conditionFilters && conditionFilters !== null) {
      const { code, diagnosticTypes, source, nda, startDate, endDate, executiveUnits, encounterStatus } =
        conditionFilters.filters

      conditionResp = await fetchCondition({
        size: 0,
        _list: [cohortId],
        code: code.map((code) => encodeURI(`${code.system}|${code.id}`)).join(','),
        source: source,
        type: diagnosticTypes?.map((type) => type.id) ?? [],
        'min-recorded-date': startDate ?? '',
        'max-recorded-date': endDate ?? '',
        executiveUnits: executiveUnits.map((unit) => unit.id),
        'encounter-identifier': nda,
        _text: conditionFilters.searchInput,
        encounterStatus: encounterStatus.map((status) => status.id)
      })
    } else {
      conditionResp = await fetchCondition({ size: 0, _list: [cohortId] })
    }
    const count = conditionResp.data.resourceType === 'Bundle' ? conditionResp.data.total : 0
    return count
  } catch (error) {
    console.error('Erreur lors de fetchConditionCount', error)
    throw error
  }
}

const fetchProcedureCount = async (cohortId: string, procedureFilters?: SearchCriterias<PMSIFilters>) => {
  try {
    let procedureResp

    if (procedureFilters && procedureFilters !== null) {
      const { code, source, nda, startDate, endDate, executiveUnits, encounterStatus } = procedureFilters.filters

      procedureResp = await fetchProcedure({
        size: 0,
        _list: [cohortId],
        code: code.map((code) => encodeURI(`${code.system}|${code.id}`)).join(','),
        source: source,
        minDate: startDate ?? '',
        maxDate: endDate ?? '',
        executiveUnits: executiveUnits.map((unit) => unit.id),
        'encounter-identifier': nda,
        _text: procedureFilters.searchInput,
        encounterStatus: encounterStatus.map((status) => status.id)
      })
    } else {
      procedureResp = await fetchProcedure({ size: 0, _list: [cohortId] })
    }
    const count = procedureResp.data.resourceType === 'Bundle' ? procedureResp.data.total : 0

    return count
  } catch (error) {
    console.error('Erreur lors de fetchProcedureCount', error)
    throw error
  }
}

const fetchClaimCount = async (cohortId: string, claimFilters?: SearchCriterias<PMSIFilters>) => {
  try {
    let claimResp
    if (claimFilters && claimFilters !== null) {
      const { code, nda, startDate, endDate, executiveUnits, encounterStatus } = claimFilters.filters

      claimResp = await fetchClaim({
        size: 0,
        _list: [cohortId],
        diagnosis: code.map((code) => encodeURI(`${code.system}|${code.id}`)).join(','),
        minCreated: startDate ?? '',
        maxCreated: endDate ?? '',
        _text: claimFilters.searchInput,
        'encounter-identifier': nda,
        executiveUnits: executiveUnits.map((unit) => unit.id),
        encounterStatus: encounterStatus.map((status) => status.id)
      })
    } else {
      claimResp = await fetchClaim({ size: 0, _list: [cohortId] })
    }
    const count = claimResp.data.resourceType === 'Bundle' ? claimResp.data.total : 0

    return count
  } catch (error) {
    console.error('Erreur lors de fetchClaimCount', error)
    throw error
  }
}

const fetchMedicationCount = async (
  cohortId: string,
  resourceType: ResourceType,
  medicationFilters?: SearchCriterias<MedicationFilters>
) => {
  try {
    let medicationResp
    if (medicationFilters && medicationFilters !== null) {
      const {
        nda,
        startDate,
        endDate,
        executiveUnits,
        code,
        encounterStatus,
        prescriptionTypes,
        administrationRoutes
      } = medicationFilters.filters

      medicationResp =
        resourceType === ResourceType.MEDICATION_REQUEST
          ? await fetchMedicationRequest({
              size: 0,
              _list: [cohortId],
              encounter: nda,
              _text: medicationFilters.searchInput,
              code: code.map((code) => encodeURI(`${code.system}|${code.id}`)).join(','),
              type: prescriptionTypes?.map(({ id }) => id),
              minDate: startDate,
              maxDate: endDate,
              executiveUnits: executiveUnits.map((unit) => unit.id),
              encounterStatus: encounterStatus.map((status) => status.id)
            })
          : await fetchMedicationAdministration({
              size: 0,
              _list: [cohortId],
              encounter: nda,
              _text: medicationFilters.searchInput,
              code: code.map((code) => encodeURI(`${code.system}|${code.id}`)).join(','),
              route: administrationRoutes?.map(({ id }) => id),
              minDate: startDate,
              maxDate: endDate,
              executiveUnits: executiveUnits.map((unit) => unit.id),
              encounterStatus: encounterStatus.map((status) => status.id)
            })
    } else {
      medicationResp =
        resourceType === ResourceType.MEDICATION_REQUEST
          ? await fetchMedicationRequest({ size: 0, _list: [cohortId], minDate: null, maxDate: null })
          : await fetchMedicationAdministration({ size: 0, _list: [cohortId], minDate: null, maxDate: null })
    }
    const count = medicationResp.data.resourceType === 'Bundle' ? medicationResp.data.total : 0
    return count
  } catch (error) {
    console.error('Erreur lors de fetchMedicationCount', error)
    throw error
  }
}

const fetchImagingCount = async (cohortId: string, imagingFilters?: SearchCriterias<ImagingFilters>) => {
  try {
    let claimResp
    if (imagingFilters && imagingFilters !== null) {
      const { nda, startDate, endDate, executiveUnits, encounterStatus, modality } = imagingFilters.filters

      claimResp = await fetchImaging({
        size: 0,
        _list: [cohortId],
        _text: imagingFilters.searchInput,
        encounter: nda,
        minDate: startDate ?? '',
        maxDate: endDate ?? '',
        modalities: modality.map(({ id }) => id),
        executiveUnits: executiveUnits.map((unit) => unit.id),
        encounterStatus: encounterStatus.map((status) => status.id)
      })
    } else {
      claimResp = await fetchImaging({ size: 0, _list: [cohortId] })
    }
    const count = claimResp.data.resourceType === 'Bundle' ? claimResp.data.total : 0

    return count
  } catch (error) {
    console.error('Erreur lors de fetchImagingCount', error)
    throw error
  }
}

const fetchDocumentsCount = async (cohortId: string, documentsFilters?: SearchCriterias<DocumentsFilters>) => {
  try {
    let docResp
    if (documentsFilters && documentsFilters !== null) {
      const { nda, startDate, endDate, executiveUnits, encounterStatus, ipp, docTypes, docStatuses } =
        documentsFilters.filters

      docResp = await fetchDocumentReference({
        size: 0,
        _list: [cohortId],
        searchBy: documentsFilters.searchBy,
        docStatuses: docStatuses.map((obj) => obj.id),
        _text: documentsFilters.searchInput,
        type: docTypes.map((docType) => docType.code).join(),
        'encounter-identifier': nda,
        'patient-identifier': ipp,
        minDate: startDate ?? '',
        maxDate: endDate ?? '',
        executiveUnits: executiveUnits.map((unit) => unit.id),
        encounterStatus: encounterStatus.map((status) => status.id)
      })
    } else {
      docResp = await fetchDocumentReference({ size: 0, _list: [cohortId] })
    }
    const count = docResp.data.resourceType === 'Bundle' ? docResp.data.total : 0

    return count
  } catch (error) {
    console.error('Erreur lors de fetchDocumentsCount', error)
    throw error
  }
}

const fetchObservationCount = async (cohortId: string, observationFilters?: SearchCriterias<BiologyFilters>) => {
  try {
    let observationResp
    if (observationFilters && observationFilters !== null) {
      const { nda, code, startDate, endDate, executiveUnits, encounterStatus, validatedStatus } =
        observationFilters.filters

      observationResp = await fetchObservation({
        size: 0,
        _list: [cohortId],
        _text: observationFilters.searchInput,
        encounter: nda,
        code: code.map((code) => encodeURI(`${code.system}|${code.id}`)).join(','),
        minDate: startDate ?? '',
        maxDate: endDate ?? '',
        rowStatus: validatedStatus,
        executiveUnits: executiveUnits.map((unit) => unit.id),
        encounterStatus: encounterStatus.map((status) => status.id)
      })
    } else {
      observationResp = await fetchObservation({ size: 0, _list: [cohortId], rowStatus: false })
    }
    const count = observationResp.data.resourceType === 'Bundle' ? observationResp.data.total : 0

    return count
  } catch (error) {
    console.error('Erreur lors de fetchObservationCount', error)
    throw error
  }
}

const fetchQuestionnaireResponseCount = async (cohortId: string) => {
  try {
    const res = await fetchForms({ size: 0, _list: [cohortId] })
    return getApiResponseResourceOrThrow(res).total
  } catch (error) {
    console.error('Erreur lors de fetchQuestionnaireResponseCount', error)
    throw error
  }
}

export const fetchQuestionnaireResponseCountDetails = async (cohortId: string) => {
  try {
    const count = await Promise.all(
      (getConfig().features.questionnaires.defaultFilterFormNames ?? []).map(async (formName) => {
        const res = await fetchForms({ size: 0, _list: [cohortId], formName })
        return getApiResponseResourceOrThrow(res).total
      })
    )
    return count
  } catch (error) {
    console.error('Erreur lors de fetchQuestionnaireResponseCount', error)
    throw error
  }
}

export const fetchResourceCount2 = async (cohortId: string, resourceType: ResourceType, fhirFilter?: any) => {
  try {
    const filters = await mapRequestParamsToSearchCriteria(fhirFilter?.filter ?? '', resourceType)
    const fetchers = {
      [ResourceType.PATIENT]: fetchPatientCount,
      [ResourceType.CONDITION]: fetchConditionCount,
      [ResourceType.PROCEDURE]: fetchProcedureCount,
      [ResourceType.CLAIM]: fetchClaimCount,
      [ResourceType.DOCUMENTS]: fetchDocumentsCount,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [ResourceType.MEDICATION_REQUEST]: (cohortId: string, filters: any) =>
        fetchMedicationCount(cohortId, ResourceType.MEDICATION_REQUEST, filters),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [ResourceType.MEDICATION_ADMINISTRATION]: (cohortId: string, filters: any) =>
        fetchMedicationCount(cohortId, ResourceType.MEDICATION_ADMINISTRATION, filters),
      [ResourceType.OBSERVATION]: fetchObservationCount,
      [ResourceType.IMAGING]: fetchImagingCount,
      [ResourceType.QUESTIONNAIRE_RESPONSE]: fetchQuestionnaireResponseCount
    }

    const fetcher = fetchers[resourceType as keyof typeof fetchers]

    return (await fetcher(cohortId, filters)) ?? 0
  } catch (error) {
    console.error('Erreur lors du fetch du count de la ressource', error)
    throw error
  }
}

export const getResourceType = (tableName: string): ResourceType => {
  const resourceType = {
    imaging_study: ResourceType.IMAGING,
    drug_exposure_administration: ResourceType.MEDICATION_ADMINISTRATION,
    measurement: ResourceType.OBSERVATION,
    imaging_series: ResourceType.UNKNOWN,
    condition_occurrence: ResourceType.CONDITION,
    iris: ResourceType.UNKNOWN,
    visit_detail: ResourceType.UNKNOWN,
    person: ResourceType.PATIENT,
    note: ResourceType.DOCUMENTS,
    note_legacy: ResourceType.DOCUMENTS,
    fact_relationship: ResourceType.UNKNOWN,
    care_site: ResourceType.UNKNOWN,
    visit_occurrence: ResourceType.UNKNOWN,
    cost: ResourceType.CLAIM,
    procedure_occurrence: ResourceType.PROCEDURE,
    drug_exposure_prescription: ResourceType.MEDICATION_REQUEST,
    QuestionnaireResponse: ResourceType.QUESTIONNAIRE_RESPONSE
  }[tableName]

  return resourceType ?? ResourceType.UNKNOWN
}

export const getExportTableLabel = (tableName: string) => {
  const tableLabel = {
    imaging_study: 'Fait - Imagerie - Étude',
    drug_exposure_administration: 'Fait - Médicaments - Administration',
    measurement: 'Fait - Biologie',
    imaging_series: 'Fait - Imagerie - Séries',
    condition_occurrence: 'Fait - PMSI - Diagnostics',
    care_site: 'Structure hospitalière',
    iris: 'Zone géographique',
    visit_detail: 'Détail de prise en charge',
    person: 'Patient',
    note: 'Fait - Documents cliniques',
    note_legacy: 'Fait - Documents cliniques',
    fact_relationship: 'Référentiel',
    visit_occurrence: 'Prise en charge',
    cost: 'Fait - PMSI - GHM',
    procedure_occurrence: 'Fait - PMSI - Actes',
    drug_exposure_prescription: 'Fait - Médicaments - Prescription',
    QuestionnaireResponse: 'Formulaires'
  }[tableName]
  return tableLabel ?? '-'
}

export const sortTables = (tables: TableInfo[]): TableInfo[] => {
  return tables.sort((a, b) => {
    if (a.name === 'person') return -1
    if (b.name === 'person') return 1
    return a.name.localeCompare(b.name)
  })
}
