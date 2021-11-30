import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import clsx from 'clsx'

import { Button, IconButton, CircularProgress, Grid, Hidden, Tooltip, Typography } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import { ReactComponent as DriveFileMoveIcon } from 'assets/icones/drive-file-move.svg'

import ProjectTable from 'components/MyProjects/ProjectTable/ProjectTable'
import ProjectSearchBar from 'components/MyProjects/ProjectSearchBar/ProjectSearchBar'

import ModalAddOrEditProject from 'components/MyProjects/Modals/ModalAddOrEditProject/ModalAddOrEditProject'
import ModalAddOrEditRequest from 'components/Cohort/CreationCohort/Modals/ModalCreateNewRequest/ModalCreateNewRequest'
import ModalEditCohort from 'components/MyProjects/Modals/ModalEditCohort/ModalEditCohort'
import ModalMoveRequest from 'components/MyProjects/Modals/ModalMoveRequest/ModalMoveRequest'
import ModalDeleteRequests from 'components/MyProjects/Modals/ModalDeleteRequests/ModalDeleteRequests'

import { RequestType } from 'types'

import { useAppSelector } from 'state'
import { ProjectState, fetchProjects as fetchProjectsList, setSelectedProject } from 'state/project'
import { RequestState, fetchRequests as fetchRequestsList, setSelectedRequest } from 'state/request'
import { CohortState, fetchCohorts as fetchCohortsList, setSelectedCohort } from 'state/cohort'

import useStyles from './styles'

const MyProjects = () => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const [searchInput, setSearchInput] = useState('')
  const [selectedRequests, setSelectedRequests] = useState<RequestType[]>([])
  const [openModal, setOpenModal] = useState<'move_to_folder' | 'delete_items' | null>(null)

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
  const { selectedRequest, requestsList } = requestState
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

          <Grid item xs={11} sm={9}>
            <Grid container justifyContent="space-between">
              <Grid className={classes.secondaryContainer}>
                {selectedRequests.length > 0 && (
                  <>
                    <Grid container direction="row">
                      <Hidden only={['xs', 'sm', 'md']}>
                        <Button
                          startIcon={<DriveFileMoveIcon />}
                          onClick={() => setOpenModal('move_to_folder')}
                          color="primary"
                        >
                          Deplacer {selectedRequests.length > 1 ? 'des requêtes' : 'une  requête'}
                        </Button>
                      </Hidden>
                      <Hidden only={['lg', 'xl']}>
                        <Tooltip title={`Deplacer ${selectedRequests.length > 1 ? 'des requêtes' : 'une  requête'}`}>
                          <IconButton onClick={() => setOpenModal('move_to_folder')} color="primary">
                            <DriveFileMoveIcon />
                          </IconButton>
                        </Tooltip>
                      </Hidden>

                      <Hidden only={['xs', 'sm', 'md']}>
                        <Button
                          startIcon={<DeleteIcon />}
                          onClick={() => setOpenModal('delete_items')}
                          color="secondary"
                        >
                          Supprimer {selectedRequests.length > 1 ? 'des requêtes' : 'une  requête'}
                        </Button>
                      </Hidden>
                      <Hidden only={['lg', 'xl']}>
                        <Tooltip title={`Supprimer ${selectedRequests.length > 1 ? 'des requêtes' : 'une  requête'}`}>
                          <IconButton onClick={() => setOpenModal('delete_items')} color="secondary">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Hidden>
                    </Grid>
                  </>
                )}
              </Grid>
              <Grid className={classes.actionContainer}>
                <ProjectSearchBar setSearchInput={(newValue: string) => setSearchInput(newValue)} />

                <Hidden only={['xs', 'sm', 'md']}>
                  <Button startIcon={<AddIcon />} onClick={() => handleClickAddProject()} className={classes.addButton}>
                    Ajouter un projet
                  </Button>
                </Hidden>

                <Hidden only={['lg', 'xl']}>
                  <Tooltip title={'Ajouter un projet'}>
                    <IconButton onClick={() => handleClickAddProject()} className={classes.addIconButton}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Hidden>
              </Grid>
            </Grid>

            <Typography style={{ height: 20 }}>
              {selectedRequests.length > 0 &&
                `${selectedRequests.length} selectionnée${selectedRequests.length === 1 ? '' : 's'} / ${
                  requestsList.length
                } requête${requestsList.length === 1 ? '' : 's'}`}
            </Typography>
          </Grid>

          <Grid container item xs={11} sm={9}>
            <ProjectTable
              searchInput={searchInput}
              selectedRequests={selectedRequests}
              setSelectedRequests={setSelectedRequests}
            />
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

      <ModalMoveRequest
        open={openModal === 'move_to_folder'}
        onClose={(onConfirm?: boolean) => {
          setOpenModal(null)
          if (onConfirm) {
            setSelectedRequests([])
          }
        }}
        selectedRequests={selectedRequests}
      />

      <ModalDeleteRequests
        open={openModal === 'delete_items'}
        onClose={(onConfirm?: boolean) => {
          setOpenModal(null)
          if (onConfirm) {
            setSelectedRequests([])
          }
        }}
        selectedRequests={selectedRequests}
      />
    </>
  )
}

export default MyProjects
