import { RessourceType } from 'types/requestCriterias'
import { ScopeTreeRow, SimpleCodeType } from 'types'
import {
  Direction,
  Filters,
  GenderCodes,
  GenderStatus,
  Order,
  PatientsFilters,
  SearchBy,
  SearchCriterias,
  SearchInput,
  VitalStatus,
  SearchByTypes,
  DurationRangeType,
  DocumentsFilters,
  BiologyFilters,
  ImagingFilters,
  MedicationFilters,
  PMSIFilters,
  LabelObject,
  GenericFilter
} from 'types/searchCriterias'
import allDocTypesList from 'assets/docTypes.json'
import {
  convertDurationToString,
  convertDurationToTimestamp,
  convertStringToDuration,
  convertTimestampToDuration
} from 'utils/age'
import { fetchPerimeterFromPerimeterId } from 'services/aphp/servicePatients'
import { fetchClaimCodes, fetchConditionCodes, fetchProcedureCodes } from 'services/aphp/servicePmsi'
import { fetchAnabioCodes, fetchLoincCodes } from 'services/aphp/serviceBiology'
import {
  CONDITION_HIERARCHY,
  CLAIM_HIERARCHY,
  PROCEDURE_HIERARCHY,
  CONDITION_STATUS,
  BIOLOGY_HIERARCHY_ITM_ANABIO,
  BIOLOGY_HIERARCHY_ITM_LOINC
} from '../constants'
import services from 'services/aphp'

enum PatientsParamsKeys {
  GENDERS = 'gender',
  DATE_DEINDENTIFIED = 'age-month',
  DATE_IDENTIFIED = 'age-day',
  VITAL_STATUS = 'deceased'
}

enum DocumentsParamsKeys {
  IPP = 'subject.identifier',
  DOC_TYPES = 'type',
  ONLY_PDF_AVAILABLE = 'onlyPdfAvailable',
  NDA = 'encounter.identifier',
  DATE = 'date',
  EXECUTIVE_UNITS = 'encounter.encounter-care-site'
}

enum ConditionParamsKeys {
  NDA = 'encounter.identifier',
  CODE = 'code',
  DIAGNOSTIC_TYPES = 'orbis-status',
  DATE = 'recorded-date',
  EXECUTIVE_UNITS = 'encounter.encounter-care-site'
}

enum ProcedureParamsKeys {
  NDA = 'encounter.identifier',
  CODE = 'code',
  SOURCE = 'source',
  DATE = 'recorded-date',
  EXECUTIVE_UNITS = 'encounter.encounter-care-site'
}

enum ClaimParamsKeys {
  NDA = 'encounter.identifier',
  CODE = 'diagnosis',
  DATE = 'created',
  EXECUTIVE_UNITS = 'encounter.encounter-care-site'
}

enum PrescriptionParamsKeys {
  NDA = 'encounter.identifier',
  PRESCRIPTION_TYPES = 'category',
  DATE = 'validity-period-start',
  EXECUTIVE_UNITS = 'encounter.encounter-care-site'
}

enum AdministrationParamsKeys {
  NDA = 'context.identifier',
  ADMINISTRATION_ROUTES = 'dosage-route',
  DATE = 'effective-time',
  EXECUTIVE_UNITS = 'context.encounter-care-site'
}

enum ObservationParamsKeys {
  NDA = 'encounter.identifier',
  ANABIO_LOINC = 'code',
  VALIDATED_STATUS = 'status',
  DATE = 'date',
  EXECUTIVE_UNITS = 'context.encounter-care-site'
}

enum ImagingParamsKeys {
  MODALITY = 'modality',
  NDA = 'encounter.identifier',
  DATE = 'date',
  EXECUTIVE_UNITS = 'context.encounter-care-site'
}

const getGenericKeyFromRessourceType = (type: RessourceType, key: 'NDA' | 'DATE' | 'EXECUTIVE_UNITS') => {
  switch (type) {
    case RessourceType.DOCUMENTS:
      return DocumentsParamsKeys[key]
    case RessourceType.CONDITION:
      return ConditionParamsKeys[key]
    case RessourceType.PROCEDURE:
      return ProcedureParamsKeys[key]
    case RessourceType.CLAIM:
      return ClaimParamsKeys[key]
    case RessourceType.MEDICATION_REQUEST:
      return PrescriptionParamsKeys[key]
    case RessourceType.MEDICATION_ADMINISTRATION:
      return AdministrationParamsKeys[key]
    case RessourceType.OBSERVATION:
      return ObservationParamsKeys[key]
    case RessourceType.IMAGING:
      return ImagingParamsKeys[key]
  }
  return ''
}

const mapGenericFromRequestParams = async (parameters: URLSearchParams, type: RessourceType) => {
  const nda = parameters.get(getGenericKeyFromRessourceType(type, 'NDA')) || ''
  const dates = parameters.getAll(getGenericKeyFromRessourceType(type, 'DATE'))
  const startDate = dates.find((e) => e.includes('ge'))?.split('ge')?.[1] || null
  const endDate = dates.find((e) => e.includes('le'))?.split('le')?.[1] || null
  const executiveUnitsParams = parameters.get(getGenericKeyFromRessourceType(type, 'EXECUTIVE_UNITS'))
  let executiveUnits: ScopeTreeRow[] = []
  if (executiveUnitsParams) {
    executiveUnits = await Promise.all<ScopeTreeRow>(
      executiveUnitsParams.split(',').map(async (unit) => {
        try {
          const fetchedData = await fetchPerimeterFromPerimeterId(unit)
          return fetchedData
        } catch (error) {
          console.error('Erreur lors de la récupération des données', error)
          return unit
        }
      })
    )
  }
  return { nda, startDate, endDate, executiveUnits }
}

const mapPatientFromRequestParams = (parameters: URLSearchParams) => {
  const genders =
    parameters
      .get(PatientsParamsKeys.GENDERS)
      ?.split(',')
      ?.map((code) => mapGenderCodesToGenderStatus(code as GenderCodes)) || []
  const vitalStatuses =
    parameters
      .get(PatientsParamsKeys.VITAL_STATUS)
      ?.split(',')
      ?.map((bool) => (bool === 'true' ? VitalStatus.DECEASED : VitalStatus.ALIVE)) || []
  const birthdatesRanges =
    parameters.getAll(PatientsParamsKeys.DATE_IDENTIFIED).length > 0
      ? mapBirthdatesRangesFromRequestParams(PatientsParamsKeys.DATE_IDENTIFIED, parameters)
      : mapBirthdatesRangesFromRequestParams(PatientsParamsKeys.DATE_DEINDENTIFIED, parameters)
  return { genders, vitalStatuses, birthdatesRanges }
}

const mapDocumentsFromRequestParams = async (parameters: URLSearchParams) => {
  const docTypes =
    (allDocTypesList.docTypes as SimpleCodeType[]).filter((docType) =>
      parameters.get(DocumentsParamsKeys.DOC_TYPES)?.split(',').includes(docType.code)
    ) || []
  const ipp = parameters.get(DocumentsParamsKeys.IPP) || ''
  const onlyPdfAvailable = true
  const { nda, startDate, endDate, executiveUnits } = await mapGenericFromRequestParams(
    parameters,
    RessourceType.DOCUMENTS
  )
  return { docTypes, ipp, onlyPdfAvailable, nda, startDate, endDate, executiveUnits }
}

const mapConditionFromRequestParams = async (parameters: URLSearchParams) => {
  const codeIds =
    decodeURIComponent(parameters.get(ConditionParamsKeys.CODE) || '')
      ?.split(',')
      ?.map((e) => e.split('|')?.[1])
      ?.join(',') || ''
  const fetchCodesResults = await fetchConditionCodes(codeIds, true)
  const code = fetchCodesResults.map((e) => {
    return { id: e.id, label: e.label }
  })
  const diagnosticTypesParams = parameters.get(ConditionParamsKeys.DIAGNOSTIC_TYPES)
  let diagnosticTypes: LabelObject[] = []
  if (diagnosticTypesParams) {
    const allDiagnosticTypes = await services.cohortCreation.fetchDiagnosticTypes()
    diagnosticTypes = diagnosticTypesParams?.split(',')?.map((elem) => {
      const toParse = elem.split('|')?.[1]
      return { id: toParse, label: allDiagnosticTypes.find((diag) => diag.id === toParse)?.label || '' }
    })
  }
  const { nda, startDate, endDate, executiveUnits } = await mapGenericFromRequestParams(
    parameters,
    RessourceType.CONDITION
  )
  return { code, diagnosticTypes, nda, startDate, endDate, executiveUnits }
}

