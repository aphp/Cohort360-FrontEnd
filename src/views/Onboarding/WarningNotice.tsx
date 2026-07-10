import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { Box, Typography } from '@mui/material'
import React from 'react'

import useStyles from './styles'

export const WARNING_NOTICE_TEXT =
  'L’utilisation que vous faites des données est tracée et engage votre responsabilité.'

type Props = {
  /** `boxed` is the banner standing above the card, `inline` sits inside the card content. */
  variant: 'boxed' | 'inline'
}

const WarningNotice = ({ variant }: Props) => {
  const { classes, cx } = useStyles()

  return (
    <Box
      role="note"
      data-testid={variant === 'boxed' ? 'onboarding-warning-banner' : 'onboarding-warning-inline'}
      className={cx(
        classes.warningNotice,
        variant === 'boxed' ? classes.warningNoticeBoxed : classes.warningNoticeInline
      )}
    >
      <WarningRoundedIcon className={classes.warningIcon} fontSize="small" />
      <Typography className={classes.warningText}>{WARNING_NOTICE_TEXT}</Typography>
    </Box>
  )
}

export default WarningNotice
