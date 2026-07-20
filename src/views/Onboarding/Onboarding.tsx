import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Button, Typography } from '@mui/material'
import logo from 'assets/images/logo-login.png'
import useOnboardingEnabled from 'hooks/onboarding/useOnboardingEnabled'
import useOnboardingStatus from 'hooks/onboarding/useOnboardingStatus'
import React from 'react'
import { Navigate } from 'react-router-dom'

import { OnboardingProvider, useOnboarding } from './OnboardingContext'
import { ONBOARDING_STEPS } from './steps'
import useStyles from './styles'
import UserMenu from './UserMenu'
import WelcomeScreen from './WelcomeScreen'
import WizardShell from './WizardShell'

const PROGRESS_ERROR_MESSAGE =
  "Une erreur est survenue lors de l'enregistrement de votre progression. Veuillez réessayer."

const OnboardingLayout = () => {
  const { classes } = useStyles()
  const { screen, currentStep, screenConfig, stepProgress, primaryLabel, saving, error, goNext, goBack } =
    useOnboarding()

  const ActiveScreen = screenConfig?.component

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
          className={classes.backButton}
          variant="outlined"
          onClick={goBack}
          disabled={saving}
          startIcon={<ArrowBackIcon />}
        >
          Revenir
        </Button>
      )}
      <Button
        className={classes.nextButton}
        variant="contained"
        onClick={goNext}
        disabled={saving}
        endIcon={<ArrowForwardIcon />}
      >
        {primaryLabel}
      </Button>
    </>
  )

  return (
    <WizardShell
      header={header}
      steps={ONBOARDING_STEPS}
      activeStep={screen === 'welcome' ? -1 : currentStep}
      stepProgress={stepProgress}
      layout={screenConfig?.layout}
      footer={footer}
    >
      {screen === 'welcome' ? <WelcomeScreen /> : ActiveScreen && <ActiveScreen />}
      {error && (
        <Typography role="alert" className={classes.error}>
          {screenConfig?.primaryAction?.errorMessage ?? PROGRESS_ERROR_MESSAGE}
        </Typography>
      )}
    </WizardShell>
  )
}

const Onboarding = () => {
  const onboardingEnabled = useOnboardingEnabled()
  const { status } = useOnboardingStatus(onboardingEnabled)

  if (!onboardingEnabled) {
    return <Navigate to="/home" replace />
  }

  if (status?.onboarding_completed_at != null) {
    return <Navigate to="/home" replace />
  }

  return (
    <OnboardingProvider initialStep={status?.onboarding_step ?? 0}>
      <OnboardingLayout />
    </OnboardingProvider>
  )
}

export default Onboarding
