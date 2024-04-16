import React, { useEffect, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  Autocomplete
} from '@mui/material'

import { capitalizeFirstLetter } from 'utils/capitalize'

import useStyles from './styles'
import { LabelObject } from 'types/searchCriterias'
import { Hierarchy } from 'types/hierarchy'

type FilterTimelineDialogProps = {
  open: boolean
  onClose: () => void
  diagnosticTypesList: Hierarchy<any, any>[]
  selectedDiagnosticTypes: LabelObject[]
  onChangeSelectedDiagnosticTypes: (selectedDiagnosticTypes: LabelObject[]) => void
  encounterStatusList: Hierarchy<any, any>[]
  encounterStatus: LabelObject[]
  onChangeEncounterStatus: (encounterStatus: LabelObject[]) => void
}
const FilterTimelineDialog: React.FC<FilterTimelineDialogProps> = ({
  open,
  onClose,
  diagnosticTypesList,
  selectedDiagnosticTypes,
  onChangeSelectedDiagnosticTypes,
  encounterStatusList,
  encounterStatus,
  onChangeEncounterStatus
}) => {
  const { classes } = useStyles()

  const [_selectedDiagnosticTypes, setSelectedDiagnosticTypes] = useState<LabelObject[]>(selectedDiagnosticTypes)
  const [_encounterStatus, setEncounterStatus] = useState<LabelObject[]>(encounterStatus)

  const _onChangeSelectedDiagnosticTypes = (event: React.ChangeEvent<{}>, value: LabelObject[]) => {
    setSelectedDiagnosticTypes(value)
  }

  const _onSubmit = () => {
    onChangeSelectedDiagnosticTypes(_selectedDiagnosticTypes)
    onChangeEncounterStatus(_encounterStatus)
    onClose()
  }

  useEffect(() => {
    setSelectedDiagnosticTypes(selectedDiagnosticTypes)
    setEncounterStatus(encounterStatus)
  }, [open]) // eslint-disable-line

  const currentSelectedTypes = diagnosticTypesList.filter((item) =>
    _selectedDiagnosticTypes.find((selectedDiagCode) => selectedDiagCode.id === item.id)
  )

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Filtrer par :</DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="column">
          <Typography variant="h3">Type de diagnostics :</Typography>
          <Autocomplete
            multiple
            onChange={_onChangeSelectedDiagnosticTypes}
            options={diagnosticTypesList}
            value={currentSelectedTypes}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disableCloseOnSelect
            getOptionLabel={(diagnosticType) => capitalizeFirstLetter(diagnosticType.label)}
            renderOption={(props, diagnosticType) => <li {...props}>{capitalizeFirstLetter(diagnosticType.label)}</li>}
            renderInput={(params) => (
              <TextField {...params} label="Types de diagnostics" placeholder="Sélectionner type(s) de diagnostics" />
            )}
            className={classes.autocomplete}
          />
          <Typography variant="h3" className={classes.autocomplete}>
            Statut de la visite associée :
          </Typography>
          <Autocomplete
            multiple
            onChange={(event, value) => {
              setEncounterStatus(value)
            }}
            options={encounterStatusList}
            value={_encounterStatus}
            disableCloseOnSelect
            getOptionLabel={(encounterStatus: LabelObject) => encounterStatus.label}
            renderOption={(props, encounterStatus: LabelObject) => <li {...props}>{encounterStatus.label}</li>}
            renderInput={(params) => (
              <TextField {...params} placeholder="Sélectionner le statut de la visite associée" />
            )}
            className={classes.autocomplete}
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={_onSubmit}>Valider</Button>
      </DialogActions>
    </Dialog>
  )
}

export default FilterTimelineDialog
