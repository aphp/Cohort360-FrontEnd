import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { KeyboardDatePicker } from '@material-ui/pickers'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

import ClearIcon from '@material-ui/icons/Clear'

import { CohortFilters, ValueSet } from 'types'

import useStyles from './styles'

type CohortsFiltersProps = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  filters: CohortFilters
  onChangeFilters: (filters: CohortFilters) => void
}
const DocumentFilters: React.FC<CohortsFiltersProps> = ({ open, onClose, onSubmit, filters, onChangeFilters }) => {
  const classes = useStyles()

  const [_status, setStatus] = useState<ValueSet[]>(filters.status)
  const [_type, setType] = useState<string>(filters.type)
  const [_favorite, setFavorite] = useState<string>(filters.favorite)
  const [_minPatients, setMinPatients] = useState<null | string>(filters.minPatients)
  const [_maxPatients, setMaxPatients] = useState<null | string>(filters.maxPatients)
  const [_startDate, setStartDate] = useState<any>(filters.startDate)
  const [_endDate, setEndDate] = useState<any>(filters.endDate)
  const [nbPatientsError, setNbPatientsError] = useState(false)
  const [dateError, setDateError] = useState(false)

  const statusOptions = [
    {
      display: 'Terminé',
      code: 'finished'
    },
    {
      display: 'En attente',
      code: 'pending,started'
    },
    {
      display: 'Erreur',
      code: 'failed'
    }
  ]

  useEffect(() => {
    setStatus(filters.status)
    setType(filters.type)
    setFavorite(filters.favorite)
    setMinPatients(filters.minPatients)
    setMaxPatients(filters.maxPatients)
    setStartDate(filters.startDate)
    setEndDate(filters.endDate)
  }, [open]) //eslint-disable-line

  useEffect(() => {
    if (_minPatients && _maxPatients && parseInt(_minPatients, 10) > parseInt(_maxPatients, 10)) {
      setNbPatientsError(true)
    } else {
      setNbPatientsError(false)
    }
  }, [_minPatients, _maxPatients])

  useEffect(() => {
    if (moment(_startDate).isAfter(_endDate)) {
      setDateError(true)
    } else {
      setDateError(false)
    }
  }, [_startDate, _endDate])

  const _onChangeStatus = (
    event: React.ChangeEvent<{}>,
    value: {
      display: string
      code: string
    }[]
  ) => {
    if (value) setStatus(value)
  }

  const _onChangeType = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setType(value)
  }

  const _onChangeFavorite = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setFavorite(value)
  }

  const _onChangeMinPatients = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinPatients(event.target.value)
  }

  const _onChangeMaxPatients = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPatients(event.target.value)
  }

  const _onSubmit = () => {
    const newStartDate = moment(_startDate).isValid() ? moment(_startDate).format('YYYY-MM-DD') : null
    const newEndDate = moment(_endDate).isValid() ? moment(_endDate).format('YYYY-MM-DD') : null

    onChangeFilters({
      ...filters,
      status: _status,
      type: _type,
      favorite: _favorite,
      minPatients: _minPatients,
      maxPatients: _maxPatients,
      startDate: newStartDate,
      endDate: newEndDate
    })
    onSubmit()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.title}>Filtrer par :</DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Statut :</Typography>
          <Autocomplete
            multiple
            onChange={_onChangeStatus}
            options={statusOptions}
            value={_status}
            disableCloseOnSelect
            getOptionLabel={(status: any) => status.display}
            renderOption={(status: any) => <React.Fragment>{status.display}</React.Fragment>}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Statut de la cohorte" />}
            className={classes.autocomplete}
          />
        </Grid>

        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Type de cohortes :</Typography>
          <RadioGroup name="cohortType" value={_type} onChange={_onChangeType} row={true}>
            <FormControlLabel value="all" control={<Radio />} label="Toutes les cohortes" />
            <FormControlLabel value="MY_COHORTS" control={<Radio />} label="Cohort360" />
            <FormControlLabel value="IMPORT_I2B2" control={<Radio />} label="Cohortes I2B2" />
          </RadioGroup>
        </Grid>

        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Favoris :</Typography>
          <RadioGroup name="favorite" value={_favorite} onChange={_onChangeFavorite} row={true}>
            <FormControlLabel value="all" control={<Radio />} label="Toutes les cohortes" />
            <FormControlLabel value="True" control={<Radio />} label="Cohortes favorites" />
            <FormControlLabel value="False" control={<Radio />} label="Cohortes non favorites" />
          </RadioGroup>
        </Grid>

        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Nombre de patients :</Typography>
          <Grid container alignItems="baseline" className={classes.datePickers}>
            <FormLabel component="legend" className={classes.label}>
              Au moins :
            </FormLabel>
            <TextField
              type="number"
              value={_minPatients}
              onChange={_onChangeMinPatients}
              variant="outlined"
              inputProps={{ min: 0 }}
            />
            <FormLabel component="legend" className={classes.patientsLabel}>
              patients.
            </FormLabel>
          </Grid>

          <Grid container alignItems="baseline" className={classes.datePickers}>
            <FormLabel component="legend" className={classes.label}>
              Jusque :
            </FormLabel>
            <TextField
              type="number"
              value={_maxPatients}
              onChange={_onChangeMaxPatients}
              variant="outlined"
              inputProps={{ min: 0 }}
            />
            <FormLabel component="legend" className={classes.patientsLabel}>
              patients.
            </FormLabel>
          </Grid>
          {nbPatientsError && (
            <Typography className={classes.error}>
              Vous ne pouvez pas sélectionner de minimum de patients supérieur au nombre maximum.
            </Typography>
          )}
        </Grid>

        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Date :</Typography>
          <Grid container alignItems="baseline" className={classes.datePickers}>
            <FormLabel component="legend" className={classes.label}>
              Après le :
            </FormLabel>
            <KeyboardDatePicker
              clearable
              error={dateError}
              style={{ width: 'calc(100% - 120px)' }}
              invalidDateMessage='La date doit être au format "JJ/MM/AAAA"'
              format="DD/MM/YYYY"
              onChange={(date) => setStartDate(date ?? null)}
              value={_startDate}
            />
            {_startDate !== null && (
              <IconButton
                classes={{ root: classes.clearDate, label: classes.buttonLabel }}
                color="primary"
                onClick={() => setStartDate(null)}
              >
                <ClearIcon />
              </IconButton>
            )}
          </Grid>

          <Grid container alignItems="baseline" className={classes.datePickers}>
            <FormLabel component="legend" className={classes.label}>
              Avant le :
            </FormLabel>
            <KeyboardDatePicker
              clearable
              error={dateError}
              style={{ width: 'calc(100% - 120px)' }}
              invalidDateMessage='La date doit être au format "JJ/MM/AAAA"'
              format="DD/MM/YYYY"
              onChange={setEndDate}
              value={_endDate}
            />
            {_endDate !== null && (
              <IconButton
                classes={{ root: classes.clearDate, label: classes.buttonLabel }}
                color="primary"
                onClick={() => setEndDate(null)}
              >
                <ClearIcon />
              </IconButton>
            )}
          </Grid>
          {dateError && (
            <Typography className={classes.error}>
              Vous ne pouvez pas sélectionner de date de début supérieure à la date de fin.
            </Typography>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Annuler
        </Button>
        <Button onClick={_onSubmit} color="primary" disabled={nbPatientsError || dateError}>
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DocumentFilters
