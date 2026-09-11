import type React from 'react'
import { createContext, useContext, useMemo, useState } from 'react'

import useAdvanceOnboarding from 'hooks/onboarding/useAdvanceOnboarding'
import useSignCharter from 'hooks/onboarding/useSignCharter'

import {
  getScreenConfig,
  getStepScreenCount,
  ONBOARDING_STEPS,
  ONBOARDING_TOTAL_STEPS,
  type OnboardingScreenConfig
} from './steps'

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
  /** Share of the current step's screens already left behind, from 0 to 1. */
  stepProgress: number
  screenConfig?: OnboardingScreenConfig
  primaryLabel: string
  /** False while a screen still awaits its required acknowledgement, blocking the primary button. */
  canProceed: boolean
  acknowledged: boolean
  setAcknowledged: (value: boolean) => void
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
  const {
    mutate: persistStep,
    reset: resetAdvance,
    isPending: advancePending,
    isError: advanceError
  } = useAdvanceOnboarding()
  const {
    mutateAsync: signCharter,
    reset: resetCharter,
    isPending: charterPending,
    isError: charterError
  } = useSignCharter()

  const saving = advancePending || charterPending
  const error = advanceError || charterError

  const [currentStep, setCurrentStep] = useState(() => clampStep(initialStep))
  const [subStep, setSubStep] = useState(0)
  const [screen, setScreen] = useState<OnboardingScreen>(() => (initialStep <= 0 ? 'welcome' : 'steps'))
  const [acknowledged, setAcknowledged] = useState(false)

  const value = useMemo<OnboardingContextValue>(() => {
    const screenCount = getStepScreenCount(currentStep)
    const isLastMacroStep = currentStep === ONBOARDING_STEPS.length - 1
    const isFirstStep = currentStep === 0 && subStep === 0
    const isLastStep = isLastMacroStep && subStep === screenCount - 1
    const screenConfig = screen === 'steps' ? getScreenConfig(currentStep, subStep) : undefined
    const canProceed = !screenConfig?.requiresAcknowledgement || acknowledged

    const advance = () => {
      // A fresh screen must earn its own acknowledgement again.
      setAcknowledged(false)
      // Progress is persisted per macro step, only once its last screen is left.
      if (subStep < screenCount - 1) {
        setSubStep((step) => step + 1)
        return
      }
      persistStep(currentStep + 1)
      if (!isLastMacroStep) {
        setCurrentStep((step) => step + 1)
        setSubStep(0)
      }
    }

    const goNext = () => {
      if (saving || !canProceed) {
        return
      }
      if (screen === 'welcome') {
        setScreen('steps')
        return
      }
      const run = screenConfig?.primaryAction?.run
      if (run) {
        // On rejection the error message is raised and the user stays on the screen.
        run({ signCharter }).then(advance, () => undefined)
        return
      }
      advance()
    }

    const goBack = () => {
      if (screen === 'welcome') {
        return
      }
      setAcknowledged(false)
      if (error) {
        resetAdvance()
        resetCharter()
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
      stepProgress: screen === 'welcome' ? 0 : subStep / screenCount,
      screenConfig,
      primaryLabel: screenConfig?.primaryAction?.label ?? defaultLabel,
      canProceed,
      acknowledged,
      setAcknowledged,
      goNext,
      goBack
    }
  }, [screen, currentStep, subStep, acknowledged, saving, error, persistStep, signCharter, resetAdvance, resetCharter])

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
