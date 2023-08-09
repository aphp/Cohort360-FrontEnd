import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import 'moment/locale/fr'

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
  Tooltip,
  Typography
} from '@mui/material'

import ClearIcon from '@mui/icons-material/Clear'
import InfoIcon from '@mui/icons-material/Info'

import scopeType from 'data/scope_type.json'

import useStyles from './styles'
import { CriteriaName, ObservationFilters, ScopeTreeRow } from 'types'
import PopulationCard from 'components/CreationCohort/DiagramView/components/PopulationCard/PopulationCard'

type BiologyFiltersProps = {
  open: boolean
  onClose: () => void
  filters: ObservationFilters
  onChangeFilters: (filters: ObservationFilters) => void
  deidentified: boolean
}

const BiologyFilters: React.FC<BiologyFiltersProps> = ({ open, onClose, filters, onChangeFilters, deidentified }) => {
  const { classes } = useStyles()
  const label = 'Séléctionnez une unité exécutrice'

  const [_nda, setNda] = useState<string>(filters.nda)
  const [_startDate, setStartDate] = useState<any>(filters.startDate)
  const [_endDate, setEndDate] = useState<any>(filters.endDate)
  const [_loinc, setLoinc] = useState<any>(filters.loinc)
  const [_anabio, setAnabio] = useState<any>(filters.anabio)

  const [dateError, setDateError] = useState(false)
  const [_executiveUnits, setExecutiveUnits] = useState<Array<ScopeTreeRow> | undefined>([])

  const _onChangeNda = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNda(event.target.value)
  }

  const _onChangeLoinc = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoinc(event.target.value)
  }

  const _onChangeAnabio = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnabio(event.target.value)
  }

  const _onSubmit = () => {
    const newStartDate = moment(_startDate).isValid() ? moment(_startDate).format('YYYY-MM-DD') : null
    const newEndDate = moment(_endDate).isValid() ? moment(_endDate).format('YYYY-MM-DD') : null

    onChangeFilters({
      nda: _nda,
      loinc: _loinc,
      startDate: newStartDate,
      endDate: newEndDate,
      anabio: _anabio,
      executiveUnits: _executiveUnits ?? []
    })
    onClose()
  }

  useEffect(() => {
    setExecutiveUnits(filters.executiveUnits)
  }, [filters.executiveUnits])

  useEffect(() => {
    onChangeFilters(filters)
  }, [open])

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
          <Typography variant="h3">Code ANABIO :</Typography>
          <TextField
            margin="normal"
            fullWidth
            autoFocus
            placeholder="Exemple: A0260,E2068"
            value={_anabio}
            onChange={_onChangeAnabio}
          />
        </Grid>

        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Code LOINC :</Typography>
          <TextField
            margin="normal"
            fullWidth
            autoFocus
            placeholder="Exemple: 1925-7,46426-3"
            value={_loinc}
            onChange={_onChangeLoinc}
          />
        </Grid>

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
                  {'- Le niveau hiérarchique de rattachement est : ' +
                    scopeType?.criteriaType[CriteriaName.Biology] +
                    '.'}
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
              form={CriteriaName.Biology}
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
        <Button disabled={dateError} onClick={_onSubmit}>
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BiologyFilters
