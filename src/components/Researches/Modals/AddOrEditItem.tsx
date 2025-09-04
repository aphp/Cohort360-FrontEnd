import React, { useEffect, useState } from 'react'

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material'

import { Cohort, ProjectType, RequestType } from 'types'

const AddOrEditItem: React.FC<{
  open: boolean
  selectedItem: ProjectType | RequestType | Cohort | null
  onCreate?: (data: Omit<ProjectType | RequestType | Cohort, 'uuid'>) => void
  onUpdate: (data: ProjectType | RequestType | Cohort) => void
  titleCreate?: string
  titleEdit: string
  onClose: () => void
}> = ({ open, selectedItem, onCreate, onUpdate, titleCreate, titleEdit, onClose }) => {
  const [name, setName] = useState(selectedItem?.name)
  const [description, setDescription] = useState(selectedItem?.description)
  const [hasInteracted, setHasInteracted] = useState(false)

  const isEdition = selectedItem
  const nameTooLong = !!(name && name.length > 255)
  const noName = !name?.trim()
  const error = nameTooLong || noName

  const handleSubmit = () => {
    if (!name || error) {
      return
    }

    const itemData: ProjectType | Omit<ProjectType, 'uuid'> = {
      ...(isEdition && { uuid: selectedItem.uuid }),
      name,
      description
    }
    if (isEdition) {
      onUpdate(itemData)
    } else {
      if (onCreate) {
        onCreate(itemData)
      }
    }

    onClose()
  }

  useEffect(() => {
    if (open) {
      setName(selectedItem?.name ?? '')
      setDescription(selectedItem?.description ?? '')
      setHasInteracted(false)
    }
  }, [open, selectedItem])

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle>{isEdition ? titleEdit : titleCreate}</DialogTitle>

      <DialogContent>
        <Grid container direction="column">
          <Typography variant="h3">Nom :</Typography>
          <TextField
            placeholder="Nom"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (!hasInteracted) setHasInteracted(true)
            }}
            autoFocus
            id="title"
            margin="normal"
            fullWidth
            error={nameTooLong || (noName && hasInteracted)}
            helperText={
              nameTooLong || (noName && hasInteracted)
                ? noName && hasInteracted
                  ? 'Le nom doit comporter au moins un caractère.'
                  : 'Le nom est trop long (255 caractères max.)'
                : ''
            }
          />

          <Typography variant="h3">Description :</Typography>
          <TextField
            placeholder="Description"
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

export default AddOrEditItem
