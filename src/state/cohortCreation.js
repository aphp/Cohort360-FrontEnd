const initialState = {
  populationSources: [],
  inclusionCriterias: [],
  cohortName: ''
}

export function setPopulationSource(populationSources) {
  return {
    type: 'SET_POPULATION_SOURCE',
    populationSources
  }
}

export function addInclusionCriteria(inclusionCriteria, index) {
  return {
    type: 'ADD_INCLUSION_CRITERIA',
    inclusionCriteria,
    index
  }
}

export function removeInclusionCriteria(index) {
  return {
    type: 'REMOVE_INCLUSION_CRITERIA',
    index
  }
}

export function setCohortName(name) {
  return {
    type: 'SET_COHORT_NAME',
    name
  }
}

export function resetCohortCreation() {
  return {
    type: 'RESET_STATE'
  }
}

function cohortCreation(state = initialState, action) {
  switch (action.type) {
    case 'SET_POPULATION_SOURCE':
      return {
        ...state,
        populationSources: action.populationSources
      }

    case 'ADD_INCLUSION_CRITERIA':
      const inclusionCriterias = [...state.inclusionCriterias]
      const newCriterias =
        undefined !== action.index
          ? inclusionCriterias.map((criteria, index) => {
              return index.toString() === action.index
                ? action.inclusionCriteria
                : criteria
            })
          : [...state.inclusionCriterias, action.inclusionCriteria]
      return {
        ...state,
        inclusionCriterias: newCriterias
      }

    case 'REMOVE_INCLUSION_CRITERIA':
      return {
        ...state,
        inclusionCriterias: state.inclusionCriterias.filter(
          (criteria, index) => index !== action.index
        )
      }

    case 'SET_COHORT_NAME': {
      return {
        ...state,
        cohortName: action.name
      }
    }

    case 'RESET_STATE': {
      return {
        ...initialState
      }
    }

    default:
      return state
  }
}

export default cohortCreation
