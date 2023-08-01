import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import 'moment/locale/fr'

import scopeType from 'data/scope_type.json'
import InfoIcon from '@mui/icons-material/Info'

import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'

import ClearIcon from '@mui/icons-material/Clear'

import services from 'services/aphp'

import { capitalizeFirstLetter } from 'utils/capitalize'

import { CriteriaName, CriteriaNameType, PMSIFilters, ScopeTreeRow } from 'types'

import useStyles from './styles'
import PopulationCard from 'components/CreationCohort/DiagramView/components/PopulationCard/PopulationCard'

type ModalPMSIFiltersProps = {
  open: boolean
  onClose: () => void
  deidentified: boolean
  showDiagnosticTypes: boolean
  filters: PMSIFilters
  setFilters: (filters: PMSIFilters) => void
  pmsiType: string
}

const mapToCriteriaName = (criteria: string): CriteriaNameType => {
  const mapping: { [key: string]: CriteriaNameType } = {
    diagnostic: CriteriaName.Cim10,
    ghm: CriteriaName.Ghm,
    ccam: CriteriaName.Ccam
  }
  if (criteria in mapping) return mapping[criteria]
  throw new Error(`Unknown criteria ${criteria}`)
}

const ModalPMSIFilters: React.FC<ModalPMSIFiltersProps> = ({
  open,
  onClose,
  deidentified,
  showDiagnosticTypes,
  filters,
  setFilters,
  pmsiType
}) => {
  const { classes } = useStyles()
  const label = 'Séléctionnez une unité exécutrice'

  const [_nda, setNda] = useState<string>(filters.nda)
  const [_code, setCode] = useState<string>(filters.code)
  const [_startDate, setStartDate] = useState<any>(filters.startDate)
  const [_endDate, setEndDate] = useState<any>(filters.endDate)
  const [_selectedDiagnosticTypes, setSelectedDiagnosticTypes] = useState<any[]>(filters.diagnosticTypes)
  const [dateError, setDateError] = useState(false)
  const [_executiveUnits, setExecutiveUnits] = useState<Array<ScopeTreeRow> | undefined>([])

  const [diagnosticTypesList, setDiagnosticTypesList] = useState<any[]>([])
  const criteriaName = mapToCriteriaName(pmsiType)

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
      diagnosticTypes: _selectedDiagnosticTypes,
      executiveUnits: _executiveUnits?.map((r) => r.id)
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
    setSelectedDiagnosticTypes(filters.diagnosticTypes)
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
      <DialogTitle>Filtrer par :</DialogTitle>
      <DialogContent className={classes.dialog}>
        {!deidentified && (
          <Grid container direction="column" className={classes.filter}>
            <Typography variant="h3">NDA :</Typography>
            <TextField
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
              renderOption={(props, diagnosticType: any) => (
                <li {...props}>{capitalizeFirstLetter(diagnosticType.label)}</li>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Types de diagnostics" placeholder="Sélectionner type(s) de diagnostics" />
              )}
              className={classes.autocomplete}
            />
          </Grid>
        )}

        <Grid container direction="column">
          <Typography variant="h3">Date :</Typography>
          <Grid container alignItems="center" className={classes.datePickers}>
            <FormLabel component="legend" className={classes.dateLabel}>
              Après le :
            </FormLabel>
            <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'fr'}>
              <DatePicker
                onChange={(date) => setStartDate(date ?? null)}
                value={_startDate}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    variant="standard"
                    error={dateError}
                    helperText={dateError && 'La date doit être au format "JJ/MM/AAAA"'}
                    style={{ width: 'calc(100% - 120px)' }}
                  />
                )}
              />
            </LocalizationProvider>
            {_startDate !== null && (
              <IconButton classes={{ root: classes.clearDate }} color="primary" onClick={() => setStartDate(null)}>
                <ClearIcon />
              </IconButton>
            )}
          </Grid>

          <Grid container alignItems="center" className={classes.datePickers}>
            <FormLabel component="legend" className={classes.dateLabel}>
              Avant le :
            </FormLabel>
            <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'fr'}>
              <DatePicker
                onChange={(date) => setEndDate(date ?? null)}
                value={_endDate}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    variant="standard"
                    error={dateError}
                    helperText={dateError && 'La date doit être au format "JJ/MM/AAAA"'}
                    style={{ width: 'calc(100% - 120px)' }}
                  />
                )}
              />
            </LocalizationProvider>
            {_endDate !== null && (
              <IconButton classes={{ root: classes.clearDate }} color="primary" onClick={() => setEndDate(null)}>
                <ClearIcon />
              </IconButton>
            )}
          </Grid>
          <FormLabel style={{ padding: '1em 1em 0 1em', display: 'flex', alignItems: 'center' }} component="legend">
            Unité exécutrice
            <Tooltip
              title={
                <>
                  {'- Le niveau hiérarchique de rattachement est : ' + scopeType?.criteriaType[criteriaName] + '.'}
                  <br />
                  {"- L'unité exécutrice" +
                    ' est la structure élémentaire de prise en charge des malades par une équipe soignante ou médico-technique identifiées par leurs fonctions et leur organisation.'}
                </>
              }
            >
              <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
            </Tooltip>
          </FormLabel>
          <Grid item container direction="row" alignItems="center">
            <PopulationCard
              form={criteriaName}
              label={label}
              title={label}
              executiveUnits={_executiveUnits}
              isAcceptEmptySelection={true}
              isDeleteIcon={true}
              onChangeExecutiveUnits={setExecutiveUnits}
            />
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
        <Button onClick={_onSubmit} disabled={dateError}>
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalPMSIFilters
