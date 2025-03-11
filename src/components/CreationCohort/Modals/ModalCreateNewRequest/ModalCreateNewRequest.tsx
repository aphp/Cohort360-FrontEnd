import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material'

import RequestForm from './components/RequestForm'
import RequestList from './components/RequestList'

import { RequestType } from 'types'
import services from 'services/aphp'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchProjects, setSelectedProject } from 'state/project'
import { fetchRequests, addRequest } from 'state/request'
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
  const url = window.location.href?.includes('/cohort/new')
  const requestState = useAppSelector((state) => state.request)
  const { projectsList, selectedProject } = useAppSelector((state) => state.project)

  const { requestsList, selectedRequest } = requestState

  const [tab, setTab] = useState<'form' | 'open'>('form')
  const [loading, setLoading] = useState(true)

  const [currentRequest, setCurrentRequest] = useState<RequestType | null>(selectedRequest)
  const [projectName, setProjectName] = useState<string>('Projet de recherche')
  const [openRequest, setOpenRequest] = useState<string | null>(null)

  const [error, setError] = useState<'error_title' | 'error_project' | 'error_project_name' | 'error_regex' | null>(
    null
  )

  const _onChangeValue = (key: 'name' | 'parent_folder' | 'description', value: string | { uuid: string }) => {
    setCurrentRequest((prevState) =>
      prevState ? { ...prevState, [key]: value } : { uuid: '', name: '', [key]: value }
    )
  }

  const _fetchProject = async () => {
    let _projectsList = []
    if (projectsList && projectsList.length > 0) {
      _projectsList = projectsList
    } else {
      const myProjects = (await dispatch(fetchProjects()).unwrap()) || []
      _projectsList = myProjects.projectsList
    }
    // Auto select newset project folder
    // + Auto set the new project folder with 'Projet de recherche ...'
    if (_projectsList && _projectsList.length > 0) {
      if (selectedProject) {
        _onChangeValue('parent_folder', selectedProject)
      } else if (!selectedRequest?.parent_folder) {
        _onChangeValue('parent_folder', { uuid: _projectsList[0].uuid })
      }
      setProjectName(`Projet de recherche ${_projectsList.length || ''}`)
    } else {
      _onChangeValue('parent_folder', NEW_PROJECT_ID)
      setProjectName(`Projet de recherche par défaut`)
    }
  }

  const _fetchRequestNumber = async () => {
    if (requestState?.requestsList) {
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
      setProjectName('')
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

    if (currentRequest.parent_folder.uuid === NEW_PROJECT_ID) {
      // Create a project before
      const newProject = await services.projects.addProject({ name: projectName })
      if (newProject) {
        currentRequest.parent_folder.uuid = newProject.uuid
      }
      dispatch(fetchProjects())
    }

    dispatch(addRequest({ newRequest: currentRequest }))
    dispatch(setSelectedProject(null))
  }

  const handleConfirmOpen = () => {
    if (tab === 'open' && openRequest !== null) {
      dispatch(fetchRequestCohortCreation({ requestId: openRequest }))
    }
  }

  return (
    <Dialog
      fullWidth
      onClose={() => onClose && typeof onClose === 'function' && onClose()}
      maxWidth="sm"
      open
      aria-labelledby="form-dialog-title"
    >
      {tab === 'form' ? (
        <DialogTitle>Création d'une requête</DialogTitle>
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
            onChangeProjectName={setProjectName}
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
        {url ? (
          <Button variant="contained" disabled={loading} onClick={() => setTab(tab === 'form' ? 'open' : 'form')}>
            {tab === 'form' ? 'Ouvrir' : 'Nouvelle requête'}
          </Button>
        ) : (
          <></>
        )}

        <Grid style={{ flex: 1 }} />

        <Button disabled={loading} onClick={handleClose} color="secondary">
          Annuler
        </Button>
        {tab === 'form' ? (
          <Button disabled={loading} onClick={handleConfirm}>
            Créer
          </Button>
        ) : (
          <Button disabled={loading || openRequest === null} onClick={handleConfirmOpen}>
            Ouvrir
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ModalCreateNewRequest
