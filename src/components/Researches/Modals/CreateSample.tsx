import React, { useContext, useEffect, useState } from 'react'

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography
} from '@mui/material'

import { Cohort } from 'types'
import { AppConfig } from 'config'
import { CreateSampleProps } from 'services/aphp/serviceCohortCreation'

const CreateSample: React.FC<{
  open: boolean
  parentCohort: Cohort
  onCreate: (data: CreateSampleProps) => void
  onClose: () => void
}> = ({ open, parentCohort, onCreate, onClose }) => {
  const appConfig = useContext(AppConfig)
  const cohortLimit = appConfig.features.cohort.shortCohortLimit

  const [name, setName] = useState('')
  const [percentage, setPercentage] = useState('')
  const [description, setDescription] = useState('')
  const [hasInteractedName, setHasInteractedName] = useState(false)
  const [hasInteractedPercentage, setHasInteractedPercentage] = useState(false)

  const nameTooLong = !!(name && name.length > 255)
  const noName = !name?.trim()
  const parsedPercentage = parseFloat(percentage)
  const percentageError = isNaN(parsedPercentage) || parsedPercentage < 0.01 || parsedPercentage > 99.99
  const error = nameTooLong || noName || percentageError

  const handleSubmit = () => {
    if (!name || error) {
      return
    }

    const sampleData = {
      parentCohort: parentCohort.uuid as string,
      cohortName: name,
      cohortDescription: description,
      samplingRatio: parsedPercentage / 100
    }
    onCreate(sampleData)
    onClose()
  }

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (/^\d*(\.\d{0,2})?$/.exec(newValue)) {
      setPercentage(newValue)
      if (!hasInteractedPercentage) setHasInteractedPercentage(true)
    }
  }

  useEffect(() => {
    if (open) {
      setName('')
      setDescription('')
      setPercentage('')
      setHasInteractedName(false)
      setHasInteractedPercentage(false)
    }
  }, [open, parentCohort])

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle>Échantillonnage de la cohorte</DialogTitle>

      <DialogContent>
        <Grid container direction="column" gap={1}>
          <Grid item>
            <Typography variant="h3">Nom :</Typography>
            <TextField
              placeholder="Nom"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!hasInteractedName) setHasInteractedName(true)
              }}
              autoFocus
              id="title"
              margin="normal"
              fullWidth
              error={nameTooLong || (noName && hasInteractedName)}
              helperText={
                nameTooLong || (noName && hasInteractedName)
                  ? noName && hasInteractedName
                    ? 'Le nom doit comporter au moins un caractère.'
                    : 'Le nom est trop long (255 caractères max.)'
                  : ''
              }
            />
          </Grid>

          <Grid item>
            <Typography variant="h3">Pourcentage du total à extraire (%) :</Typography>
            <TextField
              fullWidth
              style={{ margin: '16px 0 8px' }}
              value={percentage}
              onChange={handlePercentageChange}
              placeholder="Entrez une valeur entre 0.01 et 99.99%"
              error={hasInteractedPercentage && percentageError}
              helperText={
                percentageError && hasInteractedPercentage
                  ? 'Le pourcentage doit être compris entre 0.01 et 99.99.'
                  : ''
              }
            />
          </Grid>

          <Grid item>
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
        </Grid>
      </DialogContent>
      {parsedPercentage / 100 > cohortLimit && !percentageError && (
        <Alert severity="warning" style={{ alignItems: 'center' }}>
          Cette cohorte contenant plus de {cohortLimit} patients, sa création est plus complexe et nécessite d'être
          placée dans une file d'attente. Un mail vous sera envoyé quand celle-ci sera disponible.
        </Alert>
      )}

      <DialogActions style={{ position: 'relative' }}>
        <Button onClick={onClose} color="secondary">
          Annuler
        </Button>

        <Button onClick={handleSubmit} disabled={error}>
          Créer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateSample
