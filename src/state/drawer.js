const initialState = true

export const open = () => {
  return {
    type: 'OPEN'
  }
}

export const close = () => {
  return {
    type: 'CLOSE'
  }
}

const drawer = (state = initialState, action) => {
  switch (action.type) {
    case 'OPEN': {
      return true
    }

    case 'CLOSE': {
      return false
    }

    case 'LOGOUT': {
      return initialState
    }

    default:
      return state
  }
}

export default drawer
