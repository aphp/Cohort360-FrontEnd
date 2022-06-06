import React, { useState, useEffect } from 'react'

import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import useStyles from './styles'

import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
// import services from 'services'

import displayDigit from 'utils/displayDigit'
import apiFhir from 'services/apiFhir'

const PatientSearchCard = () => {
  const [patientNb, setPatientNb] = useState(null)
  const [loading, setLoading] = useState(false)
  const classes = useStyles()

  useEffect(() => {
    const _fetchPatientsCount = async () => {
      setLoading(true)
      const response = await apiFhir.get(`/Patient?size=0`)
      if (response.status === 200) {
        setPatientNb(response.data.total)
        setLoading(false)
      } else {
        setPatientNb(null)
        setLoading(false)
      }
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
          href="/my-patients"
          size="small"
          variant="contained"
          disableElevation
          className={classes.button}
        >
          Explorer tous les patients
        </Button>
        <Button
          id="scope-research-button"
          href="/perimeter"
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
