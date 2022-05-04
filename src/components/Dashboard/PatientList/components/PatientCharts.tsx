import React from 'react'

import { CircularProgress, Grid, Paper, Typography } from '@material-ui/core'

import PieChart from '../../Preview/Charts/PieChart'
import BarChart from '../../Preview/Charts/BarChart'
import PyramidChart from '../../Preview/Charts/PyramidChart'

import { AgeRepartitionType, SimpleChartDataType } from 'types'

import useStyles from './styles'

type PatientChartsProps = {
  agePyramid?: AgeRepartitionType
  patientData?: { vitalStatusData?: SimpleChartDataType[]; genderData?: SimpleChartDataType[] }
}
const PatientCharts: React.FC<PatientChartsProps> = ({ agePyramid, patientData }) => {
  const classes = useStyles()

  return (
    <Grid container>
      <Grid container item xs={12} md={6} lg={4} justifyContent="center">
        <Paper className={classes.chartOverlay}>
          <Grid container item className={classes.chartTitle}>
            <Typography variant="h3" color="primary">
              Répartition par genre
            </Typography>
          </Grid>
          {patientData === undefined || (patientData && patientData.genderData === undefined) ? (
            <Grid container justifyContent="center" alignItems="center">
              <CircularProgress />
            </Grid>
          ) : patientData.genderData && patientData.genderData.length > 0 ? (
            <BarChart data={patientData.genderData ?? []} />
          ) : (
            <Typography>Aucun patient</Typography>
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
          {patientData === undefined || (patientData && patientData.vitalStatusData === undefined) ? (
            <Grid container justifyContent="center" alignItems="center">
              <CircularProgress />
            </Grid>
          ) : patientData.vitalStatusData &&
            patientData.vitalStatusData.find(({ value }) => value !== 0) !== undefined ? (
            <PieChart data={patientData.vitalStatusData ?? []} />
          ) : (
            <Typography>Aucun patient</Typography>
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
          {agePyramid === undefined ? (
            <Grid container justifyContent="center" alignItems="center">
              <CircularProgress />
            </Grid>
          ) : agePyramid && agePyramid.length > 0 ? (
            <PyramidChart data={agePyramid} width={250} />
          ) : (
            <Typography>Aucun patient</Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  )
}

export default PatientCharts
