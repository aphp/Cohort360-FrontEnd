import { removeFilter } from 'utils/filters'
import { useReducer, useEffect } from 'react'
import {
  ActionTypes,
  SearchCriterias,
  ActionFilters,
  Direction,
  Order,
  SearchByTypes,
  OrderBy,
  FilterKeys,
  FilterValue
} from 'types/searchCriterias'
import { ResourceType } from 'types/requestCriterias'
import { getConfig } from 'config'

export const initExportSearchCriterias: SearchCriterias<null> = {
  orderBy: {
    orderBy: Order.CREATED_AT,
    orderDirection: Direction.DESC
  },
  searchInput: '',
  filters: null
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
}

const useSearchCriterias = <F>(
  initState: SearchCriterias<F>,
  resetKey: string | number
): [SearchCriterias<F>, DispatchActions<F>] => {
  const [state, dispatch] = useReducer(
    searchCriteriasReducer<F>(() => initState),
    undefined,
    () => initState
  )

  useEffect(() => {
    dispatch({ type: ActionTypes.REMOVE_SEARCH_CRITERIAS, payload: null })
  }, [resetKey])

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
      addSearchCriterias: (searchCriterias: SearchCriterias<F>) =>
        dispatch({ type: ActionTypes.ADD_SEARCH_CRITERIAS, payload: searchCriterias })
    }
  ]
}

export default useSearchCriterias
