import axios from 'axios'

import { v4 as uuid } from 'uuid'
import { STATE_STORAGE_KEY } from '../constants'
import { authClient } from './arkhnAuth/oauth/authClient'

type Authentication = {
  status: number
  data: {
    access: string
    refresh: string
  }
}

export const authenticate = async (username: string, password: string): Promise<Authentication> => {
  return axios({
    method: 'POST',
    url: '/api/jwt/',
    data: { username: username, password: password }
  })
}

export const arkhnAuthenticationRedirect = () => {
  const state = uuid()
  localStorage.setItem(STATE_STORAGE_KEY, state)
  const uri = authClient.code.getUri({
    state: state
  })
  window.location.assign(uri)
}
