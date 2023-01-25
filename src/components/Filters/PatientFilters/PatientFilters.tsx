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

import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { PatientFilters as PatientFiltersType, VitalStatus } from 'types'

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
  const classes = useStyles()

  const [_gender, setGender] = useState<PatientGenderKind>(filters.gender)
  const [_birthdates, setBirthdates] = useState<[string, string]>(filters.birthdates)
  const [_vitalStatus, setVitalStatus] = useState<VitalStatus>(filters.vitalStatus)

  const [error, setError] = useState(false)

  useEffect(() => {
    setGender(filters.gender)
    setBirthdates(filters.birthdates)
    setVitalStatus(filters.vitalStatus)
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
      birthdates: _birthdates,
      vitalStatus: _vitalStatus
    })

    onSubmit()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.title}>Filtrer les patients :</DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Genre :</Typography>
          <RadioGroup name="Gender" value={_gender} onChange={_onChangeGender} row={true}>
            <FormControlLabel value={PatientGenderKind._male} control={<Radio />} label="Hommes" />
            <FormControlLabel value={PatientGenderKind._female} control={<Radio />} label="Femmes" />
            <FormControlLabel value={PatientGenderKind._other} control={<Radio />} label="Autres" />
            <FormControlLabel value={PatientGenderKind._unknown} control={<Radio />} label="Tous les genres" />
          </RadioGroup>
        </Grid>
        <Grid container direction="column" className={classes.filter}>
          <InputAgeRange
            error={error}
            setError={setError}
            birthdates={_birthdates}
            onChangeBirthdates={(newBirthdates: [string, string]) => setBirthdates(newBirthdates)}
          />
        </Grid>

        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Statut vital :</Typography>
          <RadioGroup name="VitalStatus" value={_vitalStatus} onChange={_onChangeVitalStatus} row={true}>
            <FormControlLabel value="alive" control={<Radio />} label="Patients vivants" />
            <FormControlLabel value="deceased" control={<Radio />} label="Patients décédés" />
            <FormControlLabel value="all" control={<Radio />} label="Tous les patients" />
          </RadioGroup>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Annuler
        </Button>
        <Button onClick={_onSubmit} color="primary" disabled={error}>
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PatientFilters