const mapProcedureFromRequestParams = async (parameters: URLSearchParams) => {
  const codeIds =
    decodeURIComponent(parameters.get(ProcedureParamsKeys.CODE) || '')
      ?.split(',')
      ?.map((e) => e.split('|')?.[1])
      ?.join(',') || ''
  const fetchCodesResults = await fetchProcedureCodes(codeIds, true)
  const code = fetchCodesResults.map((e) => {
    return { id: e.id, label: e.label }
  })
  const source = parameters.get(ProcedureParamsKeys.SOURCE) || ''
  const { nda, startDate, endDate, executiveUnits } = await mapGenericFromRequestParams(
    parameters,
    RessourceType.PROCEDURE
  )
  return { code, source, nda, startDate, endDate, executiveUnits }
}

const mapClaimFromRequestParams = async (parameters: URLSearchParams) => {
  const codeIds =
    decodeURIComponent(parameters.get(ClaimParamsKeys.CODE) || '')
      ?.split(',')
      ?.map((e) => e.split('|')?.[1])
      ?.join(',') || ''
  const fetchCodesResults = await fetchClaimCodes(codeIds, true)
  const code = fetchCodesResults.map((e) => {
    return { id: e.id, label: e.label }
  })
  const { nda, startDate, endDate, executiveUnits } = await mapGenericFromRequestParams(parameters, RessourceType.CLAIM)
  return { code, nda, startDate, endDate, executiveUnits }
}

const mapPrescriptionFromRequestParams = async (parameters: URLSearchParams) => {
  const prescriptionTypesParam = parameters.get(PrescriptionParamsKeys.PRESCRIPTION_TYPES)
  let prescriptionTypes: LabelObject[] = []
  if (prescriptionTypesParam) {
    const types = await services.cohortCreation.fetchPrescriptionTypes()
    prescriptionTypes = prescriptionTypesParam?.split(',')?.map((elem) => {
      return { id: elem, label: types.find((type) => type.id === elem)?.label || '' }
    })
  }
  const { nda, startDate, endDate, executiveUnits } = await mapGenericFromRequestParams(
    parameters,
    RessourceType.MEDICATION_REQUEST
  )
  return { prescriptionTypes, nda, startDate, endDate, executiveUnits }
}

const mapAdministrationFromRequestParams = async (parameters: URLSearchParams) => {
  const administrationRoutesParam = parameters.get(AdministrationParamsKeys.ADMINISTRATION_ROUTES)
  let administrationRoutes: LabelObject[] = []
  if (administrationRoutesParam) {
    const routes = await services.cohortCreation.fetchAdministrations()
    administrationRoutes = administrationRoutesParam?.split(',')?.map((elem) => {
      return { id: elem, label: routes.find((route) => route.id === elem)?.label || '' }
    })
  }
  const { nda, startDate, endDate, executiveUnits } = await mapGenericFromRequestParams(
    parameters,
    RessourceType.MEDICATION_ADMINISTRATION
  )
  return { administrationRoutes, nda, startDate, endDate, executiveUnits }
}

