import React, { useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography
} from '@mui/material'

import { Sort } from 'types'

import useStyles from './styles'

type SortDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  sort: Sort
  onChangeSort: (sort: Sort) => void
}

const sortOptions = [
  { label: 'Sexe', code: 'gender' },
  { label: 'Prénom', code: 'given' },
  { label: 'Nom', code: 'family' },
  { label: 'Date de Naissance', code: 'birthdate' }
]

const SortDialog: React.FC<SortDialogProps> = ({ open, onClose, onSubmit, sort, onChangeSort }) => {
  const classes = useStyles()
  const [_sort, setSort] = useState(sort)

  const _onSubmit = () => {
    onChangeSort(_sort)
    onSubmit()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.title}>Trier par :</DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="row" justifyContent="space-between">
          <Select
            value={_sort.sortBy}
            onChange={(
              event: React.ChangeEvent<{
                name?: string | undefined
                value: unknown
              }>
            ) => setSort({ ..._sort, sortBy: event.target.value as string })}
            className={classes.autocomplete}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.code} value={option.code}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <div className={classes.orderBy}>
            <Typography variant="button">Ordre :</Typography>
            <RadioGroup
              value={_sort.sortDirection}
              onChange={(event, value) => setSort({ ..._sort, sortDirection: value as 'asc' | 'desc' })}
              classes={{ root: classes.radioGroup }}
            >
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
        <Button onClick={_onSubmit} color="primary">
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SortDialog
