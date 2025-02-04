import React, { useEffect, useState } from 'react'

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material'

import { ProjectType } from 'types'
import useCreateProject from 'components/Exploration/hooks/useCreateProject'
import useEditProject from 'components/Exploration/hooks/useEditProject'

const AddOrEditProject: React.FC<{
  open: boolean
  selectedProject: ProjectType | null
  onClose: () => void
}> = ({ open, selectedProject, onClose }) => {
  const createProjectMutation = useCreateProject()
  const editProjectMutation = useEditProject()

  const [name, setName] = useState(selectedProject?.name)
  const [description, setDescription] = useState(selectedProject?.description)
  const [error, setError] = useState(false)

  const isEdition = selectedProject

  const handleSubmit = () => {
    if (!name || (name && name.length > 255)) {
      return setError(true)
    }

    const projectData: ProjectType | Omit<ProjectType, 'uuid'> = {
      ...(isEdition && { uuid: selectedProject.uuid }),
      name,
      description
    }
    if (isEdition) {
      editProjectMutation.mutate(projectData as ProjectType, { onSuccess: onClose })
    } else {
      createProjectMutation.mutate(projectData, { onSuccess: onClose })
    }
    // TODO: gérer les onError
  }

  useEffect(() => {
    if (open) {
      setName(selectedProject?.name ?? '')
      setDescription(selectedProject?.description ?? '')
      setError(false)
    }
  }, [open, selectedProject])

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle>{isEdition ? 'Modifier ' : 'Créer '} un projet de recherche</DialogTitle>

      <DialogContent>
        <Grid container direction="column">
          <Typography variant="h3">Nom du projet :</Typography>
          <TextField
            placeholder="Nom du projet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            id="title"
            margin="normal"
            fullWidth
            error={error}
            helperText={
              error
                ? name?.length === 0
                  ? 'Le nom du projet doit comporter au moins un caractère.'
                  : 'Le nom est trop long (255 caractères max.)'
                : ''
            }
          />

          <Typography variant="h3">Description du projet :</Typography>
          <TextField
            placeholder="Description du projet"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            id="description"
            margin="normal"
            fullWidth
            multiline
            minRows={5}
            maxRows={8}
          />
        </Grid>
      </DialogContent>

      <DialogActions style={{ position: 'relative' }}>
        <Button onClick={onClose} color="secondary">
          Annuler
        </Button>

        <Button onClick={handleSubmit} disabled={error}>
          {isEdition ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddOrEditProject
