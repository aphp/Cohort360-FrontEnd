import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { KeyboardDatePicker } from '@material-ui/pickers'

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
} from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'

import ClearIcon from '@material-ui/icons/Clear'

import services from 'services'

import { capitalizeFirstLetter } from 'utils/capitalize'

import { PMSIFilters } from 'types'

import useStyles from './styles'

type ModalPMSIFiltersProps = {
  open: boolean
  onClose: () => void
  deidentified: boolean
  showDiagnosticTypes: boolean
  filters: PMSIFilters
  setFilters: (filters: PMSIFilters) => void
}
const ModalPMSIFilters: React.FC<ModalPMSIFiltersProps> = ({
  open,
  onClose,
  deidentified,
  showDiagnosticTypes,
  filters,
  setFilters
}) => {
  const classes = useStyles()

  const [_nda, setNda] = useState<string>(filters.nda)
  const [_code, setCode] = useState<string>(filters.code)
  const [_startDate, setStartDate] = useState<any>(filters.startDate)
  const [_endDate, setEndDate] = useState<any>(filters.endDate)
  const [_selectedDiagnosticTypes, setSelectedDiagnosticTypes] = useState<any[]>(filters.selectedDiagnosticTypes)
  const [dateError, setDateError] = useState(false)

  const [diagnosticTypesList, setDiagnosticTypesList] = useState<any[]>([])

  const _onChangeNda = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNda(event.target.value)
  }

  const _onChangeCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value)
  }

  const _onChangeSelectedDiagnosticTypes = (event: React.ChangeEvent<{}>, value: any[]) => {
    setSelectedDiagnosticTypes(value)
  }

  const _onSubmit = () => {
    const newStartDate = moment(_startDate).isValid() ? moment(_startDate).format('YYYY-MM-DD') : null
    const newEndDate = moment(_endDate).isValid() ? moment(_endDate).format('YYYY-MM-DD') : null

    setFilters({
      nda: _nda,
      code: _code,
      startDate: newStartDate,
      endDate: newEndDate,
      selectedDiagnosticTypes: _selectedDiagnosticTypes
    })
    onClose()
  }

  useEffect(() => {
    const _fetchDiagnosticTypes = async () => {
      const diagnosticTypes = await services.cohortCreation.fetchDiagnosticTypes()
      if (!diagnosticTypes) return
      setDiagnosticTypesList(diagnosticTypes)
    }
    _fetchDiagnosticTypes()
  }, [])

  useEffect(() => {
    setNda(filters.nda)
    setCode(filters.code)
    setStartDate(filters.startDate)
    setEndDate(filters.endDate)
    setSelectedDiagnosticTypes(filters.selectedDiagnosticTypes)
  }, [open]) // eslint-disable-line

  useEffect(() => {
    if (moment(_startDate).isAfter(_endDate)) {
      setDateError(true)
    } else {
      setDateError(false)
    }
  }, [_startDate, _endDate])

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.title}>Filtrer par :</DialogTitle>
      <DialogContent className={classes.dialog}>
        {!deidentified && (
          <Grid container direction="column" className={classes.filter}>
            <Typography variant="h3">NDA :</Typography>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              autoFocus
              placeholder="Exemple: 6601289264,141740347"
              value={_nda}
              onChange={_onChangeNda}
            />
          </Grid>
        )}
        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Code :</Typography>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            autoFocus
            placeholder="Exemple: G629,R2630,F310"
            value={_code}
            onChange={_onChangeCode}
          />
        </Grid>
        {showDiagnosticTypes && (
          <Grid container direction="column" className={classes.filter}>
            <Typography variant="h3">Type de diagnostics :</Typography>
            <Autocomplete
              multiple
              onChange={_onChangeSelectedDiagnosticTypes}
              options={diagnosticTypesList}
              value={_selectedDiagnosticTypes}
              disableCloseOnSelect
              getOptionLabel={(diagnosticType: any) => capitalizeFirstLetter(diagnosticType.label)}
              renderOption={(diagnosticType: any) => (
                <React.Fragment>{capitalizeFirstLetter(diagnosticType.label)}</React.Fragment>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Types de diagnostics"
                  placeholder="Sélectionner type(s) de diagnostics"
                />
              )}
              className={classes.autocomplete}
            />
          </Grid>
        )}

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

export default ModalPMSIFilters
