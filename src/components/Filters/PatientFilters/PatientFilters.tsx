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
} from '@material-ui/core'

import { InputAgeRange } from 'components/Inputs'

import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { VitalStatus } from 'types'

import useStyles from './styles'
type PatientFiltersProps = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  gender: PatientGenderKind
  onChangeGender: (gender: PatientGenderKind) => void
  birthdates: [string, string]
  onChangeBirthdates: (birthdates: [string, string]) => void
  vitalStatus: VitalStatus
  onChangeVitalStatus: (status: VitalStatus) => void
}

const PatientFilters: React.FC<PatientFiltersProps> = ({
  open,
  onClose,
  onSubmit,
  gender,
  onChangeGender,
  birthdates,
  onChangeBirthdates,
  vitalStatus,
  onChangeVitalStatus
}) => {
  const classes = useStyles()

  const [_gender, setGender] = useState<PatientGenderKind>(gender)
  const [_birthdates, setBirthdates] = useState<[string, string]>(birthdates)
  const [_vitalStatus, setVitalStatus] = useState<VitalStatus>(vitalStatus)

  useEffect(() => {
    setGender(gender)
    setBirthdates(birthdates)
    setVitalStatus(vitalStatus)
  }, [open]) // eslint-disable-line

  const _onChangeGender = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setGender(value as PatientGenderKind)
  }

  const _onChangeVitalStatus = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setVitalStatus(value as VitalStatus)
  }

  const _onSubmit = () => {
    onChangeGender(_gender)
    onChangeBirthdates(_birthdates)
    onChangeVitalStatus(_vitalStatus)
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
        <Button onClick={_onSubmit} color="primary">
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PatientFilters
