import React, { useState, useEffect } from 'react'

import Button from '@material-ui/core/Button'
import useStyles from './styles'
import Title from '../../Title'
import CircularProgress from '@material-ui/core/CircularProgress'
import { fetchPatientsCount } from 'services/patient'

const PatientSearchCard = () => {
  const [patientNb, setPatientNb] = useState(0)
  const [loading, setLoading] = useState(true)
  const classes = useStyles()

  useEffect(() => {
    setLoading(true)
    fetchPatientsCount()
      .then((patientNumber) => setPatientNb(patientNumber))
      .then(() => setLoading(false))
  }, [])

  return (
    <>
      <Title>{loading ? <CircularProgress size={20} /> : patientNb} patients pris en charge</Title>
      <Button href="/mes_patients" variant="contained" disableElevation className={classes.button}>
        Explorer tous les patients
      </Button>
      <Button href="/perimetre" variant="contained" disableElevation className={classes.button}>
        Explorer un périmètre
      </Button>
    </>
  )
}

export default PatientSearchCard
