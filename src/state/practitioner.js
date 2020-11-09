// const initialState = {
//   identifier: [{ value: '17144' }],
//   patients: []
// }

const initialState = null

export const loadPractitioner = (practitionerID) => {
  return {
    type: 'LOAD_PRACTITIONER',
    payload: {
      practitionerID
    }
  }
}

const practitioner = (state = initialState, action) => {
  switch (action.type) {
    case 'LOAD_PRACTITIONER': {
      return action.payload
    }

    case 'LOGOUT': {
      return initialState
    }

    default:
      return state
  }
}

export default practitioner
