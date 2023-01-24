import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'

import { logout, login } from './me'

import services from 'services'

import { ScopeTreeRow } from 'types'

export type ScopeState = {
  loading: boolean
  scopesList: ScopeTreeRow[]
  openPopulation: number[]
}

const defaultInitialState: ScopeState = {
  loading: false,
  scopesList: [],
  openPopulation: []
}

type FetchScopeListReturn = {
  scopesList: ScopeTreeRow[]
}

const fetchScopesList = createAsyncThunk<FetchScopeListReturn, void, { state: RootState }>(
  'scope/fetchScopesList',
  async (DO_NOT_USE, { getState, dispatch }) => {
    try {
      const state = getState()
      const { me, scope } = state
      const { scopesList } = scope

      if (scopesList.length) {
        dispatch(fetchScopesListinBackground())
        return { scopesList }
      } else {
        if (!me) return { scopesList: [] }
        const scopes = (await services.perimeters.getScopePerimeters(me.id)) || []
        return { scopesList: scopes }
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

const fetchScopesListinBackground = createAsyncThunk<FetchScopeListReturn, void, { state: RootState }>(
  'scope/fetchScopesListinBackground',
  async (DO_NOT_USE, { getState }) => {
    try {
      const state = getState()
      const { me, scope } = state
      const { scopesList } = scope

      if (!me) return { scopesList: [] }
      const scopes = (await services.perimeters.getScopePerimeters(me.id)) || []
      return {
        scopesList: scopes.map((scope) => ({
          ...scope,
          subItems: (scopesList.find(({ id }) => id === scope.id) || { subItems: [] }).subItems
        }))
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

type ExpandScopeElementParams = {
  rowId: number
  selectedItems?: ScopeTreeRow[]
}
type ExpandScopeElementReturn = {
  scopesList: ScopeTreeRow[]
  selectedItems: ScopeTreeRow[]
  openPopulation: number[]
}

const expandScopeElement = createAsyncThunk<ExpandScopeElementReturn, ExpandScopeElementParams, { state: RootState }>(
  'scope/expandScopeElement',
  async ({ rowId, selectedItems }, { getState }) => {
    const state = getState().scope
    const { scopesList, openPopulation } = state

    let _rootRows = scopesList ? [...scopesList] : []
    let savedSelectedItems = selectedItems ? [...selectedItems] : []
    let _openPopulation = openPopulation ? [...openPopulation] : []

    const index = _openPopulation.indexOf(rowId)
    if (index !== -1) {
      _openPopulation = _openPopulation.filter((id) => id !== rowId)
    } else {
      _openPopulation = [..._openPopulation, rowId]

      const replaceSubItems = async (items: ScopeTreeRow[]) => {
        let _items: ScopeTreeRow[] = []
        for (let item of items) {
          // Replace sub items element by response of back-end
          if (+item.id === +rowId) {
            const foundItem = item.subItems ? item.subItems.find((i: any) => i.id === 'loading') : true
            if (foundItem) {
              const subItems: ScopeTreeRow[] = await services.perimeters.getScopeSubItems(item, true)
              item = { ...item, subItems: subItems }
            }
          } else if (item.subItems && item.subItems.length !== 0) {
            item = { ...item, subItems: await replaceSubItems(item.subItems) }
          }
          _items = [..._items, item]

          // Check if element is selected, if true => add sub items to savedSelectedItems
          const isSelected = savedSelectedItems.find(
            (savedSelectedItem: ScopeTreeRow) => savedSelectedItem.id === item.id
          )
          if (isSelected !== undefined && item.subItems && item.subItems.length > 0) {
            savedSelectedItems = [...savedSelectedItems, ...item.subItems]
          }
        }
        return _items
      }

      _rootRows = await replaceSubItems(scopesList)
    }

    return {
      scopesList: _rootRows,
      selectedItems: savedSelectedItems,
      openPopulation: _openPopulation
    }
  }
)

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
      openPopulation: action.payload.openPopulation
    }))
    builder.addCase(expandScopeElement.rejected, (state) => ({ ...state }))
  }
})

export default scopeSlice.reducer
export { fetchScopesList, expandScopeElement }
export const { clearScope, closeAllOpenedPopulation } = scopeSlice.actions
