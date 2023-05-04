import React, { useState, useEffect } from 'react'

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material'

import { useAppSelector, useAppDispatch } from 'state'
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
  const dispatch = useAppDispatch()
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
      dispatch(editProject({ editedProject: modalProjectState }))
    } else {
      dispatch(addProject({ newProject: modalProjectState }))
    }
  }

  const handleConfirmDeletion = () => {
    if (loading) return
    setLoading(true)

    if (isEdition && selectedProject !== null) {
      dispatch(deleteProject({ deletedProject: selectedProject }))
    }
    onClose()
  }

  return (
    <>
      <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle>{isEdition ? 'Modifier ' : 'Créer '} un projet de recherche</DialogTitle>

        <DialogContent>
          <Grid container direction="column">
            <Typography variant="h3">Nom du projet :</Typography>
            <TextField
              placeholder="Nom du projet"
              value={modalProjectState.name}
              onChange={(e: any) => onChangeValue('name', e.target.value)}
              autoFocus
              id="title"
              margin="normal"
              fullWidth
              error={error === ERROR_TITLE}
              helperText={
                error === ERROR_TITLE
                  ? modalProjectState.name.length === 0
                    ? 'Le nom du projet doit comporter au moins un caractère.'
                    : 'Le nom est trop long (255 caractères max.)'
                  : ''
              }
            />
          </Grid>
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

          <Button disabled={loading} onClick={handleConfirm}>
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
        <DialogTitle>Supprimer un projet de recherche</DialogTitle>

        <DialogContent>
          <Typography>
            Êtes-vous sûr(e) de vouloir supprimer ce projet de recherche ? L'ensemble des requêtes lié à ce projet va
            également être supprimé.
          </Typography>
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
    </>
  )
}

export default ModalAddOrEditProject
