import React from 'react'
import { useHistory } from 'react-router-dom'
import useStyles from './styles'
import PropTypes from 'prop-types'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Chip from '@material-ui/core/Chip'

import { ReactComponent as FemaleIcon } from '../../../../assets/icones/venus.svg'
import { ReactComponent as MaleIcon } from '../../../../assets/icones/mars.svg'
import { ReactComponent as UnknownIcon } from '../../../../assets/icones/autre-inconnu.svg'

const GenderIcon = ({ gender }) => {
  const classes = useStyles()

  switch (gender) {
    case 'female':
      return <FemaleIcon className={classes.genderIcon} />
    case 'male':
      return <MaleIcon className={classes.genderIcon} />
    default:
      return <UnknownIcon className={classes.genderIcon} />
  }
}
GenderIcon.propTypes = {
  gender: PropTypes.string
}

const VitalStatusChip = (props) => {
  const classes = useStyles()
  const deceasedBoolean = props.deceasedBoolean
  if (deceasedBoolean) {
    return <Chip className={classes.deceasedChip} label="D." />
  } else {
    return <Chip className={classes.aliveChip} label="V." />
  }
}

const PatientSidebarItem = (props) => {
  const history = useHistory()
  const classes = useStyles()

  return (
    <ListItem
      divider
      onClick={() => history.push(`/patients/${props.id}`)}
      className={classes.listItem}
    >
      <ListItemIcon className={classes.genderIconContainer}>
        <GenderIcon gender={props.gender} />
      </ListItemIcon>
      <ListItemText
        primary={`${props.firstName} ${props.lastName}`}
        secondary={`${props.age} - ${props.id}`}
      />
      <VitalStatusChip deceasedBoolean={props.deceasedBoolean} />
    </ListItem>
  )
}

PatientSidebarItem.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  age: PropTypes.string.isRequired,
  gender: PropTypes.string.isRequired,
  deceasedBoolean: PropTypes.string,
  id: PropTypes.string.isRequired
}

export default PatientSidebarItem
