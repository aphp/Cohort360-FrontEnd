import React, { useState } from 'react'

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

const ModalCohortTitle: React.FC<{
  onExecute?: (cohortName: string, cohortDescription: string) => void
  onClose: () => void
}> = ({ onExecute, onClose }) => {
  const classes = useStyles()

  const [title, onChangeTitle] = useState('')
  const [description, onChangeDescription] = useState('')
  const [error, setError] = useState<'error_title' | 'error_description' | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClose = () => onClose()

  const handleConfirm = () => {
    setLoading(true)
    if (!title) {
      setLoading(false)
      return setError(ERROR_TITLE)
    }
    if (!description) {
      setLoading(false)
      return setError(ERROR_DESCRIPTION)
    }

    if (onExecute) {
      onExecute(title, description)
    }
  }

  return (
    <Dialog fullWidth maxWidth="sm" open onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle className={classes.title}>Création de la cohorte</DialogTitle>
      <DialogContent>
        <Grid container direction="column" className={classes.inputContainer}>
          <Typography variant="h3">Nom de la cohorte :</Typography>
          <TextField
            placeholder="Nom de la cohorte"
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

export default ModalCohortTitle
