import { describe, it, expect, beforeEach } from 'vitest'
import { isTokenExpired, isAccessTokenValid } from 'utils/tokens'
import { ACCESS_TOKEN } from 'constants'

const makeJwt = (payload: Record<string, unknown>) => {
  const header = btoa(JSON.stringify({ alg: 'HS256' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

describe('isTokenExpired', () => {
  it('retourne true si token est null', () => {
    expect(isTokenExpired(null)).toBe(true)
  })

  it('retourne true si token est malformé', () => {
    expect(isTokenExpired('not-a-jwt')).toBe(true)
  })

  it('retourne true si exp est dans le passé', () => {
    const token = makeJwt({ exp: Math.floor(Date.now() / 1000) - 60 })
    expect(isTokenExpired(token)).toBe(true)
  })

  it('retourne false si exp est dans le futur', () => {
    const token = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 })
    expect(isTokenExpired(token)).toBe(false)
  })

  it('retourne true si pas de champ exp (token sans expiry)', () => {
    const token = makeJwt({ sub: 'user' })
    expect(isTokenExpired(token)).toBe(true)
  })
})

describe('isAccessTokenValid', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('retourne false si pas de token en localStorage', () => {
    expect(isAccessTokenValid()).toBe(false)
  })

  it('retourne true si token valide en localStorage', () => {
    const token = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 })
    localStorage.setItem(ACCESS_TOKEN, token)
    expect(isAccessTokenValid()).toBe(true)
  })
})
