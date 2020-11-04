import React, { useState } from 'react'
import {
  CssBaseline,
  Chip,
  Grid,
  Container,
  Paper,
  Collapse,
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

import PropTypes from 'prop-types'

import useStyles from './style'

// multi line is not supported in older browsers ?
/* eslint-disable */

const CollapsibleText = ({ content, displayedLineCount }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <React.Fragment>
      <Container>
        <Collapse collapsedHeight={displayedLineCount * 20} in={isExpanded}>
          {content}
        </Collapse>
      </Container>
    </React.Fragment>
  )
}
CollapsibleText.propTypes = {
  content: PropTypes.string.isRequired,
  displayedLineCount: PropTypes.PropTypes.number.isRequired
}

const RepartitionTable = (props) => {
  const classes = useStyles()

  const rows = props.repartitionMap

  const getFrenchName = (text) => {
    switch (text) {
      case 'male':
        return 'Homme'
      case 'female':
        return 'Femme'
      case 'other':
        return 'Autre'
      default:
        return text
    }
  }

  const alive = rows[0].extension[0]
    ? rows[0].extension[0].extension[1].extension
    : null
  const deceased = rows[0].extension[1]
    ? rows[0].extension[1].extension[1].extension
    : null
  const femaleAlive = alive
    ? alive.filter((data) => data.url === 'female')[0]
      ? alive.filter((data) => data.url === 'female')[0].valueDecimal
      : 0
    : 0
  const maleAlive = alive
    ? alive.filter((data) => data.url === 'male')[0]
      ? alive.filter((data) => data.url === 'male')[0].valueDecimal
      : 0
    : 0
  const femaleDeceased = deceased
    ? deceased.filter((data) => data.url === 'female')[0]
      ? deceased.filter((data) => data.url === 'female')[0].valueDecimal
      : 0
    : 0
  const maleDeceased = deceased
    ? deceased.filter((data) => data.url === 'male')[0]
      ? deceased.filter((data) => data.url === 'male')[0].valueDecimal
      : 0
    : 0

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
            <TableCell
              component="th"
              scope="row"
              className={classes.tableHeadCell}
            >
              Femmes
            </TableCell>
            <TableCell align="center">{femaleAlive}</TableCell>
            <TableCell align="center">{femaleDeceased}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              component="th"
              scope="row"
              className={classes.tableHeadCell}
            >
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

RepartitionTable.propTypes = {
  repartitionMap: PropTypes.array.isRequired
}

const Preview = ({
  total,
  group,
  patientsFacets,
  encountersFacets,
  loading
}) => {
  const classes = useStyles()

  const title = group.name

  return loading ? (
    <CircularProgress className={classes.loadingSpinner} size={50} />
  ) : (
    <Grid
      container
      maxwidth="xs"
      direction="column"
      alignItems="center"
      className={classes.root}
    >
      <CssBaseline />
      <Grid container item className={classes.header} justify="center">
        <Grid container item alignItems="center" md={11}>
          <Grid container item direction="column">
            <Typography variant="h2" color="primary">
              {title}
            </Typography>
            {group.perimeters && (
              <ul className={classes.perimetersChipsDiv}>
                {group.perimeters.map((perimeter) => {
                  return (
                    <li key={perimeter} className={classes.item}>
                      <Chip
                        className={classes.perimetersChip}
                        label={perimeter}
                      />
                    </li>
                  )
                })}
              </ul>
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid
        container
        item
        maxwidth="xs"
        md={11}
        className={classes.outlinedContent}
      >
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
            <RepartitionTable
              repartitionMap={patientsFacets.filter(
                (facet) => facet.url === 'facet-deceased'
              )}
            />
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
              <PieChart
                repartitionMap={patientsFacets.filter(
                  (facet) => facet.url === 'facet-deceased'
                )}
              />
            </Paper>
          </Grid>
          <Grid container item xs={12} sm={6} md={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition par type de visite
                </Typography>
              </Grid>
              <DonutChart
                encountersFacets={encountersFacets.filter(
                  (facet) => facet.url === 'facet-class-simple'
                )}
                colors={['#A355FF', '#FFE755', '#FCA355', '#FC568F', '#FC5656']}
              />
            </Paper>
          </Grid>
          <Grid container item xs={12} sm={6} md={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition par genre
                </Typography>
              </Grid>
              <BarChart
                repartitionMap={patientsFacets.filter(
                  (facet) => facet.url === 'facet-gender-simple'
                )}
              />
            </Paper>
          </Grid>
          <Grid container item xs={12} sm={6} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Pyramide des âges
                </Typography>
              </Grid>
              <PyramidChart
                patients={patientsFacets.filter(
                  (facet) => facet.url === 'facet-age-month'
                )}
                width={400}
              />
            </Paper>
          </Grid>
          <Grid container item xs={12} sm={6} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition des visites par mois
                </Typography>
              </Grid>
              <GroupedBarChart
                encountersFacets={encountersFacets.filter(
                  (facet) => facet.url === 'facet-start-date-facet'
                )}
              />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

Preview.propTypes = {
  total: PropTypes.number,
  group: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string
  }).isRequired,
  patientsFacets: PropTypes.array,
  encountersFacets: PropTypes.array,
  loading: PropTypes.bool
}

export default Preview
