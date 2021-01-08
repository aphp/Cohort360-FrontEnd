import React, { useEffect, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography
} from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'

import InputDate from 'components/Inputs/InputDate/InputDate'

import { fetchDiagnosticTypes } from '../../../services/cohortCreation/fetchCondition'
import { capitalizeFirstLetter } from '../../../utils/capitalize'

import useStyles from './styles'

type PMSIFiltersProps = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  nda: string
  onChangeNda: (nda: string) => void
  code: string
  onChangeCode: (code: string) => void
  startDate?: string
  onChangeStartDate: (startDate: string | undefined) => void
  endDate?: string
  onChangeEndDate: (endDate: string | undefined) => void
  deidentified: boolean
  selectedDiagnosticTypes: string[]
  onChangeSelectedDiagnosticTypes: (selectedDiagnosticTypes: string[]) => void
  showDiagnosticTypes: boolean
}
const PMSIFilters: React.FC<PMSIFiltersProps> = ({
  open,
  onClose,
  onSubmit,
  nda,
  onChangeNda,
  code,
  onChangeCode,
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  deidentified,
  selectedDiagnosticTypes,
  onChangeSelectedDiagnosticTypes,
  showDiagnosticTypes
}) => {
  const classes = useStyles()

  const [_nda, setNda] = useState<string>(nda)
  const [_code, setCode] = useState<string>(code)
  const [_startDate, setStartDate] = useState<string | undefined>(startDate)
  const [_endDate, setEndDate] = useState<string | undefined>(endDate)
  const [_selectedDiagnosticTypes, setSelectedDiagnosticTypes] = useState<any[]>(selectedDiagnosticTypes)

  const [diagnosticTypesList, setDiagnosticTypesList] = useState<any[]>([])

  const _onChangeNda = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNda(event.target.value)
  }

  const _onChangeCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value)
  }

  const _onChangeSelectedDiagnosticTypes = (event: React.ChangeEvent<{}>, value: any[]) => {
    setSelectedDiagnosticTypes(value.map((value) => value.id))
  }

  const _onSubmit = () => {
    onChangeNda(_nda)
    onChangeCode(_code)
    onChangeStartDate(_startDate)
    onChangeEndDate(_endDate)
    onChangeSelectedDiagnosticTypes(_selectedDiagnosticTypes)
    onSubmit()
  }

  useEffect(() => {
    fetchDiagnosticTypes().then((diagnosticTypes) => {
      setDiagnosticTypesList(diagnosticTypes)
    })
  }, [])

  useEffect(() => {
    setNda(nda)
    setCode(code)
    setStartDate(startDate)
    setEndDate(endDate)
    setSelectedDiagnosticTypes(selectedDiagnosticTypes)
  }, [open]) // eslint-disable-line

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.title}>Filtrer les documents par... :</DialogTitle>
      <DialogContent className={classes.dialog}>
        {!deidentified && (
          <Grid container direction="column" className={classes.filter}>
            <Typography variant="h3">NDA :</Typography>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label="NDA"
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
            label="Code"
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
              value={diagnosticTypesList.filter((value) => _selectedDiagnosticTypes.includes(value.id))}
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
          <InputDate
            label={'Après le :'}
            value={_startDate}
            onChange={(startDate: string) => setStartDate(startDate)}
          />
          <InputDate label={'Avant le :'} value={_endDate} onChange={(endDate: string) => setEndDate(endDate)} />
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

export default PMSIFilters
