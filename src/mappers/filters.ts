import { RessourceType } from 'types/requestCriterias'
import { GenericFilter, PMSIFilters, ScopeTreeRow, SimpleCodeType } from 'types'
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
  AllDocumentsFilters,
  CohortsFilters,
  BiologyFilters,
  ImagingFilters,
  MedicationFilters
} from 'types/searchCriterias'
import allDocTypesList from 'assets/docTypes.json'
import {
  convertDurationToString,
  convertDurationToTimestamp,
  convertStringToDuration,
  convertTimestampToDuration
} from 'utils/age'

enum RequestParamsKeys {
  GENDER = 'gender',
  AGE_MONTH = 'age-month',
  AGE_DAY = 'age-day',
  DECEASED = 'deceased',
  NDA = 'nda',
  IPP = 'ipp',
  DOC_TYPES = 'docTypes',
  EXECUTIVE_UNITS = 'executiveUnits',
  ONLY_PDF_AVAILABLE = 'onlyPdfAvailable',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  STATUS = 'status',
  FAVORITE = 'favorite',
  MIN_PATIENTS = 'minPatients',
  MAX_PATIENTS = 'maxPatients',
  ANABIO = 'anabio',
  LOINC = 'loinc',
  VALIDATED_STATUS = 'validatedStatus',
  MODALITY = 'modality',
  CODE = 'code',
  DIAGNOSTIC_TYPES = 'diagnosticTypes',
  ADMINISTRATION_ROUTES = 'administrationRoutes',
  PRESCRIPTION_TYPES = 'prescriptionTypes'
}

const mapFiltersFromRequestParams = (parameters: URLSearchParams, type: RessourceType): Filters => {
  const genders =
    parameters
      .get(RequestParamsKeys.GENDER)
      ?.split(',')
      ?.map((code) => mapGenderCodesToGenderStatus(code as GenderCodes)) || []
  const vitalStatuses =
    parameters
      .get(RequestParamsKeys.DECEASED)
      ?.split(',')
      ?.map((bool) => (bool === 'true' ? VitalStatus.DECEASED : VitalStatus.ALIVE)) || []
  const birthdatesRanges =
    parameters.getAll(RequestParamsKeys.AGE_DAY).length > 0
      ? mapBirthdatesRangesFromRequestParams(RequestParamsKeys.AGE_DAY, parameters)
      : mapBirthdatesRangesFromRequestParams(RequestParamsKeys.AGE_MONTH, parameters)
  const nda = parameters.get(RequestParamsKeys.NDA) || ''
  const ipp = parameters.get(RequestParamsKeys.IPP) || ''
  const docTypes =
    (allDocTypesList.docTypes as SimpleCodeType[]).filter((docType) =>
      parameters.get(RequestParamsKeys.DOC_TYPES)?.split(',').includes(docType.code)
    ) || []
  const onlyPdfAvailable = parameters.get(RequestParamsKeys.ONLY_PDF_AVAILABLE) === 'true'
  const startDate =
    parameters.get(RequestParamsKeys.START_DATE) === 'null' ? null : parameters.get(RequestParamsKeys.START_DATE)
  const endDate =
    parameters.get(RequestParamsKeys.END_DATE) === 'null' ? null : parameters.get(RequestParamsKeys.END_DATE)
  const executiveUnits =
    parameters
      .get(RequestParamsKeys.EXECUTIVE_UNITS)
      ?.split(',')
      .map(
        (elem) =>
          ({
            id: elem
          } as ScopeTreeRow)
      ) || []
  if (type === RessourceType.PATIENT) return { genders, vitalStatuses, birthdatesRanges }
  return {
    nda,
    ipp,
    docTypes,
    onlyPdfAvailable,
    startDate,
    endDate,
    executiveUnits
  }
}

export const mapRequestParamsToSearchCriteria = (
  filtersString: string,
  type: RessourceType
): SearchCriterias<Filters> => {
  const parameters = new URLSearchParams(filtersString)
  const [searchBy, searchInput] = mapSearchByAndSearchInputFromRequestParams(parameters)
  const filters = mapFiltersFromRequestParams(parameters, type)
  return {
    searchBy,
    searchInput,
    orderBy: { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC },
    filters
  }
}

