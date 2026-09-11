import { useMutation, useQueryClient } from '@tanstack/react-query'
import serviceOnboarding, { type OnboardingStatus } from 'services/aphp/serviceOnboarding'
import { ONBOARDING_STATUS_QUERY_KEY } from './useOnboardingStatus'

const useAdvanceOnboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (step: number) => serviceOnboarding.updateStep(step),
    onSuccess: (progress) => {
      queryClient.setQueryData<OnboardingStatus>(ONBOARDING_STATUS_QUERY_KEY, (previous) =>
        previous
          ? {
              ...previous,
              onboarding_step: progress.onboarding_step,
              onboarding_completed_at: progress.onboarding_completed_at
            }
          : previous
      )
    }
  })
}

export default useAdvanceOnboarding
