import React from 'react'

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

import { ProjectType } from 'types'
import useDeleteProject from 'components/Exploration/hooks/useDeleteProject'

const ConfirmDeletion: React.FC<{
  open: boolean
  selectedProject: ProjectType | null
  onClose: () => void
}> = ({ open, selectedProject, onClose }) => {
  const deleteProjectMutation = useDeleteProject()

  const handleSubmit = () => {
    deleteProjectMutation.mutate(selectedProject as ProjectType, { onSuccess: onClose })
    // TODO: gérer onError
  }

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>Supprimer un projet de recherche</DialogTitle>

      <DialogContent style={{ paddingBottom: 4 }}>
        <Typography>
          Êtes-vous sûr(e) de vouloir supprimer ce projet? Sa suppression entraînera également celle des requêtes,
          cohortes et échantillons sous-jacents.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSubmit} style={{ color: '#dc3545' }}>
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDeletion
