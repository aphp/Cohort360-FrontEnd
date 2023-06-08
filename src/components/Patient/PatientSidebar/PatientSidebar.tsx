import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { CircularProgress, Divider, Drawer, Grid, IconButton, List, Pagination, Typography } from '@mui/material'

import PatientSidebarHeader from './PatientSidebarHeader/PatientSidebarHeader'
import PatientSidebarItem from './PatientSidebarItem/PatientSidebarItem'

import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import { getAge, substructAgeString } from 'utils/age'
import services from 'services/aphp'
import {
  CohortPatient,
  PatientFilters as PatientFiltersType,
  PatientGenderKind,
  SearchByTypes,
  Sort,
  VitalStatus
} from 'types'

import useStyles from './styles'
import moment from 'moment/moment'

type PatientSidebarTypes = {
  total: number
  patients?: CohortPatient[]
  openDrawer: boolean
  onClose: () => void
  deidentifiedBoolean: boolean
}

const PatientSidebar: React.FC<PatientSidebarTypes> = ({
  total,
  patients,
  openDrawer,
  onClose,
  deidentifiedBoolean
}) => {
  const { classes } = useStyles()
  const location = useLocation()

  const { search } = location
  const params = new URLSearchParams(search)
  const _searchInput = params.get('search')
  const groupId = params.get('groupId')?.split(',') ?? []

  const [page, setPage] = useState(1)
  const [totalPatients, setTotalPatients] = useState(total)
  const [patientsList, setPatientsList] = useState(patients)

  const [open, setOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(_searchInput ?? '')
  const [searchBy, setSearchBy] = useState(SearchByTypes.text)
  const [loadingStatus, setLoadingStatus] = useState(false)

  const [filters, setFilters] = useState<PatientFiltersType>({
    gender: PatientGenderKind._unknown,
    birthdatesRanges: ['', ''],
    vitalStatus: VitalStatus.all
  })

  const [openSort, setOpenSort] = useState(false)
  const [sort, setSort] = useState<Sort>({
    sortBy: 'family',
    sortDirection: 'asc'
  })

  const [showFilterChip, setShowFilterChip] = useState(false)

  const numberOfRows = 20 // Number of desired lines in the document array

  const onSearchPatient = async (sort: Sort, page = 1) => {
    setLoadingStatus(true)
    const birthdates: [string, string] = [
      moment(substructAgeString(filters.birthdatesRanges[0])).format('MM/DD/YYYY'),
      moment(substructAgeString(filters.birthdatesRanges[1])).format('MM/DD/YYYY')
    ]

    const patientsResp = await services.cohorts.fetchPatientList(
      page,
      searchBy,
      searchInput,
      filters.gender,
      birthdates,
      filters.vitalStatus,
      sort.sortBy,
      sort.sortDirection,
      deidentifiedBoolean,
      groupId.join(',')
    )
    setPatientsList(patientsResp?.originalPatients ?? [])
    setTotalPatients(patientsResp?.totalPatients ?? 0)
    setPage(page)
    setLoadingStatus(false)
  }

  const handleChangeSearchInput = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSearchInput(event.target.value)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearchPatient(sort)
    }
  }

  const handleChangePage = (event: React.ChangeEvent<unknown>, page: number) => {
    if (patientsList && patientsList.length < totalPatients) {
      onSearchPatient(sort, page)
    } else {
      setPage(page)
    }
  }

  const handleCloseDialog = (submit: boolean) => () => {
    setOpen(false)
    submit && setShowFilterChip(true)
  }

  const handleCloseSortDialog = () => {
    setOpenSort(false)
  }

  useEffect(() => {
    onSearchPatient(sort)
  }, [filters, sort]) // eslint-disable-line

  const patientsToDisplay =
    patientsList?.length === totalPatients
      ? patientsList.slice((page - 1) * numberOfRows, page * numberOfRows)
      : patientsList

  return (
    <Drawer anchor="right" classes={{ paper: classes.paper }} variant="persistent" open={openDrawer}>
      <div className={classes.openLeftBar}>
        <IconButton onClick={onClose}>
          <ChevronRightIcon color="action" width="20px" />
        </IconButton>
      </div>
      <PatientSidebarHeader
        deidentified={deidentifiedBoolean}
        onCloseButtonClick={onClose}
        searchInput={searchInput}
        onChangeSearchInput={handleChangeSearchInput}
        onKeyDownSearchInput={onKeyDown}
        searchBy={searchBy}
        onChangeSelect={setSearchBy}
        onSearchPatient={() => onSearchPatient(sort)}
        showFilterChip={showFilterChip}
        onClickFilterButton={() => setOpen(true)}
        open={open}
        onCloseFilterDialog={handleCloseDialog(false)}
        onSubmitDialog={handleCloseDialog(true)}
        filters={filters}
        onChangeFilters={setFilters}
        onClickSortButton={() => setOpenSort(true)}
        openSort={openSort}
        onCloseSort={handleCloseSortDialog}
        sort={sort}
        onChangeSort={setSort}
      />
      <Divider />
      <List className={classes.patientList} disablePadding>
        {loadingStatus ? (
          <Grid container justifyContent="center" className={classes.loading}>
            <CircularProgress />
          </Grid>
        ) : patientsToDisplay ? (
          patientsToDisplay.map((patient) => (
            <PatientSidebarItem
              key={patient.id}
              closeDialog={onClose}
              firstName={deidentifiedBoolean ? 'Prénom' : patient.name?.[0].given?.[0] ?? ''}
              lastName={deidentifiedBoolean ? 'Nom' : patient.name?.map((e) => e.family).join(' ') ?? ''}
              age={getAge(patient)}
              gender={patient.gender as PatientGenderKind}
              deceased={patient.deceasedDateTime ?? patient.deceasedBoolean}
              ipp={
                deidentifiedBoolean
                  ? `IPP chiffré: ${patient.id}`
                  : `IPP: ${
                      patient.identifier?.find((identifier) => identifier.type?.coding?.[0].code === 'IPP')?.value ??
                      'inconnu'
                    }`
              }
              id={patient.id}
            />
          ))
        ) : (
          <Grid container justifyContent="center">
            <Typography variant="h6">Aucun patient à afficher</Typography>
          </Grid>
        )}
      </List>
      <Pagination
        className={classes.pagination}
        count={Math.ceil(totalPatients / numberOfRows)}
        shape="circular"
        onChange={handleChangePage}
        page={page}
      />
    </Drawer>
  )
}

export default PatientSidebar
