import { Box, Typography } from '@mui/material'
import React from 'react'

import IllustrationPlaceholder from '../../IllustrationPlaceholder'
import useStyles from '../../styles'

const DataCrossing = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Le croisement des données
      </Typography>
      <Typography className={classes.sectionText}>
        Le croisement des données obtenues grâce à Cohort360 avec des données issues d'autres bases de données est{' '}
        <strong>formellement interdit</strong>.
      </Typography>
      <IllustrationPlaceholder label="Illustration : croisement interdit entre deux jeux de données" />
    </Box>
  )
}

export default DataCrossing