const mapBiologyFromRequestParams = async (parameters: URLSearchParams) => {
  const anabioLoinc = parameters.get(ObservationParamsKeys.ANABIO_LOINC)?.split(',') || []

  const anabioIds = anabioLoinc
    ?.filter((e) => e.includes(BIOLOGY_HIERARCHY_ITM_ANABIO))
    ?.map((e) => e.split('|')?.[1])
    ?.join(',')
  const fetchAnabioResults = await fetchAnabioCodes(anabioIds, true)
  const anabio = fetchAnabioResults.map((e) => {
    return { id: e.id, label: e.label }
  })
  const loincIds = anabioLoinc
    ?.filter((e) => e.includes(BIOLOGY_HIERARCHY_ITM_LOINC))
    ?.map((e) => e.split('|')?.[1])
    ?.join(',')
  const fetchLoincResults = await fetchLoincCodes(loincIds, true)
  const loinc = fetchLoincResults.map((e) => {
    return { id: e.id, label: e.label }
  })

  const validatedStatus = true
  const { nda, startDate, endDate, executiveUnits } = await mapGenericFromRequestParams(
    parameters,
    RessourceType.OBSERVATION
  )
  return { loinc, anabio, validatedStatus, nda, startDate, endDate, executiveUnits }
}

const mapImagingFromRequestParams = async (parameters: URLSearchParams) => {
  const modalityParams = parameters.get(ImagingParamsKeys.MODALITY)
  let modality: LabelObject[] = []
  if (modalityParams) {
    const allModalities = await services.cohortCreation.fetchModalities()
    modality = modalityParams
      ?.split('*|')?.[1]
      .split(',')
      ?.map((elem) => {
        return { id: elem, label: allModalities.find((diag) => diag.id === elem)?.label || '' }
      })
  }
  const { nda, startDate, endDate, executiveUnits } = await mapGenericFromRequestParams(
    parameters,
    RessourceType.IMAGING
  )
  return { modality, nda, startDate, endDate, executiveUnits }
}

const mapFiltersFromRequestParams = async (parameters: URLSearchParams, type: RessourceType): Promise<Filters> => {
  switch (type) {
    case RessourceType.PATIENT:
      return mapPatientFromRequestParams(parameters)
    case RessourceType.DOCUMENTS:
      return await mapDocumentsFromRequestParams(parameters)
    case RessourceType.CONDITION:
      return await mapConditionFromRequestParams(parameters)
    case RessourceType.PROCEDURE:
      return await mapProcedureFromRequestParams(parameters)
    case RessourceType.CLAIM:
      return await mapClaimFromRequestParams(parameters)
    case RessourceType.MEDICATION_REQUEST:
      return await mapPrescriptionFromRequestParams(parameters)
    case RessourceType.MEDICATION_ADMINISTRATION:
      return await mapAdministrationFromRequestParams(parameters)
    case RessourceType.IMAGING:
      return await mapImagingFromRequestParams(parameters)
  }
  return await mapBiologyFromRequestParams(parameters)
}

export const mapRequestParamsToSearchCriteria = async (
  filtersString: string,
  type: RessourceType
): Promise<SearchCriterias<Filters>> => {
  const parameters = new URLSearchParams(filtersString)
  const [searchBy, searchInput] = mapSearchByAndSearchInputFromRequestParams(parameters)
  const filters = await mapFiltersFromRequestParams(parameters, type)
  const orderBy = getDefaultOrderBy(type)
  return {
    searchBy,
    searchInput,
    orderBy: orderBy,
    filters
  }
}

const mapGenericToRequestParams = (filters: GenericFilter, type: RessourceType) => {
  const { nda, startDate, endDate, executiveUnits } = filters
  let requestParams = ''
  if (nda) requestParams += `${getGenericKeyFromRessourceType(type, 'NDA')}=${nda}&`
  if (startDate) requestParams += `${getGenericKeyFromRessourceType(type, 'DATE')}=ge${startDate}&`
  if (endDate) requestParams += `${getGenericKeyFromRessourceType(type, 'DATE')}=le${endDate}&`
  if (executiveUnits && executiveUnits.length > 0)
    requestParams += `${getGenericKeyFromRessourceType(type, 'EXECUTIVE_UNITS')}=${executiveUnits.map(
      (scopeTreeRow: ScopeTreeRow) => scopeTreeRow.id
    )}`
  return requestParams
}

