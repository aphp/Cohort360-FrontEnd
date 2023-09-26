import React from 'react'

import { Grid, Typography } from '@mui/material'

import useStyles from './styles'
import { GenderStatus } from 'types/searchCriterias'
import GenderIcon from 'components/ui/GenderIcon/GenderIcon'

type PatientInfoTypes = {
  gender?: GenderStatus
  age: React.ReactText
  ipp?: string
}
const PatientInfo: React.FC<PatientInfoTypes> = ({ gender, age, ipp }) => {
  const { classes } = useStyles()

  return (
    <Grid className={classes.root} container direction="column">
      <Grid container item justifyContent="center" alignItems="center" className={classes.whiteCircle}>
        <GenderIcon gender={gender?.toLocaleUpperCase() as GenderStatus} className={classes.genderIcon} />
      </Grid>
      <Typography variant="body1">{age}</Typography>
      <Typography variant="body1">{ipp}</Typography>
    </Grid>
  )
}

export default PatientInfo
