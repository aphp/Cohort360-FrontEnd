import { Box, Typography } from '@mui/material'
import { AppConfig } from 'config'
import useOnboardingStatus from 'hooks/onboarding/useOnboardingStatus'
import React, { useContext } from 'react'
import { useAppSelector } from 'state'

import { ONBOARDING_STEPS } from './steps'
import useStyles from './styles'

const WelcomeScreen = () => {
  const { classes } = useStyles()
  const { status } = useOnboardingStatus()
  const aphCode = useAppSelector((state) => state.me?.userName)
  const { preOnboardingAphCodes } = useContext(AppConfig).features.onboarding
  // The APH list forces the pre-onboarding user message, e.g. to check it in a test environment.
  const isPreOnboardingUser = !!status?.is_pre_onboarding_user || (!!aphCode && preOnboardingAphCodes.includes(aphCode))

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Bienvenue !
      </Typography>
      <Typography className={classes.sectionText}>
        {isPreOnboardingUser
          ? "Le parcours d'embarquement à Cohort360 évolue, nous en profitons pour vous proposer 3 étapes pour vous rappeler les informations importantes concernant l'outil Cohort360."
          : "Avant de commencer à utiliser l'outil, nous vous proposons un parcours en 3 étapes pour vous aider à comprendre l'outil Cohort360."}
      </Typography>
      {ONBOARDING_STEPS.map(({ key, label, summary, icon: Icon }) => (
        <Box key={key} className={classes.stepRow}>
          <Box className={classes.iconBox}>
            <Icon fontSize="small" />
          </Box>
          <Box>
            <Typography className={classes.stepTitle}>{label}</Typography>
            <Typography className={classes.stepDesc}>{summary}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default WelcomeScreen
