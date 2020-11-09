import React from 'react'

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

import InputDate from 'components/Inputs/InputDate/InputDate'

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
  deidentified
}) => {
  const classes = useStyles()

  const _onChangeNda = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeNda(event.target.value)
  }

  const _onChangeCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeCode(event.target.value)
  }

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
