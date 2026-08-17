import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { Box, Typography } from '@mui/material'
import CircleBadge from 'components/ui/CircleBadge'
import React from 'react'

import useStyles from './styles'
import { onboardingTokens } from './tokens'

export const WARNING_NOTICE_TEXT =
  'L’utilisation que vous faites des données est tracée et engage votre responsabilité.'

/** Shown once, on the opening screen of the commitments step (RG3308.02, revised mockups). */
const WarningNotice = () => {
  const { classes } = useStyles()

  return (
    <Box role="note" data-testid="onboarding-warning" className={classes.warningNotice}>
      <CircleBadge color={onboardingTokens.warning} variant="filled" size={32} className={classes.warningBadge}>
        <WarningRoundedIcon fontSize="inherit" />
      </CircleBadge>
      <Typography className={classes.warningText}>{WARNING_NOTICE_TEXT}</Typography>
    </Box>
  )
}

export default WarningNotice
