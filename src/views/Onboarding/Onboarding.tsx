import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Avatar, Box, Button, Typography } from '@mui/material'
import logo from 'assets/images/logo-login.png'
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from 'state'

import { OnboardingProvider, useOnboarding } from './OnboardingContext'
import StepPlaceholder from './StepPlaceholder'
import { ONBOARDING_STEPS } from './steps'
import useStyles from './styles'
import WelcomeScreen from './WelcomeScreen'
import WizardShell from './WizardShell'

const PROGRESS_ERROR_MESSAGE =
  "Une erreur est survenue lors de l'enregistrement de votre progression. Veuillez réessayer."

const getInitials = (name?: string) =>
  name
    ? name
        .trim()
        .split(/\s+/)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''

const OnboardingLayout = () => {
  const { classes } = useStyles()
  const displayName = useAppSelector((state) => state.me?.displayName)
  const { screen, currentStep, screenConfig, stepProgress, primaryLabel, saving, error, goNext, goBack } =
    useOnboarding()

  const activeStepConfig = ONBOARDING_STEPS[currentStep]
  const ActiveScreen = screenConfig?.component

  const header = (
    <>
      <img className={classes.logo} src={logo} alt="Logo Cohort360" />
      {displayName && (
        <Box className={classes.userBox}>
          <Avatar className={classes.avatar}>{getInitials(displayName)}</Avatar>
          <Typography className={classes.user}>{displayName}</Typography>
        </Box>
      )}
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
      <Button variant="contained" onClick={goNext} disabled={saving} endIcon={<ArrowForwardIcon />}>
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
      {screen === 'welcome' ? (
        <WelcomeScreen />
      ) : ActiveScreen ? (
        <ActiveScreen />
      ) : (
        <StepPlaceholder step={activeStepConfig} />
      )}
      {error && (
        <Typography role="alert" className={classes.error}>
          {screenConfig?.primaryAction?.errorMessage ?? PROGRESS_ERROR_MESSAGE}
        </Typography>
      )}
    </WizardShell>
  )
}

const Onboarding = () => {
  const { step, completedAt } = useAppSelector((state) => state.onboarding)

  if (completedAt !== null) {
    return <Navigate to="/home" replace />
  }

  return (
    <OnboardingProvider initialStep={step}>
      <OnboardingLayout />
    </OnboardingProvider>
  )
}

export default Onboarding
