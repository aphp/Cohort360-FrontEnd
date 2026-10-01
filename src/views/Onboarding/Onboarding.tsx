import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { Button, GlobalStyles, Typography } from '@mui/material'
import logo from 'assets/images/logo-login.png'
import useOnboardingEnabled from 'hooks/onboarding/useOnboardingEnabled'
import useOnboardingStatus from 'hooks/onboarding/useOnboardingStatus'
import React, { useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'

import { OnboardingProvider, useOnboarding } from './OnboardingContext'
import OnboardingReview from './OnboardingReview'
import type { OnboardingRouteState, OnboardingSection } from './route'
import ScreenTag from './ScreenTag'
import { getScreenByKey, ONBOARDING_STEPS } from './steps'
import useStyles from './styles'
import UserMenu from './UserMenu'
import WelcomeScreen from './WelcomeScreen'
import WizardShell from './WizardShell'

const PROGRESS_ERROR_MESSAGE =
  "Une erreur est survenue lors de l'enregistrement de votre progression. Veuillez réessayer."

/** The screen each side menu entry opens again, by its key in `ONBOARDING_STEPS`. */
const SECTION_SCREEN_KEYS: Record<OnboardingSection, string> = {
  habilitations: 'user-rights',
  engagements: 'commitments-summary',
  tutoriels: 'key-features'
}

const OnboardingLayout = () => {
  const { classes, cx } = useStyles()
  const {
    screen,
    currentStep,
    subStep,
    screenConfig,
    stepProgress,
    primaryLabel,
    canProceed,
    saving,
    error,
    goNext,
    goBack
  } = useOnboarding()

  const ActiveScreen = screenConfig?.component

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen, currentStep, subStep])

  const header = (
    <>
      <img className={classes.logo} src={logo} alt="Logo Cohort360" />
      <UserMenu />
    </>
  )

  const footer = (
    <>
      {screen === 'steps' && (
        <Button
          className={cx(classes.button, classes.backButton)}
          variant="outlined"
          onClick={goBack}
          disabled={saving}
          startIcon={<ArrowBackRoundedIcon />}
        >
          Revenir
        </Button>
      )}
      <Button
        className={cx(classes.button, classes.nextButton)}
        variant="contained"
        onClick={goNext}
        disabled={saving || !canProceed}
        endIcon={<ArrowForwardRoundedIcon />}
      >
        {primaryLabel}
      </Button>
    </>
  )

  return (
    <>
      {/* Scrollbar always on, so screens do not shift sideways when the content grows. */}
      <GlobalStyles styles={{ html: { overflowY: 'scroll' } }} />
      <WizardShell
        header={header}
        steps={ONBOARDING_STEPS}
        activeStep={screen === 'welcome' ? -1 : currentStep}
        stepProgress={stepProgress}
        layout={screenConfig?.layout}
        footer={footer}
      >
        {screen === 'welcome' ? (
          <WelcomeScreen />
        ) : (
          ActiveScreen && (
            <>
              {screenConfig?.tag && <ScreenTag label={screenConfig.tag} />}
              <ActiveScreen />
            </>
          )
        )}
        {error && (
          <Typography role="alert" className={classes.error}>
            {screenConfig?.primaryAction?.errorMessage ?? PROGRESS_ERROR_MESSAGE}
          </Typography>
        )}
      </WizardShell>
    </>
  )
}

const Onboarding = () => {
  const onboardingEnabled = useOnboardingEnabled()
  const { status } = useOnboardingStatus(onboardingEnabled)
  const navigate = useNavigate()
  const location = useLocation()
  const { from = '/home', section } = (location.state as OnboardingRouteState | null) ?? {}
  const reviewedScreen = section ? getScreenByKey(SECTION_SCREEN_KEYS[section]) : undefined

  if (!onboardingEnabled) {
    return <Navigate to="/home" replace />
  }

  if (status?.onboarding_completed_at != null) {
    // A completed journey is only reopened on a screen picked from the side menu; a new user who has
    // just completed it, or anyone typing the URL, is sent home.
    if (!reviewedScreen) {
      return <Navigate to="/home" replace />
    }
    return (
      <OnboardingProvider initialStep={0} mode="review">
        <OnboardingReview screenConfig={reviewedScreen} onReturn={() => navigate(from, { replace: true })} />
      </OnboardingProvider>
    )
  }

  return (
    <OnboardingProvider initialStep={status?.onboarding_step ?? 0}>
      <OnboardingLayout />
    </OnboardingProvider>
  )
}

export default Onboarding
