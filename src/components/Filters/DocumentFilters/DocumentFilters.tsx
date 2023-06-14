import React, { useEffect, useState } from 'react'
import moment from 'moment'

import 'moment/locale/fr'

import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  Grid,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'

import InfoIcon from '@mui/icons-material/Info'

import scopeType from 'data/scope_type.json'
import docTypes from 'assets/docTypes.json'
import { CriteriaName, DocumentFilters, ScopeTreeRow } from 'types'

import useStyles from './styles'
import PopulationCard from 'components/CreationCohort/DiagramView/components/PopulationCard/PopulationCard'
import InputCalendar from 'components/Inputs/InputCalendar/InputCalendar'

type DocumentFiltersProps = {
  open: boolean
  onClose: () => void
  showIpp?: boolean
  filters: DocumentFilters
  onChangeFilters: (newFilters: DocumentFilters) => void
  deidentified: boolean | null
}
const ModalDocumentFilters: React.FC<DocumentFiltersProps> = ({
  open,
  onClose,
  filters,
  onChangeFilters,
  showIpp,
  deidentified
}) => {
  const label = 'Séléctionnez une unité exécutrice'
  const { classes } = useStyles()

  const [_nda, setNda] = useState<string>(filters.nda)
  const [_ipp, setIpp] = useState<string>(filters.ipp ?? '')
  const [_selectedDocTypes, setSelectedDocTypes] = useState<any[]>(filters.selectedDocTypes)
  const [_startDate, setStartDate] = useState<any>(filters.startDate)
  const [_endDate, setEndDate] = useState<any>(filters.endDate)
  const [_executiveUnits, setExecutiveUnits] = useState<Array<ScopeTreeRow> | undefined>([])
  const [dateError, setDateError] = useState(false)

  const docTypesList = docTypes

  useEffect(() => {
    setNda(filters.nda)
    showIpp && setIpp(filters.ipp ?? '')
    setSelectedDocTypes(filters.selectedDocTypes)
    setStartDate(filters.startDate)
    setEndDate(filters.endDate)
  }, [open]) //eslint-disable-line

  useEffect(() => {
    setExecutiveUnits(filters.executiveUnits)
  }, [filters.executiveUnits, open])

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

  const _onSubmit = () => {
    const newStartDate = moment(_startDate).isValid() ? moment(_startDate).format('YYYY-MM-DD') : null
    const newEndDate = moment(_endDate).isValid() ? moment(_endDate).format('YYYY-MM-DD') : null

    onChangeFilters({
      ...filters,
      nda: _nda,
      ipp: _ipp,
      selectedDocTypes: _selectedDocTypes,
      startDate: newStartDate,
      endDate: newEndDate,
      executiveUnits: _executiveUnits ?? []
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Filtrer par :</DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Type de documents :</Typography>
          <Autocomplete
            multiple
            onChange={_onChangeSelectedDocTypes}
            groupBy={(doctype) => doctype.type}
            options={docTypesList.docTypes}
            value={_selectedDocTypes}
            disableCloseOnSelect
            getOptionLabel={(docType: any) => docType.label}
            renderGroup={(docType: any) => {
              const currentDocTypeList = docTypesList
                ? docTypesList.docTypes.filter((doc: any) => doc.type === docType.group)
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
            renderOption={(props, docType: any) => <li {...props}>{docType.label}</li>}
            renderInput={(params) => <TextField {...params} placeholder="Types de documents" />}
            className={classes.autocomplete}
          />
        </Grid>
        {!deidentified && (
          <Grid container direction="column" className={classes.filter}>
            <Typography variant="h3">NDA :</Typography>
            <TextField
              margin="normal"
              fullWidth
              label="NDA"
              placeholder="Exemple: 6601289264,141740347"
              value={_nda}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNda(event.target.value)}
            />
          </Grid>
        )}
        {!deidentified && showIpp && (
          <Grid container direction="column" className={classes.filter}>
            <Typography variant="h3">IPP :</Typography>
            <TextField
              margin="normal"
              fullWidth
              label="IPP"
              placeholder="Exemple: 6601289264,141740347"
              value={_ipp}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setIpp(event.target.value)}
            />
          </Grid>
        )}
        <Grid container direction="column">
          <Typography variant="h3">Date :</Typography>
          <Grid container alignItems="center" className={classes.datePickers}>
            <InputCalendar label="Après le :" date={_startDate} error={dateError} onclick={setStartDate} />
          </Grid>

          <Grid container alignItems="center" className={classes.datePickers}>
            <InputCalendar label="Avant le :" date={_endDate} error={dateError} onclick={setEndDate} />
          </Grid>
          <FormLabel style={{ padding: '1em 1em 0 1em', display: 'flex', alignItems: 'center' }} component="legend">
            Unité exécutrice
            <Tooltip
              title={
                <>
                  {'- Le niveau hiérarchique de rattachement est : ' +
                    scopeType?.criteriaType[CriteriaName.Document] +
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
              form={CriteriaName.Document}
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

export default ModalDocumentFilters
