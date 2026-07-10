import CareTeamSharingArtwork from 'assets/images/onboarding/care-team-sharing.svg?react'
import { Box, Typography } from '@mui/material'
import React from 'react'

import Illustration from '../../Illustration'
import useStyles from '../../styles'

const CareTeamSharing = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h6" className={classes.titleChip}>
        Un partage limité à « l'équipe de soin »
      </Typography>
      <Typography className={classes.accentText}>
        Votre compte est défini par l'accès à un <strong>périmètre précis</strong>. Vous pouvez partager les données
        associées à un patient ou groupe de patients{' '}
        <strong>seulement avec les personnes ayant participé à leur prise en charge</strong>.
      </Typography>
      <Illustration
        image={CareTeamSharingArtwork}
        label="Le partage est restreint aux personnes ayant participé à la prise en charge"
      />
    </Box>
  )
}

export default CareTeamSharing
