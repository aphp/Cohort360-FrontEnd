import { Box, Typography } from '@mui/material'
import React from 'react'

import useStyles from '../../styles'
import WarningNotice from '../../WarningNotice'

const UsageRules = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Les règles d'utilisation des données dans Cohort360
      </Typography>
      <Typography className={classes.sectionText}>
        En demandant un accès à Cohort360, vous vous engagez à respecter plusieurs règles d'utilisation des données de
        santé de l'EDS.
      </Typography>
      <WarningNotice variant="inline" />
    </Box>
  )
}

export default UsageRules
