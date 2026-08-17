import { Box, Divider, Typography } from '@mui/material'
import InfoBadge from 'components/ui/InfoBadge'
import type { CircleBadgeVariant } from 'components/ui/CircleBadge'
import React from 'react'
import { eds } from 'styles/palette'

import useStyles from './styles'

type Props = {
  children: React.ReactNode
  variant?: CircleBadgeVariant
}

/** Encart d'information séparé du contenu par un filet, utilisé pour les exemples (RG3429.03). */
const InfoCallout = ({ children, variant = 'filled' }: Props) => {
  const { classes } = useStyles()

  return (
    <>
      <Divider className={classes.divider} />
      <Box role="note" className={classes.infoRow}>
        <InfoBadge className={classes.infoBadge} variant={variant} color={eds.blue[600]} size={32} />
        <Typography className={classes.infoText}>{children}</Typography>
      </Box>
    </>
  )
}

export default InfoCallout
