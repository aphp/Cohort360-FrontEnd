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
  MenuItem,
  Select,
  TextField,
  Typography
} from '@material-ui/core'

import useStyles from './styles'

import { ProjectType, RequestType, addProject, fetchProjectsList, fetchRequestsList } from 'services/myProjects'

import { useAppSelector } from 'state'
import { ProjectState, fetchProjects } from 'state/project'
import { RequestState, addRequest, editRequest, deleteRequest } from 'state/request'

// import { createRequestCohortCreation as createRequest } from 'state/cohortCreation'

const ERROR_TITLE = 'error_title'
const ERROR_DESCRIPTION = 'error_description'
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

  const { selectedRequest } = requestState

  const isEdition = selectedRequest ? selectedRequest.uuid : false
  const selectedProjectId = selectedRequest?.parent_folder

  const [deletionConfirmation, setDeletionConfirmation] = useState(false)

  const [loading, setLoading] = useState(true)

  const [currentRequest, setCurrentRequest] = useState<RequestType | null>(selectedRequest)
  const [projectName, onChangeProjectName] = useState<string>('Projet de recherche')

  const [projectList, onSetProjectList] = useState<ProjectType[]>([])

  const [error, setError] =
    useState<'error_title' | 'error_description' | 'error_project' | 'error_project_name' | null>(null)

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
      const myProjects = (await fetchProjectsList()) || []
      projectsList = myProjects.results
    }
    onSetProjectList(projectsList)
    // Auto select newset project folder
    // + Auto set the new project folder with 'Projet de recherche ...'
    if (projectsList && projectsList.length > 0) {
      if (!isEdition && !selectedProjectId) {
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
    const requestResponse = await fetchRequestsList()
    if (!requestResponse) return
    _onChangeValue('name', `Nouvelle requête ${(requestResponse.count || 0) + 1}`)
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
    if (!currentRequest.name) {
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
      const newProject = await addProject({ uuid: '', name: projectName })
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
        <DialogTitle className={classes.title}>{isEdition ? 'Modification' : 'Création'} d'une requête</DialogTitle>
        <DialogContent>
          {loading || currentRequest === null ? (
            <Grid container direction="column" justify="center" alignItems="center" className={classes.inputContainer}>
              <CircularProgress />
            </Grid>
          ) : (
            <>
              <Grid container direction="column" className={classes.inputContainer}>
                <Typography variant="h3">Nom de la requête :</Typography>
                <TextField
                  placeholder="Nom de la requête"
                  value={currentRequest.name}
                  onChange={(e: any) => _onChangeValue('name', e.target.value)}
                  autoFocus
                  id="title"
                  margin="normal"
                  variant="outlined"
                  fullWidth
                  error={error === ERROR_TITLE}
                />
              </Grid>

              <Grid container direction="column" className={classes.inputContainer}>
                <Typography variant="h3">Projet :</Typography>

                <Select
                  id="criteria-occurrenceComparator-select"
                  value={currentRequest.parent_folder}
                  onChange={(event) => _onChangeValue('parent_folder', event.target.value as string)}
                  variant="outlined"
                  error={error === ERROR_PROJECT}
                  style={{ marginTop: 16, marginBottom: 8 }}
                >
                  {projectList.map((project, index) => (
                    <MenuItem key={index} value={project.uuid}>
                      {project.name}
                    </MenuItem>
                  ))}
                  <MenuItem value={NEW_PROJECT_ID}>Nouveau projet</MenuItem>
                </Select>

                {currentRequest.parent_folder === NEW_PROJECT_ID && (
                  <TextField
                    placeholder="Nom du nouveau projet"
                    value={projectName}
                    onChange={(e: any) => onChangeProjectName(e.target.value)}
                    id="project_name"
                    margin="normal"
                    variant="outlined"
                    fullWidth
                    error={error === ERROR_PROJECT_NAME}
                  />
                )}
              </Grid>

              <Grid container direction="column" className={classes.inputContainer}>
                <Typography variant="h3">Description :</Typography>
                <TextField
                  placeholder="Description"
                  value={currentRequest.description}
                  onChange={(e: any) => _onChangeValue('description', e.target.value)}
                  id="description"
                  margin="normal"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={5}
                  rowsMax={8}
                  error={error === ERROR_DESCRIPTION}
                />
              </Grid>
            </>
          )}
        </DialogContent>

        <DialogActions>
          {isEdition && (
            <Button disabled={loading} onClick={() => setDeletionConfirmation(true)} className={classes.deleteButton}>
              Supprimer
            </Button>
          )}

          <Button disabled={loading} onClick={handleClose} color="primary">
            Annuler
          </Button>
          <Button disabled={loading} onClick={handleConfirm} color="primary">
            {isEdition ? 'Modifier' : 'Créer'}
          </Button>
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
