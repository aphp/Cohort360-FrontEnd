import type { AxiosResponse } from 'axios'

import apiBackend from 'services/apiBackend'

export type OnboardingProgress = {
  onboarding_step: number
  onboarding_completed_at: string | null
}

export interface IServiceOnboarding {
  updateStep: (step: number) => Promise<AxiosResponse<OnboardingProgress>>
}

const serviceOnboarding: IServiceOnboarding = {
  updateStep: (step) => apiBackend.patch<OnboardingProgress>('/users/me/onboarding/', { onboarding_step: step })
}

export default serviceOnboarding
