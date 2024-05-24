import React from 'react'

import { CircularProgress, Grid, Paper, Typography } from '@mui/material'

import PieChart from '../../Preview/Charts/PieChart'
import BarChart from '../../Preview/Charts/BarChart'
import PyramidChart from '../../Preview/Charts/PyramidChart'

import { AgeRepartitionType, SimpleChartDataType } from 'types'
import { VitalStatusLabel } from 'types/searchCriterias'

import useStyles from './styles'

type PatientChartsProps = {
  agePyramid: AgeRepartitionType
  patientData: { vitalStatusData?: SimpleChartDataType[]; genderData?: SimpleChartDataType[] }
  loading: boolean
}
const PatientCharts: React.FC<PatientChartsProps> = ({ agePyramid, patientData, loading }) => {
  const { classes } = useStyles()

  return (
    <Grid container>
      <Grid container item xs={12} md={6} lg={4} justifyContent="center">
        <Paper className={classes.chartOverlay}>
          <Grid container item className={classes.chartTitle}>
            <Typography variant="h3" color="primary">
              Répartition par genre
            </Typography>
          </Grid>
          {loading && (
            <Grid container justifyContent="center" alignItems="center" style={{ height: '100%' }}>
              <CircularProgress />
            </Grid>
          )}
          {!loading && patientData?.genderData && patientData?.genderData?.length > 0 && (
            <BarChart data={patientData.genderData} />
          )}
          {!loading && patientData?.genderData && patientData?.genderData?.length < 1 && (
            <Grid container justifyContent="center" alignItems="center" style={{ height: '100%' }}>
              <Typography>Aucun patient</Typography>
            </Grid>
          )}
        </Paper>
      </Grid>

      <Grid container item xs={12} md={6} lg={4} justifyContent="center">
        <Paper className={classes.chartOverlay}>
          <Grid container item className={classes.chartTitle}>
            <Typography variant="h3" color="primary">
              Répartition par statut vital
            </Typography>
          </Grid>
          {loading && (
            <Grid container justifyContent="center" alignItems="center" style={{ height: '100%' }}>
              <CircularProgress />
            </Grid>
          )}
          {!loading && patientData?.vitalStatusData?.find(({ value }) => value > 0) && (
            <PieChart data={patientData.vitalStatusData} />
          )}
          {!loading &&
            patientData?.vitalStatusData?.find(({ label, value }) => value < 1 && label === VitalStatusLabel.ALIVE) &&
            patientData?.vitalStatusData?.find(
              ({ label, value }) => value < 1 && label === VitalStatusLabel.DECEASED
            ) && (
              <Grid container justifyContent="center" alignItems="center" style={{ height: '100%' }}>
                <Typography>Aucun patient</Typography>
              </Grid>
            )}
        </Paper>
      </Grid>

      <Grid container item md={12} lg={4} justifyContent="center">
        <Paper className={classes.chartOverlay}>
          <Grid container item className={classes.chartTitle}>
            <Typography variant="h3" color="primary">
              Pyramide des âges
            </Typography>
          </Grid>
          {loading && (
            <Grid container justifyContent="center" alignItems="center" style={{ height: '100%' }}>
              <CircularProgress />
            </Grid>
          )}
          {!loading && agePyramid?.length > 0 && <PyramidChart data={agePyramid} width={250} />}
          {!loading && agePyramid?.length < 1 && (
            <Grid container justifyContent="center" alignItems="center" style={{ height: '100%' }}>
              <Typography>Aucun âge à afficher</Typography>
            </Grid>
          )}
        </Paper>
      </Grid>
    </Grid>
  )
}

export default PatientCharts
