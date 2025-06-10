import React, { useContext, useEffect } from 'react'
import {
  CircularProgress,
  Grid,
  Paper,
  TableRow,
  TableHead,
  Table,
  TableBody,
  TableContainer,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import PieChart from './Charts/PieChart'
import BarChart from './Charts/BarChart'
import GroupedBarChart from './Charts/GroupedBarChart'
import DonutChart from './Charts/DonutChart'
import PyramidChart from './Charts/PyramidChart'
import InfoIcon from '@mui/icons-material/Info'
import WarningIcon from '@mui/icons-material/Warning'

import useStyles from './styles'
import clsx from 'clsx'

import { getGenderRepartitionSimpleData } from 'utils/graphUtils'
import { format } from 'utils/numbers'

import { SimpleChartDataType, GenderRepartitionType, AgeRepartitionType, VisiteRepartitionType } from 'types'
import LocationMap from 'components/Dashboard/Preview/LocationMap'
import { AppConfig } from 'config'
import { useSearchParams } from 'react-router-dom'
import { getCleanGroupId } from 'utils/paginationUtils'

const MAP_WARNING_PERSON_COUNT_THRESHOLD = 1000000

type RepartitionTableProps = {
  genderRepartitionMap?: GenderRepartitionType
  loading?: boolean
}

const RepartitionTable: React.FC<RepartitionTableProps> = ({ genderRepartitionMap, loading }) => {
  const { classes } = useStyles()
  let femaleAlive, maleAlive, femaleDeceased, maleDeceased
  if (loading) {
    return (
      <Paper className={classes.repartitionTable}>
        <Grid className={classes.progressContainer}>
          <CircularProgress />
        </Grid>
      </Paper>
    )
  }

  if (genderRepartitionMap) {
    const femaleValues = genderRepartitionMap.female
    const maleValues = genderRepartitionMap.male

    femaleAlive = femaleValues?.alive
    femaleDeceased = femaleValues?.deceased
    maleAlive = maleValues?.alive
    maleDeceased = maleValues?.deceased
  }

  return (
    <TableContainer id="repartition-table-card" component={Paper} className={classes.repartitionTable}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow className={classes.tableHead}>
            <TableCellWrapper variant="head" />
            <TableCellWrapper className={classes.tableHeadCell}>Vivant</TableCellWrapper>
            <TableCellWrapper className={classes.tableHeadCell}>Décédé</TableCellWrapper>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCellWrapper align="left" component="th" scope="row" className={classes.tableHeadCell}>
              Femmes
            </TableCellWrapper>
            <TableCellWrapper id="female-alive-cell">{format(femaleAlive)}</TableCellWrapper>
            <TableCellWrapper id="female-deceased-cell">{format(femaleDeceased)}</TableCellWrapper>
          </TableRow>
          <TableRow>
            <TableCellWrapper align="left" component="th" scope="row" className={classes.tableHeadCell}>
              Hommes
            </TableCellWrapper>
            <TableCellWrapper id="male-alive-cell">{format(maleAlive)}</TableCellWrapper>
            <TableCellWrapper id="male-deceased-cell">{format(maleDeceased)}</TableCellWrapper>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

type PreviewProps = {
  cohortId?: string
  total?: number
  loading?: boolean
  genderRepartitionMap?: GenderRepartitionType
  visitTypeRepartitionData?: SimpleChartDataType[]
  monthlyVisitData?: VisiteRepartitionType
  agePyramidData?: AgeRepartitionType
}
const Preview: React.FC<PreviewProps> = ({
  cohortId,
  total,
  genderRepartitionMap,
  visitTypeRepartitionData,
  monthlyVisitData,
  agePyramidData,
  loading
}) => {
  const { classes } = useStyles()
  const appConfig = useContext(AppConfig)
  const [searchParams, setSearchParams] = useSearchParams()
  const groupIds = searchParams.get('groupId') ?? undefined
  const { vitalStatusData, genderData } = getGenderRepartitionSimpleData(genderRepartitionMap)

  useEffect(() => {
    setSearchParams({ ...(groupIds && getCleanGroupId(groupIds) && { groupId: getCleanGroupId(groupIds) }) })
  }, [])

  return (
    <Grid container direction="column" alignItems="center" className={classes.root}>
      <Grid container item justifyContent="space-between" alignItems="center">
        <Grid container item xs={12} sm={6} md={4} justifyContent="center">
          <Paper id="patient-number-card" className={classes.nbPatientsOverlay}>
            <Grid container item className={classes.chartTitle}>
              <Typography id="patient-number-card-title" variant="h3" color="primary">
                Nombre de patients
              </Typography>
            </Grid>

            {loading || !total ? (
              <Grid className={classes.progressContainer}>
                <CircularProgress />
              </Grid>
            ) : (
              <Typography id="patient-number-card-value" variant="h4" className={classes.nbPatients}>
                {format(total)} patients
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <RepartitionTable genderRepartitionMap={genderRepartitionMap} loading={loading} />
        </Grid>
      </Grid>

      <Grid container>
        <Grid container item xs={12} sm={6} lg={4} justifyContent="center">
          <Paper id="vital-repartition-card" className={clsx(classes.chartOverlay, classes.fixedChartOverlay)}>
            <Grid container item className={classes.chartTitle}>
              <Typography id="vital-repartition-card-title" variant="h3" color="primary">
                Répartition par statut vital
              </Typography>
            </Grid>

            {loading || !vitalStatusData ? (
              <Grid className={classes.progressContainer}>
                <CircularProgress />
              </Grid>
            ) : (
              <PieChart data={vitalStatusData ?? []} />
            )}
          </Paper>
        </Grid>

        <Grid container item xs={12} sm={6} lg={4} justifyContent="center">
          <Paper id="visit-type-repartition-card" className={clsx(classes.chartOverlay, classes.fixedChartOverlay)}>
            <Grid container item className={classes.chartTitle}>
              <Typography id="visit-type-repartition-card-title" variant="h3" color="primary">
                Répartition par type de visite
              </Typography>
            </Grid>

            {loading ? (
              <Grid className={classes.progressContainer}>
                <CircularProgress />
              </Grid>
            ) : (
              <DonutChart data={visitTypeRepartitionData} />
            )}
          </Paper>
        </Grid>

        <Grid container item xs={12} sm={12} lg={4} justifyContent="center">
          <Paper id="gender-repartition-card" className={clsx(classes.chartOverlay, classes.fixedChartOverlay)}>
            <Grid container item className={classes.chartTitle}>
              <Typography id="gender-repartition-card-title" variant="h3" color="primary">
                Répartition par genre
              </Typography>
            </Grid>

            {loading ? (
              <Grid className={classes.progressContainer}>
                <CircularProgress />
              </Grid>
            ) : (
              <BarChart data={genderData} />
            )}
          </Paper>
        </Grid>

        <Grid container item md={12} lg={6} justifyContent="center">
          <Grid container item justifyContent="center">
            <Paper id="age-structure-card" className={clsx(classes.chartOverlay, classes.fixedChartOverlay)}>
              <Grid container item className={classes.chartTitle}>
                <Typography id="age-structure-card-title" variant="h3" color="primary">
                  Pyramide des âges
                </Typography>
              </Grid>

              {loading ? (
                <Grid className={classes.progressContainer}>
                  <CircularProgress />
                </Grid>
              ) : (
                <PyramidChart data={agePyramidData} />
              )}
            </Paper>
          </Grid>
        </Grid>

        <Grid container item md={12} lg={6} justifyContent="center">
          <Grid container item justifyContent="center">
            <Paper id="month-repartition-visit-card" className={clsx(classes.chartOverlay, classes.fixedChartOverlay)}>
              <Grid container item className={classes.chartTitle}>
                <Typography id="month-repartition-visit-card-title" variant="h3" color="primary">
                  Répartition des visites par mois
                </Typography>
              </Grid>

              {loading ? (
                <Grid className={classes.progressContainer}>
                  <CircularProgress />
                </Grid>
              ) : (
                <GroupedBarChart data={monthlyVisitData} />
              )}
            </Paper>
          </Grid>
        </Grid>
      </Grid>

      {appConfig.features.locationMap.enabled && cohortId && (
        <Grid container item justifyContent="space-between" alignItems="center">
          <Grid item xs={12} sm={12} md={12} justifyContent="center">
            <Paper id="location-map" className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography id="location-map-card-title" variant="h3" color="primary">
                  Répartition spatiale par zone IRIS
                  <Tooltip title="Les localisations des patients sont affichées uniquement si leur adresse est disponible (certains patients n'ayant pas d'adresse associée).">
                    <IconButton style={{ padding: '0 0 0 4px', marginTop: '-2.5px', position: 'absolute' }}>
                      <InfoIcon style={{ height: 22 }} />
                    </IconButton>
                  </Tooltip>
                  {total && total > MAP_WARNING_PERSON_COUNT_THRESHOLD && (
                    <Tooltip title="Le nombre de patients de ce périmètre est très large, la carte peut être lente à charger.">
                      <IconButton
                        style={{ padding: '0 0 0 4px', marginTop: '-2.5px', marginLeft: '25px', position: 'absolute' }}
                      >
                        <WarningIcon color="warning" style={{ height: 22 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Typography>
              </Grid>

              <LocationMap cohortId={cohortId} />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Grid>
  )
}

export default Preview
