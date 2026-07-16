import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getStatus } = vi.hoisted(() => ({ getStatus: vi.fn() }))

vi.mock('services/aphp/serviceOnboarding', () => ({
  default: { getStatus }
}))

import useOnboardingStatus from '../useOnboardingStatus'

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useOnboardingStatus', () => {
  beforeEach(() => {
    getStatus.mockReset()
  })

  it('expose le statut résolu depuis le serveur', async () => {
    getStatus.mockResolvedValue({
      onboarding_step: 3,
      onboarding_completed_at: '2026-01-01T00:00:00Z',
      charter_signed_at: '2026-01-01T00:00:00Z'
    })

    const { result } = renderHook(() => useOnboardingStatus(), { wrapper })

    await waitFor(() => expect(result.current.statusPending).toBe(false))
    expect(result.current.status?.onboarding_completed_at).toBe('2026-01-01T00:00:00Z')
    expect(result.current.statusIsError).toBe(false)
  })

  it('reste en attente sans livrer de statut tant que la récupération échoue (fail-closed)', async () => {
    getStatus.mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useOnboardingStatus(), { wrapper })

    await waitFor(() => expect(getStatus).toHaveBeenCalled())
    expect(result.current.statusPending).toBe(true)
    expect(result.current.status).toBeUndefined()
  })
})
