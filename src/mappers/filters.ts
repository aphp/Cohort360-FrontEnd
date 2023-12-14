import { RessourceType } from 'types/requestCriterias'
import {
  AllDocumentsFilters,
  Direction,
  DurationRangeType,
  FilterKeys,
  Filters,
  GenderStatus,
  Order,
  PatientsFilters,
  SearchBy,
  SearchCriterias,
  SearchInput,
  VitalStatus
} from 'types/searchCriterias'

export function parsePatientsFiltersString(filterURLParams: URLSearchParams): PatientsFilters {
  const filters: PatientsFilters = {
    genders: [],
    birthdatesRanges: [null, null],
    vitalStatuses: []
  }

  for (const [filterName, filterValue] of filterURLParams.entries()) {
    if (filterValue === '') continue
    switch (filterName) {
      case FilterKeys.GENDERS:
        filters.genders = filterValue.split(',') as GenderStatus[]
        break
      case FilterKeys.BIRTHDATES:
        if (filterValue === ',') continue
        // eslint-disable-next-line no-case-declarations
        const [start, end] = filterValue.split(',')
        filters.birthdatesRanges = [start, end] as DurationRangeType
        break
      case FilterKeys.VITAL_STATUSES:
        filters.vitalStatuses = filterValue.split(',') as VitalStatus[]
        break
    }
  }

  return filters
}

export function parseDocumentsFiltersString(filterURLParams: URLSearchParams): AllDocumentsFilters {
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
    switch (filterName) {
      case FilterKeys.NDA:
        filters.nda = filterValue
        break
      case FilterKeys.IPP:
        filters.ipp = filterValue
        break
      case FilterKeys.DOC_TYPES:
        filters.docTypes = filterValue?.split(',').map((docType) => JSON.parse(docType)) ?? []
        break
      case FilterKeys.ONLY_PDF_AVAILABLE:
        filters.onlyPdfAvailable = filterValue === 'true'
        break
      case FilterKeys.START_DATE:
        filters.startDate = filterValue
        break
      case FilterKeys.END_DATE:
        filters.endDate = filterValue
        break
      case FilterKeys.EXECUTIVE_UNITS:
        filters.executiveUnits = filterValue?.split(',').map((executiveUnit) => JSON.parse(executiveUnit)) ?? []
        break
    }
  }

  return filters
}

export const mapStringToSearchCriteria = <T>(filtersString: string, type: RessourceType): SearchCriterias<T> => {
  const parameters = new URLSearchParams(filtersString)
  const searchBy = parameters.get('searchBy') as SearchBy
  const searchInput = parameters.get('searchInput') as SearchInput
  const filters = <T>(function () {
    switch (type) {
      case RessourceType.PATIENT:
        return parsePatientsFiltersString(parameters)
      case RessourceType.PMSI:
        return {} as Filters
      case RessourceType.MEDICATION:
        return {} as Filters
      case RessourceType.BIO_MICRO:
        return {} as Filters
      case RessourceType.DOCUMENTS:
        return parseDocumentsFiltersString(parameters)
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

export const mapObjectToString = (obj: any) => {
  let transformedString = ''
  for (const property in obj) {
    const value = obj[property as keyof Filters]
    if (Array.isArray(value)) {
      transformedString += `${property}=`
      for (const entry of value) {
        transformedString += `${entry},`
      }
      transformedString = transformedString.substring(0, transformedString.length - 1)
    } else {
      transformedString += `${property}=${value}`
    }
    transformedString += `&`
  }
  transformedString = transformedString.substring(0, transformedString.length - 1)
  return transformedString
}
