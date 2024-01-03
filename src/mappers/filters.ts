import { RessourceType } from 'types/requestCriterias'
import { ScopeTreeRow, SimpleCodeType } from 'types'
import {
  AllDocumentsFilters,
  BiologyFilters,
  CohortsFilters,
  Direction,
  DurationRangeType,
  FilterKeys,
  Filters,
  GenderCodes,
  GenderStatus,
  ImagingFilters,
  MedicationFilters,
  Order,
  PatientsFilters,
  PatientDocumentsFilters,
  PMSIFilters,
  SearchBy,
  SearchCriterias,
  SearchInput,
  VitalStatus,
  SearchByTypes
} from 'types/searchCriterias'
import allDocTypesList from 'assets/docTypes.json'
import moment from 'moment'
import { convertDurationToString, convertTimestampToDuration, substructAgeString } from 'utils/age'

export function parsePatientsFiltersRequestParams(filterURLParams: URLSearchParams): PatientsFilters {
  const filters: PatientsFilters = {
    genders: [],
    birthdatesRanges: [null, null],
    vitalStatuses: [VitalStatus.ALL]
  }

  for (const [filterName, filterValue] of filterURLParams.entries()) {
    console.log('testParsing', filterName, filterValue)
    if (filterValue === '') continue
    switch (filterName) {
      case 'gender':
        filters.genders = filterValue.split(',').map((code) => genderCodesToGenderStatus(code as GenderCodes))
        break
      case 'age-month':
      case 'age-day':
        if (filterValue?.includes('ge')) {
          const ageMin = filterValue?.replace('ge', '')
          filters.birthdatesRanges[0] = convertDurationToString(convertTimestampToDuration(+ageMin))
        } else if (filterValue?.includes('le')) {
          const ageMax = filterValue?.replace('le', '')
          filters.birthdatesRanges[1] = convertDurationToString(convertTimestampToDuration(+ageMax))
        }
        break
      case 'deceased':
        filters.vitalStatuses = filterValue === 'true' ? [VitalStatus.DECEASED] : [VitalStatus.ALIVE]
        break
    }
  }

  return filters
}

export function parseDocumentsFiltersRequestParams(filterURLParams: URLSearchParams): AllDocumentsFilters {
  const filters: AllDocumentsFilters = {
    nda: '',
    ipp: '',
    docTypes: [],
    onlyPdfAvailable: false,
    startDate: '',
    endDate: '',
    executiveUnits: []
  }

  for (const [filterName, filterValue] of filterURLParams.entries()) {
    if (filterValue === '') continue
    switch (filterName) {
      case FilterKeys.NDA:
        filters.nda = filterValue
        break
      case FilterKeys.IPP:
        filters.ipp = filterValue
        break
      case FilterKeys.DOC_TYPES:
        filters.docTypes = (allDocTypesList.docTypes as SimpleCodeType[]).filter((docType) =>
          filterValue.split(',').includes(docType.code)
        )
        break
      case FilterKeys.ONLY_PDF_AVAILABLE:
        filters.onlyPdfAvailable = filterValue === 'true'
        break
      case FilterKeys.START_DATE:
        filters.startDate = filterValue === 'null' ? null : filterValue
        break
      case FilterKeys.END_DATE:
        filters.endDate = filterValue === 'null' ? null : filterValue
        break
      case FilterKeys.EXECUTIVE_UNITS:
        filters.executiveUnits =
          filterValue.split(',').map(
            (filter) =>
              ({
                id: filter
              } as ScopeTreeRow)
          ) ?? []
        break
    }
  }

  return filters
}

export const mapRequestParamsToSearchCriteria = <T>(filtersString: string, type: RessourceType): SearchCriterias<T> => {
  const parameters = new URLSearchParams(filtersString)
  const searchBy = parameters.get('searchBy') as SearchBy
  const searchInput = parameters.get('searchInput') as SearchInput
  const filters = <T>(function () {
    switch (type) {
      case RessourceType.PATIENT:
        return parsePatientsFiltersRequestParams(parameters)
      case RessourceType.PMSI:
        return {} as Filters
      case RessourceType.MEDICATION:
        return {} as Filters
      case RessourceType.BIO_MICRO:
        return {} as Filters
      case RessourceType.DOCUMENTS:
        return parseDocumentsFiltersRequestParams(parameters)
      case RessourceType.IMAGING:
        return {} as T
    }
  })()

  return {
    searchBy,
    searchInput,
    orderBy: { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC },
    filters
  }
}

