import { ACCESS_TOKEN } from 'constants.js'

const decodeTokenPayload = (token: string): Record<string, unknown> | null => {
  try {
    // JWT segments are base64url, atob only reads base64
    const segment = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')
    return JSON.parse(atob(segment))
  } catch {
    return null
  }
}

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
    return true
  }

  const payload = decodeTokenPayload(token)
  if (typeof payload?.exp !== 'number') {
    return true
  }
  return payload.exp * 1000 < Date.now()
}

/**
 * Returns the username the token was issued for: `username` in the back-end's own JWT
 * (SIMPLE_JWT `USER_ID_CLAIM`), `preferred_username` in OIDC tokens.
 */
export const getTokenUsername = (token: string | null): string | null => {
  const payload = token ? decodeTokenPayload(token) : null
  const username = payload?.username ?? payload?.preferred_username
  return typeof username === 'string' ? username : null
}

export const getStoredAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN)
}

export const isAccessTokenValid = (): boolean => {
  return !isTokenExpired(getStoredAccessToken())
}
