const initialState = {
  originalPatients: [],
  importedPatients: [],
  includedPatients: [],
  excludedPatients: [],
  documentsList: [],
  totalPatients: 0,
  totalDocs: 0,
  patientsFacets: [],
  encountersFacets: [],
  // wordcloudData: [],
  cohort: {}
}

export function setPatientsFacets(facets) {
  return {
    type: 'SET_PATIENTS_FACETS',
    facets
  }
}

export function setEncountersFacets(facets) {
  return {
    type: 'SET_ENCOUNTERS_FACETS',
    facets
  }
}

export function setWordcloudData(facet) {
  return {
    type: 'SET_WORDCLOUD_DATA',
    facet
  }
}

export function setTotalDocs(total) {
  return {
    type: 'SET_TOTAL_DOCS',
    total
  }
}

export function setDocumentsList(documents) {
  return {
    type: 'SET_DOCUMENTS_LIST',
    documents
  }
}

export function setTotalPatients(total) {
  return {
    type: 'SET_TOTAL_PATIENTS',
    total
  }
}

export function setOriginalPatients(patients) {
  return {
    type: 'SET_ORIGINAL_PATIENTS',
    patients
  }
}

export function addImportedPatients(patients) {
  return {
    type: 'ADD_IMPORTED_PATIENTS',
    patients
  }
}

export function removeImportedPatients(patients) {
  return {
    type: 'REMOVE_IMPORTED_PATIENTS',
    patients
  }
}

export function includePatients(patients) {
  return {
    type: 'INCLUDE_PATIENTS',
    patients
  }
}

export function excludePatients(patients) {
  return {
    type: 'EXCLUDE_PATIENTS',
    patients
  }
}

export function removeExcludedPatients(patients) {
  return {
    type: 'REMOVE_EXCLUDED_PATIENTS',
    patients
  }
}

export function setCohort(cohort) {
  return {
    type: 'SET_COHORT',
    cohort
  }
}

export function updateCohort(newMembers) {
  return {
    type: 'UPDATE_COHORT',
    newMembers
  }
}

function exploredCohort(state = initialState, action) {
  switch (action.type) {
    case 'SET_PATIENTS_FACETS':
      return {
        ...state,
        patientsFacets: action.facets
      }

    case 'SET_ENCOUNTERS_FACETS':
      return {
        ...state,
        encountersFacets: action.facets
      }

    case 'SET_WORDCLOUD_DATA':
      return {
        ...state,
        wordcloudData: action.facet
      }

    case 'SET_TOTAL_DOCS':
      return {
        ...state,
        totalDocs: action.total
      }

    case 'SET_DOCUMENTS_LIST':
      return {
        ...state,
        documentsList: action.documents
      }

    case 'SET_TOTAL_PATIENTS':
      return {
        ...state,
        totalPatients: action.total
      }

    case 'SET_ORIGINAL_PATIENTS':
      return {
        ...state,
        originalPatients: action.patients,
        importedPatients: [],
        includedPatients: [],
        excludedPatients: []
      }

    case 'ADD_IMPORTED_PATIENTS': {
      const importedPatients = [...state.importedPatients, ...action.patients]
      return {
        ...state,
        importedPatients: importedPatients.filter(
          (patient, index, self) =>
            index === self.findIndex((t) => t.id === patient.id) &&
            !state.originalPatients.map((p) => p.id).includes(patient.id) &&
            !state.excludedPatients.map((p) => p.id).includes(patient.id)
        )
      }
    }

    case 'REMOVE_IMPORTED_PATIENTS': {
      return {
        ...state,
        importedPatients: state.importedPatients.filter(
          (patient) => !action.patients.map((p) => p.id).includes(patient.id)
        )
      }
    }

    case 'INCLUDE_PATIENTS': {
      const includedPatients = [...state.includedPatients, ...action.patients]
      const importedPatients = state.importedPatients.filter(
        (patient) => !action.patients.map((p) => p.id).includes(patient.id)
      )
      return {
        ...state,
        importedPatients,
        includedPatients
      }
    }

    case 'EXCLUDE_PATIENTS': {
      const toExcluded = state.originalPatients.filter((patient) =>
        action.patients.map((p) => p.id).includes(patient.id)
      )
      const toImported = state.includedPatients.filter((patient) =>
        action.patients.map((p) => p.id).includes(patient.id)
      )
      const allExcludedPatients = [...state.excludedPatients, ...toExcluded]
      const allImportedPatients = [...state.importedPatients, ...toImported]
      return {
        ...state,
        includedPatients: state.includedPatients.filter(
          (patient) => !action.patients.map((p) => p.id).includes(patient.id)
        ),
        originalPatients: state.originalPatients.filter(
          (patient) => !action.patients.map((p) => p.id).includes(patient.id)
        ),
        excludedPatients: allExcludedPatients.filter(
          (patient, index, self) =>
            index === self.findIndex((t) => t.id === patient.id)
        ),
        importedPatients: allImportedPatients
      }
    }

    case 'REMOVE_EXCLUDED_PATIENTS': {
      const originalPatients = [...state.originalPatients, ...action.patients]
      const excludedPatients = state.excludedPatients.filter(
        (patient) => !action.patients.map((p) => p.id).includes(patient.id)
      )
      return {
        ...state,
        originalPatients,
        excludedPatients
      }
    }

    case 'SET_COHORT': {
      return {
        ...state,
        cohort: action.cohort
      }
    }

    case 'UPDATE_COHORT': {
      return {
        ...state,
        cohort: { ...state.cohort, member: action.newMembers },
        importedPatients: [],
        includedPatients: [],
        excludedPatients: []
      }
    }

    default:
      return state
  }
}

export default exploredCohort
