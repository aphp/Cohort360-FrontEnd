// import { AnyAction } from 'redux'

export type MeState = {
  id: string
  userName: string
  displayName: string
  firstName: string
  lastName: string
  deidentified: boolean
} | null

const initialState: MeState = null

type LoginActionType = {
  type: 'LOGIN'
  payload: MeState
}
export const login = (payload: MeState): LoginActionType => {
  return {
    type: 'LOGIN',
    payload
  }
}

export type LogoutActionType = {
  type: 'LOGOUT'
}
export const logout = () => {
  return {
    type: 'LOGOUT'
  }
}

type MeActions = LoginActionType | LogoutActionType

const me = (state: MeState = initialState, action: MeActions): MeState => {
  switch (action.type) {
    case 'LOGIN': {
      return action.payload
    }

    case 'LOGOUT': {
      return initialState
    }

    default:
      return state
  }
}

export default me
