import apiBackend from 'services/apiBackend'
import type { MyAccess, RightCatalogCategory } from 'types'

export type OnboardingProgress = {
  onboarding_step: number
  onboarding_completed_at: string | null
}

export type CharterSignature = {
  charter_signed_at: string
}

export type OnboardingStatus = {
  onboarding_step: number
  onboarding_completed_at: string | null
  charter_signed_at: string | null
}

export interface IServiceOnboarding {
  updateStep: (step: number) => Promise<OnboardingProgress>
  signCharter: () => Promise<CharterSignature>
  getMyAccesses: () => Promise<MyAccess[]>
  getRightsCatalog: () => Promise<RightCatalogCategory[]>
  getStatus: () => Promise<OnboardingStatus>
}

/**
 * The shared axios instance resolves failed requests with the error object instead of
 * rejecting them, so a 4xx would otherwise reach the store as a successful `undefined`.
 */
const requireData = <T>(response: { data?: T }): T => {
  if (response?.data === undefined) {
    throw new Error('Onboarding request failed')
  }
  return response.data
}

const serviceOnboarding: IServiceOnboarding = {
  updateStep: async (step) =>
    requireData(await apiBackend.patch<OnboardingProgress>('/users/me/onboarding/', { onboarding_step: step })),
  signCharter: async () => requireData(await apiBackend.post<CharterSignature>('/users/me/onboarding/charter/')),
  getMyAccesses: async () => requireData(await apiBackend.get<MyAccess[]>('accesses/accesses/my-accesses/')),
  getRightsCatalog: async () => requireData(await apiBackend.get<RightCatalogCategory[]>('accesses/rights/')),
  getStatus: async () => requireData(await apiBackend.get<OnboardingStatus>('/users/me/onboarding/'))
}

export default serviceOnboarding
