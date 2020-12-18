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
  const [diagnosticTypes, setDiagnosticTypes] = useState<any[]>(selectedDiagnosticTypes)

  const _onChangeNda = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeNda(event.target.value)
  }

  const _onChangeCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeCode(event.target.value)
  }

  const _onChangeSelectedDiagnosticTypes = (event: React.ChangeEvent<{}>, value: any[]) => {
    onChangeSelectedDiagnosticTypes(value.map((value) => value.code))
  }

  useEffect(() => {
    fetchDiagnosticTypes().then((diagnosticTypes) => {
      setDiagnosticTypes(diagnosticTypes)
    })
  }, [])

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
              placeholder='Exemple: "6601289264,141740347"'
              value={nda}
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
            placeholder='Exemple: "G629,R2630,F310"'
            value={code}
            onChange={_onChangeCode}
          />
        </Grid>
        {showDiagnosticTypes && (
          <Grid container direction="column" className={classes.filter}>
            <Typography variant="h3">Type de diagnostics :</Typography>
            <Autocomplete
              multiple
              onChange={_onChangeSelectedDiagnosticTypes}
              options={diagnosticTypes}
              value={diagnosticTypes.filter((value) => selectedDiagnosticTypes.includes(value.code))}
              disableCloseOnSelect
              getOptionLabel={(diagnosticType: any) => capitalizeFirstLetter(diagnosticType.display)}
              renderOption={(diagnosticType: any) => (
                <React.Fragment>
                  {diagnosticType.code.toUpperCase()} - {capitalizeFirstLetter(diagnosticType.display)}
                </React.Fragment>
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
            value={startDate}
            onChange={(startDate: string) => onChangeStartDate(startDate)}
          />
          <InputDate label={'Avant le :'} value={endDate} onChange={(endDate: string) => onChangeEndDate(endDate)} />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Annuler
        </Button>
        <Button onClick={onSubmit} color="primary">
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PMSIFilters
