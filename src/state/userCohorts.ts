import { FormattedCohort } from 'types'
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'
import { fetchFavoriteCohorts, fetchLastCohorts, setFavorite, onRemoveCohort } from 'services/savedResearches'
import { setAsFavoriteCohort } from './cohort'

import { logout, login } from './me'

export type UserCohortsState = {
  lastCohorts?: FormattedCohort[]
  favoriteCohorts?: FormattedCohort[]
}

const localStorageUserCohorts = localStorage.getItem('userCohorts') ?? null

const initialState: UserCohortsState = localStorageUserCohorts ? JSON.parse(localStorageUserCohorts) : {}

const initUserCohortsThunk = createAsyncThunk<UserCohortsState, void, { state: RootState }>(
  'userCohorts/initUserCohortsThunk',
  async (params, { getState }) => {
    const meState = getState().me

    const [favoriteCohorts, lastCohorts] = await Promise.all([
      fetchFavoriteCohorts(meState?.id),
      fetchLastCohorts(meState?.id)
    ])

    return { favoriteCohorts: favoriteCohorts ?? [], lastCohorts: lastCohorts ?? [] }
  }
)

const fetchFavoriteCohortsThunk = createAsyncThunk<void, void, { state: RootState }>(
  'userCohorts/fetchFavoriteCohortsThunk',
  async (params, { getState, dispatch }) => {
    const meState = getState().me

    const favoriteCohorts = await fetchFavoriteCohorts(meState?.id)
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    dispatch<any>(userCohortsSlice.actions.setFavoriteCohorts(favoriteCohorts))
  }
)

const setFavoriteCohortThunk = createAsyncThunk<void, { cohortId: string }, { state: RootState }>(
  'userCohorts/setFavoriteCohortThunk',
  async ({ cohortId }, { getState, dispatch }) => {
    const { favoriteCohorts } = getState().userCohorts
    const isCohortFavorite = favoriteCohorts ? favoriteCohorts.some((cohort) => cohort.researchId === cohortId) : false
    if (await setFavorite(cohortId, isCohortFavorite)) {
      dispatch<any>(fetchFavoriteCohortsThunk())
      dispatch<any>(setAsFavoriteCohort(cohortId))
    }
  }
)

const deleteUserCohortThunk = createAsyncThunk<void, { cohortId: string }, { state: RootState }>(
  'userCohorts/deleteUserCohortThunk',
  async ({ cohortId }, { dispatch }) => {
    if (await onRemoveCohort(cohortId)) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      dispatch<any>(userCohortsSlice.actions.deleteCohort(cohortId))
    }
  }
)

const userCohortsSlice = createSlice({
  name: 'userCohorts',
  initialState,
  reducers: {
    deleteCohort: (state, { payload }: PayloadAction<string>) => {
      state.favoriteCohorts = state.favoriteCohorts?.filter((cohort) => cohort.researchId !== payload)
      state.lastCohorts = state.lastCohorts?.filter((cohort) => cohort.researchId !== payload)
    },
    setFavoriteCohorts: (state, { payload }: PayloadAction<FormattedCohort[] | undefined>) => {
      state.favoriteCohorts = payload
      const { lastCohorts } = state

      if (payload) {
        state.lastCohorts = lastCohorts?.map((cohort) => {
          const isCohortFav = payload.some((favCohort) => favCohort.researchId === cohort.researchId)
          return { ...cohort, favorite: isCohortFav }
        })
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => ({
      lastCohorts: [],
      favoriteCohorts: []
    }))
    builder.addCase(logout, () => ({
      lastCohorts: [],
      favoriteCohorts: []
    }))
    builder.addCase(initUserCohortsThunk.fulfilled, (state, { payload }) => {
      return payload
    })
  }
})

export default userCohortsSlice.reducer
export { initUserCohortsThunk, setFavoriteCohortThunk, deleteUserCohortThunk }
