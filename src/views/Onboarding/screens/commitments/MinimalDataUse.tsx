import PerimeterScopeArtwork from 'assets/images/onboarding/perimeter-scope.svg?react'
import { Box, Typography } from '@mui/material'
import React from 'react'

import Illustration from '../../Illustration'
import useStyles from '../../styles'

const MinimalDataUse = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        L'utilisation minimale des données
      </Typography>
      <Typography className={classes.sectionText}>
        En utilisant Cohort360, vous vous engagez à utiliser uniquement les données strictement nécessaires à votre
        recherche.
      </Typography>
      <Illustration
        image={PerimeterScopeArtwork}
        label="Seul le sous-ensemble de données strictement nécessaire est utilisé"
      />
    </Box>
  )
}

export default MinimalDataUse
