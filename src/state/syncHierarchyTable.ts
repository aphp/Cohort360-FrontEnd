import { AsyncThunk, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from './index'
import { HierarchyTree } from '../types'
import { SelectedCriteriaType } from 'types/requestCriterias'
import { impersonate, login, logout } from './me'

const initialState: HierarchyTree = {
  code: undefined,
  loading: 0
}

const pushSyncHierarchyTable: AsyncThunk<HierarchyTree, HierarchyTree, { state: RootState }> = createAsyncThunk<
  HierarchyTree,
  HierarchyTree,
  { state: RootState }
>('syncHierarchyTable/pushSyncHierarchyTable', async (newState: HierarchyTree, { getState }) => {
  return { loading: getState().syncHierarchyTable.loading, code: newState?.code }
})
const incrementLoadingSyncHierarchyTable: AsyncThunk<HierarchyTree, void, { state: RootState }> = createAsyncThunk<
  HierarchyTree,
  void,
  { state: RootState }
>('syncHierarchyTable/incrementLoadingSyncHierarchyTable', async (DO_NOT_USE, { getState }) => {
  return getState().syncHierarchyTable
})
const decrementLoadingSyncHierarchyTable: AsyncThunk<HierarchyTree, void, { state: RootState }> = createAsyncThunk<
  HierarchyTree,
  void,
  { state: RootState }
>('syncHierarchyTable/decrementLoadingSyncHierarchyTable', async (DO_NOT_USE, { getState }) => {
  return getState().syncHierarchyTable
})
const initSyncHierarchyTable: AsyncThunk<HierarchyTree, SelectedCriteriaType, { state: RootState }> = createAsyncThunk<
  HierarchyTree,
  SelectedCriteriaType,
  { state: RootState }
>('syncHierarchyTable/initSyncHierarchyTable', (selectedCriteria: SelectedCriteriaType, { getState }) => {
  const selectedResource: any = (getState().cohortCreation.request ?? {}).selectedCriteria?.find(
    (item) => item.id === selectedCriteria.id
  )
  const newState: HierarchyTree = selectedResource
    ? {
        code: selectedResource ? selectedResource.code : 'loading',
        loading: 0
      }
    : initialState
  return newState
})

const synchroSlice = createSlice({
  name: 'syncHierarchyTable',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(login, () => initialState)
    builder.addCase(logout.fulfilled, () => initialState)
    builder.addCase(impersonate, () => initialState)
    builder.addCase(pushSyncHierarchyTable.fulfilled, (state, action) => ({
      ...action.payload,
      ...{ loading: state.loading ?? 0 }
    }))
    builder.addCase(initSyncHierarchyTable.fulfilled, (state, action) => ({
      ...action.payload
    }))
    builder.addCase(incrementLoadingSyncHierarchyTable.pending, (state) => ({
      ...state,
      ...{ loading: (state.loading ?? 0) + 1 }
    }))
    builder.addCase(decrementLoadingSyncHierarchyTable.fulfilled, (state) => {
      return {
        ...state,
        ...{ loading: (state.loading ?? 0) - 1 }
      }
    })
  }
})
export {
  pushSyncHierarchyTable,
  initSyncHierarchyTable,
  incrementLoadingSyncHierarchyTable,
  decrementLoadingSyncHierarchyTable
}
export default synchroSlice.reducer
