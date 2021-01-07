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
import Autocomplete from '@material-ui/lab/Autocomplete'

import InputDate from 'components/Inputs/InputDate/InputDate'

import { docTypes } from '../../../assets/docTypes.json'

import useStyles from './styles'

type DocumentFiltersProps = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  nda: string
  onChangeNda: (nda: string) => void
  selectedDocTypes: string[]
  onChangeSelectedDocTypes: (selectedDocTypes: string[]) => void
  startDate?: string
  onChangeStartDate: (startDate: string | undefined) => void
  endDate?: string
  onChangeEndDate: (endDate: string | undefined) => void
  deidentified: boolean
}
const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  open,
  onClose,
  onSubmit,
  nda,
  onChangeNda,
  selectedDocTypes,
  onChangeSelectedDocTypes,
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  deidentified
}) => {
  const classes = useStyles()

  const [_nda, setNda] = useState<string>(nda)
  const [_selectedDocTypes, setSelectedDocTypes] = useState<string[]>(selectedDocTypes)
  const [_startDate, setStartDate] = useState<string | undefined>(startDate)
  const [_endDate, setEndDate] = useState<string | undefined>(endDate)

  const docTypesList = docTypes

  useEffect(() => {
    setNda(nda)
    setSelectedDocTypes(selectedDocTypes)
    setStartDate(startDate)
    setEndDate(endDate)
  }, [open]) //eslint-disable-line

  const _onChangeSelectedDocTypes = (
    event: React.ChangeEvent<{}>,
    value: {
      type: string
      label: string
      code: string
    }[]
  ) => {
    // if (value) onChangeSelectedDocTypes(value.map((value) => value.code))
    if (value) setSelectedDocTypes(value.map((value) => value.code))
  }

  const _onChangeNda = (event: React.ChangeEvent<HTMLInputElement>) => {
    // onChangeNda(event.target.value)
    setNda(event.target.value)
  }

  const _onSubmit = () => {
    onChangeSelectedDocTypes(_selectedDocTypes)
    onChangeNda(_nda)
    onChangeStartDate(_startDate)
    onChangeEndDate(_endDate)
    onSubmit()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.title}>Filtrer par :</DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Type de documents :</Typography>
          <Autocomplete
            multiple
            onChange={_onChangeSelectedDocTypes}
            groupBy={(doctype) => doctype.type}
            options={docTypesList}
            value={docTypesList.filter((value) => _selectedDocTypes.includes(value.code))}
            disableCloseOnSelect
            getOptionLabel={(docType: any) => docType.label}
            renderOption={(docType: any) => <React.Fragment>{docType.label}</React.Fragment>}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Types de documents" placeholder="Types de documents" />
            )}
            className={classes.autocomplete}
          />
        </Grid>
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
          <Typography variant="h3">Date :</Typography>
          <InputDate
            label={'Après le :'}
            value={_startDate}
            // onChange={(startDate: string) => onChangeStartDate(startDate)}
            onChange={(startDate: string) => setStartDate(startDate)}
          />
          <InputDate
            label={'Avant le :'}
            value={_endDate}
            // onChange={(endDate: string) => onChangeEndDate(endDate)}
            onChange={(endDate: string) => setEndDate(endDate)}
          />
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

export default DocumentFilters
