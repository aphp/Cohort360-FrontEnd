import DataCrossingArtwork from 'assets/images/onboarding/data-crossing.svg?react'
import { Box, Typography } from '@mui/material'
import React from 'react'

import Illustration from '../../Illustration'
import InfoCallout from '../../InfoCallout'
import useStyles from '../../styles'

const DataCrossing = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Vous ne croisez pas les données
      </Typography>
      <Typography className={classes.sectionText}>
        Vous vous engagez à ne pas croiser des données exportées via Cohort360 avec d'autres sources de données.
      </Typography>
      <Illustration image={DataCrossingArtwork} label="Le croisement entre deux jeux de données est interdit" />
      <InfoCallout>
        Que ce soit des données externes, comme par exemple des données du SNDS ou de l'INSEE ou des données internes à
        l'AP-HP issues d'un autre service pour lequel vous n'êtes pas habilité.
      </InfoCallout>
    </Box>
  )
}

export default DataCrossing
