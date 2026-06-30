import type React from 'react'
import { createContext, useContext, useMemo, useState } from 'react'

import { useAppDispatch, useAppSelector } from 'state'
import { advanceOnboarding, clearOnboardingError, ONBOARDING_TOTAL_STEPS } from 'state/onboarding'

import { ONBOARDING_STEPS } from './steps'

type OnboardingScreen = 'welcome' | 'steps'

type OnboardingContextValue = {
  screen: OnboardingScreen
  currentStep: number
  totalSteps: number
  saving: boolean
  error: boolean
  isFirstStep: boolean
  isLastStep: boolean
  goNext: () => void
  goBack: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

const clampStep = (step: number) => Math.min(Math.max(step, 0), ONBOARDING_TOTAL_STEPS - 1)

type ProviderProps = {
  initialStep: number
  children: React.ReactNode
}

export const OnboardingProvider = ({ initialStep, children }: ProviderProps) => {
  const dispatch = useAppDispatch()
  const { saving, error } = useAppSelector((state) => state.onboarding)

  const [currentStep, setCurrentStep] = useState(() => clampStep(initialStep))
  const [screen, setScreen] = useState<OnboardingScreen>(() => (initialStep <= 0 ? 'welcome' : 'steps'))

  const value = useMemo<OnboardingContextValue>(() => {
    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1

    const goNext = () => {
      if (saving) {
        return
      }
      if (screen === 'welcome') {
        setScreen('steps')
        return
      }
      dispatch(advanceOnboarding(currentStep + 1))
      if (!isLastStep) {
        setCurrentStep((step) => step + 1)
      }
    }

    const goBack = () => {
      if (screen === 'welcome') {
        return
      }
      if (error) {
        dispatch(clearOnboardingError())
      }
      if (isFirstStep) {
        setScreen('welcome')
        return
      }
      setCurrentStep((step) => step - 1)
    }

    return {
      screen,
      currentStep,
      totalSteps: ONBOARDING_STEPS.length,
      saving,
      error,
      isFirstStep,
      isLastStep,
      goNext,
      goBack
    }
  }, [screen, currentStep, saving, error, dispatch])

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
