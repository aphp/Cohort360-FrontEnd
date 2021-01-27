import { RootState } from './index'
import { CohortData } from 'types'
import { IGroup_Member } from '@ahryman40k/ts-fhir-types/lib/R4'
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { logout } from './me'
import { fetchCohort } from 'services/cohortInfos'
import { fetchMyPatients } from 'services/myPatients'
import { fetchPerimetersInfos } from 'services/perimeters'

type ExploredCohortState = {
  importedPatients: any[]
  includedPatients: any[]
  excludedPatients: any[]
  loading: boolean
  requestId?: string
} & CohortData

const initialState: ExploredCohortState & CohortData = {
  // CohortData
  name: '',
  cohort: [],
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
  // ExploredCohortState
  importedPatients: [],
  includedPatients: [],
  excludedPatients: [],
  loading: false
}

const fetchExploredCohort = createAsyncThunk<
  CohortData,
  { context: 'patients' | 'cohort' | 'perimeters' | 'new_cohort'; id?: string },
  { state: RootState }
>('exploredCohort/fetchExploredCohort', async ({ context, id }, { getState }) => {
  const state = getState()
  const stateCohort = state.exploredCohort.cohort
  let shouldRefreshData = true
  switch (context) {
    case 'cohort':
      shouldRefreshData = !stateCohort || Array.isArray(stateCohort) || stateCohort.id !== id
      break
    case 'perimeters': {
      if (!id) {
        throw new Error('No given perimeter ids')
      }
      const perimeterIds = id.split(',')
      const statePerimeterIds =
        stateCohort &&
        Array.isArray(stateCohort) &&
        (stateCohort.map((group) => group.id).filter((id) => id !== undefined) as string[])

      shouldRefreshData =
        !statePerimeterIds ||
        statePerimeterIds.length !== perimeterIds.length ||
        statePerimeterIds.some((id: any) => !perimeterIds.includes(id))
      break
    }
    case 'patients': {
      shouldRefreshData = stateCohort !== undefined && state.exploredCohort.originalPatients !== undefined
      break
    }

    default:
      break
  }
  let cohort
  if (shouldRefreshData) {
    switch (context) {
      case 'cohort': {
        if (id) {
          cohort = await fetchCohort(id)
        }
        break
      }
      case 'patients': {
        cohort = await fetchMyPatients()
        break
      }
      case 'perimeters': {
        if (id) {
          cohort = await fetchPerimetersInfos(id)
        }
        break
      }

      default:
        break
    }
  }
  return cohort ?? initialState
})

const exploredCohortSlice = createSlice({
  name: 'exploredCohort',
  initialState,
  reducers: {
    setExploredCohort: (state: ExploredCohortState, action: PayloadAction<CohortData | undefined>) => {
      return action.payload ? { ...state, ...action.payload } : initialState
    },
    updateCohort: (state: ExploredCohortState, action: PayloadAction<IGroup_Member[]>) => {
      return {
        ...state,
        cohort:
          Array.isArray(state.cohort) || !state.cohort ? state.cohort : { ...state.cohort, member: action.payload },
        importedPatients: [],
        includedPatients: [],
        excludedPatients: []
      }
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
      return { ...state, ...payload, loading: state.requestId !== meta.requestId }
    })
  }
})

export default exploredCohortSlice.reducer
export const { setExploredCohort, updateCohort } = exploredCohortSlice.actions
