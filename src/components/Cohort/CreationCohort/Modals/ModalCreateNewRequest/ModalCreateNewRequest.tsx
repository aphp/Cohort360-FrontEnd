import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography
} from '@material-ui/core'

import RequestForm from './components/RequestForm'
import RequestList from './components/RequestList'

import { RequestType } from 'types'
import services from 'services'

import { useAppSelector } from 'state'
import { ProjectState, fetchProjects } from 'state/project'
import { RequestState, fetchRequests, addRequest, editRequest, deleteRequest } from 'state/request'
import { fetchRequestCohortCreation } from 'state/cohortCreation'

import useStyles from './styles'

const ERROR_TITLE = 'error_title'
const ERROR_PROJECT = 'error_project'
const ERROR_PROJECT_NAME = 'error_project_name'

const NEW_PROJECT_ID = 'new'

const ModalCreateNewRequest: React.FC<{
  onClose?: () => void
}> = ({ onClose }) => {
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useDispatch()
  const { projectState, requestState } = useAppSelector<{
    projectState: ProjectState
    requestState: RequestState
  }>((state) => ({
    projectState: state.project,
    requestState: state.request
  }))

  const { requestsList, selectedRequest } = requestState
  const { projectsList } = projectState

  const isEdition = selectedRequest ? selectedRequest.uuid : false

  const [tab, setTab] = useState<'form' | 'open'>('form')
  const [deletionConfirmation, setDeletionConfirmation] = useState(false)

  const [loading, setLoading] = useState(true)

  const [currentRequest, setCurrentRequest] = useState<RequestType | null>(selectedRequest)
  const [projectName, onChangeProjectName] = useState<string>('Projet de recherche')
  const [openRequest, setOpenRequest] = useState<string | null>(null)

  const [error, setError] = useState<'error_title' | 'error_project' | 'error_project_name' | null>(null)

  const _onChangeValue = (key: 'name' | 'parent_folder' | 'description', value: string) => {
    setCurrentRequest((prevState) =>
      prevState ? { ...prevState, [key]: value } : { uuid: '', name: '', [key]: value }
    )
  }

  const _fetchProject = async () => {
    let projectsList = []
    if (projectState && projectState.projectsList && projectState.projectsList.length > 0) {
      projectsList = projectState.projectsList
    } else {
      const myProjects = (await dispatch<any>(fetchProjects())) || []
      projectsList = myProjects.payload.results
    }
    // Auto select newset project folder
    // + Auto set the new project folder with 'Projet de recherche ...'
    if (projectsList && projectsList.length > 0) {
      if (!isEdition && !selectedRequest?.parent_folder) {
        _onChangeValue('parent_folder', projectsList[0].uuid)
      }
      onChangeProjectName(`Projet de recherche ${projectsList.length || ''}`)
    } else {
      _onChangeValue('parent_folder', NEW_PROJECT_ID)
      onChangeProjectName(`Projet de recherche par défaut`)
    }
  }

  const _fetchRequestNumber = async () => {
    if (isEdition) return

    if (requestState && requestState.requestsList && requestState.requestsList.length > 0) {
      _onChangeValue('name', `Nouvelle requête ${(requestState?.count || 0) + 1}`)
    } else {
      const requestResponse = await dispatch<any>(fetchRequests())
      if (!requestResponse) return
      _onChangeValue('name', `Nouvelle requête ${(requestResponse?.payload?.count || 0) + 1}`)
    }
  }

  useEffect(() => {
    const fetcher = async () => {
      setLoading(true)
      await _fetchRequestNumber()
      await _fetchProject()
      setLoading(false)
    }

    fetcher()
    return () => {
      onChangeProjectName('')
    }
  }, [])

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose()
    } else {
      history.push(`/accueil`)
    }
  }

  const handleConfirm = async () => {
    if (loading || currentRequest === null) return

    setLoading(true)
    if (!currentRequest.name || (currentRequest.name && currentRequest.name.length > 255)) {
      setLoading(false)
      return setError(ERROR_TITLE)
    }
    if (!currentRequest.parent_folder) {
      setLoading(false)
      return setError(ERROR_PROJECT)
    }
    if (!currentRequest.parent_folder && !projectName) {
      setLoading(false)
      return setError(ERROR_PROJECT_NAME)
    }

    if (currentRequest.parent_folder === NEW_PROJECT_ID) {
      // Create a project before
      const newProject = await services.projects.addProject({ uuid: '', name: projectName })
      if (newProject) {
        currentRequest.parent_folder = newProject.uuid
      }
      dispatch<any>(fetchProjects())
    }

    if (isEdition) {
      dispatch<any>(editRequest({ editedRequest: currentRequest }))
    } else {
      dispatch<any>(addRequest({ newRequest: currentRequest }))
    }
  }

  const handleConfirmOpen = () => {
    if (tab === 'open' && openRequest !== null) {
      dispatch<any>(fetchRequestCohortCreation({ requestId: openRequest }))
    }
  }

  const handleConfirmDeletion = () => {
    if (loading || !isEdition || !selectedRequest) return
    setLoading(true)

    dispatch<any>(deleteRequest({ deletedRequest: selectedRequest }))
  }

  return (
    <>
      <Dialog
        fullWidth
        onClose={() => onClose && typeof onClose === 'function' && onClose()}
        maxWidth="sm"
        open
        aria-labelledby="form-dialog-title"
      >
        {tab === 'form' ? (
          <DialogTitle className={classes.title}>{isEdition ? 'Modification' : 'Création'} d'une requête</DialogTitle>
        ) : (
          <DialogTitle className={classes.title}>Ouvrir une requête</DialogTitle>
        )}
        <DialogContent>
          {loading || currentRequest === null ? (
            <Grid container direction="column" justify="center" alignItems="center" className={classes.inputContainer}>
              <CircularProgress />
            </Grid>
          ) : tab === 'form' ? (
            <RequestForm
              currentRequest={currentRequest}
              onChangeValue={_onChangeValue}
              error={error}
              projectName={projectName}
              onChangeProjectName={onChangeProjectName}
              projectList={projectsList}
            />
          ) : (
            <RequestList
              projectList={projectsList}
              requestsList={requestsList}
              selectedItem={openRequest}
              onSelectedItem={(newOpenRequest: string) =>
                setOpenRequest(newOpenRequest === openRequest ? null : newOpenRequest)
              }
            />
          )}
        </DialogContent>

        <DialogActions>
          {isEdition ? (
            <Button disabled={loading} onClick={() => setDeletionConfirmation(true)} style={{ color: '#dc3545' }}>
              Supprimer
            </Button>
          ) : (
            <Button disabled={loading} onClick={() => setTab(tab === 'form' ? 'open' : 'form')}>
              {tab === 'form' ? 'Ouvrir' : 'Nouvelle requête'}
            </Button>
          )}

          <Grid style={{ flex: 1 }} />

          <Button disabled={loading} onClick={handleClose} color="secondary">
            Annuler
          </Button>
          {tab === 'form' ? (
            <Button disabled={loading} onClick={handleConfirm} color="primary">
              {isEdition ? 'Modifier' : 'Créer'}
            </Button>
          ) : (
            <Button disabled={loading || openRequest === null} onClick={handleConfirmOpen} color="primary">
              Ouvrir
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {isEdition && (
        <Dialog
          fullWidth
          maxWidth="xs"
          open={deletionConfirmation}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle className={classes.title}>Supprimer une requête</DialogTitle>

          <DialogContent>
            <Typography>Êtes-vous sur de vouloir supprimer cette requête ?</Typography>
          </DialogContent>

          <DialogActions>
            <Button disabled={loading} onClick={handleClose} color="primary">
              Annuler
            </Button>

            <Button disabled={loading} onClick={handleConfirmDeletion} style={{ color: '#dc3545' }}>
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default ModalCreateNewRequest