export const mapSearchCriteriasToRequestParams = (searchCriterias: SearchCriterias<Filters>, deidentified: boolean) => {
  let requestParams = ''
  const { searchBy, searchInput, filters } = searchCriterias
  const searchParams = searchBy ? mapSearchByAndSearchInputToRequestParams(searchBy, searchInput) : ''
  const { genders, vitalStatuses, birthdatesRanges } = filters as PatientsFilters
  const { docTypes, onlyPdfAvailable, ipp } = filters as AllDocumentsFilters
  const { nda, startDate, endDate, executiveUnits } = filters as GenericFilter
  const { favorite, minPatients, maxPatients, status } = filters as CohortsFilters
  const { anabio, loinc, validatedStatus } = filters as BiologyFilters
  const { modality } = filters as ImagingFilters
  const { code, diagnosticTypes } = filters as PMSIFilters
  const { administrationRoutes, prescriptionTypes } = filters as MedicationFilters
  const minBirthdate = convertDurationToTimestamp(convertStringToDuration(birthdatesRanges?.[0]), deidentified)
  const maxBirthdate = convertDurationToTimestamp(convertStringToDuration(birthdatesRanges?.[1]), deidentified)

  if (searchParams) requestParams += searchParams
  if (vitalStatuses && vitalStatuses.length > 0)
    requestParams += `${RequestParamsKeys.DECEASED}=${vitalStatuses.map((status) => status === VitalStatus.DECEASED)}&`
  if (genders && genders.length > 0)
    requestParams += `${RequestParamsKeys.GENDER}=${genders.map(mapGenderStatusToGenderCodes)}&`
  if (minBirthdate && deidentified) requestParams += `${RequestParamsKeys.AGE_MONTH}=ge${minBirthdate}&`
  if (minBirthdate && !deidentified) requestParams += `${RequestParamsKeys.AGE_DAY}=ge${minBirthdate}&`
  if (maxBirthdate && deidentified) requestParams += `${RequestParamsKeys.AGE_MONTH}=le${maxBirthdate}&`
  if (maxBirthdate && !deidentified) requestParams += `${RequestParamsKeys.AGE_DAY}=le${maxBirthdate}&`
  if (docTypes && docTypes.length > 0)
    requestParams += `${RequestParamsKeys.DOC_TYPES}=${docTypes.map((codeType) => codeType.code)}&`
  if (onlyPdfAvailable) requestParams += `${RequestParamsKeys.ONLY_PDF_AVAILABLE}=${onlyPdfAvailable}&`
  if (nda) requestParams += `${RequestParamsKeys.NDA}=${nda}&`
  if (ipp) requestParams += `${RequestParamsKeys.IPP}=${ipp}&`
  if (startDate) requestParams += `${RequestParamsKeys.START_DATE}=${startDate}&`
  if (endDate) requestParams += `${RequestParamsKeys.END_DATE}=${endDate}&`
  if (executiveUnits && executiveUnits.length > 0)
    requestParams += `${RequestParamsKeys.EXECUTIVE_UNITS}=${executiveUnits.map((scopeTreeRow) => scopeTreeRow.id)}&`
  if (favorite) requestParams += `${RequestParamsKeys.FAVORITE}=${favorite}&`
  if (minPatients) requestParams += `${RequestParamsKeys.MIN_PATIENTS}=${minPatients}&`
  if (maxPatients) requestParams += `${RequestParamsKeys.MAX_PATIENTS}=${maxPatients}&`
  if (status) requestParams += `${RequestParamsKeys.STATUS}=${status.map((valueSet) => valueSet.code)}&`
  if (anabio) requestParams += `${RequestParamsKeys.ANABIO}=${anabio}&`
  if (loinc) requestParams += `${RequestParamsKeys.LOINC}=${loinc}&`
  if (validatedStatus) requestParams += `${RequestParamsKeys.VALIDATED_STATUS}=${validatedStatus}&`
  if (modality) requestParams += `${RequestParamsKeys.MODALITY}=${modality.map((labelObject) => labelObject.id)}&`
  if (code) requestParams += `${RequestParamsKeys.CODE}=${code}&`
  if (diagnosticTypes)
    requestParams += `${RequestParamsKeys.DIAGNOSTIC_TYPES}=${diagnosticTypes.map((labelObject) => labelObject.id)}&`
  if (administrationRoutes)
    requestParams += `${RequestParamsKeys.ADMINISTRATION_ROUTES}=${administrationRoutes.map(
      (labelObject) => labelObject.id
    )}&`
  if (prescriptionTypes)
    requestParams += `${RequestParamsKeys.PRESCRIPTION_TYPES}=${prescriptionTypes.map(
      (labelObject) => labelObject.id
    )}&`
  return requestParams
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

function mapBirthdatesRangesFromRequestParams(key: RequestParamsKeys, parameters: URLSearchParams): DurationRangeType {
  const birthdatesRanges: DurationRangeType = [null, null]
  const dates = parameters.getAll(key)
  dates.forEach((date) => {
    if (date?.includes('ge')) {
      const ageMin = date?.replace('ge', '')
      birthdatesRanges[0] = convertDurationToString(
        convertTimestampToDuration(+ageMin, key === RequestParamsKeys.AGE_DAY ? false : true)
      )
    }
    if (date?.includes('le')) {
      const ageMax = date?.replace('le', '')
      birthdatesRanges[1] = convertDurationToString(
        convertTimestampToDuration(+ageMax, key === RequestParamsKeys.AGE_DAY ? false : true)
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
