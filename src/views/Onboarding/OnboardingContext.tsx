import type React from 'react'
import { createContext, useContext, useMemo, useState } from 'react'

import { useAppDispatch, useAppSelector } from 'state'
import { advanceOnboarding, clearOnboardingError, ONBOARDING_TOTAL_STEPS } from 'state/onboarding'

import { getScreenConfig, getStepScreenCount, ONBOARDING_STEPS, type OnboardingScreenConfig } from './steps'

type OnboardingScreen = 'welcome' | 'steps'

type OnboardingContextValue = {
  screen: OnboardingScreen
  currentStep: number
  subStep: number
  totalSteps: number
  saving: boolean
  error: boolean
  isFirstStep: boolean
  isLastStep: boolean
  screenConfig?: OnboardingScreenConfig
  primaryLabel: string
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
  const [subStep, setSubStep] = useState(0)
  const [screen, setScreen] = useState<OnboardingScreen>(() => (initialStep <= 0 ? 'welcome' : 'steps'))

  const value = useMemo<OnboardingContextValue>(() => {
    const screenCount = getStepScreenCount(currentStep)
    const isLastMacroStep = currentStep === ONBOARDING_STEPS.length - 1
    const isFirstStep = currentStep === 0 && subStep === 0
    const isLastStep = isLastMacroStep && subStep === screenCount - 1
    const screenConfig = screen === 'steps' ? getScreenConfig(currentStep, subStep) : undefined

    const advance = () => {
      // Progress is persisted per macro step, only once its last screen is left.
      if (subStep < screenCount - 1) {
        setSubStep((step) => step + 1)
        return
      }
      dispatch(advanceOnboarding(currentStep + 1))
      if (!isLastMacroStep) {
        setCurrentStep((step) => step + 1)
        setSubStep(0)
      }
    }

    const goNext = () => {
      if (saving) {
        return
      }
      if (screen === 'welcome') {
        setScreen('steps')
        return
      }
      const primaryAction = screenConfig?.primaryAction
      if (primaryAction) {
        // On rejection the store raises the error message and the user stays on the screen.
        primaryAction.run(dispatch).then(advance, () => undefined)
        return
      }
      advance()
    }

    const goBack = () => {
      if (screen === 'welcome') {
        return
      }
      if (error) {
        dispatch(clearOnboardingError())
      }
      if (subStep > 0) {
        setSubStep((step) => step - 1)
        return
      }
      if (currentStep === 0) {
        setScreen('welcome')
        return
      }
      const previousStep = currentStep - 1
      setCurrentStep(previousStep)
      setSubStep(getStepScreenCount(previousStep) - 1)
    }

    const defaultLabel = screen === 'welcome' ? 'Commencer' : isLastStep ? 'Terminer' : 'Continuer'

    return {
      screen,
      currentStep,
      subStep,
      totalSteps: ONBOARDING_STEPS.length,
      saving,
      error,
      isFirstStep,
      isLastStep,
      screenConfig,
      primaryLabel: screenConfig?.primaryAction?.label ?? defaultLabel,
      goNext,
      goBack
    }
  }, [screen, currentStep, subStep, saving, error, dispatch])

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
