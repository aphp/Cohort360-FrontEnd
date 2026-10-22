import { describe, it, expect, beforeEach } from 'vitest'
import { isTokenExpired, isAccessTokenValid, getTokenUsername } from 'utils/tokens'
import { ACCESS_TOKEN } from 'constants.js'

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

describe('getTokenUsername', () => {
  it('retourne null si token est null', () => {
    expect(getTokenUsername(null)).toBeNull()
  })

  it('retourne null si token est malformé', () => {
    expect(getTokenUsername('not-a-jwt')).toBeNull()
  })

  it('lit le claim username du JWT Django', () => {
    expect(getTokenUsername(makeJwt({ username: '4208892', preferred_username: 'autre' }))).toBe('4208892')
  })

  it('lit le claim preferred_username des tokens OIDC', () => {
    expect(getTokenUsername(makeJwt({ preferred_username: '4208892' }))).toBe('4208892')
  })

  it("retourne null si aucun claim n'est une chaîne", () => {
    expect(getTokenUsername(makeJwt({ username: 42 }))).toBeNull()
    expect(getTokenUsername(makeJwt({ sub: 'user' }))).toBeNull()
  })

  it('décode un payload base64url', () => {
    // '?' and '>' produce '/' and '+' in base64, i.e. '_' and '-' in base64url
    const body = btoa(JSON.stringify({ username: 'u', note: '??>>' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    expect(body).toMatch(/[-_]/)
    expect(getTokenUsername(`header.${body}.signature`)).toBe('u')
  })
})
