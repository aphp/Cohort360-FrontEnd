import { removeFilter } from 'utils/filters'
import { useReducer, Reducer, ReducerState } from 'react'
import {
  ActionTypes,
  SearchCriterias,
  ActionFilters,
  Direction,
  Order,
  SearchByTypes,
  PatientsFilters,
  PMSIFilters,
  MedicationFilters,
  BiologyFilters,
  PatientDocumentsFilters,
  AllDocumentsFilters,
  OrderBy,
  FilterKeys,
  FilterValue,
  CohortsFilters
} from 'types/searchCriterias'
import { CohortsType } from 'types/cohorts'

export const initCohortsSearchCriterias: SearchCriterias<CohortsFilters> = {
  orderBy: {
    orderBy: Order.MODIFIED,
    orderDirection: Direction.DESC
  },
  searchInput: '',
  filters: {
    status: [],
    startDate: null,
    endDate: null,
    favorite: CohortsType.ALL,
    minPatients: null,
    maxPatients: null
  }
}

export const initSearchPatientsSearchCriterias: SearchCriterias<null> = {
  orderBy: {
    orderBy: Order.FAMILY,
    orderDirection: Direction.ASC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: null
}

export const initPatientsSearchCriterias: SearchCriterias<PatientsFilters> = {
  orderBy: {
    orderBy: Order.FAMILY,
    orderDirection: Direction.ASC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    genders: [],
    birthdatesRanges: [null, null],
    vitalStatuses: []
  }
}

export const initPmsiSearchCriterias: SearchCriterias<PMSIFilters> = {
  orderBy: {
    orderBy: Order.DATE,
    orderDirection: Direction.DESC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    code: '',
    nda: '',
    source: '',
    diagnosticTypes: [],
    startDate: null,
    endDate: null,
    executiveUnits: []
  }
}

export const initMedSearchCriterias: SearchCriterias<MedicationFilters> = {
  orderBy: {
    orderBy: Order.PERIOD_START,
    orderDirection: Direction.DESC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    nda: '',
    startDate: null,
    endDate: null,
    executiveUnits: [],
    administrationRoutes: [],
    prescriptionTypes: []
  }
}

export const initBioSearchCriterias: SearchCriterias<BiologyFilters> = {
  orderBy: {
    orderBy: Order.DATE,
    orderDirection: Direction.ASC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    validatedStatus: true,
    nda: '',
    loinc: '',
    anabio: '',
    startDate: null,
    endDate: null,
    executiveUnits: []
  }
}

export const initPatientDocsSearchCriterias: SearchCriterias<PatientDocumentsFilters> = {
  orderBy: {
    orderBy: Order.DATE,
    orderDirection: Direction.DESC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    nda: '',
    docTypes: [],
    onlyPdfAvailable: true,
    startDate: null,
    endDate: null,
    executiveUnits: []
  }
}

export const initAllDocsSearchCriterias: SearchCriterias<AllDocumentsFilters> = {
  orderBy: {
    orderBy: Order.DATE,
    orderDirection: Direction.DESC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    ipp: '',
    nda: '',
    docTypes: [],
    onlyPdfAvailable: true,
    startDate: null,
    endDate: null,
    executiveUnits: []
  }
}

const searchCriteriasReducer = <F>(
  initState: () => SearchCriterias<F>
): ((state: SearchCriterias<F> | undefined, action: ActionFilters<F>) => SearchCriterias<F>) => {
  return (state: SearchCriterias<F> = initState(), action: ActionFilters<F>): SearchCriterias<F> => {
    switch (action.type) {
      case ActionTypes.CHANGE_ORDER_BY:
        return { ...state, orderBy: action.payload }
      case ActionTypes.CHANGE_SEARCH_INPUT:
        return { ...state, searchInput: action.payload }
      case ActionTypes.CHANGE_SEARCH_BY:
        return { ...state, searchBy: action.payload }
      case ActionTypes.ADD_FILTERS:
        return { ...state, filters: action.payload }
      case ActionTypes.REMOVE_FILTER:
        return { ...state, filters: removeFilter<F>(action.payload.key, action.payload.value, state.filters) }
      case ActionTypes.REMOVE_SEARCH_CRITERIAS:
        return initState()
      default:
        return state
    }
  }
}

type DispatchActions<F> = {
  changeOrderBy: (orderBy: OrderBy) => void
  changeSearchInput: (searchInput: string) => void
  changeSearchBy: (searchBy: SearchByTypes) => void
  addFilters: (filters: F) => void
  removeFilter: (key: FilterKeys, value: FilterValue) => void
  removeSearchCriterias: () => void
}

const useSearchCriterias = <F>(
  initState: SearchCriterias<F>
): [ReducerState<Reducer<SearchCriterias<F>, ActionFilters<F>>>, DispatchActions<F>] => {
  const [state, dispatch] = useReducer<Reducer<SearchCriterias<F>, ActionFilters<F>>>(
    searchCriteriasReducer<F>(() => initState),
    initState
  )
  return [
    state,
    {
      changeOrderBy: (orderBy: OrderBy) => dispatch({ type: ActionTypes.CHANGE_ORDER_BY, payload: orderBy }),
      changeSearchInput: (searchInput: string) =>
        dispatch({ type: ActionTypes.CHANGE_SEARCH_INPUT, payload: searchInput }),
      changeSearchBy: (searchBy: SearchByTypes) => dispatch({ type: ActionTypes.CHANGE_SEARCH_BY, payload: searchBy }),
      addFilters: (filters: F) => dispatch({ type: ActionTypes.ADD_FILTERS, payload: filters }),
      removeFilter: (key: FilterKeys, value: FilterValue) =>
        dispatch({ type: ActionTypes.REMOVE_FILTER, payload: { key, value } }),
      removeSearchCriterias: () => dispatch({ type: ActionTypes.REMOVE_SEARCH_CRITERIAS, payload: null })
    }
  ]
}

export default useSearchCriterias
