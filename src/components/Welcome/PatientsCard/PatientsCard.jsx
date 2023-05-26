import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'

import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import useStyles from './styles'

import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import services from 'services/aphp'

import displayDigit from 'utils/displayDigit'

const PatientSearchCard = () => {
  const [patientNb, setPatientNb] = useState(0)
  const [loading, setLoading] = useState(true)
  const classes = useStyles()
  const navigate = useNavigate()

  useEffect(() => {
    const _fetchPatientsCount = async () => {
      if (typeof services.patients.fetchPatientsCount !== 'function') return

      setLoading(true)
      const patientNumber = await services.patients.fetchPatientsCount()
      if (patientNumber !== null) {
        setPatientNb(patientNumber)
      }
      setLoading(false)
    }

    _fetchPatientsCount()
  }, [])

  return (
    <>
      <div id="patients-card-title">
        <Typography component="h2" variant="h2" color="primary" gutterBottom>
          {loading ? (
            <CircularProgress size={20} />
          ) : patientNb ? (
            displayDigit(patientNb) + ' patients pris en charge'
          ) : (
            '- patients pris en charge'
          )}
        </Typography>
      </div>
      <Divider />
      <Grid container direction="column" justifyContent="space-evenly" style={{ height: '100%', marginTop: 8 }}>
        <Button
          id="patients-research-button"
          onClick={() => navigate('/my-patients')}
          size="small"
          variant="contained"
          disableElevation
          className={classes.button}
        >
          Explorer tous les patients
        </Button>
        <Button
          id="scope-research-button"
          onClick={() => navigate('/perimeter')}
          size="small"
          variant="contained"
          disableElevation
          className={classes.button}
        >
          Explorer un périmètre
        </Button>
      </Grid>
    </>
  )
}

export default PatientSearchCard
