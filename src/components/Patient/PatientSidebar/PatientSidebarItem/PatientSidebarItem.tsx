import React from 'react'
import { useHistory } from 'react-router-dom'

import { Chip, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'

import { ReactComponent as FemaleIcon } from '../../../../assets/icones/venus.svg'
import { ReactComponent as MaleIcon } from '../../../../assets/icones/mars.svg'
import { ReactComponent as UnknownIcon } from '../../../../assets/icones/autre-inconnu.svg'

import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'

import useStyles from './styles'

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

type VitalStatusChipTypes = {
  deceased?: string | boolean
}
const VitalStatusChip: React.FC<VitalStatusChipTypes> = ({ deceased }) => {
  const classes = useStyles()

  if (deceased) {
    return <Chip className={classes.deceasedChip} label="D." />
  } else {
    return <Chip className={classes.aliveChip} label="V." />
  }
}

type PatientSidebarItemTypes = {
  gender?: PatientGenderKind
  firstName?: string
  lastName?: string
  age?: string | number
  id?: string
  ipp?: string
  deceased?: string | boolean
}
const PatientSidebarItem: React.FC<PatientSidebarItemTypes> = ({
  gender,
  firstName,
  lastName,
  age,
  id,
  ipp,
  deceased
}) => {
  const classes = useStyles()
  const history = useHistory()
  return (
    <ListItem divider onClick={() => history.push(`/patients/${id}`)} className={classes.listItem}>
      <ListItemIcon className={classes.genderIconContainer}>
        <GenderIcon gender={gender} />
      </ListItemIcon>
      <ListItemText primary={`${firstName} ${lastName}`} secondary={`${age} - ${ipp}`} />
      <VitalStatusChip deceased={deceased} />
    </ListItem>
  )
}

export default PatientSidebarItem
