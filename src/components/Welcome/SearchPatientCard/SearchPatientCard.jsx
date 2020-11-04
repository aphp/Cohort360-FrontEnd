import React from 'react'
import Divider from '@material-ui/core/Divider'

import useStyles from './style'
import Title from '../../Title'
import PatientSearchBar from '../../PatientSearchBar/PatientSearchBar'

const PatientSearchCard = () => {
  const classes = useStyles()

  return (
    <React.Fragment>
      <Title>Explorer les données d'un patient pris en charge</Title>
      <Divider className={classes.divider} />
      <PatientSearchBar />
    </React.Fragment>
  )
}

export default PatientSearchCard
