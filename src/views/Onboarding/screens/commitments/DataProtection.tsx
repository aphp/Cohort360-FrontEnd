import { Box, Typography } from '@mui/material'
import React from 'react'

import InfoCallout from '../../InfoCallout'
import useStyles from '../../styles'

const DataProtection = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Vous protégez les données que vous manipulez
      </Typography>
      <Typography className={classes.sectionText}>
        Vous vous engagez à prendre toutes les mesures et précautions conformes aux usages et à l'état de l'art dans le
        cadre de vos attributions, afin d'éviter l'utilisation détournée ou frauduleuse de ces données, et d'en
        préserver la sécurité matérielle.
      </Typography>
      <InfoCallout>
        Par exemple : déposer un export sur un service en ligne externe à l'AP-HP, le stocker sur un ordinateur partagé
        ou le transmettre à un prestataire, constitue un usage que vous ne maîtrisez plus et vous expose à un risque de
        poursuite.
      </InfoCallout>
    </Box>
  )
}

export default DataProtection