function genderStatusToGenderCodes(status: GenderStatus): GenderCodes {
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

function genderCodesToGenderStatus(code: GenderCodes): GenderStatus {
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

const isPatientsFilter = (filters: Filters): filters is PatientsFilters => {
  return 'genders' in filters && 'birthdatesRanges' in filters && 'vitalStatuses' in filters
}

const isPMSIFilters = (filters: Filters): filters is PMSIFilters => {
  return 'diagnosticTypes' in filters && 'code' in filters && 'source' in filters
}

const isMedicationFilters = (filters: Filters): filters is MedicationFilters => {
  return 'prescriptionTypes' in filters && 'administrationRoutes' in filters
}

const isBiologyFilters = (filters: Filters): filters is BiologyFilters => {
  return 'loinc' in filters && 'anabio' in filters && 'validatedStatus' in filters
}

const isImagingFilters = (filters: Filters): filters is ImagingFilters => {
  return 'modality' in filters
}

const isPatientDocumentsFilters = (filters: Filters): filters is PatientDocumentsFilters => {
  return 'docTypes' in filters && 'onlyPdfAvailable' in filters
}

const isAllDocumentsFilters = (filters: Filters): filters is AllDocumentsFilters => {
  return isPatientDocumentsFilters(filters) && 'ipp' in filters
}

const isCohortsFilters = (filters: Filters): filters is CohortsFilters => {
  return 'status' in filters && 'favorite' in filters && 'minPatients' in filters && 'maxPatients' in filters
}

export const mapSearchCriteriasToRequestParams = (searchCriterias: SearchCriterias<Filters>, deidentified: boolean) => {
  let transformedString = ''

  let _searchInput: string | string[] = ''
  _searchInput = searchCriterias.searchInput
    .split(' ') // Split by space (= ['mot1', 'mot2' ...])
    .filter((elem: string) => elem) // Filter if you have ['mot1', '', 'mot2'] (double space)

  if (searchCriterias.searchBy === SearchByTypes.IDENTIFIER) {
    _searchInput = _searchInput.join()
    transformedString += `${searchCriterias.searchBy}=${_searchInput}&`
  } else {
    _searchInput.forEach((input) => (transformedString += `${searchCriterias.searchBy}=${input}&`))
  }

  const filters = searchCriterias.filters

  if (isPatientsFilter(filters)) {
    transformedString += filters.genders.length ? `gender=${filters.genders.map(genderStatusToGenderCodes)}&` : ''
    transformedString +=
      filters.vitalStatuses.length === 1 ? `deceased=${filters.vitalStatuses[0] === VitalStatus.DECEASED}&` : ''

    const birthdates: [string, string] = [
      moment(substructAgeString(filters?.birthdatesRanges?.[0] || '')).format('MM/DD/YYYY'),
      moment(substructAgeString(filters?.birthdatesRanges?.[1] || '')).format('MM/DD/YYYY')
    ]
    const minBirthdate = birthdates && Math.abs(moment(birthdates[0]).diff(moment(), deidentified ? 'months' : 'days'))
    const maxBirthdate = birthdates && Math.abs(moment(birthdates[1]).diff(moment(), deidentified ? 'months' : 'days'))
    if (minBirthdate) transformedString += `${deidentified ? 'age-month' : 'age-day'}=ge${minBirthdate}&`
    if (maxBirthdate) transformedString += `${deidentified ? 'age-month' : 'age-day'}=le${maxBirthdate}&`
  } else if (isCohortsFilters(filters)) {
    transformedString += filters.status ? `status=${filters.status.map((valueSet) => valueSet.code)}&` : ''
    transformedString += filters.favorite ? `favorite=${filters.favorite}&` : ''
    transformedString += filters.minPatients ? `minPatients=${filters.minPatients}&` : ''
    transformedString += filters.maxPatients ? `maxPatients=${filters.maxPatients}&` : ''
  } else {
    transformedString += filters.nda ? `nda=${filters.nda}&` : ''
    transformedString += filters.startDate ? `startDate=${filters.startDate}&` : ''
    transformedString += filters.endDate ? `endDate=${filters.endDate}&` : ''
    transformedString += filters.executiveUnits
      ? `executiveUnits=${filters.executiveUnits.map((scopeTreeRow) => scopeTreeRow.id)}&`
      : ''
    if (isImagingFilters(filters) || isAllDocumentsFilters(filters)) {
      transformedString += filters.ipp ? `ipp=${filters.ipp}&` : ''
      if (isImagingFilters(filters)) {
        transformedString += filters.modality
          ? `modality=${filters.modality.map((labelObject) => labelObject.id)}&`
          : ''
      } else {
        transformedString += filters.docTypes ? `docTypes=${filters.docTypes.map((codeType) => codeType.code)}&` : ''
        transformedString += filters.onlyPdfAvailable ? `onlyPdfAvailable=${filters.onlyPdfAvailable}&` : ''
      }
    } else if (isPMSIFilters(filters)) {
      transformedString += filters.diagnosticTypes
        ? `diagnosticTypes=${filters.diagnosticTypes.map((labelObject) => labelObject.id)}&`
        : ''
      transformedString += filters.code ? `code=${filters.code}&` : ''
      transformedString += filters.source ? `source=${filters.source}&` : ''
    } else if (isMedicationFilters(filters)) {
      transformedString += filters.prescriptionTypes
        ? `prescriptionTypes=${filters.prescriptionTypes.map((labelObject) => labelObject.id)}&`
        : ''
      transformedString += filters.administrationRoutes
        ? `administrationRoutes=${filters.administrationRoutes.map((labelObject) => labelObject.id)}&`
        : ''
    } else if (isBiologyFilters(filters)) {
      transformedString += filters.loinc ? `loinc=${filters.loinc}&` : ''
      transformedString += filters.anabio ? `anabio=${filters.anabio}&` : ''
      transformedString += filters.validatedStatus ? `validatedStatus=${filters.validatedStatus}&` : ''
    }
  }
  transformedString = transformedString.substring(0, transformedString.length - 1)
  return transformedString
}
