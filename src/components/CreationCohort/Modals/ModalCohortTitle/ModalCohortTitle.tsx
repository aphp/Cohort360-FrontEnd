import React, { useState } from 'react'

import {
  Button,
  Dialog,
  FormControlLabel,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  Alert
} from '@mui/material'

import useStyles from './styles'

const ERROR_TITLE = 'error_title'
const ERROR_DESCRIPTION = 'error_description'

const ModalCohortTitle: React.FC<{
  onExecute?: (cohortName: string, cohortDescription: string, globalCount: boolean) => void
  onClose: () => void
  longCohort: boolean
  cohortLimit: number
}> = ({ onExecute, onClose, longCohort, cohortLimit }) => {
  const classes = useStyles()

  const [title, onChangeTitle] = useState('')
  const [description, onChangeDescription] = useState('')
  const [globalCount, onCheckGlobalCount] = useState(false)
  const [error, setError] = useState<'error_title' | 'error_description' | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClose = () => onClose()

  const handleConfirm = () => {
    setLoading(true)
    if (!title || (title && title.length > 255)) {
      setLoading(false)
      return setError(ERROR_TITLE)
    }

    if (onExecute) {
      onExecute(title, description, globalCount)
    }
  }

  return (
    <Dialog fullWidth maxWidth="sm" open onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle>Création de la cohorte</DialogTitle>
      <DialogContent style={{ overflowY: 'unset' }}>
        <Grid container direction="column" className={classes.inputContainer}>
          <Typography variant="h3">Nom de la cohorte :</Typography>
          <TextField
            placeholder="Nom de la cohorte"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            autoFocus
            id="title"
            margin="normal"
            fullWidth
            error={error === ERROR_TITLE}
            helperText={
              error === ERROR_TITLE
                ? title.length === 0
                  ? 'Le nom de la cohorte doit comporter au moins un caractère.'
                  : 'Le nom est trop long (255 caractères max.)'
                : ''
            }
          />
        </Grid>

        <Grid container direction="column" className={classes.inputContainer}>
          <Typography variant="h3">Description :</Typography>
          <TextField
            placeholder="Description"
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            id="description"
            margin="normal"
            fullWidth
            multiline
            minRows={5}
            maxRows={8}
            error={error === ERROR_DESCRIPTION}
          />
        </Grid>

        <Grid container direction="column">
          <FormControlLabel
            labelPlacement="start"
            control={
              <Checkbox
                checked={globalCount}
                onChange={(event) => onCheckGlobalCount(event.target.checked)}
                color="secondary"
              />
            }
            label={
              <Typography variant="h3">
                Estimer le nombre de patients répondant à vos critères sur le périmètre de l'APHP
              </Typography>
            }
          />
        </Grid>
      </DialogContent>

      {longCohort && (
        <Alert severity="warning" style={{ alignItems: 'center' }}>
          Cette cohorte contenant plus de {cohortLimit} patients, sa création est plus complexe et nécessite d'être
          placée dans une file d'attente. Un mail vous sera envoyé quand celle-ci sera disponible.
        </Alert>
      )}

      <DialogActions>
        <Button disabled={loading} onClick={handleClose} color="secondary">
          Annuler
        </Button>
        <Button disabled={loading} onClick={handleConfirm}>
          Créer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalCohortTitle
