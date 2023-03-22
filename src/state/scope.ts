import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'state'

import { logout, login } from './me'

import services from 'services/aphp'

import { ScopeType, ScopeTreeRow, ExpandScopeElementReturnType, ExpandScopeElementParamsType } from 'types'
import { expandScopeTree } from '../utils/scopeTree'

export type ScopeState = {
  loading: boolean
  scopesList: ScopeTreeRow[]
  openPopulation: number[]
  aborted?: boolean
}

const defaultInitialState: ScopeState = {
  loading: false,
  scopesList: [],
  openPopulation: [],
  aborted: false
}

type FetchScopeListReturn = {
  scopesList: ScopeTreeRow[]
  aborted?: boolean
}

type FetchScopeListArgs = {
  isScopeList?: boolean
  type?: ScopeType
  signal?: AbortSignal | undefined
}

const fetchScopesList = createAsyncThunk<FetchScopeListReturn, FetchScopeListArgs, { state: RootState }>(
  'scope/fetchScopesList',
  async ({ isScopeList, type, signal }, { getState, dispatch }) => {
    try {
      const state = getState()
      const { me, scope } = state
      const { scopesList } = scope

      if (scopesList.length && !isScopeList) {
        dispatch(fetchScopesListinBackground({ type, signal }))
        return { scopesList: scopesList, aborted: signal?.aborted }
      } else {
        if (!me) return { scopesList: [], aborted: signal?.aborted }
        const scopes = (await services.perimeters.getScopePerimeters(me.id, type, signal)) || []
        if (signal?.aborted) {
          return { scopesList: scopesList, aborted: signal?.aborted }
        } else {
          return { scopesList: scopes, aborted: signal?.aborted }
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
}
const fetchScopesListinBackground = createAsyncThunk<
  FetchScopeListReturn,
  fetchScopesListinBackgroundArgs,
  { state: RootState }
>('scope/fetchScopesListinBackground', async ({ type, signal }, { getState }) => {
  try {
    const state = getState()
    const { me, scope } = state
    const { scopesList } = scope

    if (!me) return { scopesList: [], aborted: signal?.aborted }
    const scopes = (await services.perimeters.getScopePerimeters(me.id, type, signal)) || []
    return {
      scopesList: scopes.map((scope) => ({
        ...scope,
        subItems: (
          scopesList.find((item) => item.id === scope.id && item.subItems?.length) ?? {
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
      })),
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
    updateScopeList: (state, action: PayloadAction<ScopeTreeRow[]>) => {
      return {
        ...state,
        scopesList: action.payload
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
export { fetchScopesList, expandScopeElement }
export const { clearScope, closeAllOpenedPopulation, updateScopeList } = scopeSlice.actions
