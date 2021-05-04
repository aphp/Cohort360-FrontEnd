import React, { useState, useEffect } from 'react'
import clsx from 'clsx'

import { Grid, Button, CircularProgress, Typography } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'

import ProjectTable from 'components/MyProjects/ProjectTable/ProjectTable'
import ModalAddOrEditProject from 'components/MyProjects/Modals/ModalAddOrEditProject/ModalAddOrEditProject'
import ModalAddOrEditRequest from 'components/Cohort/CreationCohort/Modals/ModalCreateNewRequest/ModalCreateNewRequest'

import { fetchProjectsList, fetchRequestList } from 'services/myProjects'

import { useAppSelector } from 'state'

import useStyles from './styles'

const MyProjects = () => {
  const classes = useStyles()
  const open = useAppSelector((state) => state.drawer)

  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState<'addOrEditProject' | 'addOrEditRequest' | null>(null)

  const [projectList, setProjectList] = useState<any[]>([])
  const [requestList, setRequestList] = useState<any[]>([])

  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  const _fetchProjectsList = async () => {
    const _projectList: any[] = await fetchProjectsList()
    setProjectList(_projectList)
  }

  const _fetchRequestList = async () => {
    const _requestResponse = await fetchRequestList()
    const _requestList: any[] = _requestResponse.results
    setRequestList(_requestList)
  }

  const _fetch = async () => {
    setLoading(true)
    await _fetchProjectsList()
    await _fetchRequestList()
    setLoading(false)
  }

  useEffect(() => {
    _fetch()
    return () => {
      setLoading(false)
      setProjectList([])
      setRequestList([])
    }
  }, [])

  const handleClickAddOrEditProject = (selectedProjectId: string | null) => {
    if (selectedProjectId) {
      let foundItem = projectList.find((project) => project.uuid === selectedProjectId)
      if (!foundItem) foundItem = null
      setSelectedProject(foundItem)
      setOpenModal('addOrEditProject')
    } else {
      setSelectedProject(null)
      setOpenModal('addOrEditProject')
    }
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
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleClickAddOrEditProject(null)}
              className={classes.addButton}
            >
              Ajouter un projet
            </Button>
          </Grid>

          <Grid container item xs={11} sm={9}>
            <ProjectTable
              projectList={projectList}
              requestList={requestList}
              onEditRequest={handleClickAddOrEditRequest}
              onEditProject={handleClickAddOrEditProject}
            />
          </Grid>
        </Grid>
      </Grid>

      <ModalAddOrEditProject
        open={openModal === 'addOrEditProject'}
        onClose={() => {
          setOpenModal(null)
          _fetch()
        }}
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
