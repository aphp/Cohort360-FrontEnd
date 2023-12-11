import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography
} from '@mui/material'

import RequestForm from './components/RequestForm'
import RequestList from './components/RequestList'

import { RequestType } from 'types'
import services from 'services/aphp'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchProjects } from 'state/project'
import { fetchRequests, addRequest, editRequest, deleteRequest } from 'state/request'
import { fetchRequestCohortCreation } from 'state/cohortCreation'

const ERROR_TITLE = 'error_title'
const ERROR_PROJECT = 'error_project'
const ERROR_PROJECT_NAME = 'error_project_name'
const ERROR_REGEX = 'error_regex'

const BLANK_REGEX = /^\s*$/

const NEW_PROJECT_ID = 'new'

const ModalCreateNewRequest: React.FC<{
  onClose?: () => void
}> = ({ onClose }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const requestState = useAppSelector((state) => state.request)
  const _projectsList = useAppSelector((state) => state.project.projectsList)

  const { requestsList, selectedRequest } = requestState

  const isEdition = selectedRequest ? selectedRequest.uuid : false

  const [tab, setTab] = useState<'form' | 'open'>('form')
  const [deletionConfirmation, setDeletionConfirmation] = useState(false)

  const [loading, setLoading] = useState(true)

  const [currentRequest, setCurrentRequest] = useState<RequestType | null>(selectedRequest)
  const [projectName, onChangeProjectName] = useState<string>('Projet de recherche')
  const [openRequest, setOpenRequest] = useState<string | null>(null)

  const [error, setError] = useState<'error_title' | 'error_project' | 'error_project_name' | 'error_regex' | null>(
    null
  )

  const _onChangeValue = (key: 'name' | 'parent_folder' | 'description', value: string) => {
    setCurrentRequest((prevState) =>
      prevState ? { ...prevState, [key]: value } : { uuid: '', name: '', [key]: value }
    )
  }

  const _fetchProject = async () => {
    let projectsList = []
    if (_projectsList && _projectsList.length > 0) {
      projectsList = _projectsList
    } else {
      const myProjects = (await dispatch(fetchProjects()).unwrap()) || []
      projectsList = myProjects.projectsList
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

    if (requestState && requestState.requestsList) {
      _onChangeValue('name', `Nouvelle requête ${(requestState?.requestsList.length || 0) + 1}`)
    } else {
      const requestResponse = await dispatch(fetchRequests()).unwrap()
      if (!requestResponse) return
      _onChangeValue('name', `Nouvelle requête ${(requestResponse?.count || 0) + 1}`)
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
      navigate(`/home`)
    }
  }

  const handleConfirm = async () => {
    if (loading || currentRequest === null) return

    setLoading(true)
    if (!currentRequest.name || (currentRequest.name && currentRequest.name.length > 255)) {
      setLoading(false)
      return setError(ERROR_TITLE)
    }
    if (currentRequest.name && BLANK_REGEX.test(currentRequest.name)) {
      setLoading(false)
      return setError(ERROR_REGEX)
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
      dispatch(fetchProjects())
    }

    if (isEdition) {
      dispatch(editRequest({ editedRequest: currentRequest }))
    } else {
      dispatch(addRequest({ newRequest: currentRequest }))
    }
  }

  const handleConfirmOpen = () => {
    if (tab === 'open' && openRequest !== null) {
      dispatch(fetchRequestCohortCreation({ requestId: openRequest }))
    }
  }

  const handleConfirmDeletion = () => {
    if (loading || !isEdition || !selectedRequest) return
    setLoading(true)

    dispatch(deleteRequest({ deletedRequest: selectedRequest }))
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
          <DialogTitle>{isEdition ? 'Modification' : 'Création'} d'une requête</DialogTitle>
        ) : (
          <DialogTitle>Ouvrir une requête</DialogTitle>
        )}
        <DialogContent>
          {loading || currentRequest === null ? (
            <Grid container direction="column" justifyContent="center" alignItems="center" marginBottom={3}>
              <CircularProgress />
            </Grid>
          ) : tab === 'form' ? (
            <RequestForm
              currentRequest={currentRequest}
              onChangeValue={_onChangeValue}
              error={error}
              projectName={projectName}
              onChangeProjectName={onChangeProjectName}
              projectList={_projectsList}
            />
          ) : (
            <RequestList
              projectList={_projectsList}
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
            <Button variant="contained" disabled={loading} onClick={() => setTab(tab === 'form' ? 'open' : 'form')}>
              {tab === 'form' ? 'Ouvrir' : 'Nouvelle requête'}
            </Button>
          )}

          <Grid style={{ flex: 1 }} />

          <Button disabled={loading} onClick={handleClose} color="secondary">
            Annuler
          </Button>
          {tab === 'form' ? (
            <Button disabled={loading} onClick={handleConfirm}>
              {isEdition ? 'Modifier' : 'Créer'}
            </Button>
          ) : (
            <Button disabled={loading || openRequest === null} onClick={handleConfirmOpen}>
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
          <DialogTitle>Supprimer une requête</DialogTitle>

          <DialogContent>
            <Typography>Êtes-vous sûr(e) de vouloir supprimer cette requête ?</Typography>
          </DialogContent>

          <DialogActions>
            <Button disabled={loading} onClick={handleClose}>
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
