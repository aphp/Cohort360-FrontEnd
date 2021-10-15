import axios, { AxiosResponse } from 'axios'

import { v4 as uuid } from 'uuid'
import { STATE_STORAGE_KEY, PORTAIL_API_URL } from '../../constants'
import { authClient } from '../arkhnAuth/oauth/authClient'

export const authenticate = async (username: string, password: string): Promise<any> => {
  getCsrfToken(username, password)
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

export const getCsrfToken = (username: string, password: string): Promise<AxiosResponse<any>> => {
  const formData = new FormData()
  formData.append('username', username.toString())
  formData.append('password', password)

  return axios({
    method: 'POST',
    url: `${PORTAIL_API_URL}/accounts/login/`,
    data: formData
  })
}
