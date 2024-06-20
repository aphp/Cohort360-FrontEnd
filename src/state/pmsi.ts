import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { RootState } from 'state'
import { impersonate, login, logout } from 'state/me'

import services from 'services/aphp'
import { HierarchyElement } from 'types'

export type PmsiElementType = {
  loading: boolean
  list: HierarchyElement[]
  openedElement: string[]
}

type PmsiState = {
  claim: PmsiElementType
  condition: PmsiElementType
  procedure: PmsiElementType
  syncLoading?: number
}

const defaultInitialState: PmsiState = {
  claim: {
    loading: false,
    list: [],
    openedElement: []
  },
  condition: {
    loading: false,
    list: [],
    openedElement: []
  },
  procedure: {
    loading: false,
    list: [],
    openedElement: []
  },
  syncLoading: 0
}

const initPmsiHierarchy = createAsyncThunk<PmsiState, void, { state: RootState }>(
  'pmsi/fetchElements',
  async (DO_NOT_USE, { getState }) => {
    try {
      const state = getState().pmsi
      const { claim, condition, procedure } = state

      const claimList = claim.list.length === 0 ? await services.cohortCreation.fetchGhmHierarchy('') : claim.list
      const conditionList =
        condition.list.length === 0 ? await services.cohortCreation.fetchCim10Hierarchy('') : condition.list
      const procedureList =
        procedure.list.length === 0 ? await services.cohortCreation.fetchCcamHierarchy('') : procedure.list

      return {
        ...state,
        claim: {
          ...state.claim,
          loading: false,
          list: claimList
        },
        condition: {
          ...state.condition,
          loading: false,
          list: conditionList
        },
        procedure: {
          ...state.procedure,
          loading: false,
          list: procedureList
        }
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

const fetchCondition = createAsyncThunk<PmsiElementType, void, { state: RootState }>(
  'pmsi/fetchCondition',
  async (DO_NOT_USE, { getState }) => {
    const state = getState().pmsi
    const conditionList = await services.cohortCreation.fetchCim10Hierarchy('')

    return {
      ...state.condition,
      list: conditionList,
      openedElement: [],
      loading: false
    }
  }
)

const fetchClaim = createAsyncThunk<PmsiElementType, void, { state: RootState }>(
  'pmsi/fetchClaim',
  async (DO_NOT_USE, { getState }) => {
    const state = getState().pmsi
    const claimList = await services.cohortCreation.fetchGhmHierarchy('')

    return {
      ...state.claim,
      list: claimList,
      openedElement: [],
      loading: false
    }
  }
)

const fetchProcedure = createAsyncThunk<PmsiElementType, void, { state: RootState }>(
  'pmsi/fetchProcedure',
  async (DO_NOT_USE, { getState }) => {
    const state = getState().pmsi
    const procedureList = await services.cohortCreation.fetchCcamHierarchy('')

    return {
      ...state.procedure,
      list: procedureList,
      openedElement: [],
      loading: false
    }
  }
)

type ExpandPmsiElementParams = {
  rowId: string
  keyElement: 'claim' | 'condition' | 'procedure'
  selectedItems?: HierarchyElement[]
}

const expandPmsiElement = createAsyncThunk<PmsiState, ExpandPmsiElementParams, { state: RootState }>(
  'scope/expandPmsiElement',
  async ({ rowId, keyElement, selectedItems }, { getState }) => {
    const state = getState().pmsi
    const listElement = state[keyElement].list
    const openedElement = state[keyElement].openedElement

    let _rootRows = listElement ? [...listElement] : []
    let _openedElement = openedElement ? [...openedElement] : []
    let savedSelectedItems = selectedItems ? [...selectedItems] : []

    const index = _openedElement.indexOf(rowId)
    if (index !== -1) {
      _openedElement = _openedElement.filter((id) => id !== rowId)
    } else {
      _openedElement = [..._openedElement, rowId]

      const replaceSubItems = async (items: HierarchyElement[]) => {
        let _items: HierarchyElement[] = []
        for (let item of items) {
          // Replace sub items element by response of back-end
          if (item.id === rowId) {
            const foundItem = item.subItems ? item.subItems.find((i) => i.id === 'loading') : true
            if (foundItem) {
              let subItems: HierarchyElement[] = []
              if (keyElement === 'claim') {
                subItems = await services.cohortCreation.fetchGhmHierarchy(item.id)
              }
              if (keyElement === 'condition') {
                subItems = await services.cohortCreation.fetchCim10Hierarchy(item.id)
              }
              if (keyElement === 'procedure') {
                subItems = await services.cohortCreation.fetchCcamHierarchy(item.id)
              }

              item = { ...item, subItems: subItems }
            }
          } else if (item.subItems && item.subItems.length !== 0) {
            item = { ...item, subItems: await replaceSubItems(item.subItems) }
          }
          _items = [..._items, item]

          // Check if element is selected, if true => add sub items to savedSelectedItems
          const isSelected = savedSelectedItems.find((savedSelectedItem) => savedSelectedItem.id === item.id)
          if (isSelected !== undefined && item.subItems && item.subItems.length > 0) {
            savedSelectedItems = [...savedSelectedItems, ...item.subItems]
          }
        }
        return _items
      }

      _rootRows = await replaceSubItems(listElement)
    }

    return {
      ...state,
      [keyElement]: {
        ...state[keyElement],
        list: _rootRows,
        openedElement: _openedElement,
        loading: false
      },
      savedSelectedItems: savedSelectedItems.filter((savedSelectedItem) => savedSelectedItem.id !== 'loading')
    }
  }
)

const pmsiSlice = createSlice({
  name: 'pmsi',
  initialState: defaultInitialState,
  reducers: {
    clearPmsiHierarchy: () => {
      return {
        claim: {
          loading: false,
          list: [],
          openedElement: []
        },
        condition: {
          loading: false,
          list: [],
          openedElement: []
        },
        procedure: {
          loading: false,
          list: [],
          openedElement: []
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
    builder.addCase(impersonate, () => defaultInitialState)
    // initPmsiHierarchy
    builder.addCase(initPmsiHierarchy.pending, (state) => ({
      ...state,
      claim: { ...state.claim, loading: true },
      condition: { ...state.condition, loading: true },
      procedure: { ...state.procedure, loading: true }
    }))
    builder.addCase(initPmsiHierarchy.fulfilled, (state, action) => ({ ...state, ...action.payload }))
    builder.addCase(initPmsiHierarchy.rejected, (state) => ({ ...state }))
    // fetchCondition
    builder.addCase(fetchCondition.pending, (state) => ({
      ...state,
      condition: { ...state.condition, loading: true }
    }))
    builder.addCase(fetchCondition.fulfilled, (state, action) => ({
      ...state,
      condition: { ...state.condition, ...action.payload }
    }))
    builder.addCase(fetchCondition.rejected, (state) => ({ ...state }))
    // fetchClaim
    builder.addCase(fetchClaim.pending, (state) => ({
      ...state,
      claim: { ...state.claim, loading: true }
    }))
    builder.addCase(fetchClaim.fulfilled, (state, action) => ({
      ...state,
      claim: { ...state.claim, ...action.payload }
    }))
    builder.addCase(fetchClaim.rejected, (state) => ({ ...state }))
    // fetchProcedure
    builder.addCase(fetchProcedure.pending, (state) => ({
      ...state,
      procedure: { ...state.procedure, loading: true }
    }))
    builder.addCase(fetchProcedure.fulfilled, (state, action) => ({
      ...state,
      procedure: { ...state.procedure, ...action.payload }
    }))
    builder.addCase(fetchProcedure.rejected, (state) => ({ ...state }))
    // expandPmsiElement
    builder.addCase(expandPmsiElement.pending, (state) => ({
      ...state,
      claim: { ...state.claim, loading: true },
      condition: { ...state.condition, loading: true },
      procedure: { ...state.procedure, loading: true },
      syncLoading: (state.syncLoading ?? 0) + 1
    }))
    builder.addCase(expandPmsiElement.fulfilled, (state, action) => ({
      ...state,
      ...action.payload,
      ...{ syncLoading: (state.syncLoading ?? 0) - 1 }
    }))
    builder.addCase(expandPmsiElement.rejected, (state) => ({
      ...state,
      ...{ syncLoading: (state.syncLoading ?? 0) - 1 }
    }))
  }
})

export default pmsiSlice.reducer
export { initPmsiHierarchy, fetchCondition, fetchClaim, fetchProcedure, expandPmsiElement }
export const { clearPmsiHierarchy } = pmsiSlice.actions
