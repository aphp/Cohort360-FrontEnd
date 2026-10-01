import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { Box, Button } from '@mui/material'
import logo from 'assets/images/logo-login.png'
import React from 'react'

import ScreenTag from './ScreenTag'
import type { OnboardingScreenConfig } from './steps'
import useStyles from './styles'
import UserMenu from './UserMenu'
import WizardShell from './WizardShell'

type Props = {
  screenConfig: OnboardingScreenConfig
  onReturn: () => void
}

/** A single screen consulted again from the side menu: no steps rail and no navigation buttons. */
const OnboardingReview = ({ screenConfig, onReturn }: Props) => {
  const { classes, cx } = useStyles()
  const ReviewedScreen = screenConfig.component

  const header = (
    <>
      <img className={classes.logo} src={logo} alt="Logo Cohort360" />
      <Box className={classes.headerActions}>
        <UserMenu />
        <Button
          className={cx(classes.button, classes.nextButton, classes.returnButton)}
          variant="contained"
          onClick={onReturn}
          startIcon={<CloseRoundedIcon />}
        >
          Revenir à Cohort360
        </Button>
      </Box>
    </>
  )

  return (
    <WizardShell header={header} layout={screenConfig.layout}>
      {screenConfig.tag && <ScreenTag label={screenConfig.tag} />}
      <ReviewedScreen />
    </WizardShell>
  )
}

export default OnboardingReview
