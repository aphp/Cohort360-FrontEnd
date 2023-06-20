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

import useStyles from './styles'
import { InputAgeRange } from '../../Inputs'
import { PatientsFilters, GenderStatus, VitalStatus } from 'types/searchCriterias'

type PatientFiltersProps = {
  onClose: () => void
  onSubmit: () => void
  filters: PatientsFilters
  onChangeFilters: (newFilters: PatientsFilters) => void
}

const PatientFilters: React.FC<PatientFiltersProps> = ({ onClose, onSubmit, filters, onChangeFilters }) => {
  const { classes } = useStyles()

  const [birthdatesRanges, setBirthdatesRanges] = useState<[string, string]>(filters.birthdatesRanges)
  const [gender, setGender] = useState<GenderStatus[]>(filters.genders)
  const [vitalStatus, setVitalStatus] = useState<VitalStatus[]>(filters.vitalStatuses)

  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const checkIfChecked = <T,>(value: T, arr: T[]): boolean => {
    return arr.includes(value)
  }

  const onChangeGender = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as GenderStatus
    if (gender.includes(value)) {
      setGender([...gender.filter((elem) => elem !== value)])
    } else {
      setGender([...gender, value])
    }
  }

  const onChangeVitalStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as VitalStatus
    if (vitalStatus.includes(value)) {
      setVitalStatus([...vitalStatus.filter((elem) => elem !== value)])
    } else {
      setVitalStatus([...vitalStatus, value])
    }
  }

  const _onSubmit = () => {
    onChangeFilters({
      genders: gender,
      birthdatesRanges: birthdatesRanges,
      vitalStatuses: vitalStatus
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
              checked={checkIfChecked(GenderStatus.OTHER_UNKNOWN, gender)}
              value={GenderStatus.OTHER_UNKNOWN}
              control={<Checkbox color="secondary" />}
              label="Autres"
            />
          </FormGroup>
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
