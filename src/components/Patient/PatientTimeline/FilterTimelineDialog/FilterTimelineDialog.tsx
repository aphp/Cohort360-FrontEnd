import React, { useEffect, useState } from 'react'

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material'
import { Autocomplete } from '@mui/lab'

import { capitalizeFirstLetter } from 'utils/capitalize'

import useStyles from './styles'

type FilterTimelineDialogProps = {
  open: boolean
  onClose: () => void
  diagnosticTypesList: any[]
  selectedDiagnosticTypes: string[]
  onChangeSelectedDiagnosticTypes: (selectedDiagnosticTypes: string[]) => void
}
const FilterTimelineDialog: React.FC<FilterTimelineDialogProps> = ({
  open,
  onClose,
  diagnosticTypesList,
  selectedDiagnosticTypes,
  onChangeSelectedDiagnosticTypes
}) => {
  const classes = useStyles()

  const [_selectedDiagnosticTypes, setSelectedDiagnosticTypes] = useState<any[]>(selectedDiagnosticTypes)

  const _onChangeSelectedDiagnosticTypes = (event: React.ChangeEvent<{}>, value: any[]) => {
    setSelectedDiagnosticTypes(value)
  }

  const _onSubmit = () => {
    onChangeSelectedDiagnosticTypes(_selectedDiagnosticTypes)
    onClose()
  }

  useEffect(() => {
    setSelectedDiagnosticTypes(selectedDiagnosticTypes)
  }, [open]) // eslint-disable-line

  const currentSelectedTypes = diagnosticTypesList.filter((item) =>
    _selectedDiagnosticTypes.find((selectedDiagCode) => selectedDiagCode.id === item.id)
  )

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.title}>Filtrer par :</DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Type de diagnostics :</Typography>
          <Autocomplete
            multiple
            onChange={_onChangeSelectedDiagnosticTypes}
            options={diagnosticTypesList}
            value={currentSelectedTypes}
            isOptionEqualToValue={(option, value) => option.id === value.id}
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

export default FilterTimelineDialog
