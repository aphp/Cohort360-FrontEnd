import PerimeterScopeArtwork from 'assets/images/onboarding/perimeter-scope.svg?react'
import { Box, Typography } from '@mui/material'
import React from 'react'

import Illustration from '../../Illustration'
import InfoCallout from '../../InfoCallout'
import useStyles from '../../styles'

const PerimeterScope = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Vous n'accédez qu'aux données de votre périmètre
      </Typography>
      <Typography className={classes.sectionText}>
        Vous vous engagez à n'accéder qu'aux seuls dossiers et données auxquels l'AP-HP vous donne accès et qui sont
        strictement nécessaires à l'exercice de vos missions, selon les instructions du service concerné.
      </Typography>
      <Typography className={classes.sectionText}>
        Vous vous engagez à ne pas accéder aux autres dossiers ou données, même si cet accès est techniquement possible,
        et vous reconnaissez qu'un tel accès sera qualifié d'illégitime et sanctionnable.
      </Typography>
      <Illustration image={PerimeterScopeArtwork} label="Seul le périmètre habilité est accessible" />
      <InfoCallout>
        Si votre périmètre ne correspond pas à votre besoin réel, une demande de modification est possible, si vous êtes
        déjà habilité à Cohort360.
      </InfoCallout>
    </Box>
  )
}

export default PerimeterScope
