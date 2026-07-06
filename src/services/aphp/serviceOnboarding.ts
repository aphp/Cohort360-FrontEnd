import type { AxiosResponse } from 'axios'

import apiBackend from 'services/apiBackend'
import type { MyAccess, RightCatalogCategory } from 'types'

export type OnboardingProgress = {
  onboarding_step: number
  onboarding_completed_at: string | null
}

export interface IServiceOnboarding {
  updateStep: (step: number) => Promise<AxiosResponse<OnboardingProgress>>
  getMyAccesses: () => Promise<MyAccess[]>
  getRightsCatalog: () => Promise<RightCatalogCategory[]>
}

const serviceOnboarding: IServiceOnboarding = {
  updateStep: (step) => apiBackend.patch<OnboardingProgress>('/users/me/onboarding/', { onboarding_step: step }),
  getMyAccesses: async () => {
    const { data } = await apiBackend.get<MyAccess[]>('accesses/accesses/my-accesses/')
    return data
  },
  getRightsCatalog: async () => {
    const { data } = await apiBackend.get<RightCatalogCategory[]>('accesses/rights/')
    return data
  }
}

export default serviceOnboarding
