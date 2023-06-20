import React from 'react'

import { Grid, Typography } from '@mui/material'

import { ReactComponent as FemaleIcon } from 'assets/icones/venus.svg'
import { ReactComponent as MaleIcon } from 'assets/icones/mars.svg'
import { ReactComponent as UnknownIcon } from 'assets/icones/autre-inconnu.svg'

import useStyles from './styles'
import { GenderStatus } from 'types/searchCriterias'

type GenderIconTypes = {
  gender?: GenderStatus
}
const GenderIcon: React.FC<GenderIconTypes> = ({ gender }) => {
  const { classes } = useStyles()

  switch (gender) {
    case GenderStatus.FEMALE:
      return <FemaleIcon className={classes.genderIcon} />
    case GenderStatus.MALE:
      return <MaleIcon className={classes.genderIcon} />
    default:
      return <UnknownIcon className={classes.genderIcon} />
  }
}

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
        <GenderIcon gender={gender} />
      </Grid>
      <Typography variant="body1">{age}</Typography>
      <Typography variant="body1">{ipp}</Typography>
    </Grid>
  )
}

export default PatientInfo
