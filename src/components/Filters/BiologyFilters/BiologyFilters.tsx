import React, { useEffect, useState } from 'react'
import moment from 'moment'

import DatePicker from '@mui/lab/DatePicker'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  Grid,
  IconButton,
  TextField,
  Typography
} from '@mui/material'

import ClearIcon from '@mui/icons-material/Clear'

import useStyles from './styles'

type BiologyFiltersProps = {
  open: boolean
  onClose: () => void
  filters: any
  onChangeFilters: (filters: any) => void
  deidentified: boolean
}

const BiologyFilters: React.FC<BiologyFiltersProps> = ({ open, onClose, filters, onChangeFilters, deidentified }) => {
  const classes = useStyles()

  const [_filters, setFilters] = useState(filters)
  const [dateError, setDateError] = useState(false)

  const _onChangeValue = (key: 'nda' | 'loinc' | 'anabio' | 'startDate' | 'endDate', value: any) => {
    const _filtersCopy = { ..._filters }
    _filtersCopy[key] = value

    setFilters(_filtersCopy)
  }

  const _onSubmit = () => {
    const newStartDate = moment(_filters.startDate).isValid() ? moment(_filters.startDate).format('YYYY-MM-DD') : null
    const newEndDate = moment(_filters.endDate).isValid() ? moment(_filters.endDate).format('YYYY-MM-DD') : null

    onChangeFilters({ ..._filters, startDate: newStartDate, endDate: newEndDate })
    onClose()
  }

  useEffect(() => {
    setFilters(filters)
  }, [open])

  useEffect(() => {
    if (moment(_filters.startDate).isAfter(_filters.endDate)) {
      setDateError(true)
    } else {
      setDateError(false)
    }
  }, [_filters.startDate, _filters.endDate])

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.title}>Filtrer par :</DialogTitle>
      <DialogContent className={classes.dialog}>
        {!deidentified && (
          <Grid container direction="column" className={classes.filter}>
            <Typography variant="h3">NDA :</Typography>
            <TextField
              margin="normal"
              fullWidth
              autoFocus
              placeholder="Exemple: 6601289264,141740347"
              value={_filters.nda}
              onChange={(event) => _onChangeValue('nda', event.target.value)}
            />
          </Grid>
        )}

        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Code ANABIO :</Typography>
          <TextField
            margin="normal"
            fullWidth
            autoFocus
            placeholder="Exemple: A0260,E2068"
            value={_filters.anabio}
            onChange={(event) => _onChangeValue('anabio', event.target.value)}
          />
        </Grid>

        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Code LOINC :</Typography>
          <TextField
            margin="normal"
            fullWidth
            autoFocus
            placeholder="Exemple: 1925-7,46426-3"
            value={_filters.loinc}
            onChange={(event) => _onChangeValue('loinc', event.target.value)}
          />
        </Grid>

        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Date :</Typography>
          <Grid container alignItems="baseline" className={classes.datePickers}>
            <FormLabel component="legend" className={classes.dateLabel}>
              Après le :
            </FormLabel>
            {/* <DatePicker
              clearable
              error={dateError}
              style={{ width: 'calc(100% - 120px)' }}
              invalidDateMessage='La date doit être au format "JJ/MM/AAAA"'
              format="DD/MM/YYYY"
              onChange={(date) => _onChangeValue('startDate', date ?? null)}
              value={_filters.startDate}
            /> */}
            {_filters.startDate !== null && (
              <IconButton
                classes={{ root: classes.clearDate /*, label: classes.buttonLabel*/ }}
                color="primary"
                onClick={() => _onChangeValue('startDate', null)}
                size="large"
              >
                <ClearIcon />
              </IconButton>
            )}
          </Grid>

          <Grid container alignItems="baseline" className={classes.datePickers}>
            <FormLabel component="legend" className={classes.dateLabel}>
              Avant le :
            </FormLabel>
            {/* <DatePicker
              clearable
              error={dateError}
              style={{ width: 'calc(100% - 120px)' }}
              invalidDateMessage='La date doit être au format "JJ/MM/AAAA"'
              format="DD/MM/YYYY"
              onChange={(date) => _onChangeValue('endDate', date ?? null)}
              value={_filters.endDate}
            /> */}
            {_filters.endDate !== null && (
              <IconButton
                classes={{ root: classes.clearDate /*, label: classes.buttonLabel*/ }}
                color="primary"
                onClick={() => _onChangeValue('endDate', null)}
                size="large"
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
        <Button onClick={onClose}>Annuler</Button>
        <Button disabled={dateError} onClick={_onSubmit}>
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BiologyFilters
