import { Box, Typography } from '@mui/material'
import React from 'react'

import InfoCallout from '../../InfoCallout'
import useStyles from '../../styles'

const HabilitationLifecycle = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Vous anticipez la modification ou la clôture de vos habilitations
      </Typography>
      <Typography className={classes.sectionText}>
        Vous vous engagez à demander la clôture ou la modification des accès - si nécessaire de manière anticipée - en
        cas de changement de situation, ou dès qu'ils ne sont plus requis à votre point de contact EDS ou directement au
        support.
      </Typography>
      <InfoCallout>
        Par exemple : un changement de service, la fin d'un projet ou un départ modifient votre habilitation.
      </InfoCallout>
    </Box>
  )
}

export default HabilitationLifecycle
