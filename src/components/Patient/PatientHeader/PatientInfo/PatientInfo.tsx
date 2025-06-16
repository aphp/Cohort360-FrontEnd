import React from 'react'

import { Box, Grid, Typography } from '@mui/material'

import useStyles from './styles'
import { GenderStatus } from 'types/searchCriterias'
import GenderIcon from 'components/ui/GenderIcon'

type PatientInfoTypes = {
  gender?: GenderStatus
  age: string
  ipp?: string
}
const PatientInfo: React.FC<PatientInfoTypes> = ({ gender, age, ipp }) => {
  const { classes } = useStyles()

  return (
    <Box display="flex" alignItems="center">
      <Grid container item justifyContent="center" alignItems="center" className={classes.whiteCircle}>
        <GenderIcon gender={gender?.toLocaleUpperCase() as GenderStatus} size={44} color="#153D8A" />
      </Grid>
      <Box display="flex" flexDirection="column" ml={1}>
        <Typography>{age}</Typography>
        <Typography>IPP: {ipp}</Typography>
      </Box>
    </Box>
  )
}

export default PatientInfo
