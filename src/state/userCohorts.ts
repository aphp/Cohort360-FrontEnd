import { FormattedCohort } from 'types'
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'
import { fetchFavoriteCohorts, fetchLastCohorts, setFavorite, onRemoveCohort } from 'services/savedResearches'

export type UserCohortsState = {
  lastCohorts?: FormattedCohort[]
  favoriteCohorts?: FormattedCohort[]
}

const initialState: UserCohortsState = {}

const initUserCohortsThunk = createAsyncThunk<UserCohortsState, void, { state: RootState }>(
  'userCohorts/initUserCohortsThunk',
  async () => {
    const [favoriteCohorts, lastCohorts] = await Promise.all([fetchFavoriteCohorts(), fetchLastCohorts()])
    return { favoriteCohorts: favoriteCohorts ?? [], lastCohorts: lastCohorts ?? [] }
  }
)

const fetchFavoriteCohortsThunk = createAsyncThunk<void, void, { state: RootState }>(
  'userCohorts/fetchFavoriteCohortsThunk',
  async (params, { dispatch }) => {
    const favoriteCohorts = await fetchFavoriteCohorts()
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    dispatch(userCohortsSlice.actions.setFavoriteCohorts(favoriteCohorts))
  }
)

const setFavoriteCohortThunk = createAsyncThunk<void, { cohortId: string }, { state: RootState }>(
  'userCohorts/setFavoriteCohortThunk',
  async ({ cohortId }, { getState, dispatch }) => {
    const { favoriteCohorts } = getState().userCohorts
    const isCohortFavorite = favoriteCohorts ? favoriteCohorts.some((cohort) => cohort.researchId === cohortId) : false
    if (await setFavorite(cohortId, isCohortFavorite)) {
      dispatch(fetchFavoriteCohortsThunk())
    }
  }
)

const deleteUserCohortThunk = createAsyncThunk<void, { cohortId: string }, { state: RootState }>(
  'userCohorts/setFavoriteCohortThunk',
  async ({ cohortId }, { dispatch }) => {
    if (await onRemoveCohort(cohortId)) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      dispatch(userCohortsSlice.actions.deleteCohort(cohortId))
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
    builder.addCase(initUserCohortsThunk.fulfilled, (state, { payload }) => {
      return payload
    })
  }
})

export default userCohortsSlice.reducer
export { initUserCohortsThunk, setFavoriteCohortThunk, deleteUserCohortThunk }
