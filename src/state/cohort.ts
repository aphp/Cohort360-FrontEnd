import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'
import { Cohort } from 'types'

import { logout, login } from './me'
import { fetchExploredCohortInBackground } from './exploredCohort'
import services from 'services'

export type CohortState = {
  loading: boolean
  count: number
  selectedCohort: Cohort | null
  cohortsList: Cohort[]
}

const defaultInitialState: CohortState = {
  loading: false,
  count: 0,
  selectedCohort: null,
  cohortsList: []
}

type FetchCohortListReturn = {
  count: number
  selectedCohort?: null
  cohortsList: Cohort[]
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

      let cohortList: Cohort[] = cohorts.results || []
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

const fetchCohortInBackGround = createAsyncThunk<FetchCohortListReturn, Cohort[], { state: RootState }>(
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
  newCohort: Cohort
}
type AddCohortReturn = {
  selectedCohort: null
  cohortsList: Cohort[]
}

const addCohort = createAsyncThunk<AddCohortReturn, AddCohortParams, { state: RootState }>(
  'cohort/addCohort',
  async ({ newCohort }, { getState }) => {
    try {
      const state = getState().cohort
      const cohortsList: Cohort[] = state.cohortsList ?? []

      const createdCohort = await services.projects.addCohort(newCohort)

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
  editedCohort: Cohort
}
type EditCohortReturn = {
  selectedCohort: null
  cohortsList: Cohort[]
}

const editCohort = createAsyncThunk<EditCohortReturn, EditCohortParams, { state: RootState }>(
  'cohort/editCohort',
  async ({ editedCohort }, { getState, dispatch }) => {
    try {
      const state = getState().cohort
      const stateExploredCohort = getState().exploredCohort
      // eslint-disable-next-line
      let cohortsList: Cohort[] = state.cohortsList ? [...state.cohortsList] : []
      const foundItem = cohortsList.find(({ uuid }) => uuid === editedCohort.uuid)
      if (!foundItem) {
        // if not found -> create it
        dispatch(addCohort({ newCohort: editedCohort }))
      } else {
        const index = cohortsList.indexOf(foundItem)

        const modifiedCohort = await services.projects.editCohort(editedCohort)

        cohortsList[index] = {
          ...cohortsList[index],
          name: modifiedCohort.name,
          description: modifiedCohort.description,
          favorite: modifiedCohort.favorite,
          modified_at: modifiedCohort.modified_at
        }
      }

      if (stateExploredCohort.uuid === editedCohort.uuid) {
        dispatch(fetchExploredCohortInBackground({ context: 'cohort', id: editedCohort.fhir_group_id }))
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
  deletedCohort: Cohort
}
type DeleteCohortReturn = {
  selectedCohort: null
  cohortsList: Cohort[]
}

const deleteCohort = createAsyncThunk<DeleteCohortReturn, DeleteCohortParams, { state: RootState }>(
  'cohort/deleteCohort',
  async ({ deletedCohort }, { getState }) => {
    try {
      const state = getState().cohort
      // eslint-disable-next-line
      let cohortsList: Cohort[] = state.cohortsList ? [...state.cohortsList] : []
      const foundItem = cohortsList.find(({ uuid }) => uuid === deletedCohort.uuid)
      const index = foundItem ? cohortsList.indexOf(foundItem) : -1
      if (index !== -1) {
        // delete item at index
        await services.projects.deleteCohort(deletedCohort)

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
/**
 * setFavoriteCohort
 *
 */
type SetFavoriteCohortParams = {
  favCohort: Cohort
}
type SetFavoriteCohortReturn = {
  cohortsList: Cohort[]
}

const setFavoriteCohort = createAsyncThunk<SetFavoriteCohortReturn, SetFavoriteCohortParams, { state: RootState }>(
  'cohort/setFavoriteCohortThunk',
  async ({ favCohort }, { getState }) => {
    const cohortsState = getState().cohort

    const cohortsList = cohortsState.cohortsList ? [...cohortsState.cohortsList] : []

    const newFavCohort = await services.projects.editCohort({ ...favCohort, favorite: !favCohort.favorite })

    const foundItem = cohortsList.find(({ uuid }) => uuid === newFavCohort.uuid)
    const index = foundItem ? cohortsList.indexOf(foundItem) : -1
    if (index !== -1) {
      cohortsList[index] = newFavCohort
    }

    return {
      cohortsList
    }
  }
)

const setCohortSlice = createSlice({
  name: 'cohort',
  initialState: defaultInitialState as CohortState,
  reducers: {
    clearCohort: () => {
      return defaultInitialState
    },
    setSelectedCohort: (state: CohortState, action: PayloadAction<string | null>) => {
      const cohortsList: Cohort[] = state.cohortsList ?? []
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
              name: `Cohort ${(cohortsList.length || 0) + 1}`,
              description: ''
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
    builder.addCase(logout.fulfilled, () => defaultInitialState)
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
    // setFavoriteCohort
    builder.addCase(setFavoriteCohort.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(setFavoriteCohort.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(setFavoriteCohort.rejected, (state) => ({ ...state, loading: false }))
  }
})

export default setCohortSlice.reducer
export { fetchCohorts, addCohort, editCohort, deleteCohort, setFavoriteCohort }
export const { clearCohort, setSelectedCohort } = setCohortSlice.actions
