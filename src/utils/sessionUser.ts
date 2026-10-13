import { CanceledError } from 'axios'
import { ACCESS_TOKEN } from 'constants.js'
import { getStoredAccessToken, getTokenUsername } from './tokens'

let readSessionUsername: () => string | undefined = () => undefined

export const registerSessionUsername = (reader: () => string | undefined) => {
  readSessionUsername = reader
}

export const isSessionUserMismatch = (): boolean => {
  const sessionUsername = readSessionUsername()
  const tokenUsername = getTokenUsername(getStoredAccessToken())
  return !!sessionUsername && !!tokenUsername && sessionUsername !== tokenUsername
}

export const isSessionLostAfterStorageChange = (key: string | null): boolean => {
  if (key !== null && key !== ACCESS_TOKEN) {
    return false
  }
  return !getStoredAccessToken() || isSessionUserMismatch()
}

export const leaveSession = () => {
  if (window.location.pathname !== '/') {
    window.location.assign('/')
  }
}

export const assertSessionUser = () => {
  if (!isSessionUserMismatch()) {
    return
  }
  leaveSession()
  throw new CanceledError('Access token belongs to another user than the displayed one')
}
