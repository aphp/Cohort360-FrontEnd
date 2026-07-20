import { describe, expect, it, vi } from 'vitest'

const patch = vi.fn()
const post = vi.fn()
const get = vi.fn()

vi.mock('services/apiBackend', () => ({
  default: {
    patch: (...args: unknown[]) => patch(...args),
    post: (...args: unknown[]) => post(...args),
    get: (...args: unknown[]) => get(...args)
  }
}))

import serviceOnboarding from '../serviceOnboarding'

describe('serviceOnboarding', () => {
  it('returns the payload of a successful step update', async () => {
    patch.mockResolvedValue({ data: { onboarding_step: 2, onboarding_completed_at: null } })
    await expect(serviceOnboarding.updateStep(2)).resolves.toEqual({
      onboarding_step: 2,
      onboarding_completed_at: null
    })
  })

  it('rejects when the shared axios instance resolves a failed request with an error object', async () => {
    // apiBackend's response interceptor returns the error instead of rejecting it.
    patch.mockResolvedValue(new Error('Request failed with status code 404'))
    await expect(serviceOnboarding.updateStep(2)).rejects.toThrow()
  })

  it('rejects when the interceptor swallows a network failure entirely', async () => {
    patch.mockResolvedValue(undefined)
    await expect(serviceOnboarding.updateStep(2)).rejects.toThrow()
  })

  it('rejects a charter signature that carries no payload', async () => {
    post.mockResolvedValue(new Error('Request failed with status code 500'))
    await expect(serviceOnboarding.signCharter()).rejects.toThrow()
  })

  it('returns the charter signature date on success', async () => {
    post.mockResolvedValue({ data: { charter_signed_at: '2026-07-10T09:00:00Z' } })
    await expect(serviceOnboarding.signCharter()).resolves.toEqual({ charter_signed_at: '2026-07-10T09:00:00Z' })
  })

  it('unwraps the accesses of the current user', async () => {
    get.mockResolvedValue({ data: [{ id: 1 }] })
    await expect(serviceOnboarding.getMyAccesses()).resolves.toEqual([{ id: 1 }])
    expect(get).toHaveBeenCalledWith('accesses/accesses/my-accesses/')
  })

  it('unwraps the rights catalog', async () => {
    get.mockResolvedValue({ data: [{ name: 'Lecture', rights: [] }] })
    await expect(serviceOnboarding.getRightsCatalog()).resolves.toEqual([{ name: 'Lecture', rights: [] }])
    expect(get).toHaveBeenCalledWith('accesses/rights/')
  })

  it('rejects when the accesses request is swallowed by the interceptor', async () => {
    get.mockResolvedValue(new Error('Request failed with status code 503'))
    await expect(serviceOnboarding.getMyAccesses()).rejects.toThrow()
  })

  it('rejects when the rights catalog request is swallowed by the interceptor', async () => {
    get.mockResolvedValue(new Error('Request failed with status code 503'))
    await expect(serviceOnboarding.getRightsCatalog()).rejects.toThrow()
  })

  it('returns the current onboarding status', async () => {
    get.mockResolvedValue({
      data: { onboarding_step: 3, onboarding_completed_at: '2026-06-29T10:00:00Z', charter_signed_at: null }
    })
    await expect(serviceOnboarding.getStatus()).resolves.toEqual({
      onboarding_step: 3,
      onboarding_completed_at: '2026-06-29T10:00:00Z',
      charter_signed_at: null
    })
    expect(get).toHaveBeenCalledWith('/users/me/onboarding/')
  })

  it('rejects when the status request is swallowed by the interceptor', async () => {
    get.mockResolvedValue(new Error('Request failed with status code 500'))
    await expect(serviceOnboarding.getStatus()).rejects.toThrow()
  })
})
