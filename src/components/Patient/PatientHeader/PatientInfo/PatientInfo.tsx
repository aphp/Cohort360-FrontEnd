import React from 'react'

import { Grid, Typography } from '@material-ui/core'

import { ReactComponent as FemaleIcon } from 'assets/icones/venus.svg'
import { ReactComponent as MaleIcon } from 'assets/icones/mars.svg'
import { ReactComponent as UnknownIcon } from 'assets/icones/autre-inconnu.svg'

import useStyles from './styles'
import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'

type GenderIconTypes = {
  gender?: PatientGenderKind
}
const GenderIcon: React.FC<GenderIconTypes> = ({ gender }) => {
  const classes = useStyles()

  switch (gender) {
    case PatientGenderKind._female:
      return <FemaleIcon className={classes.genderIcon} />
    case PatientGenderKind._male:
      return <MaleIcon className={classes.genderIcon} />
    default:
      return <UnknownIcon className={classes.genderIcon} />
  }
}

type PatientInfoTypes = {
  gender?: PatientGenderKind
  age: React.ReactText
  ipp?: string
}
const PatientInfo: React.FC<PatientInfoTypes> = ({ gender, age, ipp }) => {
  const classes = useStyles()

  return (
    <Grid direction="column" className={classes.root} container={true}>
      <Grid container item justify="center" alignItems="center" className={classes.whiteCircle}>
        <GenderIcon gender={gender} />
      </Grid>
      <Typography variant="body1">{age}</Typography>
      <Typography variant="body1">{ipp}</Typography>
    </Grid>
  )
}

export default PatientInfo
