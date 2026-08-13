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
        C'est un outil de datavisualisation visant à constituer des cohortes de patients. Il permet de dénombrer des
        patients, d'analyser des données de soin et de les extraire à des fins de recherche et d'analyse.
      </Typography>
    </Box>
  )
}

export default WhatIsCohort360