const mapPatientToRequestParams = (filters: PatientsFilters, deidentified: boolean) => {
  const { genders, vitalStatuses, birthdatesRanges } = filters
  let requestParams = ''
  if (vitalStatuses && vitalStatuses.length > 0)
    requestParams += `${PatientsParamsKeys.VITAL_STATUS}=${vitalStatuses.map(
      (status) => status === VitalStatus.DECEASED
    )}&`
  if (genders && genders.length > 0)
    requestParams += `${PatientsParamsKeys.GENDERS}=${genders.map(mapGenderStatusToGenderCodes)}&`
  const minBirthdate = convertDurationToTimestamp(convertStringToDuration(birthdatesRanges?.[0]), deidentified)
  const maxBirthdate = convertDurationToTimestamp(convertStringToDuration(birthdatesRanges?.[1]), deidentified)
  if (minBirthdate && deidentified) requestParams += `${PatientsParamsKeys.DATE_DEINDENTIFIED}=ge${minBirthdate}&`
  if (minBirthdate && !deidentified) requestParams += `${PatientsParamsKeys.DATE_IDENTIFIED}=ge${minBirthdate}&`
  if (maxBirthdate && deidentified) requestParams += `${PatientsParamsKeys.DATE_DEINDENTIFIED}=le${maxBirthdate}&`
  if (maxBirthdate && !deidentified) requestParams += `${PatientsParamsKeys.DATE_IDENTIFIED}=le${maxBirthdate}&`
  return requestParams
}

const mapDocumentsToRequestParams = (filters: DocumentsFilters) => {
  const { ipp, docTypes, nda, endDate, startDate, executiveUnits } = filters
  let requestParams = ''
  if (ipp) requestParams += `${DocumentsParamsKeys.IPP}=${ipp}&`
  if (docTypes && docTypes.length > 0)
    requestParams += `${DocumentsParamsKeys.DOC_TYPES}=${docTypes.map((codeType) => codeType.code)}&`
  requestParams += mapGenericToRequestParams({ nda, startDate, endDate, executiveUnits }, RessourceType.DOCUMENTS)
  return requestParams
}

const mapConditionToRequestParams = (filters: PMSIFilters) => {
  const { diagnosticTypes, code, nda, endDate, startDate, executiveUnits } = filters
  let requestParams = ''
  if (diagnosticTypes && diagnosticTypes.length > 0) {
    const diagnosticTypesUrl = encodeURIComponent(`${CONDITION_STATUS}|`)
    const urlString = diagnosticTypes.map((elem) => diagnosticTypesUrl + elem.id).join(',')
    requestParams += `${ConditionParamsKeys.DIAGNOSTIC_TYPES}=${urlString}&`
  }
  if (code)
    requestParams += `${ConditionParamsKeys.CODE}=${code.map((e) => `${CONDITION_HIERARCHY}|${e.id}`).join(',')}`
  requestParams += mapGenericToRequestParams({ nda, startDate, endDate, executiveUnits }, RessourceType.CONDITION)
  return requestParams
}

const mapClaimToRequestParams = (filters: PMSIFilters) => {
  const { code, nda, endDate, startDate, executiveUnits } = filters
  let requestParams = ''
  if (code) requestParams += `${ClaimParamsKeys.CODE}=${code.map((e) => `${CLAIM_HIERARCHY}|${e.id}`).join(',')}`
  requestParams += mapGenericToRequestParams({ nda, startDate, endDate, executiveUnits }, RessourceType.CLAIM)
  return requestParams
}

const mapProcedureToRequestParams = (filters: PMSIFilters) => {
  const { source, code, nda, endDate, startDate, executiveUnits } = filters
  let requestParams = ''
  if (code)
    requestParams += `${ProcedureParamsKeys.CODE}=${code.map((e) => `${PROCEDURE_HIERARCHY}|${e.id}`).join(',')}`
  if (source) requestParams += `${ProcedureParamsKeys.SOURCE}=${source}&`
  requestParams += mapGenericToRequestParams({ nda, startDate, endDate, executiveUnits }, RessourceType.PROCEDURE)
  return requestParams
}

