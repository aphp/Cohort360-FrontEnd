import {
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

export function parseFiltersString(filtersString: string): PatientsFilters {
  const filters: PatientsFilters = {
    genders: [],
    birthdatesRanges: [null, null],
    vitalStatuses: []
  }
  const filterPairs = filtersString.replaceAll('null', '').split('&')
  for (const filterPair of filterPairs) {
    const [filterName, filterValue] = filterPair.split('=')
    switch (filterName) {
      case FilterKeys.GENDERS:
        filters.genders = (filterValue?.split(',') ?? []) as GenderStatus[]
        break
      case FilterKeys.BIRTHDATES:
        // eslint-disable-next-line no-case-declarations
        const [start, end] = filterValue.split(',')
        filters.birthdatesRanges = [start, end] as DurationRangeType
        break
      case FilterKeys.VITAL_STATUSES:
        filters.vitalStatuses = (filterValue?.split(',') ?? []) as VitalStatus[]
        break
    }
  }

  return filters
}

export function mapStringToSearchCriteria(filtersString: string): SearchCriterias<PatientsFilters> {
  const parameters = new URLSearchParams(filtersString)

  const searchBy = parameters.get('searchBy') as SearchBy
  const searchInput = parameters.get('searchInput') as SearchInput
  const filters = parseFiltersString(filtersString)

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
