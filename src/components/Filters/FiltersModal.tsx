import React, { useState } from 'react'

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid,
  Typography
} from '@mui/material'

import { GenderStatus, PatientsFilters, VitalStatus } from 'types'

import useStyles from './styles'
import { InputAgeRange } from '../Inputs'

type FiltersModalProps = {
  onClose: () => void
  onSubmit: () => void
  filters: PatientsFilters
  onChange: (newFilters: PatientsFilters) => void
}

const FiltersModal = ({ onClose, onSubmit, filters, onChange }: FiltersModalProps) => {
  const { classes } = useStyles()

  const [birthdatesRanges, setBirthdatesRanges] = useState<PatientsFilters['birthdatesRanges'] | undefined>(
    filters.birthdatesRanges
  )
  const [gender, setGender] = useState<GenderStatus[] | undefined>(filters.gender)
  const [vitalStatus, setVitalStatus] = useState<VitalStatus[] | undefined>(filters.vitalStatus)

  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const checkIfChecked = <T,>(value: T, arr: T[]): boolean => {
    return arr.includes(value)
  }

  const onChangeGender = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as GenderStatus
    if (gender) {
      if (gender.includes(value)) {
        setGender([...gender.filter((elem) => elem !== value)])
      } else {
        setGender([...gender, value])
      }
    }
  }

  const onChangeVitalStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as VitalStatus
    if (vitalStatus) {
      if (vitalStatus.includes(value)) {
        setVitalStatus([...vitalStatus.filter((elem) => elem !== value)])
      } else {
        setVitalStatus([...vitalStatus, value])
      }
    }
  }

  const _onSubmit = () => {
    onChange({
      gender: gender,
      birthdatesRanges: birthdatesRanges,
      vitalStatus: vitalStatus
    })

    onSubmit()
  }

  const _onError = (isError: boolean, errorMessage = '') => {
    setError(isError)
    setErrorMessage(errorMessage)
  }

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Filtrer les patients :</DialogTitle>
      <DialogContent className={classes.dialog}>
        {gender && (
          <Grid container direction="column" className={classes.filter}>
            <Typography variant="h3">Genre :</Typography>
            <FormGroup onChange={onChangeGender} row={true}>
              <FormControlLabel
                checked={checkIfChecked(GenderStatus.MALE, gender)}
                value={GenderStatus.MALE}
                control={<Checkbox color="secondary" />}
                label="Hommes"
              />
              <FormControlLabel
                checked={checkIfChecked(GenderStatus.FEMALE, gender)}
                value={GenderStatus.FEMALE}
                control={<Checkbox color="secondary" />}
                label="Femmes"
              />
              <FormControlLabel
                checked={checkIfChecked(`${GenderStatus.OTHER},${GenderStatus.UNKNOWN}`, gender)}
                value={`${GenderStatus.OTHER},${GenderStatus.UNKNOWN}`}
                control={<Checkbox color="secondary" />}
                label="Autres"
              />
            </FormGroup>
          </Grid>
        )}
        {birthdatesRanges && (
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
        )}

        {vitalStatus && (
          <Grid container direction="column">
            <Typography variant="h3">Statut vital :</Typography>
            <FormGroup onChange={onChangeVitalStatus} row={true}>
              <FormControlLabel
                checked={checkIfChecked(VitalStatus.ALIVE, vitalStatus)}
                value={VitalStatus.ALIVE}
                control={<Checkbox color="secondary" />}
                label="Patients vivants"
              />
              <FormControlLabel
                checked={checkIfChecked(VitalStatus.DECEASED, vitalStatus)}
                value={VitalStatus.DECEASED}
                control={<Checkbox color="secondary" />}
                label="Patients décédés"
              />
            </FormGroup>
          </Grid>
        )}
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

export default FiltersModal
