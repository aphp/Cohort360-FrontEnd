import { useReducer, Reducer } from 'react'
import searchCriteriasReducer from 'reducers/searchCriteriasReducer'
import {
  SearchCriterias,
  ActionFilters,
  Direction,
  Order,
  SearchByTypes,
  PatientsFilters,
  PMSIFilters
} from 'types/searchCriterias'

export const initPatientsSearchCriterias: SearchCriterias<PatientsFilters> = {
  orderBy: {
    orderBy: Order.FAMILY,
    orderDirection: Direction.ASC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    genders: [],
    birthdatesRanges: ['', ''],
    vitalStatuses: []
  }
}

export const initPmsisSearchCriterias: SearchCriterias<PMSIFilters> = {
  orderBy: {
    orderBy: Order.DATE,
    orderDirection: Direction.DESC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    code: '',
    nda: '',
    diagnosticTypes: [],
    startDate: null,
    endDate: null,
    executiveUnits: []
  }
}

const useSearchCriterias = <F>(initState: SearchCriterias<F>) => {
  return useReducer<Reducer<SearchCriterias<F>, ActionFilters<F>>>(
    searchCriteriasReducer<F>(() => initState),
    initState
  )
}

export default useSearchCriterias
