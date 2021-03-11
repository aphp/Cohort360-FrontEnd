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
  Slider,
  Typography
} from '@material-ui/core'

import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { VitalStatus } from 'types'

import useStyles from './styles'
type PatientFiltersProps = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  gender: PatientGenderKind
  onChangeGender: (gender: PatientGenderKind) => void
  age: [number, number]
  onChangeAge: (newAge: [number, number]) => void
  vitalStatus: VitalStatus
  onChangeVitalStatus: (status: VitalStatus) => void
}

const PatientFilters: React.FC<PatientFiltersProps> = ({
  open,
  onClose,
  onSubmit,
  gender,
  onChangeGender,
  age,
  onChangeAge,
  vitalStatus,
  onChangeVitalStatus
}) => {
  const classes = useStyles()

  const [_gender, setGender] = useState<PatientGenderKind>(gender)
  const [_age, setAge] = useState<[number, number]>(age)
  const [_vitalStatus, setVitalStatus] = useState<VitalStatus>(vitalStatus)

  useEffect(() => {
    setGender(gender)
    setAge(age)
    setVitalStatus(vitalStatus)
  }, [open]) // eslint-disable-line

  const _onChangeGender = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setGender(value as PatientGenderKind)
  }

  const _onChangeAge = (event: React.ChangeEvent<{}>, value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setAge([value[0], value[1]])
    }
  }

  const _onChangeVitalStatus = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setVitalStatus(value as VitalStatus)
  }

  const _onSubmit = () => {
    onChangeGender(_gender)
    onChangeAge(_age)
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
          <Typography variant="h3">Âge :</Typography>
          <Slider
            value={_age}
            onChange={_onChangeAge}
            valueLabelDisplay="on"
            max={130}
            valueLabelFormat={(value) => (value === 130 ? '130+' : value)}
            className={classes.slider}
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
