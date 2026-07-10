import { Box, Typography } from '@mui/material'
import React from 'react'

import IllustrationPlaceholder from '../../IllustrationPlaceholder'
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
      <IllustrationPlaceholder label="Illustration : sélection du sous-ensemble de données strictement nécessaire" />
    </Box>
  )
}

export default MinimalDataUse
