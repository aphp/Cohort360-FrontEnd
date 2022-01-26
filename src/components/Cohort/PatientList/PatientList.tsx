import React, { useState, useEffect } from 'react'
import moment from 'moment'

import {
  Button,
  Chip,
  CircularProgress,
  CssBaseline,
  Grid,
  IconButton,
  InputAdornment,
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

import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'
import LockIcon from '@material-ui/icons/Lock'
import ClearIcon from '@material-ui/icons/Clear'

import services from 'services'
import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import {
  CohortPatient,
  SimpleChartDataType,
  GenderRepartitionType,
  AgeRepartitionType,
  SearchByTypes,
  VitalStatus
} from 'types'
import { getGenderRepartitionSimpleData } from 'utils/graphUtils'

import displayDigit from 'utils/displayDigit'

import useStyles from './styles'

type PatientListProps = {
  total: number
  groupId?: string
  deidentified?: boolean | null
  patients?: CohortPatient[]
  loading?: boolean
  agePyramidData?: AgeRepartitionType
  genderRepartitionMap?: GenderRepartitionType
}

const PatientList: React.FC<PatientListProps> = ({
  groupId,
  total,
  deidentified,
  patients,
  agePyramidData,
  genderRepartitionMap
}) => {
  const classes = useStyles()
  const [page, setPage] = useState(1)
  const [totalPatients, setTotalPatients] = useState(total)
  const [patientsList, setPatientsList] = useState(patients)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchBy, setSearchBy] = useState<SearchByTypes>(SearchByTypes.text)
  const [agePyramid, setAgePyramid] = useState<AgeRepartitionType | undefined>(undefined)
  const [patientData, setPatientData] = useState<
    { vitalStatusData?: SimpleChartDataType[]; genderData?: SimpleChartDataType[] } | undefined
  >(undefined)
  const [open, setOpen] = useState(false)
  const [gender, setGender] = useState<PatientGenderKind>(PatientGenderKind._unknown)
  const [birthdates, setBirthdates] = useState<[string, string]>([
    moment().subtract(130, 'years').format('YYYY-MM-DD'),
    moment().format('YYYY-MM-DD')
  ])
  const [vitalStatus, setVitalStatus] = useState<VitalStatus>(VitalStatus.all)
  const [sortBy, setSortBy] = useState('given') // eslint-disable-line
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc') // eslint-disable-line

  useEffect(() => {
    setAgePyramid(agePyramidData)
  }, [agePyramidData])

  useEffect(() => {
    setPatientData(getGenderRepartitionSimpleData(genderRepartitionMap))
  }, [genderRepartitionMap])

  useEffect(() => {
    setPatientsList(patients)
  }, [patients])

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const fetchPatients = async (
    sortBy: string,
    sortDirection: string,
    input = searchInput,
    pageValue = 1,
    includeFacets: boolean
  ) => {
    setLoadingStatus(true)
    // Set loader on chart
    if (includeFacets) {
      setPatientData(undefined)
      setAgePyramid(undefined)
    }
    const result = await services.cohorts.fetchPatientList(
      pageValue,
      searchBy,
      input,
      gender,
      birthdates,
      vitalStatus,
      sortBy,
      sortDirection,
      groupId,
      includeFacets
    )
    if (result) {
      const { totalPatients, originalPatients, genderRepartitionMap, agePyramidData } = result
      setPatientsList(originalPatients)
      if (includeFacets) {
        setPatientData(getGenderRepartitionSimpleData(genderRepartitionMap))
        setAgePyramid(agePyramidData)
      }
      setTotalPatients(totalPatients)
    }
    setLoadingStatus(false)
  }

  const onSearchPatient = (sortBy = 'given', sortDirection = 'asc', input = searchInput) => {
    setPage(1)
    setSortBy(sortBy)
    setSortDirection(sortDirection as 'asc' | 'desc')
    fetchPatients(sortBy, sortDirection, input, 1, true)
  }

  useEffect(() => {
    onSearchPatient()
  }, [gender, birthdates, vitalStatus]) // eslint-disable-line

  const handleCloseDialog = () => () => {
    setOpen(false)
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
    if (patients && patients.length < totalPatients) {
      fetchPatients(sortBy, sortDirection, searchInput, value, false)
    }
  }

  const handleClearInput = () => {
    setSearchInput('')
    onSearchPatient(sortBy, sortDirection, '')
  }

  const handleDeleteChip = (filterName: string) => {
    switch (filterName) {
      case 'gender':
        setGender(PatientGenderKind._unknown)
        break
      case 'birthdates':
        setBirthdates([moment().subtract(130, 'years').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')])
        break
      case 'vitalStatus':
        setVitalStatus(VitalStatus.all)
        break
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchPatient()
    }
  }

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: any) => {
    const isAsc: boolean = sortBy === property && sortDirection === 'asc'
    const _sortDirection = isAsc ? 'desc' : 'asc'

    setSortDirection(_sortDirection)
    setSortBy(property)
    onSearchPatient(property, _sortDirection)
  }

  const genderName = () => {
    switch (gender) {
      case PatientGenderKind._female:
        return 'Genre: Femmes'
      case PatientGenderKind._male:
        return 'Genre: Hommes'
      case PatientGenderKind._other:
        return 'Genre: Autre'
    }
  }

  const ageName = () => {
    const minDate: any = {}
    const maxDate: any = {}

    maxDate.year = moment().diff(moment(birthdates[0], 'YYYY-MM-DD'), 'year') || 0
    maxDate.month = moment().subtract(maxDate.year, 'year').diff(moment(birthdates[0], 'YYYY-MM-DD'), 'month')
    maxDate.days = moment()
      .subtract(maxDate.year, 'year')
      .subtract(maxDate.month, 'month')
      .diff(moment(birthdates[0], 'YYYY-MM-DD'), 'days')

    minDate.year = moment().diff(moment(birthdates[1], 'YYYY-MM-DD'), 'year') || 0
    minDate.month = moment().subtract(minDate.year, 'year').diff(moment(birthdates[1], 'YYYY-MM-DD'), 'month')
    minDate.days = moment()
      .subtract(minDate.year, 'year')
      .subtract(minDate.month, 'month')
      .diff(moment(birthdates[1], 'YYYY-MM-DD'), 'days')

    if (
      minDate.year === 0 &&
      minDate.month === 0 &&
      minDate.days === 0 &&
      maxDate.year === 130 &&
      maxDate.month === 0 &&
      maxDate.days === 0
    ) {
      return ''
    }

    return `Age entre
      ${
        minDate.year || minDate.month || minDate.days
          ? `${minDate.year > 0 ? `${minDate.year} an(s) ` : ``}
            ${minDate.month > 0 ? `${minDate.month} mois ` : ``}
            ${minDate.days > 0 ? `${minDate.days} jour(s) ` : ``}`
          : 0
      }
    et
      ${maxDate.year > 0 ? `${maxDate.year} an(s) ` : ``}
      ${maxDate.month > 0 ? `${maxDate.month} mois ` : ``}
      ${maxDate.days > 0 ? `${maxDate.days} jour(s) ` : ``}`
  }

  const vitalStatusName = () => {
    switch (vitalStatus) {
      case VitalStatus.alive:
        return 'Patients vivants'
      case VitalStatus.deceased:
        return 'Patients décédés'
    }
  }

  return (
    <Grid container direction="column" alignItems="center">
      <CssBaseline />
      <Grid container item xs={11} justify="space-between">
        <Grid container>
          <Grid container item xs={12} md={6} lg={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition par genre
                </Typography>
              </Grid>
              {patientData === undefined || (patientData && patientData.genderData === undefined) ? (
                <Grid container justify="center" alignItems="center">
                  <CircularProgress />
                </Grid>
              ) : patientData.genderData && patientData.genderData.length > 0 ? (
                <BarChart data={patientData.genderData ?? []} />
              ) : (
                <Typography>Aucun patient</Typography>
              )}
            </Paper>
          </Grid>
          <Grid container item xs={12} md={6} lg={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition par statut vital
                </Typography>
              </Grid>
              {patientData === undefined || (patientData && patientData.vitalStatusData === undefined) ? (
                <Grid container justify="center" alignItems="center">
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
          <Grid container item md={12} lg={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Pyramide des âges
                </Typography>
              </Grid>
              {agePyramid === undefined ? (
                <Grid container justify="center" alignItems="center">
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
        <Grid container item justify="flex-end" className={classes.tableGrid}>
          <Grid container justify="space-between" alignItems="center">
            <Typography variant="button">
              {displayDigit(totalPatients)} / {displayDigit(total)} patient(s)
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
                      endAdornment={
                        <InputAdornment position="end">
                          {searchInput && (
                            <IconButton onClick={handleClearInput}>
                              <ClearIcon />
                            </IconButton>
                          )}
                        </InputAdornment>
                      }
                    />
                    <IconButton
                      type="submit"
                      aria-label="search"
                      onClick={() => onSearchPatient(sortBy, sortDirection)}
                    >
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
                onClose={() => setOpen(false)}
                onSubmit={() => setOpen(false)}
                gender={gender}
                onChangeGender={setGender}
                birthdates={birthdates}
                onChangeBirthdates={setBirthdates}
                vitalStatus={vitalStatus}
                onChangeVitalStatus={setVitalStatus}
              />
            </div>
          </Grid>
          <Grid>
            {gender !== PatientGenderKind._unknown && (
              <Chip
                className={classes.chips}
                label={genderName()}
                onDelete={() => handleDeleteChip('gender')}
                color="primary"
                variant="outlined"
              />
            )}
            {birthdates && ageName() !== '' && (
              <Chip
                className={classes.chips}
                label={ageName()}
                onDelete={() => handleDeleteChip('birthdates')}
                color="primary"
                variant="outlined"
              />
            )}
            {vitalStatus !== VitalStatus.all && (
              <Chip
                className={classes.chips}
                label={vitalStatusName()}
                onDelete={() => handleDeleteChip('vitalStatus')}
                color="primary"
                variant="outlined"
              />
            )}
          </Grid>
          <TableauPatient
            groupId={groupId}
            deidentified={deidentified}
            patients={patientsList ?? []}
            loading={patientsList === undefined ? true : loadingStatus}
            onChangePage={handleChangePage}
            page={page}
            totalPatientCount={totalPatients}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onRequestSort={handleRequestSort}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PatientList
