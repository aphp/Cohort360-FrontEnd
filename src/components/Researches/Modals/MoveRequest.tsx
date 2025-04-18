import React, { useState } from 'react'

import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material'

import { ProjectType, RequestType } from 'types'

import useProjects from 'hooks/researches/useProjects'
import useMoveRequest from 'hooks/researches/useMoveRequest'

type MoveRequestProps = {
  open: boolean
  onClose: () => void
  selectedRequests: RequestType[]
}

const MoveRequest = ({ open, onClose, selectedRequests }: MoveRequestProps) => {
  const [selectedFolder, setSelectedFolder] = useState<ProjectType | null>(null)
  const { projectsList, loading } = useProjects({ paramsReady: true })
  const moveRequestMutation = useMoveRequest()

  const _onConfirm = async () => {
    moveRequestMutation.mutate({ selectedRequests, parent: selectedFolder as ProjectType })
    onClose()
  }

  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="sm">
      <DialogTitle id="move-request-title">
        {selectedRequests.length === 1 ? 'Déplacer une requête' : 'Déplacer des requêtes'}
      </DialogTitle>
      <DialogContent id="move-request-description">
        {loading ? (
          <CircularProgress />
        ) : (
          <Autocomplete
            id="move-folder-autocomplete"
            options={projectsList}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.uuid === value.uuid}
            value={selectedFolder}
            onChange={(e, value) => setSelectedFolder(value)}
            renderInput={(params) => <TextField {...params} placeholder="Déplacer vers" />}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Annuler</Button>
        <Button onClick={_onConfirm} disabled={!selectedFolder}>
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MoveRequest
