import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { RootState } from 'state'
import { login, logout } from 'state/me'

import services from 'services'

export type BiologyListType = {
  id: string
  label: string
  subItems?: BiologyListType[]
}

export type BiologyState = {
  loading: boolean
  list: BiologyListType[]
  openedElement: string[]
}

const defaultInitialState: BiologyState = {
  loading: false,
  list: [],
  openedElement: []
}

const initBiologyHierarchy = createAsyncThunk<BiologyState, void, { state: RootState }>(
  'biology/fetchElements',
  async (DO_NOT_USE, { getState }) => {
    try {
      const state = getState().biology
      const { list } = state

      let biologyList: BiologyListType[] = []

      if (list && list.length === 0) {
        biologyList = await services.cohortCreation.fetchBiologyHierarchy()
      }

      return {
        ...state,
        loading: false,
        list: biologyList || []
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la hierarchie de Biologie', error)
      throw error
    }
  }
)

const fetchBiology = createAsyncThunk<BiologyState, void, { state: RootState }>(
  'biology/fetchBiology',
  async (DO_NOT_USE, { getState }) => {
    const state = getState().biology
    const biologyList: BiologyListType[] = await services.cohortCreation.fetchBiologyHierarchy()

    return {
      ...state,
      list: biologyList,
      openedElement: [],
      loading: false
    }
  }
)

type ExpandBiologyElementsParams = {
  rowId: string
  selectedItems?: BiologyListType[]
}
const expandBiologyElement = createAsyncThunk<BiologyState, ExpandBiologyElementsParams, { state: RootState }>(
  'scope/expandBiologyElement',
  async ({ rowId, selectedItems }, { getState }) => {
    const state = getState().biology
    const listElement = state.list
    const openedElement = state.openedElement

    let _rootRows = listElement ? [...listElement] : []
    let _openedElement = openedElement ? [...openedElement] : []
    let savedSelectedItems = selectedItems ? [...selectedItems] : []

    const index = _openedElement.indexOf(rowId)
    if (index !== -1) {
      _openedElement = _openedElement.filter((id) => id !== rowId)
    } else {
      _openedElement = [..._openedElement, rowId]

      const replaceSubItems = async (items: BiologyListType[]) => {
        let _items: BiologyListType[] = []
        for (let item of items) {
          // Replace sub items element by response of back-end
          if (item.id === rowId) {
            const foundItem = item.subItems ? item.subItems.find((i: any) => i.id === 'loading') : true
            if (foundItem) {
              let subItems: BiologyListType[] = []
              subItems = await services.cohortCreation.fetchBiologyHierarchy(item.id)

              item = { ...item, subItems: subItems }
            }
          } else if (item.subItems && item.subItems.length !== 0) {
            item = { ...item, subItems: await replaceSubItems(item.subItems) }
          }
          _items = [..._items, item]

          // Check if element is selected, if true => add sub items to savedSelectedItems
          const isSelected = savedSelectedItems.find(
            (savedSelectedItem: BiologyListType) => savedSelectedItem.id === item.id
          )
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
      loading: false,
      list: _rootRows,
      openedElement: _openedElement,
      savedSelectedItems: savedSelectedItems.filter((savedSelectedItem: any) => savedSelectedItem.id !== 'loading')
    }
  }
)

const biologySlice = createSlice({
  name: 'biology',
  initialState: defaultInitialState,
  reducers: {
    clearBiologyHierarchy: () => {
      return {
        loading: false,
        list: [],
        openedElement: []
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
    // initBiologyHierarchy
    builder.addCase(initBiologyHierarchy.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(initBiologyHierarchy.fulfilled, (state, action) => ({ ...state, ...action.payload }))
    builder.addCase(initBiologyHierarchy.rejected, (state) => ({ ...state }))
    // fetchBiologyHierarchy
    builder.addCase(fetchBiology.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(fetchBiology.fulfilled, (state, action) => ({ ...state, ...action.payload }))
    builder.addCase(fetchBiology.rejected, (state) => ({ ...state }))
    // expandBiologyElement
    builder.addCase(expandBiologyElement.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(expandBiologyElement.fulfilled, (state, action) => ({ ...state, ...action.payload }))
    builder.addCase(expandBiologyElement.rejected, (state) => ({ ...state }))
  }
})

export default biologySlice.reducer
export { initBiologyHierarchy, fetchBiology, expandBiologyElement }
export const { clearBiologyHierarchy } = biologySlice.actions
