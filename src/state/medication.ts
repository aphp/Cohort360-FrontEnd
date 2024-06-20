import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { RootState } from 'state'
import { impersonate, login, logout } from 'state/me'

import services from 'services/aphp'
import { HierarchyElement } from 'types'

export type MedicationState = {
  syncLoading?: number
  loading: boolean
  list: HierarchyElement[]
  openedElement: string[]
  ucdList: HierarchyElement[]
}

const defaultInitialState: MedicationState = {
  loading: false,
  list: [],
  openedElement: [],
  ucdList: []
}

const initMedicationHierarchy = createAsyncThunk<MedicationState, void, { state: RootState }>(
  'medication/fetchElements',
  async (DO_NOT_USE, { getState }) => {
    try {
      const state = getState().medication
      const { list } = state

      const medicationList = list.length === 0 ? await services.cohortCreation.fetchAtcHierarchy('') : list

      const medicationUCDList = await services.cohortCreation.fetchUCDList('')

      return {
        ...state,
        loading: false,
        list: medicationList,
        ucdList: medicationUCDList
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

const fetchMedication = createAsyncThunk<MedicationState, void, { state: RootState }>(
  'medication/fetchMedication',
  async (DO_NOT_USE, { getState }) => {
    const state = getState().medication
    const medicationList = await services.cohortCreation.fetchAtcHierarchy('')
    const medicationUCDList = await services.cohortCreation.fetchUCDList('')

    return {
      ...state,
      list: medicationList,
      openedElement: [],
      ucdList: medicationUCDList,
      loading: false
    }
  }
)

type ExpandMedicationElementParams = {
  rowId: string
  selectedItems?: HierarchyElement[]
}

const expandMedicationElement = createAsyncThunk<MedicationState, ExpandMedicationElementParams, { state: RootState }>(
  'scope/expandMedicationElement',
  async ({ rowId, selectedItems }, { getState }) => {
    const state = getState().medication
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

      const replaceSubItems = async (items: HierarchyElement[]) => {
        let _items: HierarchyElement[] = []
        for (let item of items) {
          // Replace sub items element by response of back-end
          if (item.id === rowId) {
            const foundItem = item.subItems ? item.subItems.find((i) => i.id === 'loading') : true
            if (foundItem) {
              let subItems: HierarchyElement[] = []
              subItems = await services.cohortCreation.fetchAtcHierarchy(item.id)

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
      loading: false,
      list: _rootRows,
      openedElement: _openedElement,
      savedSelectedItems: savedSelectedItems.filter((savedSelectedItem) => savedSelectedItem.id !== 'loading')
    }
  }
)

const medicationSlice = createSlice({
  name: 'medication',
  initialState: defaultInitialState as MedicationState,
  reducers: {
    clearMedicationHierarchy: () => {
      return {
        loading: false,
        list: [],
        openedElement: [],
        ucdList: []
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
    builder.addCase(impersonate, () => defaultInitialState)
    // initMedicationHierarchy
    builder.addCase(initMedicationHierarchy.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(initMedicationHierarchy.fulfilled, (state, action) => ({ ...state, ...action.payload }))
    builder.addCase(initMedicationHierarchy.rejected, (state) => ({ ...state }))
    // fetchMedication
    builder.addCase(fetchMedication.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(fetchMedication.fulfilled, (state, action) => ({ ...state, ...action.payload }))
    builder.addCase(fetchMedication.rejected, (state) => ({ ...state }))
    // expandMedicationElement
    builder.addCase(expandMedicationElement.pending, (state) => ({
      ...state,
      loading: true,
      syncLoading: (state.syncLoading ?? 0) + 1
    }))
    builder.addCase(expandMedicationElement.fulfilled, (state, action) => ({
      ...state,
      ...action.payload,
      syncLoading: (state.syncLoading ?? 0) - 1
    }))
    builder.addCase(expandMedicationElement.rejected, (state) => ({ ...state }))
  }
})

export default medicationSlice.reducer
export { initMedicationHierarchy, fetchMedication, expandMedicationElement }
export const { clearMedicationHierarchy } = medicationSlice.actions
