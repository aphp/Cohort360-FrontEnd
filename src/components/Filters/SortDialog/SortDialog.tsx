import React from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

import useStyles from './styles'

type SortDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  sortBy: string
  onChangeSortBy: any
  sortDirection: 'asc' | 'desc'
  onChangeSortDirection: any
}
const SortDialog: React.FC<SortDialogProps> = ({
  open,
  onClose,
  onSubmit,
  sortBy,
  onChangeSortBy,
  sortDirection,
  onChangeSortDirection
}) => {
  const classes = useStyles()

  const _onChangeSortBy = (
    event: React.ChangeEvent<{}>,
    value: {
      label: string
      code: string
    } | null
  ) => {
    onChangeSortBy(value?.code)
  }

  const _onChangeSortDirection = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    onChangeSortDirection(value)
  }

  const sortByNames = [
    { label: 'Sexe', code: 'gender' },
    { label: 'Prénom', code: 'given' },
    { label: 'Nom', code: 'family' },
    { label: 'Date de Naissance', code: 'birthdate' }
  ]

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.title}>Trier par :</DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="row" justify="space-between">
          <Autocomplete
            options={sortByNames}
            getOptionLabel={(option) => option.label}
            value={sortByNames.find((value) => value.code === sortBy)}
            renderInput={(params) => <TextField {...params} label="Trier par :" variant="outlined" />}
            onChange={_onChangeSortBy}
            className={classes.autocomplete}
          />
          <div className={classes.orderBy}>
            <Typography variant="button">Ordre :</Typography>
            <RadioGroup value={sortDirection} onChange={_onChangeSortDirection} classes={{ root: classes.radioGroup }}>
              <FormControlLabel value="asc" control={<Radio />} label="Croissant" />
              <FormControlLabel value="desc" control={<Radio />} label="Décroissant" />
            </RadioGroup>
          </div>
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

export default SortDialog
