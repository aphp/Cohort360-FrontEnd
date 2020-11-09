import axios from 'axios'

import { authClient } from './authClient'

import {
  TOKEN_DATA_STORAGE_KEY,
  ACCES_TOKEN,
  REFRESH_TOKEN,
  ID_TOKEN_STORAGE_KEY,
  CLIENT_ID,
  CLIENT_SECRET,
  REVOKE_URL
} from '../../../constants'

export const getAccessToken = () => localStorage.getItem(ACCES_TOKEN)

export const getIdToken = () => localStorage.getItem(ID_TOKEN_STORAGE_KEY)

export const removeTokens = () => {
  localStorage.removeItem(ACCES_TOKEN)
  localStorage.removeItem(REFRESH_TOKEN)
  localStorage.removeItem(ID_TOKEN_STORAGE_KEY)
  localStorage.removeItem(TOKEN_DATA_STORAGE_KEY)
}

export const fetchTokens = async () => {
  const oauthToken = await authClient.code.getToken(window.location.href)
  localStorage.setItem(ACCES_TOKEN, oauthToken.accessToken)
  localStorage.setItem(REFRESH_TOKEN, oauthToken.refreshToken)
  localStorage.setItem(ID_TOKEN_STORAGE_KEY, oauthToken.data.id_token)
  localStorage.setItem(TOKEN_DATA_STORAGE_KEY, JSON.stringify(oauthToken.data))
}

export const refreshToken = async () => {
  const tokenData = localStorage.getItem(TOKEN_DATA_STORAGE_KEY)

  if (!tokenData) return false
  const oauthToken = authClient.createToken(JSON.parse(tokenData))

  let updatedToken
  try {
    updatedToken = await oauthToken.refresh()
  } catch (err) {
    console.error(err)
    return false
  }

  localStorage.setItem(ACCES_TOKEN, updatedToken.accessToken)
  localStorage.setItem(REFRESH_TOKEN, updatedToken.refreshToken)
  localStorage.setItem(ID_TOKEN_STORAGE_KEY, updatedToken.data.id_token)
  localStorage.setItem(TOKEN_DATA_STORAGE_KEY, JSON.stringify(updatedToken.data))
  return true
}

export const revokeToken = async () => {
  // NOTE It looks like the refresh token doesn't work after the access token has been revoked.
  const accessToken = localStorage.getItem(ACCES_TOKEN)
  if (!accessToken) throw new Error('Access token not present in local storage, cannot revoke it.')

  const bodyFormData = new FormData()
  bodyFormData.set('token', accessToken)
  const conf = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json, application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
    }
  }
  try {
    const revokeResponse = await axios.post(REVOKE_URL!, bodyFormData, conf)
    if (revokeResponse.status !== 200) console.error(revokeResponse.data)
  } catch (err) {
    console.error(err.response)
  }
}
