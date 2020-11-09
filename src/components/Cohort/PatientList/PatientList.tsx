import React, { useState } from 'react'

import {
  Button,
  CssBaseline,
  Grid,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Select,
  Typography
} from '@material-ui/core'

import PatientFilters from '../../Filters/PatientFilters/PatientFilters'
import TableauPatient from '../../TableauPatients/TableauPatients'

import PieChart from '../Preview/Charts/PieChart'
import BarChart from '../Preview/Charts/BarChart'
import PyramidChart from '../Preview/Charts/PyramidChart'

import { ReactComponent as SearchIcon } from '../../../assets/icones/search.svg'
import { ReactComponent as FilterList } from '../../../assets/icones/filter.svg'
import LockIcon from '@material-ui/icons/Lock'

import { fetchPatientList } from '../../../services/cohortInfos'
import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortPatient, ComplexChartDataType, SearchByTypes, VitalStatus } from 'types'
import { getGenderRepartitionSimpleData } from 'utils/graphUtils'

import useStyles from './styles'

type PatientListProps = {
  total: number
  groupId?: string
  deidentified?: boolean
  patients: CohortPatient[]
  loading?: boolean
  agePyramidData?: ComplexChartDataType<number, { male: number; female: number; other?: number }>
  genderRepartitionMap?: ComplexChartDataType<PatientGenderKind>
}

const PatientList: React.FC<PatientListProps> = ({ groupId, total, deidentified, patients, loading, ...props }) => {
  const classes = useStyles()
  const [page, setPage] = useState(1)
  const [totalPatients, setTotalPatients] = useState(total)
  const [patientsList, setPatientsList] = useState(patients)
  const [loadingStatus, setLoadingStatus] = useState(loading)
  const [searchInput, setSearchInput] = useState('')
  const [searchBy, setSearchBy] = useState<SearchByTypes>(SearchByTypes.text)
  const [agePyramid, setAgePyramid] = useState(props.agePyramidData)
  const [patientData, setPatientData] = useState(getGenderRepartitionSimpleData(props.genderRepartitionMap))
  const [open, setOpen] = useState(false)
  const [gender, setGender] = useState<PatientGenderKind>(PatientGenderKind._unknown)
  const [age, setAge] = useState<[number, number]>([0, 130])
  const [vitalStatus, setVitalStatus] = useState<VitalStatus>(VitalStatus.all)
  const [sortBy, setSortBy] = useState('given') // eslint-disable-line
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc') // eslint-disable-line
  const includeFacets = true

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const fetchPatients = (pageValue = 1) => {
    setLoadingStatus(true)
    fetchPatientList(pageValue, searchBy, searchInput, gender, age, vitalStatus, groupId, includeFacets)
      .then((result) => {
        if (result) {
          const { totalPatients, originalPatients, genderRepartitionMap, agePyramidData } = result
          setPatientsList(originalPatients)
          setPatientData(getGenderRepartitionSimpleData(genderRepartitionMap))
          setAgePyramid(agePyramidData)
          setTotalPatients(totalPatients)
        }
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setLoadingStatus(false)
      })
  }

  const onSearchPatient = () => {
    setPage(1)
    fetchPatients()
  }

  const handleCloseDialog = (submit: boolean) => () => {
    setOpen(false)
    submit && onSearchPatient()
  }

  const handleChangeSelect = (
    event: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>
  ) => {
    setSearchBy(event.target.value as SearchByTypes)
  }

  const handleChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value = 1) => {
    setPage(value)
    //We only fetch patients if we don't already have them
    if (totalPatients > patients.length) {
      fetchPatients(value)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchPatient()
    }
  }

  return (
    <Grid container direction="column" alignItems="center">
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
              <BarChart data={patientData.genderData} />
            </Paper>
          </Grid>
          <Grid container item xs={12} sm={6} lg={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition par statut vital
                </Typography>
              </Grid>
              <PieChart data={patientData.vitalStatusData} />
            </Paper>
          </Grid>
          <Grid container item xs={12} sm={6} lg={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Pyramide des âges
                </Typography>
              </Grid>
              <PyramidChart data={agePyramid} width={300} />
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
                  <LockIcon />
                  <Typography variant="h6">Recherche désactivée car patients dé-identifiés.</Typography>
                </Grid>
              ) : (
                <>
                  <Select value={searchBy} onChange={handleChangeSelect} className={classes.select}>
                    <MenuItem value={SearchByTypes.text}>Tous les champs</MenuItem>
                    <MenuItem value={SearchByTypes.family}>Nom</MenuItem>
                    <MenuItem value={SearchByTypes.given}>Prénom</MenuItem>
                    <MenuItem value={SearchByTypes.identifier}>IPP</MenuItem>
                  </Select>
                  <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
                    <InputBase
                      placeholder="Rechercher"
                      className={classes.input}
                      value={searchInput}
                      onChange={handleChangeInput}
                      onKeyDown={onKeyDown}
                    />
                    <IconButton type="submit" aria-label="search" onClick={onSearchPatient}>
                      <SearchIcon fill="#ED6D91" height="15px" />
                    </IconButton>
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
              <PatientFilters
                open={open}
                onClose={handleCloseDialog(false)}
                onSubmit={handleCloseDialog(true)}
                gender={gender}
                onChangeGender={setGender}
                age={age}
                onChangeAge={setAge}
                vitalStatus={vitalStatus}
                onChangeVitalStatus={setVitalStatus}
              />
            </div>
          </Grid>
          <TableauPatient
            deidentified={deidentified}
            patients={patientsList}
            loading={loadingStatus}
            onChangePage={handleChangePage}
            page={page}
            totalPatientCount={totalPatients}
            sortBy={sortBy}
            sortDirection={'asc'}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PatientList
