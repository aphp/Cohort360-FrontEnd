import { Box, Typography } from '@mui/material'
import React from 'react'

import InfoCallout from '../../InfoCallout'
import useStyles from '../../styles'

const IncidentReporting = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Vous alertez en cas d'incident
      </Typography>
      <Typography className={classes.sectionText}>
        Vous vous engagez à faire remonter tout dysfonctionnement, problème ou incident observé à votre point de contact
        EDS ou directement au support.
      </Typography>
      <InfoCallout>
        Par exemple : voir apparaître des données qui ne correspondent pas à votre périmètre, ou constater qu'un accès
        fonctionne encore alors qu'il aurait dû être fermé.
      </InfoCallout>
    </Box>
  )
}

export default IncidentReporting
