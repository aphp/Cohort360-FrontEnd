const initialState = null

export const login = (username, name, firstname, lastname) => {
  return {
    type: 'LOGIN',
    payload: {
      username,
      name,
      firstname,
      lastname
    }
  }
}

export const logout = () => {
  return {
    type: 'LOGOUT',
    payload: {}
  }
}

const me = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN': {
      return action.payload
    }

    default:
      return state
  }
}

export default me
