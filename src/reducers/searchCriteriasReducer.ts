/**
 * @fileoverview Redux reducer and custom hook for managing search criteria state
 * @module reducers/searchCriteriasReducer
 */

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

/**
 * Initial state for export search criteria with default ordering and no filters
 *
 * @example
 * ```typescript
 * const exportCriteria = initExportSearchCriterias
 * // { orderBy: { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC }, searchInput: '', filters: null }
 * ```
 */
export const initExportSearchCriterias: SearchCriterias<null> = {
  orderBy: {
    orderBy: Order.CREATED_AT,
    orderDirection: Direction.DESC
  },
  searchInput: '',
  filters: null
}

/**
 * Creates a reducer function for managing search criteria state
 *
 * @template F - The type of the filters object
 * @param initState - Function that returns the initial state
 * @returns A reducer function that handles search criteria actions
 *
 * @example
 * ```typescript
 * const reducer = searchCriteriasReducer(() => ({
 *   orderBy: { orderBy: Order.NAME, orderDirection: Direction.ASC },
 *   searchInput: '',
 *   filters: { status: [] }
 * }))
 * ```
 */
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

/**
 * Type definition for dispatch actions available in the useSearchCriterias hook
 *
 * @template F - The type of the filters object
 */
type DispatchActions<F> = {
  /** Changes the ordering criteria */
  changeOrderBy: (orderBy: OrderBy) => void
  /** Updates the search input text */
  changeSearchInput: (searchInput: string) => void
  /** Changes the search type (e.g., by name, by code) */
  changeSearchBy: (searchBy: SearchByTypes) => void
  /** Adds or updates filters */
  addFilters: (filters: F) => void
  /** Removes a specific filter */
  removeFilter: (key: FilterKeys, value: FilterValue) => void
  /** Replaces all search criteria */
  addSearchCriterias: (searchCriterias: SearchCriterias<F>) => void
}

/**
 * Custom React hook for managing search criteria state with reducer pattern
 *
 * @template F - The type of the filters object
 * @param initState - The initial state for search criteria
 * @param resetKey - A key that triggers state reset when changed
 * @returns A tuple containing the current state and dispatch actions
 *
 * @example
 * ```typescript
 * const [searchCriteria, actions] = useSearchCriterias(
 *   {
 *     orderBy: { orderBy: Order.NAME, orderDirection: Direction.ASC },
 *     searchInput: '',
 *     filters: { status: [] }
 *   },
 *   'resetKey'
 * )
 *
 * // Use the actions to update state
 * actions.changeSearchInput('new search term')
 * actions.addFilters({ status: ['active'] })
 * ```
 */
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

/**
 * @default useSearchCriterias
 * @see {@link useSearchCriterias}
 */
export default useSearchCriterias
