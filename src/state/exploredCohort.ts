import { LogoutActionType } from './me'
import { CohortData } from 'types'
import { IGroup_Member } from '@ahryman40k/ts-fhir-types/lib/R4'

type ExploredCohortState = {
  importedPatients: any[]
  includedPatients: any[]
  excludedPatients: any[]
} & CohortData

const initialState: ExploredCohortState = {
  importedPatients: [],
  includedPatients: [],
  excludedPatients: []
}

type ExploredCohortActions =
  | LogoutActionType
  | SetExploredCohortAction
  | AddImportedPatientsAction
  | removeImportedPatientsAction
  | includePatientsAction
  | excludePatientsAction
  | removeExcludedPatientsAction
  | updateCohortsAction

type SetExploredCohortAction = {
  type: 'SET_EXPLORED_COHORT'
  payload?: CohortData
}

export const setExploredCohort = (payload?: CohortData): SetExploredCohortAction => {
  return {
    type: 'SET_EXPLORED_COHORT',
    payload
  }
}

type AddImportedPatientsAction = {
  type: 'ADD_IMPORTED_PATIENTS'
  payload: any[]
}
export const addImportedPatients = (patients: any[]): AddImportedPatientsAction => {
  return {
    type: 'ADD_IMPORTED_PATIENTS',
    payload: patients
  }
}
type removeImportedPatientsAction = {
  type: 'REMOVE_IMPORTED_PATIENTS'
  payload: any[]
}

export const removeImportedPatients = (patients: any[]): removeImportedPatientsAction => {
  return {
    type: 'REMOVE_IMPORTED_PATIENTS',
    payload: patients
  }
}

type includePatientsAction = {
  type: 'INCLUDE_PATIENTS'
  payload: any[]
}

export const includePatients = (patients: any[]): includePatientsAction => {
  return {
    type: 'INCLUDE_PATIENTS',
    payload: patients
  }
}

type excludePatientsAction = {
  type: 'EXCLUDE_PATIENTS'
  payload: any[]
}

export const excludePatients = (patients: any[]): excludePatientsAction => {
  return {
    type: 'EXCLUDE_PATIENTS',
    payload: patients
  }
}

type removeExcludedPatientsAction = {
  type: 'REMOVE_EXCLUDED_PATIENTS'
  payload: any[]
}
export const removeExcludedPatients = (patients: any[]): removeExcludedPatientsAction => {
  return {
    type: 'REMOVE_EXCLUDED_PATIENTS',
    payload: patients
  }
}

type updateCohortsAction = {
  type: 'UPDATE_COHORT'
  payload: IGroup_Member[]
}
export const updateCohort = (patients: IGroup_Member[]): updateCohortsAction => {
  return {
    type: 'UPDATE_COHORT',
    payload: patients
  }
}

const exploredCohort = (
  state: ExploredCohortState = initialState,
  action: ExploredCohortActions
): ExploredCohortState => {
  switch (action.type) {
    case 'SET_EXPLORED_COHORT':
      if (!action.payload) {
        return initialState
      }
      return { ...state, ...action.payload }

    case 'ADD_IMPORTED_PATIENTS': {
      const importedPatients = [...state.importedPatients, ...action.payload]
      return {
        ...state,
        importedPatients: importedPatients.filter(
          (patient, index, self) =>
            index === self.findIndex((t) => t.id === patient.id) &&
            !state.originalPatients?.map((p) => p.id).includes(patient.id) &&
            !state.excludedPatients.map((p) => p.id).includes(patient.id)
        )
      }
    }

    case 'REMOVE_IMPORTED_PATIENTS': {
      const listId = action.payload.map((patient) => patient.id)
      return {
        ...state,
        importedPatients: state.importedPatients.filter((patient) => !listId.includes(patient.id))
      }
    }

    case 'INCLUDE_PATIENTS': {
      const includedPatients = [...state.includedPatients, ...action.payload]
      const importedPatients = state.importedPatients.filter(
        (patient) => !action.payload.map((p) => p.id).includes(patient.id)
      )
      return {
        ...state,
        importedPatients: importedPatients,
        includedPatients: includedPatients
      }
    }

    case 'EXCLUDE_PATIENTS': {
      const toExcluded = state.originalPatients?.filter((patient) =>
        action.payload.map((p) => p.id).includes(patient.id)
      )
      const toImported = state.includedPatients.filter((patient) =>
        action.payload.map((p) => p.id).includes(patient.id)
      )
      const allExcludedPatients = [...state.excludedPatients, ...toExcluded]
      const allImportedPatients = [...state.importedPatients, ...toImported]
      return {
        ...state,
        includedPatients: state.includedPatients.filter(
          (patient) => !action.payload.map((p) => p.id).includes(patient.id)
        ),
        originalPatients: state.originalPatients?.filter(
          (patient) => !action.payload.map((p) => p.id).includes(patient.id)
        ),
        excludedPatients: allExcludedPatients.filter(
          (patient, index, self) => index === self.findIndex((t) => t.id === patient.id)
        ),
        importedPatients: allImportedPatients
      }
    }

    case 'REMOVE_EXCLUDED_PATIENTS': {
      const originalPatients = [...state.originalPatients, ...action.payload]
      const excludedPatients = state.excludedPatients.filter(
        (patient) => !action.payload.map((p) => p.id).includes(patient.id)
      )
      return {
        ...state,
        originalPatients: originalPatients,
        excludedPatients: excludedPatients
      }
    }

    case 'UPDATE_COHORT': {
      return {
        ...state,
        cohort:
          Array.isArray(state.cohort) || !state.cohort ? state.cohort : { ...state.cohort, member: action.payload },
        importedPatients: [],
        includedPatients: [],
        excludedPatients: []
      }
    }

    case 'LOGOUT': {
      return initialState
    }

    default:
      return state
  }
}

export default exploredCohort
