import React, { useContext, useEffect, useMemo, useState } from 'react'

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

type FieldErrors = {
  nameTooLong: boolean
  noName: boolean
  percentageOutOfRange: boolean
  zeroPatient: boolean
}

type ErrorLabels = {
  name: string
  percentage: string
}

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

  const parsedPercentage = parseFloat(percentage)
  const parentPatientCount = parentCohort?.result_size ?? 0

  // Compute all field errors in one place
  const errors = useMemo<FieldErrors>(() => {
    const nameTooLong = !!(name && name.length > 255)
    const noName = !name?.trim()
    const percentageOutOfRange = isNaN(parsedPercentage) || parsedPercentage < 0.01 || parsedPercentage > 99.99
    const expectedPatientCount = Math.floor((parsedPercentage / 100) * parentPatientCount)
    const zeroPatient = !isNaN(parsedPercentage) && !percentageOutOfRange && expectedPatientCount === 0

    return { nameTooLong, noName, percentageOutOfRange, zeroPatient }
  }, [name, parsedPercentage, parentPatientCount])

  // Compute error labels for display
  const errorLabels = useMemo<ErrorLabels>(() => {
    let nameLabel = ''
    if (hasInteractedName && errors.noName) {
      nameLabel = 'Le nom doit comporter au moins un caractère.'
    } else if (errors.nameTooLong) {
      nameLabel = 'Le nom est trop long (255 caractères max.)'
    }

    let percentageLabel = ''
    if (hasInteractedPercentage) {
      if (errors.percentageOutOfRange) {
        percentageLabel = 'Le pourcentage doit être compris entre 0.01 et 99.99.'
      } else if (errors.zeroPatient) {
        percentageLabel = `Ce pourcentage donnerait 0 patient. La cohorte parente contient ${parentPatientCount} patient(s), veuillez augmenter le pourcentage.`
      }
    }

    return { name: nameLabel, percentage: percentageLabel }
  }, [errors, hasInteractedName, hasInteractedPercentage, parentPatientCount])

  const hasError = useMemo(
    () => errors.nameTooLong || errors.noName || errors.percentageOutOfRange || errors.zeroPatient,
    [errors]
  )

  const handleSubmit = () => {
    if (!name || hasError) {
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
        <Grid container sx={{ flexDirection: 'column', gap: 1 }}>
          <Grid>
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
              error={errors.nameTooLong || (errors.noName && hasInteractedName)}
              helperText={errorLabels.name}
            />
          </Grid>

          <Grid>
            <Typography variant="h3">Pourcentage du total à extraire (%) :</Typography>
            <TextField
              fullWidth
              style={{ margin: '16px 0 8px' }}
              value={percentage}
              onChange={handlePercentageChange}
              placeholder="Entrez une valeur entre 0.01 et 99.99%"
              error={hasInteractedPercentage && (errors.percentageOutOfRange || errors.zeroPatient)}
              helperText={errorLabels.percentage}
            />
          </Grid>

          <Grid>
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
      {parsedPercentage / 100 > cohortLimit && !errors.percentageOutOfRange && (
        <Alert severity="warning" style={{ alignItems: 'center' }}>
          Cette cohorte contenant plus de {cohortLimit} patients, sa création est plus complexe et nécessite d'être
          placée dans une file d'attente. Un mail vous sera envoyé quand celle-ci sera disponible.
        </Alert>
      )}

      <DialogActions style={{ position: 'relative' }}>
        <Button onClick={onClose} color="secondary">
          Annuler
        </Button>

        <Button onClick={handleSubmit} disabled={hasError}>
          Créer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateSample
