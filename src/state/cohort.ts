import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'
import { Cohort } from 'types'

import { logout, login, impersonate } from './me'
import services from 'services/aphp'
import { JobStatus } from '../utils/constants'
import { CohortsFilters, Direction, Order, OrderBy, SearchCriterias } from 'types/searchCriterias'
import { CohortsType } from 'types/cohorts'

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
  options?: {
    page?: number
    limit?: number
    searchCriterias?: SearchCriterias<CohortsFilters | null>
  }
  signal?: AbortSignal
}

const fetchCohorts = createAsyncThunk<FetchCohortListReturn, FetchCohortsParams, { state: RootState }>(
  'cohort/fetchCohorts',
  async ({ options, signal }, { dispatch }) => {
    try {
      const cohortsType = options?.searchCriterias?.filters?.favorite || CohortsType.ALL
      const orderBy = options?.searchCriterias?.orderBy || {
        orderBy: Order.MODIFIED,
        orderDirection: Direction.DESC
      }
      const filters = options?.searchCriterias?.filters || {
        status: [],
        favorite: cohortsType,
        minPatients: null,
        maxPatients: null,
        startDate: null,
        endDate: null
      }
      const limit = options?.limit || 20
      const offset = ((options?.page ?? 1) - 1) * limit
      const searchInput = options?.searchCriterias?.searchInput || ''

      const cohorts =
        (await services.projects.fetchCohortsList(filters, searchInput, orderBy, limit, offset, signal)) || {}

      const cohortsList: Cohort[] = cohorts.results || []

      const forceRefresh = cohorts?.results?.some(
        (cohortList) =>
          !cohortList.fhir_group_id &&
          (cohortList.request_job_status === JobStatus.pending || cohortList.request_job_status === JobStatus.new)
      )

      if (forceRefresh) {
        dispatch(
          fetchCohortInBackGround({
            cohortsType: cohortsType,
            oldCohortsList: cohortsList,
            filters: filters,
            searchInput: searchInput,
            sort: orderBy,
            limit: limit,
            offset: offset
          })
        )
      }
      return {
        count: cohorts.count,
        selectedCohort: null,
        ...(cohortsType === CohortsType.ALL && { cohortsList: cohortsList }),
        ...(cohortsType === CohortsType.FAVORITE && { favoriteCohortsList: cohortsList }),
        ...(cohortsType === CohortsType.NOT_FAVORITE && { favoriteCohortsList: cohortsList }),
        ...(cohortsType === CohortsType.LAST && { lastCohorts: cohortsList })
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

const sleep = (m: any) => new Promise((r: any) => setTimeout(r, m))

type FetchCohortInBackGroundParams = {
  cohortsType?: CohortsType
  oldCohortsList: Cohort[]
  filters: CohortsFilters
  searchInput: string
  sort: OrderBy
  limit: number
  offset: number
}
const fetchCohortInBackGround = createAsyncThunk<
  FetchCohortListReturn,
  FetchCohortInBackGroundParams,
  { state: RootState }
>(
  'cohort/fetchCohortInBackGround',
  async ({ cohortsType = CohortsType.ALL, oldCohortsList, filters, searchInput, sort, limit, offset }) => {
    try {
      let count = 0
      let cohortsList = oldCohortsList

      while (
        cohortsList?.some(
          (cohort) =>
            !cohort.fhir_group_id &&
            (cohort.request_job_status === JobStatus.pending || cohort.request_job_status === JobStatus.new)
        )
      ) {
        const newResult = await services.projects.fetchCohortsList(filters, searchInput, sort, limit, offset)

        count = newResult.count
        cohortsList = newResult.results

        await sleep(2500)
      }

      return {
        count,
        ...(cohortsType === CohortsType.ALL && { cohortsList: cohortsList }),
        ...(cohortsType === CohortsType.FAVORITE && { favoriteCohortsList: cohortsList }),
        ...(cohortsType === CohortsType.LAST && { lastCohorts: cohortsList })
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
      const selectedCohortId = action.payload
      switch (selectedCohortId) {
        case null:
          return {
            ...state,
            selectedCohort: null
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
    builder.addCase(impersonate, () => defaultInitialState)
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
