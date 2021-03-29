import React, { useState, useEffect } from 'react'

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

import { ReactComponent as SearchIcon } from '../../../assets/icones/search.svg'
import { ReactComponent as FilterList } from '../../../assets/icones/filter.svg'
import LockIcon from '@material-ui/icons/Lock'
import ClearIcon from '@material-ui/icons/Clear'

import { PatientGenderKind, IPatient } from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortPatient, ComplexChartDataType, SearchByTypes, VitalStatus } from 'types'
import { getGenderRepartitionSimpleData, getAgeRepartitionMap, getGenderRepartitionMap } from 'utils/graphUtils'

import displayDigit from 'utils/displayDigit'

import useStyles from './styles'
import { useAppSelector } from 'state'
import { getAge } from 'utils/age'

type PatientListProps = {
  total: number
  groupId?: string
  deidentified?: boolean | null
  patients?: CohortPatient[]
  loading?: boolean
  agePyramidData?: ComplexChartDataType<number, { male: number; female: number; other?: number }>
  genderRepartitionMap?: ComplexChartDataType<PatientGenderKind>
}

const filterPatientList = (
  patients: IPatient[],
  page: number,
  searchBy: SearchByTypes,
  searchInput: string,
  gender: PatientGenderKind,
  age: [number, number],
  vitalStatus: VitalStatus,
  sortBy: string,
  sortDirection: string,
  groupId?: string,
  includeFacets?: boolean
) => {
  const filteredPatients: IPatient[] = patients.filter((patient) => {
    const lowerCaseSearchInput = searchInput.toLowerCase()
    const agePatient = parseInt(getAge(patient))
    const genderPatient = patient.gender
    const vitalStatusPatient = patient.deceasedDateTime ? VitalStatus.deceased : VitalStatus.alive
    const [ageMin, ageMax] = age
    let includePatient = true

    // Age filter
    if (isNaN(agePatient) || agePatient < ageMin || agePatient > ageMax) {
      includePatient = false
    }

    // Vital status filter
    if (vitalStatus !== VitalStatus.all && vitalStatusPatient !== vitalStatus) {
      includePatient = false
    }

    // Gender filter
    if (gender !== PatientGenderKind._unknown && genderPatient !== gender) {
      includePatient = false
    }

    // Input filter
    if (searchInput !== '') {
      const patientName = patient.name?.[0]
      const familyName = patientName?.family ?? ''
      const givenName = patientName?.given?.[0] ?? ''
      const ipp = patient.identifier?.[0].value
      switch (searchBy) {
        case SearchByTypes.text: {
          includePatient =
            givenName.toLowerCase().includes(lowerCaseSearchInput) ||
            familyName.toLowerCase().includes(lowerCaseSearchInput) ||
            ipp === lowerCaseSearchInput
          break
        }
        case SearchByTypes.family: {
          includePatient = familyName.toLowerCase().includes(lowerCaseSearchInput)
          break
        }
        case SearchByTypes.given: {
          includePatient = givenName.toLowerCase().includes(lowerCaseSearchInput)
          break
        }
        case SearchByTypes.identifier:
          includePatient = ipp === lowerCaseSearchInput
          break

        default:
          break
      }
    }

    return includePatient
  })

  return {
    totalPatients: filteredPatients.length,
    originalPatients: filteredPatients,
    agePyramidData: getAgeRepartitionMap(filteredPatients),
    genderRepartitionMap: getGenderRepartitionMap(filteredPatients)
  }
}

const PatientList: React.FC<PatientListProps> = ({ groupId, deidentified }) => {
  const classes = useStyles()
  const [page, setPage] = useState(1)

  const { originalPatients, loading, agePyramidData, genderRepartitionMap } = useAppSelector(
    (state) => state.exploredCohort
  )

  const [totalPatients, setTotalPatients] = useState(originalPatients?.length ?? 0)
  const [patientsList, setPatientsList] = useState(originalPatients)
  const [searchInput, setSearchInput] = useState('')
  const [searchBy, setSearchBy] = useState<SearchByTypes>(SearchByTypes.text)
  const [agePyramid, setAgePyramid] = useState(agePyramidData)
  const [patientData, setPatientData] = useState(getGenderRepartitionSimpleData(genderRepartitionMap))
  const [open, setOpen] = useState(false)
  const [gender, setGender] = useState<PatientGenderKind>(PatientGenderKind._unknown)
  const [age, setAge] = useState<[number, number]>([0, 130])
  const [vitalStatus, setVitalStatus] = useState<VitalStatus>(VitalStatus.all)
  const [sortBy, setSortBy] = useState('given') // eslint-disable-line
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc') // eslint-disable-line
  const [showFilterChip, setShowFilterChip] = useState(false)

  useEffect(() => {
    setTotalPatients(originalPatients?.length ?? 0)
    setPatientsList(originalPatients)
  }, [originalPatients])

  useEffect(() => {
    setAgePyramid(agePyramidData)
  }, [agePyramidData])

  useEffect(() => {
    setPatientData(getGenderRepartitionSimpleData(genderRepartitionMap))
  }, [genderRepartitionMap])

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const fetchPatients = (
    sortBy: string,
    sortDirection: string,
    input = searchInput,
    pageValue = 1,
    includeFacets: boolean
  ) => {
    const result = filterPatientList(
      originalPatients ?? [],
      pageValue,
      searchBy,
      input,
      gender,
      age,
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
  }

  const onSearchPatient = (sortBy = 'given', sortDirection = 'asc', input = searchInput) => {
    setPage(1)
    setSortBy(sortBy)
    setSortDirection(sortDirection as 'asc' | 'desc')
    fetchPatients(sortBy, sortDirection, input, 1, true)
  }

  useEffect(() => {
    onSearchPatient()
  }, [gender, age, vitalStatus]) // eslint-disable-line

  const handleCloseDialog = (submit: boolean) => () => {
    setOpen(false)
    submit && setShowFilterChip(true)
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
      case 'age':
        setAge([0, 130])
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
              {loading ? (
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
          <Grid container item xs={12} sm={6} lg={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Répartition par statut vital
                </Typography>
              </Grid>
              {loading ? (
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
          <Grid container item xs={12} sm={6} lg={4} justify="center">
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Pyramide des âges
                </Typography>
              </Grid>
              {loading ? (
                <Grid container justify="center" alignItems="center">
                  <CircularProgress />
                </Grid>
              ) : agePyramid && agePyramid.size > 0 ? (
                <PyramidChart data={agePyramid} width={250} />
              ) : (
                <Typography>Aucun patient</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
        <Grid container item justify="flex-end" className={classes.tableGrid}>
          <Grid container justify="space-between" alignItems="center">
            <Typography variant="button">{loading ? '-' : `${displayDigit(totalPatients)} patient(s)`}</Typography>
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
                          <IconButton onClick={handleClearInput}>{searchInput && <ClearIcon />}</IconButton>
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
          <Grid>
            {showFilterChip && gender !== PatientGenderKind._unknown && (
              <Chip
                className={classes.chips}
                label={genderName()}
                onDelete={() => handleDeleteChip('gender')}
                color="primary"
                variant="outlined"
              />
            )}
            {showFilterChip && (age[0] !== 0 || age[1] !== 130) && (
              <Chip
                className={classes.chips}
                label={`Âge entre ${age[0]} et ${age[1]} ans`}
                onDelete={() => handleDeleteChip('age')}
                color="primary"
                variant="outlined"
              />
            )}
            {showFilterChip && vitalStatus !== VitalStatus.all && (
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
            loading={loading}
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
