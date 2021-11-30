import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'

import Autocomplete from '@material-ui/lab/Autocomplete'

import { ProjectType, RequestType } from 'types'

import { useAppSelector } from 'state'
import { ProjectState } from 'state/project'
import { moveRequests } from 'state/request'

import useStyles from './styles'

interface IModalMoveRequestProps {
  open: boolean
  onClose: (onConfirm?: boolean) => void
  selectedRequests: RequestType[]
}

const ModalMoveRequest: React.FunctionComponent<IModalMoveRequestProps> = ({ open, onClose, selectedRequests }) => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const [currentFolder, onChangeCurrentFolder] = useState<ProjectType | null>(null)

  const { projectState } = useAppSelector<{
    projectState: ProjectState
  }>((state) => ({
    projectState: state.project
  }))
  const { projectsList } = projectState

  useEffect(() => {
    onChangeCurrentFolder(null)
    return () => {
      onChangeCurrentFolder(null)
    }
  }, [open])

  const _onConfirm = async () => {
    await dispatch(
      moveRequests({
        selectedRequests,
        parent_folder: currentFolder !== null ? currentFolder.uuid : undefined
      })
    )

    onClose(true)
  }

  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      aria-labelledby="move-request-title"
      aria-describedby="move-request-description"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="move-request-title" className={classes.title}>
        {selectedRequests.length === 1 ? 'Deplacer une requête' : 'Deplacer des requêtes'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="move-request-description">
          <Grid container direction="column" className={classes.inputContainer}>
            <Autocomplete
              id="move-folder-autocomplete"
              options={projectsList}
              getOptionLabel={(option) => option.name}
              getOptionSelected={(option, value) => option.uuid === value.uuid}
              value={currentFolder}
              onChange={(e, value) => onChangeCurrentFolder(value ? value : null)}
              renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Déplacer vers" />}
            />
          </Grid>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Annuler</Button>
        <Button onClick={_onConfirm}>Valider</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalMoveRequest
