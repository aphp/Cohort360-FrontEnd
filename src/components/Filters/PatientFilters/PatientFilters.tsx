import React, { useEffect, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material'

import { PatientFilters as PatientFiltersType, PatientGenderKind, VitalStatus } from 'types'

import useStyles from './styles'
import { InputAgeRange } from '../../Inputs'

type PatientFiltersProps = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  filters: PatientFiltersType
  onChangeFilters: (newFilters: PatientFiltersType) => void
}

const PatientFilters: React.FC<PatientFiltersProps> = ({ open, onClose, onSubmit, filters, onChangeFilters }) => {
  const { classes } = useStyles()

  const [_gender, setGender] = useState<PatientGenderKind>(filters.gender)
  const [birthdatesRanges, setBirthdatesRanges] = useState<[string, string]>(filters.birthdatesRanges)
  const [_vitalStatus, setVitalStatus] = useState<VitalStatus>(filters.vitalStatus)

  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setGender(filters.gender)
    setBirthdatesRanges(filters.birthdatesRanges)
    setVitalStatus(filters.vitalStatus)
    _onError(false)
  }, [open]) // eslint-disable-line

  const _onChangeGender = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setGender(value as PatientGenderKind)
  }

  const _onChangeVitalStatus = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setVitalStatus(value as VitalStatus)
  }

  const _onSubmit = () => {
    onChangeFilters({
      gender: _gender,
      birthdatesRanges: birthdatesRanges,
      vitalStatus: _vitalStatus
    })

    onSubmit()
  }

  const _onError = (isError: boolean, errorMessage = '') => {
    setError(isError)
    setErrorMessage(errorMessage)
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Filtrer les patients :</DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Genre :</Typography>
          <RadioGroup name="Gender" value={_gender} onChange={_onChangeGender} row={true}>
            <FormControlLabel value={PatientGenderKind._male} control={<Radio color="secondary" />} label="Hommes" />
            <FormControlLabel value={PatientGenderKind._female} control={<Radio color="secondary" />} label="Femmes" />
            <FormControlLabel value={PatientGenderKind._other} control={<Radio color="secondary" />} label="Autres" />
            <FormControlLabel
              value={PatientGenderKind._unknown}
              control={<Radio color="secondary" />}
              label="Tous les genres"
            />
          </RadioGroup>
        </Grid>
        <Grid container direction="column" className={classes.filter}>
          <InputAgeRange
            error={{ isError: error, errorMessage: errorMessage }}
            onError={_onError}
            birthdatesRanges={birthdatesRanges}
            onChangeBirthdatesRanges={(newBirthdatesRanges: [string, string]) =>
              setBirthdatesRanges(newBirthdatesRanges)
            }
          />
        </Grid>

        <Grid container direction="column">
          <Typography variant="h3">Statut vital :</Typography>
          <RadioGroup name="VitalStatus" value={_vitalStatus} onChange={_onChangeVitalStatus} row={true}>
            <FormControlLabel value="alive" control={<Radio color="secondary" />} label="Patients vivants" />
            <FormControlLabel value="deceased" control={<Radio color="secondary" />} label="Patients décédés" />
            <FormControlLabel value="all" control={<Radio color="secondary" />} label="Tous les patients" />
          </RadioGroup>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={_onSubmit} disabled={error}>
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PatientFilters
