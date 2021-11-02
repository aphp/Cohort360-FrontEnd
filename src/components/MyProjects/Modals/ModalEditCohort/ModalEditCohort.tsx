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
import { CohortState, addCohort, editCohort, deleteCohort } from 'state/cohort'

import { CohortType } from 'types'

import useStyles from './styles'

const ERROR_TITLE = 'error_title'
const ERROR_DESCRIPTION = 'error_description'

const ModalEditCohort: React.FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { cohortState } = useAppSelector<{
    cohortState: CohortState
  }>((state) => ({
    cohortState: state.cohort
  }))
  const { selectedCohort } = cohortState

  const isEdition = selectedCohort !== null && selectedCohort.uuid !== ''

  const [modalCohortState, onChangeCohortState] = useState<CohortType>({
    uuid: '',
    name: 'Cohort',
    description: ''
  })

  const [error, setError] = useState<'error_title' | 'error_description' | null>(null)
  const [loading, setLoading] = useState(false)
  const [deletionConfirmation, setDeletionConfirmation] = useState(false)

  useEffect(() => {
    if (selectedCohort !== null) {
      onChangeCohortState(selectedCohort)
    }
    setError(null)
    setLoading(false)
    setDeletionConfirmation(false)
  }, [open])

  const onChangeValue = (key: 'name' | 'description', value: string) => {
    const _cohort = { ...modalCohortState }
    _cohort[key] = value
    onChangeCohortState(_cohort)
  }

  const handleClose = () => onClose()

  const handleConfirm = () => {
    if (loading) return
    setLoading(true)

    if (!modalCohortState.name || (modalCohortState.name && modalCohortState.name.length > 255)) {
      setLoading(false)
      return setError(ERROR_TITLE)
    }

    if (!selectedCohort) return
    if (isEdition) {
      dispatch<any>(editCohort({ editedCohort: modalCohortState }))
    } else {
      dispatch<any>(addCohort({ newCohort: modalCohortState }))
    }
    onClose()
  }

  const handleConfirmDeletion = () => {
    if (loading) return
    setLoading(true)

    if (isEdition && selectedCohort !== null) {
      dispatch<any>(deleteCohort({ deletedCohort: selectedCohort }))
    }
    onClose()
  }

  return (
    <>
      <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle className={classes.title}>{isEdition ? 'Modifier ' : 'Créer '} une cohorte</DialogTitle>

        <DialogContent>
          <Grid container direction="column" className={classes.inputContainer}>
            <Typography variant="h3">Nom de la cohorte :</Typography>
            <TextField
              placeholder="Nom de la cohorte"
              value={modalCohortState.name}
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

          <Grid container direction="column" className={classes.inputContainer}>
            <Typography variant="h3">Description :</Typography>
            <TextField
              placeholder="Description"
              value={modalCohortState.description}
              onChange={(e: any) => onChangeValue('description', e.target.value)}
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
        <DialogTitle className={classes.title}>Supprimer une cohorte</DialogTitle>

        <DialogContent>
          <Typography>Êtes-vous sur de vouloir supprimer cette cohorte ?</Typography>
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

export default ModalEditCohort
