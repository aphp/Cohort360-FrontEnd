import React, { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'state'

import {
  Alert,
  Button as ButtonMui,
  CssBaseline,
  Grid,
  Hidden,
  IconButton,
  Snackbar,
  Tooltip,
  Typography
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import DriveFileMoveIcon from 'assets/icones/drive-file-move.svg?react'

import useStyles from '../MyCohorts/styles'

import ModalAddOrEditProject from 'components/Requests/Modals/ModalAddOrEditProject/ModalAddOrEditProject'
import ModalAddOrEditRequest from 'components/CreationCohort/Modals/ModalCreateNewRequest/ModalCreateNewRequest'
import ModalEditCohort from 'components/Requests/Modals/ModalEditCohort/ModalEditCohort'
import ModalMoveRequests from 'components/Requests/Modals/ModalMoveRequest/ModalMoveRequest'
import ModalDeleteRequests from 'components/Requests/Modals/ModalDeleteRequests/ModalDeleteRequests'
import ModalShareRequest from 'components/Requests/Modals/ModalShareRequest/ModalShareRequest'

import SearchInput from 'components/ui/Searchbar/SearchInput'
import { setSelectedCohort, fetchCohorts as fetchCohortsList } from 'state/cohort'
import { setSelectedProject, fetchProjects as fetchProjectsList } from 'state/project'
import { fetchRequests as fetchRequestsList, setSelectedRequest, setSelectedRequestShare } from 'state/request'
import { RequestType, SimpleStatus } from 'types'
import Button from 'components/ui/Button'
import ProjectTable from 'components/Requests/ProjectsTable'

const MyRequests = () => {
  const { classes, cx } = useStyles()
  const openDrawer = useAppSelector((state) => state.drawer)
  const dispatch = useAppDispatch()

  const [searchInput, setSearchInput] = useState('')
  const [selectedRequests, setSelectedRequests] = useState<RequestType[]>([])
  const [openModal, setOpenModal] = useState<'move_to_folder' | 'delete_items' | null>(null)
  const [shareSuccessOrFailMessage, setShareSuccessOrFailMessage] = useState<SimpleStatus>(null)
  const wrapperSetShareSuccessOrFailMessage = useCallback(
    (val: SimpleStatus) => {
      setShareSuccessOrFailMessage(val)
    },
    [setShareSuccessOrFailMessage]
  )

  const projectState = useAppSelector((state) => state.project)
  const requestState = useAppSelector((state) => state.request)
  const cohortState = useAppSelector((state) => state.cohort)
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)

  const { selectedProject } = projectState
  const { selectedRequest, selectedRequestShare, requestsList } = requestState
  const { selectedCohort } = cohortState

  const loading = projectState.loading || requestState.loading || cohortState.loading

  const _fetchProjectsList = async () => {
    dispatch(setSelectedProject(null))
    dispatch(fetchProjectsList())
  }

  const _fetchRequestsList = async () => {
    dispatch(setSelectedRequest(null))
    dispatch(fetchRequestsList())
  }

  const _fetchCohortsList = async () => {
    dispatch(
      fetchCohortsList({
        options: {
          limit: 100
        }
      })
    )
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
    dispatch(setSelectedProject(''))
  }

  return (
    <Grid
      container
      direction="column"
      className={cx(classes.appBar, {
        [classes.appBarShift]: openDrawer
      })}
    >
      <Grid container justifyContent="center" alignItems="center">
        <CssBaseline />
        <Grid container item xs={11}>
          <Grid item xs={12} margin="60px 0">
            <Typography
              id="cohortSaved-title"
              variant="h1"
              color="primary"
              padding="20px 0"
              borderBottom="1px solid #D0D7D8"
            >
              Mes requêtes
            </Typography>
          </Grid>

          <Grid container>
            <Grid container justifyContent="space-between" alignItems="center" margin="0px 0px 40px 0px">
              <Grid item xs={6}>
                {selectedRequests.length > 0 && (
                  <Grid container>
                    <Hidden only={['xs', 'sm', 'md']}>
                      <ButtonMui
                        startIcon={<DriveFileMoveIcon />}
                        onClick={() => setOpenModal('move_to_folder')}
                        disabled={maintenanceIsActive}
                      >
                        Déplacer {selectedRequests.length > 1 ? 'des requêtes' : 'une  requête'}
                      </ButtonMui>
                    </Hidden>
                    <Hidden only={['lg', 'xl']}>
                      <Tooltip title={`Déplacer ${selectedRequests.length > 1 ? 'des requêtes' : 'une  requête'}`}>
                        <IconButton
                          onClick={() => setOpenModal('move_to_folder')}
                          color="primary"
                          disabled={maintenanceIsActive}
                        >
                          <DriveFileMoveIcon />
                        </IconButton>
                      </Tooltip>
                    </Hidden>

                    <Hidden only={['xs', 'sm', 'md']}>
                      <ButtonMui
                        startIcon={<DeleteIcon />}
                        onClick={() => setOpenModal('delete_items')}
                        color="secondary"
                        disabled={maintenanceIsActive}
                      >
                        Supprimer {selectedRequests.length > 1 ? 'des requêtes' : 'une  requête'}
                      </ButtonMui>
                    </Hidden>
                    <Hidden only={['lg', 'xl']}>
                      <Tooltip title={`Supprimer ${selectedRequests.length > 1 ? 'des requêtes' : 'une  requête'}`}>
                        <IconButton
                          onClick={() => setOpenModal('delete_items')}
                          color="secondary"
                          disabled={maintenanceIsActive}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Hidden>
                  </Grid>
                )}
              </Grid>
              <Grid item xs={6} container justifyContent="flex-end" alignItems="center">
                <SearchInput
                  value={searchInput}
                  placeholder="Rechercher"
                  onChange={(newValue) => setSearchInput(newValue)}
                />

                <Hidden only={['xs', 'sm', 'md']}>
                  <Button
                    icon={<AddIcon />}
                    width="200px"
                    onClick={() => handleClickAddProject()}
                    disabled={maintenanceIsActive}
                  >
                    Ajouter un projet
                  </Button>
                </Hidden>

                <Hidden only={['lg', 'xl']}>
                  <Tooltip title={'Ajouter un projet'}>
                    <IconButton onClick={() => handleClickAddProject()} disabled={maintenanceIsActive}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Hidden>
              </Grid>
            </Grid>

            <Grid item margin={'0px 0px 10px 0px'}>
              <Typography>
                {selectedRequests.length > 0 &&
                  `${selectedRequests.length} selectionnée${selectedRequests.length === 1 ? '' : 's'} / ${
                    requestsList.length
                  } requête${requestsList.length === 1 ? '' : 's'}`}
              </Typography>
            </Grid>

            <Grid container>
              <ProjectTable
                loading={loading}
                searchInput={searchInput}
                selectedRequests={selectedRequests}
                setSelectedRequests={setSelectedRequests}
              />
            </Grid>

            <ModalAddOrEditProject
              open={selectedProject !== null}
              onClose={() => dispatch(setSelectedProject(null))}
              selectedProject={selectedProject}
            />

            {selectedRequest !== null && <ModalAddOrEditRequest onClose={() => dispatch(setSelectedRequest(null))} />}

            {selectedRequestShare !== null &&
              selectedRequestShare?.shared_query_snapshot !== undefined &&
              selectedRequestShare?.shared_query_snapshot?.length > 0 && (
                <ModalShareRequest
                  shareSuccessOrFailMessage={shareSuccessOrFailMessage}
                  parentStateSetter={wrapperSetShareSuccessOrFailMessage}
                  onClose={() => dispatch(setSelectedRequestShare(null))}
                />
              )}

            {selectedRequestShare !== null &&
              selectedRequestShare?.shared_query_snapshot !== undefined &&
              selectedRequestShare?.shared_query_snapshot?.length === 0 && (
                <Snackbar
                  open
                  onClose={() => dispatch(setSelectedRequestShare(null))}
                  autoHideDuration={5000}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                  <Alert severity="error" onClose={() => dispatch(setSelectedRequestShare(null))}>
                    Votre requête ne possède aucun critère. Elle ne peut donc pas être partagée.
                  </Alert>
                </Snackbar>
              )}

            {shareSuccessOrFailMessage === 'success' && (
              <Snackbar
                open
                onClose={() => setShareSuccessOrFailMessage(null)}
                autoHideDuration={5000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Alert severity="success" onClose={() => setShareSuccessOrFailMessage(null)}>
                  Votre requête a été partagée.
                </Alert>
              </Snackbar>
            )}

            {shareSuccessOrFailMessage === 'error' && (
              <Snackbar
                open
                onClose={() => setShareSuccessOrFailMessage(null)}
                autoHideDuration={5000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Alert severity="error" onClose={() => setShareSuccessOrFailMessage(null)}>
                  Une erreur est survenue, votre requête n'a pas pu être partagée.
                </Alert>
              </Snackbar>
            )}

            <ModalEditCohort open={selectedCohort !== null} onClose={() => dispatch(setSelectedCohort(null))} />

            <ModalMoveRequests
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
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default MyRequests
