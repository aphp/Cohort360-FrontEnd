import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { KeyboardDatePicker } from '@material-ui/pickers'

import {
  Button,
  Checkbox,
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
import Autocomplete from '@material-ui/lab/Autocomplete'

import ClearIcon from '@material-ui/icons/Clear'

import { docTypes } from 'assets/docTypes.json'

import useStyles from './styles'

type DocumentFiltersProps = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  nda: string
  onChangeNda: (nda: string) => void
  selectedDocTypes: string[]
  onChangeSelectedDocTypes: (selectedDocTypes: string[]) => void
  startDate?: string | null
  onChangeStartDate: (startDate: string | null) => void
  endDate?: string | null
  onChangeEndDate: (endDate: string | null) => void
  deidentified: boolean | null
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
  const [_selectedDocTypes, setSelectedDocTypes] = useState<any[]>(selectedDocTypes)
  const [_startDate, setStartDate] = useState<any>(startDate)
  const [_endDate, setEndDate] = useState<any>(endDate)
  const [dateError, setDateError] = useState(false)

  const docTypesList = docTypes

  useEffect(() => {
    setNda(nda)
    setSelectedDocTypes(selectedDocTypes)
    setStartDate(startDate)
    setEndDate(endDate)
  }, [open]) //eslint-disable-line

  useEffect(() => {
    if (moment(_startDate).isAfter(_endDate)) {
      setDateError(true)
    } else {
      setDateError(false)
    }
  }, [_startDate, _endDate])

  const _onChangeSelectedDocTypes = (
    event: React.ChangeEvent<{}>,
    value: {
      type: string
      label: string
      code: string
    }[]
  ) => {
    if (value) setSelectedDocTypes(value)
  }

  const _onChangeNda = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNda(event.target.value)
  }

  const _onSubmit = () => {
    const newStartDate = moment(_startDate).isValid() ? moment(_startDate).format('YYYY-MM-DD') : null
    const newEndDate = moment(_endDate).isValid() ? moment(_endDate).format('YYYY-MM-DD') : null

    onChangeSelectedDocTypes(_selectedDocTypes)
    onChangeNda(_nda)
    onChangeStartDate(newStartDate)
    onChangeEndDate(newEndDate)
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
            value={_selectedDocTypes}
            disableCloseOnSelect
            getOptionLabel={(docType: any) => docType.label}
            renderGroup={(docType: any) => {
              const currentDocTypeList = docTypesList
                ? docTypesList.filter((doc: any) => doc.type === docType.group)
                : []
              const currentSelectedDocTypeList = _selectedDocTypes
                ? _selectedDocTypes.filter((doc: any) => doc.type === docType.group)
                : []

              const onClick = () => {
                if (currentDocTypeList.length === currentSelectedDocTypeList.length) {
                  setSelectedDocTypes(_selectedDocTypes.filter((doc: any) => doc.type !== docType.group))
                } else {
                  setSelectedDocTypes(
                    [..._selectedDocTypes, ...currentDocTypeList].filter(
                      (item, index, array) => array.indexOf(item) === index
                    )
                  )
                }
              }

              return (
                <React.Fragment>
                  <Grid container direction="row" alignItems="center">
                    <Checkbox
                      indeterminate={
                        currentDocTypeList.length !== currentSelectedDocTypeList.length &&
                        currentSelectedDocTypeList.length > 0
                      }
                      color="primary"
                      checked={currentDocTypeList.length === currentSelectedDocTypeList.length}
                      onClick={onClick}
                    />
                    <Typography onClick={onClick} noWrap style={{ cursor: 'pointer', width: 'calc(100% - 150px' }}>
                      {docType.group}
                    </Typography>
                  </Grid>
                  {docType.children}
                </React.Fragment>
              )
            }}
            renderOption={(docType: any) => <React.Fragment>{docType.label}</React.Fragment>}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Types de documents" />}
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
