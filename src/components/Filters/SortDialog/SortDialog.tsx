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
  SelectChangeEvent,
  Typography
} from '@mui/material'

import useStyles from './styles'
import { Direction, Order, OrderBy } from 'types/searchCriterias'

type SortDialogProps = {
  open: boolean
  onClose: () => void
  sort: OrderBy
  onChangeSort: (sort: OrderBy) => void
}

const sortOptions = [
  { label: 'Sexe', code: 'gender,id' },
  { label: 'Prénom', code: 'name' },
  { label: 'Nom', code: 'family' },
  { label: 'Date de Naissance', code: 'birthdate,id' }
]

const SortDialog: React.FC<SortDialogProps> = ({ open, onClose, sort, onChangeSort }) => {
  const { classes } = useStyles()
  const [_sort, setSort] = useState(sort)

  const _onSubmit = () => {
    onChangeSort(_sort)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Trier par :</DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="row" justifyContent="space-between">
          <Select
            value={_sort.orderBy as any}
            onChange={(
              event: SelectChangeEvent<{
                name?: string | undefined
                value: unknown
              }>
            ) => setSort({ ..._sort, orderBy: event.target.value as Order })}
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
              value={_sort.orderDirection}
              onChange={(event, value) => setSort({ ..._sort, orderDirection: value as Direction })}
              classes={{ root: classes.radioGroup }}
            >
              <FormControlLabel value="asc" control={<Radio color="secondary" />} label="Croissant" />
              <FormControlLabel value="desc" control={<Radio color="secondary" />} label="Décroissant" />
            </RadioGroup>
          </div>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={_onSubmit}>Valider</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SortDialog