const mapPrescriptionToRequestParams = (filters: MedicationFilters) => {
  const { prescriptionTypes, nda, endDate, startDate, executiveUnits } = filters
  let requestParams = ''
  if (prescriptionTypes)
    requestParams += `${PrescriptionParamsKeys.PRESCRIPTION_TYPES}=${prescriptionTypes.map(
      (labelObject) => labelObject.id
    )}&`
  requestParams += mapGenericToRequestParams(
    { nda, startDate, endDate, executiveUnits },
    RessourceType.MEDICATION_REQUEST
  )
  return requestParams
}

const mapAdministrationToRequestParams = (filters: MedicationFilters) => {
  const { administrationRoutes, nda, endDate, startDate, executiveUnits } = filters
  let requestParams = ''
  if (administrationRoutes)
    requestParams += `${AdministrationParamsKeys.ADMINISTRATION_ROUTES}=${administrationRoutes.map(
      (labelObject) => labelObject.id
    )}&`
  requestParams += mapGenericToRequestParams(
    { nda, startDate, endDate, executiveUnits },
    RessourceType.MEDICATION_ADMINISTRATION
  )
  return requestParams
}

const mapBiologyToRequestParams = (filters: BiologyFilters) => {
  const { anabio, loinc, validatedStatus, nda, endDate, startDate, executiveUnits } = filters
  let requestParams = ''
  if (anabio || loinc) {
    requestParams += `${ObservationParamsKeys.ANABIO_LOINC}=`
    if (anabio) requestParams += anabio.map((e) => `${BIOLOGY_HIERARCHY_ITM_ANABIO}|` + e.id)
    if (anabio && loinc) requestParams += ','
    if (loinc) requestParams += loinc.map((e) => `${BIOLOGY_HIERARCHY_ITM_LOINC}|` + e.id)
    requestParams += '&'
  }
  if (validatedStatus) requestParams += `${ObservationParamsKeys.VALIDATED_STATUS}=VAL&`
  requestParams += mapGenericToRequestParams({ nda, startDate, endDate, executiveUnits }, RessourceType.OBSERVATION)
  return requestParams
}

const mapImagingToRequestParams = (filters: ImagingFilters) => {
  const { modality, nda, endDate, startDate, executiveUnits } = filters
  let requestParams = ''
  if (modality) requestParams += `${ImagingParamsKeys.MODALITY}=*|${modality.map((labelObject) => labelObject.id)}&`
  requestParams += mapGenericToRequestParams({ nda, startDate, endDate, executiveUnits }, RessourceType.IMAGING)
  return requestParams
}

export const mapSearchCriteriasToRequestParams = (
  searchCriterias: SearchCriterias<Filters>,
  type: RessourceType,
  deidentified: boolean
) => {
  const { searchBy, searchInput, filters } = searchCriterias
  const searchByParam = searchBy || SearchByTypes.TEXT
  const searchParam = searchInput ? mapSearchByAndSearchInputToRequestParams(searchByParam, searchInput) : null
  let filtersParam = searchParam ? `${searchParam}&` : ''

  switch (type) {
    case RessourceType.PATIENT:
      filtersParam += mapPatientToRequestParams(filters as PatientsFilters, deidentified)
      break
    case RessourceType.DOCUMENTS:
      filtersParam += mapDocumentsToRequestParams(filters as DocumentsFilters)
      break
    case RessourceType.CONDITION:
      filtersParam += mapConditionToRequestParams(filters as PMSIFilters)
      break

    case RessourceType.PROCEDURE:
      filtersParam += mapProcedureToRequestParams(filters as PMSIFilters)
      break
    case RessourceType.CLAIM:
      filtersParam += mapClaimToRequestParams(filters as PMSIFilters)
      break
    case RessourceType.MEDICATION_REQUEST:
      filtersParam += mapPrescriptionToRequestParams(filters as MedicationFilters)
      break
    case RessourceType.MEDICATION_ADMINISTRATION:
      filtersParam += mapAdministrationToRequestParams(filters as MedicationFilters)
      break
    case RessourceType.OBSERVATION:
      filtersParam += mapBiologyToRequestParams(filters as BiologyFilters)
      break

    case RessourceType.IMAGING:
      filtersParam += mapImagingToRequestParams(filters as ImagingFilters)
      break
  }

  return filtersParam
}

