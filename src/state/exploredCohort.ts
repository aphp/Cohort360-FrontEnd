import { CohortData } from 'types'
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { logout } from './me'
import { RootState } from 'state'
import { fetchCohort } from 'services/cohortInfos'
import { fetchMyPatients } from 'services/myPatients'
import { fetchPerimetersInfos } from 'services/perimeters'
import api from 'services/api'

export type ExploredCohortState = {
  loading: boolean
  requestId?: string
  cohortType?: 'patients' | 'cohort' | 'perimeters' | 'new_cohort'
} & CohortData

const initialState: ExploredCohortState = {
  name: '',
  totalPatients: 0,
  originalPatients: [],
  totalDocs: 0,
  documentsList: [],
  wordcloudData: [],
  encounters: [],
  genderRepartitionMap: undefined,
  visitTypeRepartitionData: undefined,
  monthlyVisitData: undefined,
  agePyramidData: undefined,
  requestId: '',
  loading: false
}

const fetchExploredCohort = createAsyncThunk<
  CohortData,
  { context: 'patients' | 'cohort' | 'perimeters' | 'new_cohort'; id?: string | string[] },
  { state: RootState }
>('exploredCohort/fetchExploredCohort', async ({ context, id }, { getState, dispatch }) => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  dispatch(exploredCohortSlice.actions.setCohortType(context))
  const state = getState()
  const stateCohort = state.exploredCohort.cohort
  let shouldRefreshData = true
  switch (context) {
    case 'cohort':
      //FIXME: Cohort exploring cache removed for demo purposes
      // shouldRefreshData = !stateCohort || Array.isArray(stateCohort) || stateCohort.id !== id
      break
    case 'perimeters': {
      if (!id || !Array.isArray(id)) {
        throw new Error('No given perimeter ids')
      }
      const statePerimeterIds =
        stateCohort &&
        Array.isArray(stateCohort) &&
        (stateCohort.map((group) => group.id).filter((id) => id !== undefined) as string[])

      shouldRefreshData =
        !statePerimeterIds || statePerimeterIds.length !== id.length || statePerimeterIds.some((id) => !id.includes(id))
      break
    }
    case 'patients': {
      shouldRefreshData = stateCohort !== undefined && state.exploredCohort.originalPatients !== undefined
      break
    }

    default:
      break
  }
  let cohort: CohortData | undefined
  if (shouldRefreshData) {
    switch (context) {
      case 'cohort': {
        if (id) {
          cohort = await fetchCohort(id as string)
        }
        break
      }
      case 'patients': {
        cohort = await fetchMyPatients()
        break
      }
      case 'perimeters': {
        // In this case, id is an array or organization ids
        if (id) {
          cohort = await fetchPerimetersInfos(id as string[])
        }
        break
      }

      default:
        break
    }
  }
  return cohort ?? state.exploredCohort
})

const excludePatientFromCohort = createAsyncThunk<void, string | undefined, { state: RootState }>(
  'exploredCohort/excludePatientFromCohort',
  async (patientId, { getState, dispatch }) => {
    const exploredCohortState = getState().exploredCohort
    const { cohort: group } = exploredCohortState

    if (!group) {
      return
    }

    const newGroupMembers = group.member?.filter(({ entity }) => entity?.reference !== `Patient/${patientId}`)
    const patchRequest = await api.put(`/Group/${group.id}`, { ...group, member: newGroupMembers })

    if (patchRequest.status === 200) {
      const newGroup = await fetchCohort(group.id as string)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      newGroup && dispatch(exploredCohortSlice.actions.setExploredCohort(newGroup))
    }
  }
)

const exploredCohortSlice = createSlice({
  name: 'exploredCohort',
  initialState,
  reducers: {
    setExploredCohort: (state: ExploredCohortState, action: PayloadAction<CohortData | undefined>) => {
      return action.payload ? { ...state, ...action.payload } : initialState
    },
    setCohortType: (state, action: PayloadAction<typeof initialState.cohortType>) => {
      state.cohortType = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => {
      return initialState
    })
    builder.addCase(fetchExploredCohort.pending, (state, { meta }) => {
      state.loading = true
      state.requestId = meta.requestId
    })
    builder.addCase(fetchExploredCohort.fulfilled, (state, { payload, meta }) => {
      return { ...payload, cohortType: state.cohortType, loading: state.requestId !== meta.requestId }
    })
  }
})

export default exploredCohortSlice.reducer
export { fetchExploredCohort, excludePatientFromCohort }
export const { setExploredCohort } = exploredCohortSlice.actions
