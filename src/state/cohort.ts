/**
 * Liste de cohort utilisé dans la page: `/mes_projets`
 *
 * /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\
 * Pour modifier la liste de cohorts favorite + recente, se referer à `state/userCohorts`
 * /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'
import { CohortType } from 'types'

import { logout, login } from './me'
import { fetchExploredCohortInBackground } from './exploredCohort'
import { initUserCohortsThunk } from './userCohorts'
import services from 'services'

export type CohortState = {
  loading: boolean
  count: number
  selectedCohort: CohortType | null
  cohortsList: CohortType[]
}

const defaultInitialState: CohortState = {
  loading: false,
  count: 0,
  selectedCohort: null,
  cohortsList: []
}

const localStorageCohort = localStorage.getItem('cohort') || null
const initialState: CohortState = localStorageCohort ? JSON.parse(localStorageCohort) : defaultInitialState

type FetchCohortListReturn = {
  count: number
  selectedCohort?: null
  cohortsList: CohortType[]
}

const fetchCohorts = createAsyncThunk<FetchCohortListReturn, void, { state: RootState }>(
  'cohort/fetchCohorts',
  async (DO_NOT_USE, { getState, dispatch }) => {
    try {
      const state = getState().cohort
      const providerId = getState().me?.id ?? '0'

      const oldProjectList = state.cohortsList || []
      const cohorts = (await services.projects.fetchCohortsList((+providerId).toString(), 100, 0)) || {}

      let forceRefresh =
        oldProjectList.some(
          (cohort) =>
            !cohort.fhir_group_id &&
            (cohort.request_job_status === 'pending' || cohort.request_job_status === 'started')
        ) ||
        cohorts?.results?.some(
          (cohort) =>
            !cohort.fhir_group_id &&
            (cohort.request_job_status === 'pending' || cohort.request_job_status === 'started')
        )

      if (state.count === cohorts.count && !forceRefresh) {
        return {
          count: state.count,
          selectedCohort: null,
          cohortsList: oldProjectList
        }
      }

      let cohortList = cohorts.results || []
      // cohortList.length <= 100, check fetchCohortsList() for more information
      if (cohorts.count > cohortList.length) {
        const newResult = await services.projects.fetchCohortsList(
          (+providerId).toString(),
          cohorts.count - cohortList.length,
          cohortList.length
        )
        // Add elements to cohortList array and filter doublon
        cohortList = [...cohortList, ...(newResult.results || [])]
        cohortList = cohortList.filter((item, index, array) => {
          const foundItem = array.find(({ uuid }) => item.uuid === uuid)
          const currentIndex = foundItem ? array.indexOf(foundItem) : -1
          return index === currentIndex
        })
      }

      forceRefresh = forceRefresh
        ? true
        : cohortList.some(
            (cohort) => cohort.request_job_status === 'pending' || cohort.request_job_status === 'started'
          )

      if (forceRefresh) {
        dispatch(fetchCohortInBackGround(cohortList))
      }

      return {
        count: cohorts.count,
        selectedCohort: null,
        cohortsList: cohortList.reverse()
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

const sleep = (m: any) => new Promise((r: any) => setTimeout(r, m))

const fetchCohortInBackGround = createAsyncThunk<FetchCohortListReturn, CohortType[], { state: RootState }>(
  'cohort/fetchCohortInBackGround',
  async (oldCohortsList, { getState }) => {
    try {
      const providerId = getState().me?.id ?? '0'

      let count = 0
      let cohortsList = oldCohortsList

      while (
        cohortsList?.some(
          (cohort) =>
            !cohort.fhir_group_id &&
            (cohort.request_job_status === 'pending' || cohort.request_job_status === 'started')
        )
      ) {
        const newResult = await services.projects.fetchCohortsList((+providerId).toString(), oldCohortsList.length, 0)

        count = newResult.count
        cohortsList = newResult.results

        await sleep(2500)
      }

      return { count, cohortsList }
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
  async ({ newCohort }, { getState, dispatch }) => {
    try {
      const state = getState().cohort
      const cohortsList: CohortType[] = state.cohortsList ?? []

      const createdCohort = await services.projects.addCohort(newCohort)

      dispatch(initUserCohortsThunk())

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
      const stateExploredCohort = getState().exploredCohort
      // eslint-disable-next-line
      let cohortsList: CohortType[] = state.cohortsList ? [...state.cohortsList] : []
      const foundItem = cohortsList.find(({ uuid }) => uuid === editedCohort.uuid)
      if (!foundItem) {
        // if not found -> create it
        dispatch(addCohort({ newCohort: editedCohort }))
      } else {
        const index = cohortsList.indexOf(foundItem)

        const modifiedCohort = await services.projects.editCohort(editedCohort)

        cohortsList[index] = modifiedCohort
      }

      if (stateExploredCohort.uuid === editedCohort.uuid) {
        dispatch(fetchExploredCohortInBackground({ context: 'cohort', id: editedCohort.fhir_group_id }))
      }
      dispatch(initUserCohortsThunk())

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
  async ({ deletedCohort }, { getState, dispatch }) => {
    try {
      const state = getState().cohort
      // eslint-disable-next-line
      let cohortsList: CohortType[] = state.cohortsList ? [...state.cohortsList] : []
      const foundItem = cohortsList.find(({ uuid }) => uuid === deletedCohort.uuid)
      const index = foundItem ? cohortsList.indexOf(foundItem) : -1
      if (index !== -1) {
        // delete item at index
        await services.projects.deleteCohort(deletedCohort)

        cohortsList.splice(index, 1)
      }
      setTimeout(() => {
        dispatch(initUserCohortsThunk())
      }, 500)

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
    setAsFavoriteCohort: (state: CohortState, action: PayloadAction<string | null>) => {
      const cohortsList: CohortType[] = state.cohortsList ? [...state.cohortsList] : []
      const selectedCohortId = action.payload
      return {
        ...state,
        cohortsList: cohortsList.map((cohortItem) => {
          return cohortItem.uuid === selectedCohortId
            ? { ...cohortItem, favorite: !cohortItem.favorite }
            : { ...cohortItem }
        })
      }
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
    // fetchCohortInBackGround
    builder.addCase(fetchCohortInBackGround.pending, (state) => ({
      ...state,
      loading: false
    }))
    builder.addCase(fetchCohortInBackGround.fulfilled, (state, action) => ({
      ...state,
      ...action.payload
    }))
    // deleteCohort
    builder.addCase(deleteCohort.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(deleteCohort.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(deleteCohort.rejected, (state) => ({ ...state, loading: false }))
  }
})

export default setCohortSlice.reducer
export { fetchCohorts, addCohort, editCohort, deleteCohort }
export const { clearCohort, setSelectedCohort, setAsFavoriteCohort } = setCohortSlice.actions
