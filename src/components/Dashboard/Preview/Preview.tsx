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
  Typography
} from '@mui/material'
import Chart from 'components/ui/Chart'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import PieChart from './Charts/PieChart'
import BarChart from './Charts/BarChart'
import GroupedBarChart from './Charts/GroupedBarChart'
import DonutChart from './Charts/DonutChart'
import PyramidChart from './Charts/PyramidChart'

import useStyles from './styles'

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
          <Chart id="vital-repartition-card" isLoading={loading} title="Répartition par statut vital">
            <PieChart data={vitalStatusData ?? []} />
          </Chart>
        </Grid>

        <Grid container item xs={12} sm={6} lg={4} justifyContent="center">
          <Chart id="visit-type-repartition-card" isLoading={loading} title="Répartition par type de visite">
            <DonutChart data={visitTypeRepartitionData} />
          </Chart>
        </Grid>

        <Grid container item xs={12} sm={12} lg={4} justifyContent="center">
          <Chart id="gender-repartition-card" isLoading={loading} title="Répartition par genre">
            <BarChart data={genderData} />
          </Chart>
        </Grid>

        <Grid container item md={12} lg={6} justifyContent="center">
          <Chart id="age-structure-card" isLoading={loading} title="Pyramide des âges">
            <PyramidChart data={agePyramidData} />
          </Chart>
        </Grid>

        <Grid container item md={12} lg={6} justifyContent="center">
          <Grid container item justifyContent="center">
            <Chart id="month-repartition-visit-card" isLoading={loading} title="Répartition des visites par mois">
              <GroupedBarChart data={monthlyVisitData} />
            </Chart>
          </Grid>
        </Grid>
      </Grid>

      {appConfig.features.locationMap.enabled && cohortId && (
        <Grid container item justifyContent="space-between" alignItems="center">
          <Grid item xs={12} sm={12} md={12} justifyContent="center">
            <Chart
              id="location-map"
              isLoading={loading}
              title="Répartition spatiale par zone IRIS"
              tooltip="Les localisations des patients sont affichées uniquement si leur adresse est disponible (certains patients n'ayant pas d'adresse associée)."
              warningTooltip={
                total && total > MAP_WARNING_PERSON_COUNT_THRESHOLD
                  ? 'Le nombre de patients de ce périmètre est très large, la carte peut être lente à charger.'
                  : undefined
              }
              height={'fit-content'}
            >
              <LocationMap cohortId={cohortId} />
            </Chart>
          </Grid>
        </Grid>
      )}
    </Grid>
  )
}

export default Preview
