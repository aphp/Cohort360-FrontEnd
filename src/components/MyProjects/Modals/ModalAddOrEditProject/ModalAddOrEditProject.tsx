import React, { useState, useEffect } from 'react'

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

import useStyles from './styles'

const ERROR_TITLE = 'error_title'
const ERROR_DESCRIPTION = 'error_description'

const ModalAddOrEditProject: React.FC<{
  open: boolean
  selectedProject: any
  onClose: () => void
}> = ({ open, selectedProject, onClose }) => {
  const classes = useStyles()

  const [deletionConfirmation, setDeletionConfirmation] = useState(false)

  const [title, onChangeTitle] = useState('')
  const [description, onChangeDescription] = useState('')
  const [error, setError] = useState<'error_title' | 'error_description' | null>(null)
  const [loading, setLoading] = useState(false)

  const isEdition = selectedProject !== null

  useEffect(() => {
    if (isEdition) {
      onChangeTitle(selectedProject.name)
      onChangeDescription(selectedProject.description)
    } else {
      onChangeTitle('')
      onChangeDescription('')
    }
    setError(null)
    setLoading(false)
    setDeletionConfirmation(false)
  }, [open])

  const handleClose = () => onClose()

  const handleConfirm = () => {
    if (loading) return
    setLoading(true)

    if (!title) {
      setLoading(false)
      return setError(ERROR_TITLE)
    }

    onClose()
  }

  const handleConfirmDeletion = () => {
    if (loading) return
    setLoading(true)

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
        </DialogContent>

        <DialogActions style={{ position: 'relative' }}>
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
