import { useMutation, useQueryClient } from '@tanstack/react-query'
import serviceOnboarding, { type CharterSignature, type OnboardingStatus } from 'services/aphp/serviceOnboarding'
import { ONBOARDING_STATUS_QUERY_KEY } from './useOnboardingStatus'

const useSignCharter = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<CharterSignature> => {
      // Stepping back from the confirmation screen re-enters the charter: never sign twice.
      const current = queryClient.getQueryData<OnboardingStatus>(ONBOARDING_STATUS_QUERY_KEY)
      if (current?.charter_signed_at) {
        return { charter_signed_at: current.charter_signed_at }
      }
      return serviceOnboarding.signCharter()
    },
    onSuccess: (signature) => {
      queryClient.setQueryData<OnboardingStatus>(ONBOARDING_STATUS_QUERY_KEY, (previous) =>
        previous ? { ...previous, charter_signed_at: signature.charter_signed_at } : previous
      )
    }
  })
}

export default useSignCharter
