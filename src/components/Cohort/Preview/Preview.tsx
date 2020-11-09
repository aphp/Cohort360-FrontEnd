import React from 'react'
import {
  CssBaseline,
  Chip,
  Grid,
  Paper,
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableBody,
  TableContainer,
  CircularProgress
} from '@material-ui/core'
import Typography from '@material-ui/core/Typography'

import PieChart from './Charts/PieChart'
import BarChart from './Charts/BarChart'
import GroupedBarChart from './Charts/GroupedBarChart'
import DonutChart from './Charts/DonutChart'
import PyramidChart from './Charts/PyramidChart'

import useStyles from './styles'

import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { getGenderRepartitionSimpleData } from 'utils/graphUtils'
import { ComplexChartDataType, SimpleChartDataType, Month } from 'types'

type RepartitionTableProps = {
  genderRepartitionMap?: ComplexChartDataType<PatientGenderKind>
}

const RepartitionTable: React.FC<RepartitionTableProps> = ({ genderRepartitionMap }) => {
  const classes = useStyles()
  let femaleAlive, maleAlive, femaleDeceased, maleDeceased
  if (genderRepartitionMap) {
    const femaleValues = genderRepartitionMap.get(PatientGenderKind._female)
    const maleValues = genderRepartitionMap.get(PatientGenderKind._male)

    femaleAlive = femaleValues?.alive
    femaleDeceased = femaleValues?.deceased
    maleAlive = maleValues?.alive
    maleDeceased = maleValues?.deceased
  }

  return (
    <TableContainer component={Paper} className={classes.repartitionTable}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow className={classes.tableHead}>
            <TableCell variant="head" />
            <TableCell align="center" className={classes.tableHeadCell}>
              Vivant
            </TableCell>
            <TableCell align="center" className={classes.tableHeadCell}>
              Décédé
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row" className={classes.tableHeadCell}>
              Femmes
            </TableCell>
            <TableCell align="center">{femaleAlive}</TableCell>
            <TableCell align="center">{femaleDeceased}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row" className={classes.tableHeadCell}>
              Hommes
            </TableCell>
            <TableCell align="center">{maleAlive}</TableCell>
            <TableCell align="center">{maleDeceased}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

type PreviewProps = {
  total: number
  group: {
    name: string
    description?: string
    perimeters?: string[]
  }
  loading?: boolean
  genderRepartitionMap?: ComplexChartDataType<PatientGenderKind>
  visitTypeRepartitionData?: SimpleChartDataType[]
  monthlyVisitData?: ComplexChartDataType<Month>
  agePyramidData?: ComplexChartDataType<number, { male: number; female: number; other?: number }>
}
const Preview: React.FC<PreviewProps> = ({
  total,
  group,
  loading,
  genderRepartitionMap,
  visitTypeRepartitionData,
  monthlyVisitData,
  agePyramidData
}) => {
  const classes = useStyles()
  const title = group.name
  const { vitalStatusData, genderData } = getGenderRepartitionSimpleData(genderRepartitionMap)

  return loading ? (
    <CircularProgress className={classes.loadingSpinner} size={50} />
  ) : (
    <Grid container direction="column" alignItems="center" className={classes.root}>
      <CssBaseline />

      <Grid container item className={classes.header} justify="center">
        <Grid container item alignItems="center" md={11}>
          <Grid container item direction="column">
            <Typography variant="h2" color="primary">
              {title}
            </Typography>

            {group.perimeters && (
              <ul className={classes.perimetersChipsDiv}>
                {group.perimeters.map((perimeter) => (
                  <li key={perimeter} className={classes.item}>
                    <Chip className={classes.perimetersChip} label={perimeter} />
                  </li>
                ))}
              </ul>
            )}
          </Grid>
        </Grid>
      </Grid>

      <Grid container item md={11} className={classes.outlinedContent}>
        <Grid container item justify="space-between" alignItems="center">
          <Grid container item xs={12} sm={6} md={4} justify="center">
            <Paper className={classes.nbPatientsOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Nombre de patients
                </Typography>
              </Grid>

              <Typography variant="h4" className={classes.nbPatients}>
                {total} patients
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            <RepartitionTable genderRepartitionMap={genderRepartitionMap} />
          </Grid>
        </Grid>

        <Grid container>
          <Grid container item xs={12} sm={6} md={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition par statut vital
                </Typography>
              </Grid>

              <PieChart data={vitalStatusData} />
            </Paper>
          </Grid>

          <Grid container item xs={12} sm={6} md={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition par type de visite
                </Typography>
              </Grid>

              <DonutChart data={visitTypeRepartitionData} />
            </Paper>
          </Grid>

          <Grid container item xs={12} sm={6} md={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition par genre
                </Typography>
              </Grid>

              <BarChart data={genderData} />
            </Paper>
          </Grid>

          <Grid container item xs={12} sm={6} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Pyramide des âges
                </Typography>
              </Grid>

              <PyramidChart data={agePyramidData} />
            </Paper>
          </Grid>

          <Grid container item xs={12} sm={6} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition des visites par mois
                </Typography>
              </Grid>

              <GroupedBarChart data={monthlyVisitData} />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Preview
