import MedicalSecrecyArtwork from 'assets/images/onboarding/medical-secrecy.svg?react'
import { Box, Typography } from '@mui/material'
import React from 'react'

import Illustration from '../../Illustration'
import InfoCallout from '../../InfoCallout'
import useStyles from '../../styles'

const MedicalSecrecy = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Vous respectez le secret médical
      </Typography>
      <Typography className={classes.sectionText}>
        Vous vous engagez à ne divulguer les informations obtenues qu'aux personnes dûment autorisées, en adéquation
        avec leur fonction.
      </Typography>
      <Illustration
        image={MedicalSecrecyArtwork}
        label="Le partage est restreint aux personnes ayant participé à la prise en charge"
      />
      <InfoCallout>
        Par exemple : il est interdit de partager les données associées à un patient ou groupe de patient avec des
        personnes n'ayant pas participé à leur prise en charge.
      </InfoCallout>
    </Box>
  )
}

export default MedicalSecrecy
