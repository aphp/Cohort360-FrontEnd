import { ACCESS_TOKEN } from 'constants.js'

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.exp) return true
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export const getStoredAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN)
}

export const isAccessTokenValid = (): boolean => {
  return !isTokenExpired(getStoredAccessToken())
}
