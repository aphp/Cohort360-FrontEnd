import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'
import { Cohort, CohortFilters, Sort } from 'types'

import { logout, login } from './me'
import services from 'services'

export type CohortState = {
  loading: boolean
  count: number
  selectedCohort: Cohort | null
  cohortsList: Cohort[]
  favoriteCohortsList: Cohort[]
  lastCohorts: Cohort[]
}

const defaultInitialState: CohortState = {
  loading: false,
  count: 0,
  selectedCohort: null,
  cohortsList: [],
  favoriteCohortsList: [],
  lastCohorts: []
}

type FetchCohortListReturn = {
  count: number
  selectedCohort?: null
  cohortsList?: Cohort[]
  favoriteCohortsList?: Cohort[]
  lastCohorts?: Cohort[]
}

type FetchCohortsParams = {
  listType?: 'AllCohorts' | 'FavoriteCohorts' | 'LastCohorts'
  sort?: Sort
  filters?: CohortFilters
  searchInput?: string
  limit?: number
  page?: number
}

const fetchCohorts = createAsyncThunk<FetchCohortListReturn, FetchCohortsParams, { state: RootState }>(
  'cohort/fetchCohorts',
  async ({ listType = 'AllCohorts', sort, filters, searchInput = '', limit = 20, page = 1 }, { dispatch }) => {
    try {
      const _sort: Sort = sort ? sort : { sortBy: 'modified_at', sortDirection: 'desc' }
      const _filters = filters
        ? filters
        : {
            status: [],
            favorite: 'all',
            minPatients: null,
            maxPatients: null,
            startDate: null,
            endDate: null
          }

      const offset = ((page ?? 1) - 1) * limit ?? 0

      const cohorts = (await services.projects.fetchCohortsList(_filters, searchInput, _sort, limit, offset)) || {}

      const cohortList: Cohort[] = cohorts.results || []

      const forceRefresh = cohorts?.results?.some(
        (cohortList) =>
          !cohortList.fhir_group_id &&
          (cohortList.request_job_status === 'pending' || cohortList.request_job_status === 'started')
      )

      if (forceRefresh) {
        dispatch(
          fetchCohortInBackGround({
            listType,
            oldCohortsList: cohortList,
            filters: _filters,
            searchInput: searchInput,
            sort: _sort,
            limit: limit,
            offset: offset
          })
        )
      }

      return {
        ...(listType === 'AllCohorts' && { cohortsList: cohortList }),
        ...(listType === 'FavoriteCohorts' && { favoriteCohortsList: cohortList }),
        ...(listType === 'LastCohorts' && { lastCohorts: cohortList }),
        count: cohorts.count,
        selectedCohort: null
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

const sleep = (m: any) => new Promise((r: any) => setTimeout(r, m))

type FetchCohortInBackGroundParams = {
  listType?: 'AllCohorts' | 'FavoriteCohorts' | 'LastCohorts'
  oldCohortsList: Cohort[]
  filters: CohortFilters
  searchInput: string
  sort: Sort
  limit: number
  offset: number
}
const fetchCohortInBackGround = createAsyncThunk<
  FetchCohortListReturn,
  FetchCohortInBackGroundParams,
  { state: RootState }
>(
  'cohort/fetchCohortInBackGround',
  async ({ listType = 'AllCohorts', oldCohortsList, filters, searchInput, sort, limit, offset }) => {
    try {
      let count = 0
      let cohortsList = oldCohortsList

      while (
        cohortsList?.some(
          (cohort) =>
            !cohort.fhir_group_id &&
            (cohort.request_job_status === 'pending' || cohort.request_job_status === 'started')
        )
      ) {
        const newResult = await services.projects.fetchCohortsList(filters, searchInput, sort, limit, offset)

        count = newResult.count
        cohortsList = newResult.results

        await sleep(2500)
      }

      return {
        count,
        ...(listType === 'AllCohorts' && { cohortsList: cohortsList }),
        ...(listType === 'FavoriteCohorts' && { favoriteCohortsList: cohortsList }),
        ...(listType === 'LastCohorts' && { lastCohorts: cohortsList })
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

const editCohort = createAsyncThunk<void, EditCohortParams, { state: RootState }>(
  'cohort/editCohort',
  async ({ editedCohort }) => {
    try {
      await services.projects.editCohort(editedCohort)
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

const deleteCohort = createAsyncThunk<void, DeleteCohortParams, { state: RootState }>(
  'cohort/deleteCohort',
  async ({ deletedCohort }) => {
    try {
      await services.projects.deleteCohort(deletedCohort)
    } catch (error) {
      console.error(error)
      throw error
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
    setSelectedCohort: (state: CohortState, action: PayloadAction<Cohort | null>) => {
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
          return {
            ...state,
            selectedCohort: selectedCohortId
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
    builder.addCase(editCohort.fulfilled, (state) => ({ ...state, loading: false }))
    builder.addCase(editCohort.rejected, (state) => ({ ...state, loading: false }))
    // deleteCohort
    builder.addCase(deleteCohort.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(deleteCohort.fulfilled, (state) => ({ ...state, loading: false }))
    builder.addCase(deleteCohort.rejected, (state) => ({ ...state, loading: false }))
    // fetchCohortInBackGround
    builder.addCase(fetchCohortInBackGround.pending, (state) => ({
      ...state,
      loading: false
    }))
    builder.addCase(fetchCohortInBackGround.fulfilled, (state, action) => ({
      ...state,
      ...action.payload
    }))
  }
})

export default setCohortSlice.reducer
export { fetchCohorts, addCohort, editCohort, deleteCohort }
export const { clearCohort, setSelectedCohort } = setCohortSlice.actions
