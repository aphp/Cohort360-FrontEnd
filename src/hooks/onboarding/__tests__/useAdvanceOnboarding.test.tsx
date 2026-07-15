import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { updateStep } = vi.hoisted(() => ({ updateStep: vi.fn() }))

vi.mock('services/aphp/serviceOnboarding', () => ({
  default: { updateStep }
}))

import type { OnboardingStatus } from 'services/aphp/serviceOnboarding'
import useAdvanceOnboarding from '../useAdvanceOnboarding'
import { ONBOARDING_STATUS_QUERY_KEY } from '../useOnboardingStatus'

const seededStatus: OnboardingStatus = {
  onboarding_step: 1,
  onboarding_completed_at: null,
  charter_signed_at: null
}

const renderAdvance = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  queryClient.setQueryData(ONBOARDING_STATUS_QUERY_KEY, seededStatus)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result } = renderHook(() => useAdvanceOnboarding(), { wrapper })
  return { result, queryClient }
}

describe('useAdvanceOnboarding', () => {
  beforeEach(() => {
    updateStep.mockReset()
  })

  it('met à jour le statut en cache depuis la réponse serveur', async () => {
    updateStep.mockResolvedValue({ onboarding_step: 3, onboarding_completed_at: '2026-06-29T10:00:00Z' })
    const { result, queryClient } = renderAdvance()

    result.current.mutate(3)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(updateStep).toHaveBeenCalledWith(3)
    const cached = queryClient.getQueryData<OnboardingStatus>(ONBOARDING_STATUS_QUERY_KEY)
    expect(cached?.onboarding_step).toBe(3)
    expect(cached?.onboarding_completed_at).toBe('2026-06-29T10:00:00Z')
  })

  it('remonte une erreur et laisse le cache intact quand la requête échoue', async () => {
    updateStep.mockRejectedValue(new Error('boom'))
    const { result, queryClient } = renderAdvance()

    result.current.mutate(3)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(queryClient.getQueryData<OnboardingStatus>(ONBOARDING_STATUS_QUERY_KEY)).toEqual(seededStatus)
  })
})
