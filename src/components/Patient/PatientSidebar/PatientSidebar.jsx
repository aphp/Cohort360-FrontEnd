import React, { useState } from 'react'
import Drawer from '@material-ui/core/Drawer'
import useStyles from './styles'
import PropTypes from 'prop-types'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import Pagination from '@material-ui/lab/Pagination'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import PatientSidebarHeader from './PatientSidebarHeader/PatientSidebarHeader'
import PatientSidebarItem from './PatientSidebarItem/PatientSidebarItem'

import { getAgeAphp } from '../../../utils/age'
import { CircularProgress } from '@material-ui/core'

import { fetchPatientList } from '../../../services/cohortInfos'

const PatientSidebar = (props) => {
  const classes = useStyles(props)

  const [page, setPage] = useState(1)
  const [totalPatients, setTotalPatients] = useState(props.total)
  const [patientsList, setPatientsList] = useState(props.patients)
  const [open, setOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchBy, setSearchBy] = useState('_text')
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [gender, setGender] = useState('all')
  const [age, setAge] = useState([0, 130])
  const [vitalStatus, setVitalStatus] = useState('all')

  const documentLines = 20 // Number of desired lines in the document array

  const handleChangePage = (event, value) => {
    setPage(value || 1)
    setLoadingStatus(true)
    fetchPatientList(
      value || 1,
      props.groupId,
      searchBy,
      searchInput,
      gender,
      age,
      vitalStatus
    )
      .then(({ patientsTotal, patientsList, patientsFacets }) => {
        setPatientsList(patientsList)
        setTotalPatients(patientsTotal)
      })
      .catch((error) => console.log(error))
      .then(() => {
        setLoadingStatus(false)
      })
  }

  const handleChangeSearchInput = (event) => {
    setSearchInput(event.target.value)
  }

  const onKeyDown = async (e) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchPatient()
    }
  }

  const handleChangeSelect = (event) => {
    setSearchBy(event.target.value)
  }

  const onSearchPatient = async () => {
    handleChangePage(1)
  }

  const handleCloseDialog = () => {
    setOpen(false)
    handleChangePage(1)
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

  return (
    <Drawer
      anchor="right"
      classes={{ paper: classes.paper }}
      variant="persistent"
      open={props.open}
    >
      <PatientSidebarHeader
        onCloseButtonClick={props.onClose}
        searchInput={searchInput}
        onChangeSearchInput={handleChangeSearchInput}
        onKeyDownSearchInput={onKeyDown}
        searchBy={searchBy}
        onChangeSelect={handleChangeSelect}
        onSearchPatient={onSearchPatient}
        open={open}
        onClickFilterButton={() => setOpen(true)}
        onCloseFilterDialog={() => setOpen(false)}
        onSubmitDialog={handleCloseDialog}
        gender={gender}
        onChangeGender={handleChangeGender}
        age={age}
        onChangeAge={handleChangeAge}
        vitalStatus={vitalStatus}
        onChangeVitalStatus={handleChangeVitalStatus}
      />
      <Divider />
      <List className={classes.patientList} disablePadding>
        {loadingStatus ? (
          <Grid container justify="center" className={classes.loading}>
            <CircularProgress />
          </Grid>
        ) : patientsList ? (
          patientsList.map((patient) => (
            <PatientSidebarItem
              key={patient.id}
              firstName={patient.name[0].given[0]}
              lastName={patient.name[0].family}
              age={getAgeAphp(patient.extension[1])}
              gender={patient.gender}
              deceasedBoolean={patient.deceasedDateTime}
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
        count={Math.ceil(totalPatients / documentLines)}
        shape="rounded"
        onChange={handleChangePage}
        page={page}
      />
    </Drawer>
  )
}

PatientSidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  patients: PropTypes.array,
  width: PropTypes.string,
  total: PropTypes.number,
  groupId: PropTypes.string
}

export default PatientSidebar
