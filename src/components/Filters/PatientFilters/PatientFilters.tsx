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
  TextField,
  Typography
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

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
  ageType: 'year' | 'month' | 'days'
  onChangeAgeType: (newAgeType: 'year' | 'month' | 'days') => void
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
  ageType,
  onChangeAgeType,
  vitalStatus,
  onChangeVitalStatus
}) => {
  const classes = useStyles()

  const [_gender, setGender] = useState<PatientGenderKind>(gender)
  const [_age, setAge] = useState<[number, number]>(age)
  const [_ageType, setAgeType] = useState<'year' | 'month' | 'days'>(ageType)
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
    onChangeAgeType(_ageType)
    onChangeVitalStatus(_vitalStatus)
    onSubmit()
  }

  const ageTypeList = [
    { id: 'year', label: 'années' },
    { id: 'month', label: 'mois' },
    { id: 'days', label: 'jours' }
  ]
  const currentAgeType = ageTypeList.find(({ id }) => id === _ageType)

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

          <Grid style={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', margin: '0 1em' }}>
            <Grid>
              <Slider
                value={age}
                onChange={_onChangeAge}
                aria-labelledby="range-slider"
                valueLabelDisplay="off"
                valueLabelFormat={(value) => (value === 130 ? '130+' : value)}
                min={0}
                max={130}
              />

              <Grid container justify="space-around">
                <Grid item>
                  <TextField
                    value={age[0]}
                    type="number"
                    onChange={(e) =>
                      setAge([+e.target.value >= 0 && +e.target.value <= 130 ? +e.target.value : age[0], age[1]])
                    }
                  />
                </Grid>
                <Grid item>
                  <TextField
                    value={age[1]}
                    type="number"
                    onChange={(e) =>
                      setAge([age[0], +e.target.value >= 0 && +e.target.value <= 130 ? +e.target.value : age[1]])
                    }
                  />
                </Grid>
              </Grid>
            </Grid>

            <Autocomplete
              id="criteria-ageType-autocomplete"
              className={classes.inputItem}
              options={ageTypeList}
              getOptionLabel={(option) => option.label}
              getOptionSelected={(option, value) => option.id === value.id}
              value={currentAgeType}
              onChange={(e, value) => setAgeType((value?.id ?? 'year') as 'year' | 'month' | 'days')}
              renderInput={(params) => <TextField {...params} variant="outlined" />}
            />
          </Grid>
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
