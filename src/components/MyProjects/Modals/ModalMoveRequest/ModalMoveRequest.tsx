import React, { useState, useEffect } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'

import Autocomplete from '@mui/lab/Autocomplete'

import { ProjectType, RequestType } from 'types'

import { useAppSelector, useAppDispatch } from 'state'
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
  const dispatch = useAppDispatch()

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
    await dispatch<any>(
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
              isOptionEqualToValue={(option, value) => option.uuid === value.uuid}
              value={currentFolder}
              onChange={(e, value) => onChangeCurrentFolder(value ? value : null)}
              renderInput={(params) => <TextField {...params} placeholder="Déplacer vers" />}
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
