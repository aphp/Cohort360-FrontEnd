import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { Box, Typography } from '@mui/material'
import CircleBadge from 'components/ui/CircleBadge'
import React from 'react'

import useStyles from './styles'
import { onboardingTokens } from './tokens'

export const WARNING_NOTICE_TEXT =
  'L’utilisation que vous faites des données est tracée et engage votre responsabilité.'

type Props = {
  /** `boxed` is the banner standing above the card, `inline` sits inside the card content. */
  variant: 'boxed' | 'inline'
}

const WarningNotice = ({ variant }: Props) => {
  const { classes, cx } = useStyles()
  const boxed = variant === 'boxed'

  return (
    <Box
      role="note"
      data-testid={boxed ? 'onboarding-warning-banner' : 'onboarding-warning-inline'}
      className={cx(classes.warningNotice, boxed ? classes.warningNoticeBoxed : classes.warningNoticeInline)}
    >
      {boxed ? (
        <WarningRoundedIcon className={classes.warningIcon} fontSize="small" />
      ) : (
        <CircleBadge color={onboardingTokens.warning} variant="filled" size={28} className={classes.warningBadge}>
          <WarningRoundedIcon fontSize="inherit" />
        </CircleBadge>
      )}
      <Typography className={classes.warningText}>{WARNING_NOTICE_TEXT}</Typography>
    </Box>
  )
}

export default WarningNotice
