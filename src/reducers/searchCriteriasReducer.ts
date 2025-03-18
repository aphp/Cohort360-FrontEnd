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
  DocumentsFilters,
  ImagingFilters,
  OrderBy,
  FilterKeys,
  FilterValue,
  CohortsFilters,
  MaternityFormFilters
} from 'types/searchCriterias'

export const initExportSearchCriterias: SearchCriterias<null> = {
  orderBy: {
    orderBy: Order.CREATED_AT,
    orderDirection: Direction.DESC
  },
  searchInput: '',
  filters: null
}

export const initCohortsSearchCriterias: SearchCriterias<CohortsFilters> = {
  orderBy: {
    orderBy: Order.MODIFIED,
    orderDirection: Direction.DESC
  },
  searchInput: '',
  filters: {
    status: [],
    durationRange: [null, null],
    favorite: [],
    minPatients: null,
    maxPatients: null
  }
}

export const initPatientsSearchCriterias = (search?: string): SearchCriterias<PatientsFilters> => ({
  orderBy: {
    orderBy: Order.FAMILY,
    orderDirection: Direction.ASC
  },
  searchInput: search ?? '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    genders: [],
    birthdatesRanges: [null, null],
    vitalStatuses: []
  }
})

export const initPmsiSearchCriterias = (search?: string): SearchCriterias<PMSIFilters> => ({
  orderBy: {
    orderBy: Order.DATE,
    orderDirection: Direction.DESC
  },
  searchInput: search ?? '',
  filters: {
    code: [],
    source: [],
    ipp: '',
    nda: '',
    diagnosticTypes: [],
    durationRange: [null, null],
    executiveUnits: [],
    encounterStatus: []
  }
})

export const initMedSearchCriterias = (search?: string): SearchCriterias<MedicationFilters> => ({
  orderBy: {
    orderBy: Order.PERIOD_START,
    orderDirection: Direction.DESC
  },
  searchInput: search ?? '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    nda: '',
    ipp: '',
    code: [],
    durationRange: [null, null],
    executiveUnits: [],
    administrationRoutes: [],
    prescriptionTypes: [],
    encounterStatus: []
  }
})

export const initBioSearchCriterias = (search?: string): SearchCriterias<BiologyFilters> => ({
  orderBy: {
    orderBy: Order.DATE,
    orderDirection: Direction.ASC
  },
  searchInput: search ?? '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    validatedStatus: true,
    nda: '',
    ipp: '',
    durationRange: [null, null],
    executiveUnits: [],
    encounterStatus: [],
    code: []
  }
})

export const initDocsSearchCriterias = (search?: string): SearchCriterias<DocumentsFilters> => ({
  orderBy: {
    orderBy: Order.DATE,
    orderDirection: Direction.DESC
  },
  searchInput: search ?? '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    ipp: '',
    nda: '',
    docStatuses: [],
    docTypes: [],
    onlyPdfAvailable: true,
    durationRange: [null, null],
    executiveUnits: [],
    encounterStatus: []
  }
})

export const initImagingCriterias = (search?: string): SearchCriterias<ImagingFilters> => ({
  orderBy: {
    orderBy: Order.STUDY_DATE,
    orderDirection: Direction.DESC
  },
  searchInput: search ?? '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    ipp: '',
    nda: '',
    durationRange: [null, null],
    executiveUnits: [],
    modality: [],
    encounterStatus: []
  }
})

export const initFormsCriterias = (search?: string): SearchCriterias<MaternityFormFilters> => ({
  orderBy: {
    orderBy: Order.AUTHORED,
    orderDirection: Direction.DESC
  },
  searchInput: search ?? '',
  filters: {
    ipp: '',
    formName: [],
    durationRange: [null, null],
    encounterStatus: [],
    executiveUnits: []
  }
})

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
      case ActionTypes.ADD_SEARCH_CRITERIAS:
        return { ...action.payload }
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
  addSearchCriterias: (searchCriterias: SearchCriterias<F>) => void
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
      removeSearchCriterias: () => dispatch({ type: ActionTypes.REMOVE_SEARCH_CRITERIAS, payload: null }),
      addSearchCriterias: (searchCriterias: SearchCriterias<F>) =>
        dispatch({ type: ActionTypes.ADD_SEARCH_CRITERIAS, payload: searchCriterias })
    }
  ]
}

export default useSearchCriterias
