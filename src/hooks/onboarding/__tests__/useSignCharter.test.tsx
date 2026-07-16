import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { signCharter } = vi.hoisted(() => ({ signCharter: vi.fn() }))

vi.mock('services/aphp/serviceOnboarding', () => ({
  default: { signCharter }
}))

import type { OnboardingStatus } from 'services/aphp/serviceOnboarding'
import useSignCharter from '../useSignCharter'
import { ONBOARDING_STATUS_QUERY_KEY } from '../useOnboardingStatus'

const SIGNED_AT = '2026-07-09T09:30:00Z'

const renderSignCharter = (charterSignedAt: string | null) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  queryClient.setQueryData<OnboardingStatus>(ONBOARDING_STATUS_QUERY_KEY, {
    onboarding_step: 1,
    onboarding_completed_at: null,
    charter_signed_at: charterSignedAt
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result } = renderHook(() => useSignCharter(), { wrapper })
  return { result, queryClient }
}

describe('useSignCharter', () => {
  beforeEach(() => {
    signCharter.mockReset()
  })

  it('signe la charte et enregistre l’horodatage en cache', async () => {
    signCharter.mockResolvedValue({ charter_signed_at: SIGNED_AT })
    const { result, queryClient } = renderSignCharter(null)

    await result.current.mutateAsync()

    expect(signCharter).toHaveBeenCalledTimes(1)
    const cached = queryClient.getQueryData<OnboardingStatus>(ONBOARDING_STATUS_QUERY_KEY)
    expect(cached?.charter_signed_at).toBe(SIGNED_AT)
  })

  it('ne signe pas deux fois quand la charte est déjà signée', async () => {
    const { result } = renderSignCharter(SIGNED_AT)

    const signature = await result.current.mutateAsync()

    expect(signCharter).not.toHaveBeenCalled()
    expect(signature).toEqual({ charter_signed_at: SIGNED_AT })
  })

  it('remonte une erreur quand la signature échoue', async () => {
    signCharter.mockRejectedValue(new Error('boom'))
    const { result } = renderSignCharter(null)

    await expect(result.current.mutateAsync()).rejects.toThrow('boom')
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
