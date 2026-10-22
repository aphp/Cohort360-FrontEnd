import { QueryClient } from '@tanstack/react-query'
import { afterEach, describe, expect, it } from 'vitest'
import { clearPreviousSession } from 'utils/session'

describe('clearPreviousSession', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('removes what the previous session left, except the keys the current login needs or overwrites', () => {
    localStorage.setItem('access_token', 'old-access')
    localStorage.setItem('refresh_token', 'old-refresh')
    localStorage.setItem('impersonated_user', '{"username":"someone"}')
    localStorage.setItem('old-path', '/researches/projects')
    localStorage.setItem('oidcAuth', 'false')

    clearPreviousSession(new QueryClient())

    expect(localStorage.getItem('impersonated_user')).toBeNull()
    expect(localStorage.getItem('old-path')).toBe('/researches/projects')
    expect(localStorage.getItem('oidcAuth')).toBe('false')
    expect(localStorage.getItem('access_token')).toBe('old-access')
    expect(localStorage.getItem('refresh_token')).toBe('old-refresh')
  })

  it('empties the React Query cache', () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(['projects'], { count: 3, results: [] })

    clearPreviousSession(queryClient)

    expect(queryClient.getQueryData(['projects'])).toBeUndefined()
  })
})
