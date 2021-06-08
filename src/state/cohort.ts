/**
 * Liste de cohort utilisé dans la page: `/mes_projets`
 *
 * /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\
 * Pour modifier la liste de cohorts favorite + recente, se referer à `state/userCohorts`
 * /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'

import { logout, login } from './me'

import {
  fetchCohortsList,
  addCohort as addCohortAPI,
  editCohort as editCohortAPI,
  deleteCohort as deleteCohortAPI,
  CohortType
} from 'services/myProjects'

export type CohortState = {
  loading: boolean
  selectedCohort: CohortType | null
  cohortsList: CohortType[]
}

const defaultInitialState: CohortState = {
  loading: false,
  selectedCohort: null,
  cohortsList: []
}

const localStorageCohort = localStorage.getItem('cohort') || null
const initialState: CohortState = localStorageCohort ? JSON.parse(localStorageCohort) : defaultInitialState

type FetchCohortListReturn = {
  selectedCohort: null
  cohortsList: CohortType[]
}

const fetchCohorts = createAsyncThunk<FetchCohortListReturn, void, { state: RootState }>(
  'cohort/fetchCohorts',
  async () => {
    try {
      const cohorts = (await fetchCohortsList()) || []
      return {
        selectedCohort: null,
        cohortsList: cohorts.results
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)
/**
 * addCohort
 *
 */
type AddCohortParams = {
  newCohort: CohortType
}
type AddCohortReturn = {
  selectedCohort: null
  cohortsList: CohortType[]
}

const addCohort = createAsyncThunk<AddCohortReturn, AddCohortParams, { state: RootState }>(
  'cohort/addCohort',
  async ({ newCohort }, { getState }) => {
    try {
      const state = getState().cohort
      const cohortsList: CohortType[] = state.cohortsList ?? []

      const createdCohort = await addCohortAPI(newCohort)

      return {
        selectedCohort: null,
        cohortsList: createdCohort !== null ? [createdCohort, ...cohortsList] : cohortsList
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/**
 * editCohort
 *
 */
type EditCohortParams = {
  editedCohort: CohortType
}
type EditCohortReturn = {
  selectedCohort: null
  cohortsList: CohortType[]
}

const editCohort = createAsyncThunk<EditCohortReturn, EditCohortParams, { state: RootState }>(
  'cohort/editCohort',
  async ({ editedCohort }, { getState, dispatch }) => {
    try {
      const state = getState().cohort
      // eslint-disable-next-line
      let cohortsList: CohortType[] = state.cohortsList ? [...state.cohortsList] : []
      const foundItem = cohortsList.find(({ uuid }) => uuid === editedCohort.uuid)
      if (!foundItem) {
        // if not found -> create it
        dispatch(addCohort({ newCohort: editedCohort }))
      } else {
        const index = cohortsList.indexOf(foundItem)

        const modifiedCohort = await editCohortAPI(editedCohort)

        cohortsList[index] = modifiedCohort
      }
      return {
        selectedCohort: null,
        cohortsList: cohortsList
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)
/**
 * deleteCohort
 *
 */
type DeleteCohortParams = {
  deletedCohort: CohortType
}
type DeleteCohortReturn = {
  selectedCohort: null
  cohortsList: CohortType[]
}

const deleteCohort = createAsyncThunk<DeleteCohortReturn, DeleteCohortParams, { state: RootState }>(
  'cohort/deleteCohort',
  async ({ deletedCohort }, { getState }) => {
    try {
      const state = getState().cohort
      // eslint-disable-next-line
      let cohortsList: CohortType[] = state.cohortsList ? [...state.cohortsList] : []
      const foundItem = cohortsList.find(({ uuid }) => uuid === deletedCohort.uuid)
      const index = foundItem ? cohortsList.indexOf(foundItem) : -1
      if (index !== -1) {
        // delete item at index
        await deleteCohortAPI(deletedCohort)

        cohortsList.splice(index, 1)
      }
      return {
        selectedCohort: null,
        cohortsList: cohortsList
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

const setCohortSlice = createSlice({
  name: 'cohort',
  initialState: initialState as CohortState,
  reducers: {
    clearCohort: () => {
      return defaultInitialState
    },
    setSelectedCohort: (state: CohortState, action: PayloadAction<string | null>) => {
      const cohortsList: CohortType[] = state.cohortsList ?? []
      const selectedCohortId = action.payload
      switch (selectedCohortId) {
        case null:
          return {
            ...state,
            selectedCohort: null
          }
        case '':
          return {
            ...state,
            selectedCohort: {
              uuid: '',
              name: `Cohort ${(cohortsList.length || 0) + 1}`
            }
          }
        default: {
          const foundItem = cohortsList.find(({ uuid }) => uuid === selectedCohortId)
          if (!foundItem) return state
          const index = cohortsList.indexOf(foundItem)
          return {
            ...state,
            selectedCohort: cohortsList[index]
          }
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout, () => defaultInitialState)
    // fetchCohorts
    builder.addCase(fetchCohorts.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(fetchCohorts.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(fetchCohorts.rejected, (state) => ({ ...state, loading: false }))
    // addCohort
    builder.addCase(addCohort.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(addCohort.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(addCohort.rejected, (state) => ({ ...state, loading: false }))
    // editCohort
    builder.addCase(editCohort.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(editCohort.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(editCohort.rejected, (state) => ({ ...state, loading: false }))
    // deleteCohort
    builder.addCase(deleteCohort.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(deleteCohort.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(deleteCohort.rejected, (state) => ({ ...state, loading: false }))
  }
})

export default setCohortSlice.reducer
export { fetchCohorts, addCohort, editCohort, deleteCohort }
export const { clearCohort, setSelectedCohort } = setCohortSlice.actions
