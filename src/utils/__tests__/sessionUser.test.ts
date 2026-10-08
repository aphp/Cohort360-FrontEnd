import { CanceledError } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ACCESS_TOKEN, REFRESH_TOKEN } from 'constants.js'
import {
  assertSessionUser,
  isSessionLostAfterStorageChange,
  isSessionUserMismatch,
  leaveSession,
  registerSessionUsername
} from 'utils/sessionUser'

const makeJwt = (payload: Record<string, unknown>) => `header.${btoa(JSON.stringify(payload))}.signature`

const assign = vi.fn()
const originalLocation = window.location

const setPathname = (pathname: string) => {
  Object.defineProperty(window, 'location', { value: { pathname, assign }, writable: true, configurable: true })
}

beforeEach(() => {
  localStorage.clear()
  assign.mockClear()
  registerSessionUsername(() => 'userA')
  setPathname('/home')
})

afterEach(() => {
  registerSessionUsername(() => undefined)
  Object.defineProperty(window, 'location', { value: originalLocation, writable: true, configurable: true })
})

describe('isSessionUserMismatch', () => {
  it('retourne false quand le token appartient à l’utilisateur affiché', () => {
    localStorage.setItem(ACCESS_TOKEN, makeJwt({ username: 'userA' }))
    expect(isSessionUserMismatch()).toBe(false)
  })

  it('retourne true quand le token appartient à un autre utilisateur', () => {
    localStorage.setItem(ACCESS_TOKEN, makeJwt({ username: 'userB' }))
    expect(isSessionUserMismatch()).toBe(true)
  })

  it('retourne false sans utilisateur affiché', () => {
    registerSessionUsername(() => undefined)
    localStorage.setItem(ACCESS_TOKEN, makeJwt({ username: 'userB' }))
    expect(isSessionUserMismatch()).toBe(false)
  })

  it('retourne false sans token ou sans username dans le token', () => {
    expect(isSessionUserMismatch()).toBe(false)
    localStorage.setItem(ACCESS_TOKEN, makeJwt({ sub: 'userB' }))
    expect(isSessionUserMismatch()).toBe(false)
  })
})

describe('isSessionLostAfterStorageChange', () => {
  it('ignore les autres clés', () => {
    expect(isSessionLostAfterStorageChange(REFRESH_TOKEN)).toBe(false)
  })

  it('retourne true après un localStorage.clear() dans un autre onglet', () => {
    expect(isSessionLostAfterStorageChange(null)).toBe(true)
  })

  it('retourne true quand le token appartient désormais à un autre utilisateur', () => {
    localStorage.setItem(ACCESS_TOKEN, makeJwt({ username: 'userB' }))
    expect(isSessionLostAfterStorageChange(ACCESS_TOKEN)).toBe(true)
  })

  it('garde la session quand le token du même utilisateur est rafraîchi', () => {
    localStorage.setItem(ACCESS_TOKEN, makeJwt({ username: 'userA' }))
    expect(isSessionLostAfterStorageChange(ACCESS_TOKEN)).toBe(false)
    expect(isSessionLostAfterStorageChange(null)).toBe(false)
  })
})

describe('leaveSession', () => {
  it('recharge sur la page de connexion', () => {
    leaveSession()
    expect(assign).toHaveBeenCalledWith('/')
  })

  it('ne recharge pas si déjà sur la page de connexion', () => {
    setPathname('/')
    leaveSession()
    expect(assign).not.toHaveBeenCalled()
  })
})

describe('assertSessionUser', () => {
  it('laisse passer la requête quand le token appartient à l’utilisateur affiché', () => {
    localStorage.setItem(ACCESS_TOKEN, makeJwt({ username: 'userA' }))
    expect(() => assertSessionUser()).not.toThrow()
    expect(assign).not.toHaveBeenCalled()
  })

  it('annule la requête et quitte la session quand le token appartient à un autre utilisateur', () => {
    localStorage.setItem(ACCESS_TOKEN, makeJwt({ username: 'userB' }))
    expect(() => assertSessionUser()).toThrow(CanceledError)
    expect(assign).toHaveBeenCalledWith('/')
  })
})
