import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from 'state'

import { login, logout } from './me'

import services from 'services/aphp'

import {
  ExpandScopeElementParamsType,
  ExpandScopeElementReturnType,
  ScopeListType,
  ScopeTreeRow,
  ScopeType
} from 'types'
import { buildScopeList, expandScopeTree, getCurrentScopeList } from '../utils/scopeTree'

export type ScopeState = {
  loading: boolean
  scopesList: ScopeListType
  openPopulation: number[]
  aborted?: boolean
}

const initialScopeList: ScopeListType = {
  perimeters: [],
  executiveUnits: []
}
const defaultInitialState: ScopeState = {
  loading: false,
  scopesList: initialScopeList,
  openPopulation: [],
  aborted: false
}

type FetchScopeListReturn = {
  scopesList: ScopeListType
  aborted?: boolean
}

type FetchScopeListArgs = {
  isScopeList?: boolean
  type?: ScopeType
  isExecutiveUnit?: boolean
  signal?: AbortSignal | undefined
}

const fetchScopesList = createAsyncThunk<FetchScopeListReturn, FetchScopeListArgs, { state: RootState }>(
  'scope/fetchScopesList',
  async ({ isScopeList, type, isExecutiveUnit, signal }, { getState, dispatch }) => {
    try {
      const state = getState()
      const { me, scope } = state
      const scopeListFromState = getCurrentScopeList(scope.scopesList, isExecutiveUnit)

      if (scopeListFromState.length && !isScopeList) {
        dispatch(fetchScopesListinBackground({ type, isExecutiveUnit, signal }))
        return {
          scopesList: buildScopeList(scope.scopesList, scopeListFromState, isExecutiveUnit),
          aborted: signal?.aborted
        }
      } else {
        if (!me) return { scopesList: initialScopeList, aborted: signal?.aborted }
        const scopeListFromFetch =
          (await services.perimeters.getScopePerimeters(me.id, type, isExecutiveUnit, signal)) || []
        if (signal?.aborted) {
          return {
            scopesList: buildScopeList(scope.scopesList, scopeListFromState, isExecutiveUnit),
            aborted: signal?.aborted
          }
        } else {
          return {
            scopesList: buildScopeList(scope.scopesList, scopeListFromFetch, isExecutiveUnit),
            aborted: signal?.aborted
          }
        }
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)
type fetchScopesListinBackgroundArgs = {
  type?: ScopeType
  signal?: AbortSignal | undefined
  isExecutiveUnit?: boolean
}
const fetchScopesListinBackground = createAsyncThunk<
  FetchScopeListReturn,
  fetchScopesListinBackgroundArgs,
  { state: RootState }
>('scope/fetchScopesListinBackground', async ({ type, isExecutiveUnit, signal }, { getState }) => {
  try {
    const state = getState()
    const { me, scope } = state
    const scopeListFromState = getCurrentScopeList(scope.scopesList, isExecutiveUnit)

    if (!me) return { scopesList: initialScopeList, aborted: signal?.aborted }
    const scopeListFromFetch =
      (await services.perimeters.getScopePerimeters(me.id, type, isExecutiveUnit, signal)) || []
    const newScopeList = scopeListFromFetch.map((scope) => ({
      ...scope,
      subItems: (
        scopeListFromState.find((item) => item.id === scope.id && item.subItems?.length) ?? {
          subItems: [
            {
              id: 'loading',
              name: 'loading',
              quantity: 0,
              subItems: []
            }
          ]
        }
      ).subItems
    }))

    return {
      scopesList: buildScopeList(scope.scopesList, newScopeList, isExecutiveUnit),
      aborted: signal?.aborted
    }
  } catch (error) {
    console.error(error)
    throw error
  }
})

const expandScopeElement = createAsyncThunk<
  ExpandScopeElementReturnType,
  ExpandScopeElementParamsType,
  { state: RootState }
>('scope/expandScopeElement', async (params, { getState }) => {
  return await expandScopeTree(params, getState)
})

const scopeSlice = createSlice({
  name: 'scope',
  initialState: defaultInitialState as ScopeState,
  reducers: {
    clearScope: () => {
      return defaultInitialState
    },
    closeAllOpenedPopulation: (state) => {
      return {
        ...state,
        openPopulation: []
      }
    },
    updateScopeList: (state, action: PayloadAction<{ newScopes: ScopeTreeRow[]; isExecutiveUnit?: Boolean }>) => {
      return {
        ...state,
        scopesList: buildScopeList(state.scopesList, action.payload.newScopes, !!action.payload.isExecutiveUnit)
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
    // fetchScopesList
    builder.addCase(fetchScopesList.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(fetchScopesList.fulfilled, (state, action) => ({
      ...state,
      loading: false,
      scopesList: action.payload.scopesList
    }))
    builder.addCase(fetchScopesList.rejected, (state) => ({ ...state, loading: false }))
    // fetchScopesListinBackground
    builder.addCase(fetchScopesListinBackground.fulfilled, (state, action) => ({
      ...state,
      loading: false,
      scopesList: action.payload.scopesList
    }))
    builder.addCase(fetchScopesListinBackground.rejected, (state) => ({ ...state, loading: false }))
    // expandScopeElement
    builder.addCase(expandScopeElement.pending, (state) => ({ ...state }))
    builder.addCase(expandScopeElement.fulfilled, (state, action) => ({
      ...state,
      scopesList: action.payload.scopesList,
      openPopulation: action.payload.openPopulation,
      aborted: action.payload.aborted ?? false
    }))
    builder.addCase(expandScopeElement.rejected, (state) => ({ ...state }))
  }
})

export default scopeSlice.reducer
export { expandScopeElement, fetchScopesList }
export const { clearScope, closeAllOpenedPopulation, updateScopeList } = scopeSlice.actions
