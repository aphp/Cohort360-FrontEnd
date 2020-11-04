import React, { useState } from 'react'
import PropTypes from 'prop-types'
import CssBaseline from '@material-ui/core/CssBaseline'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Pagination from '@material-ui/lab/Pagination'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import PatientFilters from '../../Filters/PatientFilters/PatientFilters'
import TableauPatient from '../../TableauPatients/TableauPatients'

import PieChart from '../Preview/Charts/PieChart'
import BarChart from '../Preview/Charts/BarChart'
import PyramidChart from '../Preview/Charts/PyramidChart'

import { ReactComponent as SearchIcon } from '../../../assets/icones/search.svg'
import { ReactComponent as FilterList } from '../../../assets/icones/filter.svg'
import LockIcon from '@material-ui/icons/Lock'

import { fetchPatientList } from '../../../services/cohortInfos'

import useStyles from './style'

const PatientList = ({
  groupId,
  total,
  deidentified,
  patients,
  patientsFacets,
  loading
}) => {
  const classes = useStyles()
  const [page, setPage] = useState(1)
  const [totalPatients, setTotalPatients] = useState(total)
  const [patientsList, setPatientsList] = useState(patients)
  const [loadingStatus, setLoadingStatus] = useState(loading)
  const [searchInput, setSearchInput] = useState('')
  const [searchBy, setSearchBy] = useState('_text')
  const [patientsFacetsData, setPatientsFacetsData] = useState(patientsFacets)
  const [open, setOpen] = useState(false)
  const [gender, setGender] = useState('all')
  const [age, setAge] = useState([0, 130])
  const [vitalStatus, setVitalStatus] = useState('all')

  const documentLines = 20
  const includeFacets = true

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const handleCloseDialog = () => {
    setOpen(false)
    handleChangePage(1)
  }

  const handleChangeSelect = (event) => {
    setSearchBy(event.target.value)
  }

  const handleChangeGender = (event) => {
    setGender(event.target.value)
  }

  const handleChangeAge = (event, value) => {
    setAge(value)
  }

  const handleChangeVitalStatus = (event, value) => {
    setVitalStatus(value)
  }

  const handleChangeInput = (event) => {
    setSearchInput(event.target.value)
  }

  const handleChangePage = (event, value) => {
    setPage(value || 1)
    setLoadingStatus(true)
    fetchPatientList(
      value || 1,
      groupId,
      searchBy,
      searchInput,
      gender,
      age,
      vitalStatus,
      includeFacets
    )
      .then(({ patientsTotal, patientsList, patientsFacets }) => {
        setPatientsList(patientsList)
        if (patientsList) {
          setPatientsFacetsData(patientsFacets)
        }
        setTotalPatients(patientsTotal)
      })
      .catch((error) => console.log(error))
      .then(() => {
        setLoadingStatus(false)
      })
  }

  const onSearchPatient = async () => {
    handleChangePage(1)
  }

  const onKeyDown = async (e) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchPatient()
    }
  }

  return (
    <Grid container maxwidth="xs" direction="column" alignItems="center">
      <CssBaseline />
      <Grid container item xs={11} justify="space-between">
        <Typography variant="h2" className={classes.pageTitle}>
          Données patient
        </Typography>
        <Grid container>
          <Grid container item xs={12} sm={6} lg={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition par genre
                </Typography>
              </Grid>
              <BarChart
                repartitionMap={patientsFacetsData.filter(
                  (facet) => facet.url === 'facet-gender-simple'
                )}
              />
            </Paper>
          </Grid>
          <Grid container item xs={12} sm={6} lg={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition par statut vital
                </Typography>
              </Grid>
              <PieChart
                repartitionMap={patientsFacetsData.filter(
                  (facet) => facet.url === 'facet-deceased'
                )}
              />
            </Paper>
          </Grid>
          <Grid container item xs={12} sm={6} lg={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Pyramide des âges
                </Typography>
              </Grid>
              <PyramidChart
                patients={patientsFacetsData.filter(
                  (facet) => facet.url === 'facet-age-month'
                )}
                width={300}
              />
            </Paper>
          </Grid>
        </Grid>
        <Grid container item justify="flex-end" className={classes.tableGrid}>
          <Grid container justify="space-between" alignItems="center">
            <Typography variant="button">
              {totalPatients} / {total} patient(s)
            </Typography>
            <div className={classes.tableButtons}>
              {deidentified ? (
                <Grid container alignItems="center">
                  <LockIcon size="inherit" />
                  <Typography variant="h6">
                    Les données patients sont pseudonymisées.
                  </Typography>
                </Grid>
              ) : (
                <>
                  <Select
                    value={searchBy}
                    onChange={handleChangeSelect}
                    className={classes.select}
                  >
                    <MenuItem value="_text">Tous les champs</MenuItem>
                    <MenuItem value="family">Nom</MenuItem>
                    <MenuItem value="given">Prénom</MenuItem>
                    <MenuItem value="identifier">IPP</MenuItem>
                  </Select>
                  <Grid
                    item
                    container
                    xs={10}
                    alignItems="center"
                    className={classes.searchBar}
                  >
                    <InputBase
                      placeholder="Rechercher"
                      className={classes.input}
                      value={searchInput}
                      onChange={handleChangeInput}
                      onKeyDown={onKeyDown}
                    />
                    <IconButton
                      type="submit"
                      aria-label="search"
                      onClick={onSearchPatient}
                    >
                      <SearchIcon fill="#ED6D91" height="15px" />
                    </IconButton>
                    <PatientFilters
                      open={open}
                      onClose={() => setOpen(false)}
                      onSubmit={handleCloseDialog}
                      gender={gender}
                      onChangeGender={handleChangeGender}
                      age={age}
                      onChangeAge={handleChangeAge}
                      vitalStatus={vitalStatus}
                      onChangeVitalStatus={handleChangeVitalStatus}
                    />
                  </Grid>
                </>
              )}
              <Button
                variant="contained"
                disableElevation
                startIcon={<FilterList height="15px" fill="#FFF" />}
                className={classes.searchButton}
                onClick={handleOpenDialog}
              >
                Filtrer
              </Button>
            </div>
          </Grid>
          <TableauPatient
            deidentified={deidentified}
            researchLines={documentLines}
            page={page}
            patients={patientsList}
            loading={loadingStatus}
          />
          <Pagination
            className={classes.pagination}
            count={Math.ceil(totalPatients / documentLines)}
            shape="rounded"
            onChange={handleChangePage}
            page={page}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

PatientList.propTypes = {
  deidentified: PropTypes.bool,
  loading: PropTypes.bool,
  patients: PropTypes.array,
  patientsFacets: PropTypes.array,
  total: PropTypes.number,
  groupId: PropTypes.string
}

export default PatientList
