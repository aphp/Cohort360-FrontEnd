import { LogoutActionType } from './me'

const initialState = {
  populationSources: [],
  inclusionCriterias: [],
  cohortName: ''
}

type CohortActions =
  | setPopulationSourceAction
  | addInclusionCriteriaAction
  | removeInclusionCriteriaAction
  | setCohortNameAction
  | resetCohortCreationAction
  | LogoutActionType

export type setPopulationSourceAction = {
  type: 'SET_POPULATION_SOURCE'
  payload: any[]
}
export const setPopulationSource = (populationSources: any[]): setPopulationSourceAction => {
  return {
    type: 'SET_POPULATION_SOURCE',
    payload: populationSources
  }
}

export type addInclusionCriteriaAction = {
  type: 'ADD_INCLUSION_CRITERIA'
  payload: { inclusionCriteria: any; index: number }
}

export const addInclusionCriteria = (inclusionCriteria: any, index: number): addInclusionCriteriaAction => {
  return {
    type: 'ADD_INCLUSION_CRITERIA',
    payload: { inclusionCriteria: inclusionCriteria, index: index }
  }
}
export type removeInclusionCriteriaAction = {
  type: 'REMOVE_INCLUSION_CRITERIA'
  payload: number
}

export const removeInclusionCriteria = (index: number): removeInclusionCriteriaAction => {
  return {
    type: 'REMOVE_INCLUSION_CRITERIA',
    payload: index
  }
}
export type setCohortNameAction = {
  type: 'SET_COHORT_NAME'
  payload: string
}

export const setCohortName = (name: string): setCohortNameAction => {
  return {
    type: 'SET_COHORT_NAME',
    payload: name
  }
}

export type resetCohortCreationAction = {
  type: 'RESET_STATE'
}

export const resetCohortCreation = (): resetCohortCreationAction => {
  return {
    type: 'RESET_STATE'
  }
}

const cohortCreation = (state = initialState, action: CohortActions) => {
  switch (action.type) {
    case 'SET_POPULATION_SOURCE':
      return {
        ...state,
        populationSources: action.payload
      }

    case 'ADD_INCLUSION_CRITERIA': {
      const { inclusionCriteria, index } = action.payload
      const inclusionCriterias = [...state.inclusionCriterias]
      const newCriterias =
        undefined !== index
          ? inclusionCriterias.map((criteria, i) => {
              return i === index ? inclusionCriteria : criteria
            })
          : [...state.inclusionCriterias, inclusionCriteria]
      return {
        ...state,
        inclusionCriterias: newCriterias
      }
    }
    case 'REMOVE_INCLUSION_CRITERIA':
      return {
        ...state,
        inclusionCriterias: state.inclusionCriterias.filter((criteria, index) => index !== action.payload)
      }

    case 'SET_COHORT_NAME': {
      return {
        ...state,
        cohortName: action.payload
      }
    }

    case 'LOGOUT':
    case 'RESET_STATE': {
      return initialState
    }

    default:
      return state
  }
}

export default cohortCreation
