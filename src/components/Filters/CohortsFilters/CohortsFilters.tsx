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

import useStyles from './styles'

type CohortsFiltersProps = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  filters: any // A CHANGER
  onChangeFilters: (filters: any) => void // A CHANGER - CREER UN TYPE
}
const DocumentFilters: React.FC<CohortsFiltersProps> = ({ open, onClose, onSubmit, filters, onChangeFilters }) => {
  const classes = useStyles()

  const [_status, setStatus] = useState<any[]>(filters.status)
  const [_type, setType] = useState(filters.type)
  const [_favorite, setFavorite] = useState(filters.favorite)
  const [_selectedPerimeters, setSelectedPerimeters] = useState<any[]>(filters.selectedPerimeters)
  const [_startDate, setStartDate] = useState<any>(filters.startDate)
  const [_endDate, setEndDate] = useState<any>(filters.endDate)
  const [dateError, setDateError] = useState(false)

  const statusOptions = [
    {
      label: 'Terminé',
      code: 'finished'
    },
    {
      label: 'En attente',
      code: 'pending,started'
    },
    {
      label: 'Erreur',
      code: 'failed'
    }
  ]

  useEffect(() => {
    setStatus(filters.status)
    setSelectedPerimeters(filters.selectedPerimeters)
    setStartDate(filters.startDate)
    setEndDate(filters.endDate)
  }, [open]) //eslint-disable-line

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
      label: string
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

  const _onSubmit = () => {
    const newStartDate = moment(_startDate).isValid() ? moment(_startDate).format('YYYY-MM-DD') : null
    const newEndDate = moment(_endDate).isValid() ? moment(_endDate).format('YYYY-MM-DD') : null

    onChangeFilters({
      ...filters,
      status: _status,
      type: _type,
      favorite: _favorite,
      selectedPerimeters: _selectedPerimeters,
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
            getOptionLabel={(status: any) => status.label}
            renderOption={(status: any) => <React.Fragment>{status.label}</React.Fragment>}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Statut de la cohorte" />}
            className={classes.autocomplete}
          />
        </Grid>

        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Type de cohortes :</Typography>
          <RadioGroup name="cohortType" value={_type} onChange={_onChangeType} row={true}>
            <FormControlLabel value="all" control={<Radio />} label="Toutes les cohortes" />
            <FormControlLabel value="MY_COHORTS" control={<Radio />} label="Cohortes Cohort360" />
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
          <Typography variant="h3">Date :</Typography>
          <Grid container alignItems="baseline" className={classes.datePickers}>
            <FormLabel component="legend" className={classes.dateLabel}>
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
            <FormLabel component="legend" className={classes.dateLabel}>
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
            <Typography className={classes.dateError}>
              Vous ne pouvez pas sélectionner de date de début supérieure à la date de fin.
            </Typography>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Annuler
        </Button>
        <Button onClick={_onSubmit} color="primary" disabled={dateError}>
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DocumentFilters
