import { Box, Typography } from '@mui/material'
import React from 'react'

import InfoCallout from '../../InfoCallout'
import useStyles from '../../styles'

const UsagePurposes = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Vous n'utilisez les données que pour les finalités prévues
      </Typography>
      <Typography className={classes.sectionText}>
        Vous vous engagez à ne pas utiliser les informations, données ou renseignements auxquels vous accédez pour
        d'autres fins que celles strictement prévues par vos attributions dans le cadre de vos missions.
      </Typography>
      <InfoCallout>
        Par exemple : la réutilisation de données exportées dans un cadre autorisé pour d'autres usages est interdit.
        Consulter le dossier médical d'un proche, même dans une intention de soin, est également interdit.
      </InfoCallout>
    </Box>
  )
}

export default UsagePurposes
