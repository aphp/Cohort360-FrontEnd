import React, { useState, useEffect } from 'react'

import Button from '@material-ui/core/Button'
import useStyles from './style'
import Title from '../../Title'
import CircularProgress from '@material-ui/core/CircularProgress'

import api from '../../../services/api'

const fetchPatientNumber = async () => {
  const response = await api.get('Patient?_summary=count')
  return response.data.total
}

const PatientSearchCard = () => {
  const [patientNb, setPatientNb] = useState(0)
  const [loading, setLoading] = useState(true)
  const classes = useStyles()

  useEffect(() => {
    setLoading(true)
    fetchPatientNumber()
      .then((patientNumber) => setPatientNb(patientNumber))
      .then(() => setLoading(false))
  }, [])

  return (
    <React.Fragment>
      <Title>
        {loading ? <CircularProgress size={20} /> : patientNb} patients pris en
        charge
      </Title>
      <Button
        href="/mes_patients"
        variant="contained"
        disableElevation
        className={classes.button}
      >
        Explorer tous les patients
      </Button>
      <Button
        href="/perimetre"
        variant="contained"
        disableElevation
        className={classes.button}
      >
        Explorer un périmètre
      </Button>
    </React.Fragment>
  )
}

export default PatientSearchCard
