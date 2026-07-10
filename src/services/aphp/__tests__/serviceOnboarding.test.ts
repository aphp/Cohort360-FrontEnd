import { describe, expect, it, vi } from 'vitest'

const patch = vi.fn()
const post = vi.fn()

vi.mock('services/apiBackend', () => ({
  default: { patch: (...args: unknown[]) => patch(...args), post: (...args: unknown[]) => post(...args) }
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
})
