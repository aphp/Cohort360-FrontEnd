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
import { LabelObject, TimelineFilter } from 'types/searchCriterias'

type FilterTimelineDialogProps = {
  open: boolean
  onClose: () => void
  diagnosticTypesList: LabelObject[]
  selectedDiagnosticTypes: LabelObject[]
  onChangeFilters: (newFilters: TimelineFilter) => void
  encounterStatusList: LabelObject[]
  selectedEncounterStatus: LabelObject[]
}
const FilterTimelineDialog: React.FC<FilterTimelineDialogProps> = ({
  open,
  onClose,
  diagnosticTypesList,
  selectedDiagnosticTypes,
  encounterStatusList,
  selectedEncounterStatus,
  onChangeFilters
}) => {
  const { classes } = useStyles()

  const [diagnosticTypes, setDiagnosticTypes] = useState<LabelObject[]>(selectedDiagnosticTypes)
  const [encounterStatus, setEncounterStatus] = useState<LabelObject[]>(selectedEncounterStatus)

  const _onChangeSelectedDiagnosticTypes = (event: React.ChangeEvent<object>, value: LabelObject[]) => {
    setDiagnosticTypes(value)
  }

  const _onSubmit = () => {
    onChangeFilters({ diagnosticTypes: diagnosticTypes, encounterStatus: encounterStatus })
    onClose()
  }

  useEffect(() => {
    setDiagnosticTypes(selectedDiagnosticTypes)
    setEncounterStatus(selectedEncounterStatus)
  }, [open]) // eslint-disable-line

  const currentSelectedTypes = diagnosticTypesList.filter((item) =>
    diagnosticTypes.find((selectedDiagCode) => selectedDiagCode.id === item.id)
  )

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Filtrer par :</DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container sx={{ flexDirection: 'column' }}>
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
            onChange={(event, value) => setEncounterStatus(value)}
            options={encounterStatusList}
            value={selectedEncounterStatus}
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
