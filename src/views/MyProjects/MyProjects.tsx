import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import clsx from 'clsx'

import { Grid, Button, CircularProgress, Typography } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'

import ProjectTable from 'components/MyProjects/ProjectTable/ProjectTable'
import ProjectSearchBar from 'components/MyProjects/ProjectSearchBar/ProjectSearchBar'

import ModalAddOrEditProject from 'components/MyProjects/Modals/ModalAddOrEditProject/ModalAddOrEditProject'
import ModalAddOrEditRequest from 'components/Cohort/CreationCohort/Modals/ModalCreateNewRequest/ModalCreateNewRequest'
import ModalEditCohort from 'components/MyProjects/Modals/ModalEditCohort/ModalEditCohort'

import { useAppSelector } from 'state'
import { ProjectState, fetchProjects as fetchProjectsList, setSelectedProject } from 'state/project'
import { RequestState, fetchRequests as fetchRequestsList, setSelectedRequest } from 'state/request'
import { CohortState, fetchCohorts as fetchCohortsList, setSelectedCohort } from 'state/cohort'

import useStyles from './styles'

const MyProjects = () => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const [searchInput, setSearchInput] = useState('')

  const { open, projectState, requestState, cohortState } = useAppSelector<{
    open: boolean
    projectState: ProjectState
    requestState: RequestState
    cohortState: CohortState
  }>((state) => ({
    open: state.drawer,
    projectState: state.project,
    requestState: state.request,
    cohortState: state.cohort
  }))
  const { selectedProject } = projectState
  const { selectedRequest } = requestState
  const { selectedCohort } = cohortState

  const loadingProject = projectState.loading
  const loadingRequest = requestState.loading
  const loadingCohort = cohortState.loading
  const loading = loadingProject || loadingRequest || loadingCohort

  const _fetchProjectsList = async () => {
    dispatch<any>(setSelectedProject(null))
    dispatch<any>(fetchProjectsList())
  }

  const _fetchRequestsList = async () => {
    dispatch<any>(setSelectedRequest(null))
    dispatch<any>(fetchRequestsList())
  }

  const _fetchCohortsList = async () => {
    dispatch<any>(fetchCohortsList())
  }

  const _fetch = async () => {
    await _fetchProjectsList()
    await _fetchRequestsList()
    await _fetchCohortsList()
  }

  useEffect(() => {
    _fetch()
  }, [])

  const handleClickAddProject = () => {
    dispatch<any>(setSelectedProject(''))
  }

  if (loading) {
    return (
      <Grid
        container
        direction="column"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
      >
        <Grid container className={classes.loaderGrid} justify="center" alignItems="center">
          <CircularProgress />
        </Grid>
      </Grid>
    )
  }

  return (
    <>
      <Grid
        container
        direction="column"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
      >
        <Grid container justify="center" alignItems="center">
          <Grid container item xs={11} sm={9}>
            <Typography variant="h1" color="primary" className={classes.title}>
              Mes projets de recherche
            </Typography>
          </Grid>

          <Grid container item xs={11} sm={9} className={classes.actionContainer}>
            <ProjectSearchBar setSearchInput={(newValue: string) => setSearchInput(newValue)} />

            <Button startIcon={<AddIcon />} onClick={() => handleClickAddProject()} className={classes.addButton}>
              Ajouter un projet
            </Button>
          </Grid>

          <Grid container item xs={11} sm={9}>
            <ProjectTable searchInput={searchInput} />
          </Grid>
        </Grid>
      </Grid>

      <ModalAddOrEditProject
        open={selectedProject !== null}
        onClose={() => dispatch<any>(setSelectedProject(null))}
        selectedProject={selectedProject}
      />

      {selectedRequest !== null && <ModalAddOrEditRequest onClose={() => dispatch<any>(setSelectedRequest(null))} />}

      <ModalEditCohort open={selectedCohort !== null} onClose={() => dispatch<any>(setSelectedCohort(null))} />
    </>
  )
}

export default MyProjects
