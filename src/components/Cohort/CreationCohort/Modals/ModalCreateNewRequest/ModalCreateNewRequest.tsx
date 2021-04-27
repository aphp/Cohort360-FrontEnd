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

import { fetchProjectsList, ProjectType, fetchRequestList } from 'services/myProjects'

import { createRequestCohortCreation as createRequest } from 'state/cohortCreation'

const ERROR_TITLE = 'error_title'
const ERROR_DESCRIPTION = 'error_description'
const ERROR_PROJECT = 'error_project'
const ERROR_PROJECT_NAME = 'error_project_name'

const NEW_PROJECT_ID = 'new'

const ModalCreateNewRequest: React.FC<{}> = () => {
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(true)

  const [title, onChangeTitle] = useState<string>('Nouvelle requête')
  const [description, onChangeDescription] = useState<string>('')
  const [projectId, onChangeProjectId] = useState<string>(NEW_PROJECT_ID)
  const [projectName, onChangeProjectName] = useState<string>('Nouveau projet de recherche')

  const [projectList, onSetProjectList] = useState<ProjectType[]>([])

  const [error, setError] = useState<
    'error_title' | 'error_description' | 'error_project' | 'error_project_name' | null
  >(null)

  const _fetchProject = async () => {
    const myProjects = (await fetchProjectsList()) || []
    onSetProjectList(myProjects)
    // Auto select newset project folder
    // + Auto set the new project folder with 'Nouveau projet de recherche ...'
    if (myProjects && myProjects.length >= 0) {
      onChangeProjectId(myProjects[myProjects.length - 1].uuid)
      onChangeProjectName(`Nouveau projet de recherche ${(myProjects.length || 0) + 1}`)
    }
  }

  const _fetchRequestNumber = async () => {
    const requestResponse = await fetchRequestList()
    if (!requestResponse) return
    onChangeTitle(`Nouvelle requête ${(requestResponse.count || 0) + 1}`)
  }

  useEffect(() => {
    const fetcher = async () => {
      setLoading(true)
      await _fetchProject()
      await _fetchRequestNumber()
      setLoading(false)
    }

    fetcher()
    return () => {
      onChangeTitle('')
      onChangeDescription('')
      onChangeProjectId('')
      onChangeProjectName('')
    }
  }, [])

  const handleClose = () => {
    history.push(`/accueil`)
  }

  const handleConfirm = () => {
    if (loading) return

    setLoading(true)
    if (!title) {
      setLoading(false)
      return setError(ERROR_TITLE)
    }
    if (!projectId) {
      setLoading(false)
      return setError(ERROR_PROJECT)
    }
    if (!projectId && !projectName) {
      setLoading(false)
      return setError(ERROR_PROJECT_NAME)
    }

    if (projectId === NEW_PROJECT_ID) {
      // Create a project before
    }

    dispatch<any>(
      createRequest({
        name: title,
        description: description,
        projectId
      })
    )
  }

  return (
    <Dialog fullWidth maxWidth="sm" open aria-labelledby="form-dialog-title">
      <DialogTitle className={classes.title}>Création d'une requête</DialogTitle>
      <DialogContent>
        {loading ? (
          <Grid container direction="column" justify="center" alignItems="center" className={classes.inputContainer}>
            <CircularProgress />
          </Grid>
        ) : (
          <>
            <Grid container direction="column" className={classes.inputContainer}>
              <Typography variant="h3">Nom de la requête :</Typography>
              <TextField
                placeholder="Nom de la requête"
                value={title}
                onChange={(e: any) => onChangeTitle(e.target.value)}
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
                value={projectId}
                onChange={(event) => onChangeProjectId(event.target.value as string)}
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

              {projectId === NEW_PROJECT_ID && (
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
                value={description}
                onChange={(e: any) => onChangeDescription(e.target.value)}
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
        <Button disabled={loading} onClick={handleClose} color="primary">
          Annuler
        </Button>
        <Button disabled={loading} onClick={handleConfirm} color="primary">
          Créer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalCreateNewRequest
