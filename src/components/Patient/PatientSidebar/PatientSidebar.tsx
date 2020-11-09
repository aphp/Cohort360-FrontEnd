import React, { useState } from 'react'

import { CircularProgress, Divider, Drawer, Grid, IconButton, List, Typography } from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'

import PatientSidebarHeader from './PatientSidebarHeader/PatientSidebarHeader'
import PatientSidebarItem from './PatientSidebarItem/PatientSidebarItem'

import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import { getAge } from '../../../utils/age'
import { fetchPatientList } from '../../../services/cohortInfos'
import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortPatient, SearchByTypes, VitalStatus } from 'types'

import useStyles from './styles'

type PatientSidebarTypes = {
  total: number
  patients?: CohortPatient[]
  groupId?: string
  openDrawer: boolean
  onClose: () => void
  deidentifiedBoolean: boolean
}
const PatientSidebar: React.FC<PatientSidebarTypes> = ({
  total,
  patients,
  groupId,
  openDrawer,
  onClose,
  deidentifiedBoolean
}) => {
  const classes = useStyles()

  const [page, setPage] = useState(1)
  const [totalPatients, setTotalPatients] = useState(total)
  const [patientsList, setPatientsList] = useState(patients)
  const [open, setOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchBy, setSearchBy] = useState(SearchByTypes.text)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [gender, setGender] = useState(PatientGenderKind._unknown)
  const [age, setAge] = useState<[number, number]>([0, 130])
  const [vitalStatus, setVitalStatus] = useState(VitalStatus.all)

  const numberOfRows = 20 // Number of desired lines in the document array

  const onSearchPatient = (value = 1) => {
    setLoadingStatus(true)
    fetchPatientList(value, searchBy, searchInput, gender, age, vitalStatus, groupId)
      .then((patientsResp) => {
        setPatientsList(patientsResp?.originalPatients ?? [])
        setTotalPatients(patientsResp?.totalPatients ?? 0)
        setPage(page)
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setLoadingStatus(false)
      })
  }

  const handleChangeSearchInput = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSearchInput(event.target.value)
  }

  const onKeyDown = (e: { keyCode: number; preventDefault: () => void }) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchPatient()
    }
  }

  const handleChangePage = (event: React.ChangeEvent<unknown>, page: number) => {
    if (patientsList && patientsList.length < totalPatients) {
      onSearchPatient(page)
    } else {
      setPage(page)
    }
  }

  const handleCloseDialog = (submit: boolean) => () => {
    setOpen(false)
    submit && onSearchPatient()
  }

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
        onSearchPatient={onSearchPatient}
        onClickFilterButton={() => setOpen(true)}
        open={open}
        onCloseFilterDialog={handleCloseDialog(false)}
        onSubmitDialog={handleCloseDialog(true)}
        gender={gender}
        onChangeGender={setGender}
        age={age}
        onChangeAge={setAge}
        vitalStatus={vitalStatus}
        onChangeVitalStatus={setVitalStatus}
      />
      <Divider />
      <List className={classes.patientList} disablePadding>
        {loadingStatus ? (
          <Grid container justify="center" className={classes.loading}>
            <CircularProgress />
          </Grid>
        ) : patientsToDisplay ? (
          patientsToDisplay.map((patient) => (
            <PatientSidebarItem
              key={patient.id}
              firstName={deidentifiedBoolean ? 'Prénom' : patient.name?.[0].given?.[0] ?? ''}
              lastName={deidentifiedBoolean ? 'Nom' : patient.name?.map((e) => e.family).join(' ') ?? ''}
              age={getAge(patient)}
              gender={patient.gender}
              deceased={patient.deceasedDateTime ?? patient.deceasedBoolean}
              ipp={
                deidentifiedBoolean
                  ? `ID Technique: ${patient.id}`
                  : `IPP: ${
                      patient.identifier?.find((identifier) => identifier.type?.coding?.[0].code === 'IPP')?.value ??
                      'inconnu'
                    }`
              }
              id={patient.id}
            />
          ))
        ) : (
          <Grid container justify="center">
            <Typography variant="h6">Aucun patient à afficher</Typography>
          </Grid>
        )}
      </List>
      <Pagination
        className={classes.pagination}
        count={Math.ceil(totalPatients / numberOfRows)}
        shape="rounded"
        onChange={handleChangePage}
        page={page}
      />
    </Drawer>
  )
}

export default PatientSidebar
