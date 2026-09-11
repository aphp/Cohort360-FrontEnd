import { useQuery } from '@tanstack/react-query'
import serviceOnboarding, { type OnboardingStatus } from 'services/aphp/serviceOnboarding'

export const ONBOARDING_STATUS_QUERY_KEY = ['onboardingStatus'] as const

// The gate blocks until the status is confirmed, so a failed resync retries indefinitely with a
// capped delay instead of giving up and leaving a returning session stuck.
const RETRY_DELAY_MS = 3000

const useOnboardingStatus = (enabled = true) => {
  const { data, isPending, isError, refetch } = useQuery<OnboardingStatus>({
    queryKey: ONBOARDING_STATUS_QUERY_KEY,
    queryFn: () => serviceOnboarding.getStatus(),
    enabled,
    retry: true,
    retryDelay: RETRY_DELAY_MS
  })

  return {
    status: data,
    statusPending: isPending,
    statusIsError: isError,
    refetch
  }
}

export default useOnboardingStatus
