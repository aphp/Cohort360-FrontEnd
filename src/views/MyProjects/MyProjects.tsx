import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import clsx from 'clsx'

import { Grid, Button, CircularProgress, Typography } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'

import ProjectTable from 'components/MyProjects/ProjectTable/ProjectTable'
import ModalAddOrEditProject from 'components/MyProjects/Modals/ModalAddOrEditProject/ModalAddOrEditProject'
import ModalAddOrEditRequest from 'components/Cohort/CreationCohort/Modals/ModalCreateNewRequest/ModalCreateNewRequest'

import { fetchRequestList } from 'services/myProjects'

import { useAppSelector } from 'state'
import { ProjectState, fetchProjects as fetchProjectsList, setSelectedProject } from 'state/project'

import useStyles from './styles'

const MyProjects = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { open, projectState } = useAppSelector<{
    open: boolean
    projectState: ProjectState
  }>((state) => ({
    open: state.drawer,
    projectState: state.project
  }))
  const { selectedProject } = projectState

  const loadingProject = projectState.loading
  const loading = loadingProject

  const [openModal, setOpenModal] = useState<'addOrEditProject' | 'addOrEditRequest' | null>(null)

  const [requestList, setRequestList] = useState<any[]>([])

  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  const _fetchProjectsList = async () => {
    dispatch<any>(fetchProjectsList())
  }

  const _fetchRequestList = async () => {
    const _requestResponse = await fetchRequestList()
    const _requestList: any[] = _requestResponse.results
    setRequestList(_requestList)
  }

  const _fetch = async () => {
    await _fetchProjectsList()
    await _fetchRequestList()
  }

  useEffect(() => {
    _fetch()
    return () => {
      setRequestList([])
    }
  }, [])

  const handleClickAddProject = () => {
    dispatch<any>(setSelectedProject(''))
  }

  const handleClickAddOrEditRequest = (selectedRequestId: string | null) => {
    if (selectedRequestId) {
      let foundItem = requestList.find((project) => project.uuid === selectedRequestId)
      if (!foundItem) foundItem = null
      setSelectedRequest(foundItem)
      setOpenModal('addOrEditRequest')
    } else {
      setSelectedRequest(null)
      setOpenModal('addOrEditRequest')
    }
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
            <Button startIcon={<AddIcon />} onClick={() => handleClickAddProject()} className={classes.addButton}>
              Ajouter un projet
            </Button>
          </Grid>

          <Grid container item xs={11} sm={9}>
            <ProjectTable requestList={requestList} onEditRequest={handleClickAddOrEditRequest} />
          </Grid>
        </Grid>
      </Grid>

      <ModalAddOrEditProject
        open={selectedProject !== null}
        onClose={() => dispatch<any>(setSelectedProject(null))}
        selectedProject={selectedProject}
      />

      {openModal === 'addOrEditRequest' && (
        <ModalAddOrEditRequest
          onClose={() => {
            setOpenModal(null)
            _fetch()
          }}
          selectedRequest={selectedRequest}
        />
      )}
    </>
  )
}

export default MyProjects