const getDefaultOrderBy = (type: RessourceType) => {
  switch (type) {
    case RessourceType.PATIENT:
      return {
        orderBy: Order.FAMILY,
        orderDirection: Direction.ASC
      }
    case RessourceType.CLAIM:
    case RessourceType.PROCEDURE:
    case RessourceType.CONDITION:
      return {
        orderBy: Order.DATE,
        orderDirection: Direction.DESC
      }
    case RessourceType.MEDICATION_REQUEST:
    case RessourceType.MEDICATION_ADMINISTRATION:
      return {
        orderBy: Order.PERIOD_START,
        orderDirection: Direction.DESC
      }
    case RessourceType.OBSERVATION:
      return {
        orderBy: Order.DATE,
        orderDirection: Direction.ASC
      }
  }
  return {
    orderBy: Order.STUDY_DATE,
    orderDirection: Direction.DESC
  }
}

const mapSearchByAndSearchInputToRequestParams = (searchBy: SearchByTypes, searchInput: SearchInput) => {
  const inputs = searchInput.split(' ').filter((elem: string) => elem)
  let params = ''

  if (searchBy === SearchByTypes.IDENTIFIER) {
    params = `${searchBy}=${inputs.join()}&`
  } else {
    inputs.forEach((input) => (params += `${searchBy}=${input}&`))
  }
  return params
}

const mapSearchByAndSearchInputFromRequestParams = (parameters: URLSearchParams): [SearchBy, SearchInput] => {
  const keysToCheck = [
    SearchByTypes.TEXT,
    SearchByTypes.FAMILY,
    SearchByTypes.GIVEN,
    SearchByTypes.IDENTIFIER,
    SearchByTypes.DESCRIPTION
  ]
  const [searchBy, searchInput] = (keysToCheck
    .map((key) => [key, parameters.getAll(key).join(' ')])
    .find(([, values]) => values) as [SearchByTypes, string]) ?? [SearchByTypes.TEXT, '']
  return [searchBy, searchInput]
}

function mapBirthdatesRangesFromRequestParams(key: PatientsParamsKeys, parameters: URLSearchParams): DurationRangeType {
  const birthdatesRanges: DurationRangeType = [null, null]
  const dates = parameters.getAll(key)
  dates.forEach((date) => {
    if (date?.includes('ge')) {
      const ageMin = date?.replace('ge', '')
      birthdatesRanges[0] = convertDurationToString(
        convertTimestampToDuration(+ageMin, key === PatientsParamsKeys.DATE_IDENTIFIED ? false : true)
      )
    }
    if (date?.includes('le')) {
      const ageMax = date?.replace('le', '')
      birthdatesRanges[1] = convertDurationToString(
        convertTimestampToDuration(+ageMax, key === PatientsParamsKeys.DATE_IDENTIFIED ? false : true)
      )
    }
  })
  return birthdatesRanges
}

function mapGenderStatusToGenderCodes(status: GenderStatus): GenderCodes {
  switch (status) {
    case GenderStatus.MALE:
      return GenderCodes.MALE
    case GenderStatus.FEMALE:
      return GenderCodes.FEMALE
    case GenderStatus.OTHER:
    case GenderStatus.OTHER_UNKNOWN:
      return GenderCodes.OTHER
    case GenderStatus.UNKNOWN:
      return GenderCodes.UNKNOWN
    default:
      return GenderCodes.NOT_SPECIFIED
  }
}

function mapGenderCodesToGenderStatus(code: GenderCodes): GenderStatus {
  switch (code) {
    case GenderCodes.MALE:
      return GenderStatus.MALE
    case GenderCodes.FEMALE:
      return GenderStatus.FEMALE
    case GenderCodes.OTHER:
      return GenderStatus.OTHER
    case GenderCodes.UNKNOWN:
      return GenderStatus.UNKNOWN
    case GenderCodes.UNDETERMINED:
    case GenderCodes.NOT_SPECIFIED:
    default:
      return GenderStatus.OTHER_UNKNOWN
  }
}
