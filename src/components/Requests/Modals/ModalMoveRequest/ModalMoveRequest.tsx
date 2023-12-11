import React, { useState, useEffect } from 'react'

import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'

import { ProjectType, RequestType } from 'types'

import { useAppSelector, useAppDispatch } from 'state'
import { moveRequests } from 'state/request'

interface IModalMoveRequestProps {
  open: boolean
  onClose: (onConfirm?: boolean) => void
  selectedRequests: RequestType[]
}

const ModalMoveRequest: React.FunctionComponent<IModalMoveRequestProps> = ({ open, onClose, selectedRequests }) => {
  const dispatch = useAppDispatch()

  const [currentFolder, onChangeCurrentFolder] = useState<ProjectType | null>(null)

  const projectsList = useAppSelector((state) => state.project.projectsList)

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
      <DialogTitle id="move-request-title">
        {selectedRequests.length === 1 ? 'Deplacer une requête' : 'Deplacer des requêtes'}
      </DialogTitle>
      <DialogContent id="move-request-description">
        <Autocomplete
          id="move-folder-autocomplete"
          options={projectsList}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.uuid === value.uuid}
          value={currentFolder}
          onChange={(e, value) => onChangeCurrentFolder(value ? value : null)}
          renderInput={(params) => <TextField {...params} placeholder="Déplacer vers" />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Annuler</Button>
        <Button onClick={_onConfirm}>Valider</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalMoveRequest
