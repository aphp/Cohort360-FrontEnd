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

import { fetchPrescriptionTypes, fetchAdministrations } from 'services/cohortCreation/fetchMedication'
import { capitalizeFirstLetter } from 'utils/capitalize'

import useStyles from './styles'

type MedicationFiltersProps = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  nda: string
  onChangeNda: (nda: string) => void
  startDate?: string | null
  onChangeStartDate: (startDate: string | null) => void
  endDate?: string | null
  onChangeEndDate: (endDate: string | null) => void
  deidentified: boolean
  selectedPrescriptionTypes: { id: string; label: string }[]
  onChangeSelectedPrescriptionTypes: (selectedPrescriptionTypes: { id: string; label: string }[]) => void
  showPrescriptionTypes: boolean
  selectedAdministrationRoutes: { id: string; label: string }[]
  onChangeSelectedAdministrationRoutes: (selectedAdministrationRoutes: { id: string; label: string }[]) => void
  showAdministrationRoutes: boolean
}
const MedicationFilters: React.FC<MedicationFiltersProps> = ({
  open,
  onClose,
  onSubmit,
  nda,
  onChangeNda,
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  deidentified,
  selectedPrescriptionTypes,
  onChangeSelectedPrescriptionTypes,
  showPrescriptionTypes,
  selectedAdministrationRoutes,
  onChangeSelectedAdministrationRoutes,
  showAdministrationRoutes
}) => {
  const classes = useStyles()

  const [_nda, setNda] = useState<string>(nda)
  const [_startDate, setStartDate] = useState<any>(startDate)
  const [_endDate, setEndDate] = useState<any>(endDate)
  const [_selectedPrescriptionTypes, setSelectedPrescriptionTypes] = useState<any[]>(selectedPrescriptionTypes)
  const [_selectedAdministrationRoutes, setSelectedAdministrationRoutes] = useState<any[]>(selectedAdministrationRoutes)
  const [dateError, setDateError] = useState(false)

  const [prescriptionTypesList, setPrescriptionTypesList] = useState<any[]>([])
  const [administrationRoutesList, setAdministrationRoutesList] = useState<any[]>([])

  const _onChangeNda = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNda(event.target.value)
  }

  const _onChangeSelectedPrescriptionTypes = (event: React.ChangeEvent<{}>, value: any[]) => {
    setSelectedPrescriptionTypes(value)
  }

  const _onChangeSelectedAdministrationRoutes = (event: React.ChangeEvent<{}>, value: any[]) => {
    setSelectedAdministrationRoutes(value)
  }

  const _onSubmit = () => {
    const newStartDate = moment(_startDate).isValid() ? moment(_startDate).format('YYYY-MM-DD') : null
    const newEndDate = moment(_endDate).isValid() ? moment(_endDate).format('YYYY-MM-DD') : null

    onChangeNda(_nda)
    onChangeStartDate(newStartDate)
    onChangeEndDate(newEndDate)
    onChangeSelectedPrescriptionTypes(_selectedPrescriptionTypes)
    onChangeSelectedAdministrationRoutes(_selectedAdministrationRoutes)
    onSubmit()
    onClose()
  }

  useEffect(() => {
    const _fetchPrescriptionTypes = async () => {
      const prescriptionTypes = await fetchPrescriptionTypes()
      if (!prescriptionTypes) return
      setPrescriptionTypesList(prescriptionTypes)
    }
    const _fetchAdministrationRoutes = async () => {
      const administrationRoutesList = await fetchAdministrations()
      if (!administrationRoutesList) return
      setAdministrationRoutesList(administrationRoutesList)
    }
    _fetchPrescriptionTypes()
    _fetchAdministrationRoutes()
  }, [])

  useEffect(() => {
    setNda(nda)
    setStartDate(startDate)
    setEndDate(endDate)
    setSelectedPrescriptionTypes(selectedPrescriptionTypes)
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

        {showAdministrationRoutes && (
          <Grid container direction="column" className={classes.filter}>
            <Typography variant="h3">Voie d'administration :</Typography>
            <Autocomplete
              multiple
              onChange={_onChangeSelectedAdministrationRoutes}
              options={administrationRoutesList}
              value={_selectedAdministrationRoutes}
              disableCloseOnSelect
              getOptionLabel={(administrationRoute: any) => capitalizeFirstLetter(administrationRoute.label)}
              renderOption={(administrationRoute: any) => (
                <React.Fragment>{capitalizeFirstLetter(administrationRoute.label)}</React.Fragment>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Voie d'administration"
                  placeholder="Sélectionner une ou plusieurs voie d'arministration"
                />
              )}
              className={classes.autocomplete}
            />
          </Grid>
        )}

        {showPrescriptionTypes && (
          <Grid container direction="column" className={classes.filter}>
            <Typography variant="h3">Type de prescriptions :</Typography>
            <Autocomplete
              multiple
              onChange={_onChangeSelectedPrescriptionTypes}
              options={prescriptionTypesList}
              value={_selectedPrescriptionTypes}
              disableCloseOnSelect
              getOptionLabel={(prescriptionType: any) => capitalizeFirstLetter(prescriptionType.label)}
              renderOption={(prescriptionType: any) => (
                <React.Fragment>{capitalizeFirstLetter(prescriptionType.label)}</React.Fragment>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Types de prescriptions"
                  placeholder="Sélectionner type(s) de prescriptions"
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
              onChange={(date) => setEndDate(date ?? null)}
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

export default MedicationFilters
