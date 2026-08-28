import { Box, Divider, Typography } from '@mui/material'
import InfoBadge from 'components/ui/InfoBadge'
import React from 'react'
import { eds } from 'styles/palette'

import useStyles from './styles'

type Props = {
  children: React.ReactNode
}

/** Encart d'information séparé du contenu par un filet, utilisé pour les exemples (RG3429.03). */
const InfoCallout = ({ children }: Props) => {
  const { classes } = useStyles()

  return (
    <>
      <Divider className={classes.divider} />
      <Box role="note" className={classes.infoRow}>
        <InfoBadge className={classes.infoBadge} variant="filled" color={eds.blue[600]} size={32} />
        <Typography className={classes.infoText}>{children}</Typography>
      </Box>
    </>
  )
}

export default InfoCallout
