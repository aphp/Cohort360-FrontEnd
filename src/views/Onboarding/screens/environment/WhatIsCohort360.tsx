import { Box, Typography } from '@mui/material'
import React from 'react'

import useStyles from '../../styles'

const WhatIsCohort360 = () => {
  const { classes } = useStyles()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Qu'est-ce que Cohort360 ?
      </Typography>
      <Typography className={classes.sectionText}>
        Cohort360 est un outil qui permet aux professionnels de santé de l'AP-HP{' '}
        <strong>
          de créer et de visualiser les données de groupes de patients (cohortes) en fonction de divers critères
        </strong>
        .
      </Typography>
    </Box>
  )
}

export default WhatIsCohort360
