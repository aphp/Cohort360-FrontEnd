import { Box, Typography } from '@mui/material'
import React from 'react'

import InfoCallout from '../../InfoCallout'
import useStyles from '../../styles'

const PersonalAccess = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Vos accès sont personnels
      </Typography>
      <Typography className={classes.sectionText}>
        Vous vous engagez à garder <strong>pour vous seul</strong> les accès qui vous ont été accordés et à ne les
        employer qu'en accord avec les informations renseignées au formulaire de demande d'accès.
      </Typography>
      <InfoCallout>
        Par exemple : un collègue qui travaille sur le même projet ou dans le même service ne peut pas utiliser votre
        compte. Il doit faire sa propre demande d'habilitation.
      </InfoCallout>
    </Box>
  )
}

export default PersonalAccess
