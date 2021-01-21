import { RootState } from './index'
import { CohortData } from 'types'
import { IGroup_Member } from '@ahryman40k/ts-fhir-types/lib/R4'
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { logout } from './me'

import { fetchCohort } from '../services/cohortInfos'
import { fetchMyPatients } from '../services/myPatients'
import { fetchPerimetersInfos } from '../services/perimeters'

type ExploredCohortState = {
  importedPatients?: any[]
  includedPatients?: any[]
  excludedPatients?: any[]
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
  excludedPatients: []
}

const _fetchCohort = async (cohortId: string) => {
  return (await fetchCohort(cohortId)) ?? initialState
}

const _fetchMyPatients = async () => {
  return (await fetchMyPatients()) ?? initialState
}

const _fetchPerimeters = async (perimetreIds: string) => {
  return (await fetchPerimetersInfos(perimetreIds)) ?? initialState
}

export const fetchDashboardInfo = createAsyncThunk<
  CohortData,
  { context: string; cohortId?: string },
  { state: RootState }
>('cohort/fetchInfo', async (dashboardInfo, thunkAPI) => {
  const { context, cohortId } = dashboardInfo

  const prevState = thunkAPI.getState()
  const prevExploredCohort = prevState.exploredCohort
  console.log('prevExploredCohort :>> ', prevExploredCohort)
  // if (prevExploredCohort?.cohort?.id === cohortId) return prevExploredCohort

  let cohortInfo = initialState
  switch (context) {
    case 'patients':
      cohortInfo = await _fetchMyPatients()
      break
    case 'cohort':
      if (!cohortId) return initialState

      cohortInfo = await _fetchCohort(cohortId)
      break
    case 'perimeters':
      if (!cohortId) return initialState

      cohortInfo = await _fetchPerimeters(cohortId)
      break
    default:
      break
  }
  console.log('cohortInfo :>> ', cohortInfo)
  return cohortInfo
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
    builder.addCase(fetchDashboardInfo.pending, (state, action) => {
      return {
        ...state,
        agePyramidData: undefined,
        genderRepartitionMap: undefined,
        monthlyVisitData: undefined,
        visitTypeRepartitionData: undefined,
        originalPatients: undefined
      }
    })
    builder.addCase(fetchDashboardInfo.fulfilled, (state, action) => {
      return action.payload
    })
  }
})

export default exploredCohortSlice.reducer
export const { setExploredCohort, updateCohort } = exploredCohortSlice.actions
