import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography
} from '@material-ui/core'

import { useAppSelector } from 'state'
import { ProjectState, addProject, editProject, deleteProject } from 'state/project'

import { ProjectType } from 'types'

import useStyles from './styles'

const ERROR_TITLE = 'error_title'

const ModalAddOrEditProject: React.FC<{
  open: boolean
  selectedProject: any
  onClose: () => void
}> = ({ open, onClose }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { projectState } = useAppSelector<{
    projectState: ProjectState
  }>((state) => ({
    projectState: state.project
  }))
  const { selectedProject } = projectState

  const isEdition = selectedProject !== null && selectedProject.uuid !== ''

  const [modalProjectState, onChangeProjectState] = useState<ProjectType>({
    uuid: '',
    name: 'Projet de recherche',
    description: ''
  })

  const [error, setError] = useState<'error_title' | 'error_description' | null>(null)
  const [loading, setLoading] = useState(false)
  const [deletionConfirmation, setDeletionConfirmation] = useState(false)

  useEffect(() => {
    if (selectedProject !== null) {
      onChangeProjectState(selectedProject)
    }
    setError(null)
    setLoading(false)
    setDeletionConfirmation(false)
  }, [open])

  const onChangeValue = (key: 'name' | 'description', value: string) => {
    const _project = { ...modalProjectState }
    _project[key] = value
    onChangeProjectState(_project)
  }

  const handleClose = () => onClose()

  const handleConfirm = () => {
    if (loading) return
    setLoading(true)

    if (!modalProjectState.name || (modalProjectState.name && modalProjectState.name.length > 255)) {
      setLoading(false)
      return setError(ERROR_TITLE)
    }

    if (!selectedProject) return
    if (isEdition) {
      dispatch<any>(editProject({ editedProject: modalProjectState }))
    } else {
      dispatch<any>(addProject({ newProject: modalProjectState }))
    }
  }

  const handleConfirmDeletion = () => {
    if (loading) return
    setLoading(true)

    if (isEdition && selectedProject !== null) {
      dispatch<any>(deleteProject({ deletedProject: selectedProject }))
    }
    onClose()
  }

  return (
    <>
      <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle className={classes.title}>{isEdition ? 'Modifier ' : 'Créer '} un projet de recherche</DialogTitle>

        <DialogContent>
          <Grid container direction="column" className={classes.inputContainer}>
            <Typography variant="h3">Nom du projet :</Typography>
            <TextField
              placeholder="Nom du projet"
              value={modalProjectState.name}
              onChange={(e: any) => onChangeValue('name', e.target.value)}
              autoFocus
              id="title"
              margin="normal"
              variant="outlined"
              fullWidth
              error={error === ERROR_TITLE}
              helperText={error === ERROR_TITLE ? 'Le nom est trop long (255 caractère max.)' : ''}
            />
          </Grid>

          {/* <Grid container direction="column" className={classes.inputContainer}>
            <Typography variant="h3">Description :</Typography>
            <TextField
              placeholder="Description"
              value={modalProjectState.description}
              onChange={(e: any) => onChangeValue('description', e.target.value)}
              id="description"
              margin="normal"
              variant="outlined"
              fullWidth
              multiline
              rows={5}
              rowsMax={8}
            />
          </Grid> */}
        </DialogContent>

        <DialogActions style={{ position: 'relative' }}>
          {isEdition && (
            <Button disabled={loading} onClick={() => setDeletionConfirmation(true)} className={classes.deleteButton}>
              Supprimer
            </Button>
          )}

          <Button disabled={loading} onClick={handleClose} color="secondary">
            Annuler
          </Button>

          <Button disabled={loading} onClick={handleConfirm} color="primary">
            {isEdition ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={deletionConfirmation}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle className={classes.title}>Supprimer un projet de recherche</DialogTitle>

        <DialogContent>
          <Typography>
            Êtes-vous sur de vouloir supprimer ce projet de recherche ? L'ensemble des requêtes liées à ce projet vont
            être supprimées également
          </Typography>
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
    </>
  )
}

export default ModalAddOrEditProject
