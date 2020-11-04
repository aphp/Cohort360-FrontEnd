import React from 'react'
import Grid from '@material-ui/core/Grid'
import useStyles from './style'
import PropTypes from 'prop-types'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

const PMSIFilters = ({
  open,
  onClose,
  onSubmit,
  nda,
  onChangeNda,
  code,
  onChangeCode
}) => {
  const classes = useStyles()

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.title}>
        Filtrer les documents par... :
      </DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">NDA :</Typography>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            label="NDA"
            autofocus
            placeholder='Exemple: "6601289264,141740347"'
            value={nda}
            onChange={onChangeNda}
          />
        </Grid>
        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Code :</Typography>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            label="Code"
            autofocus
            placeholder='Exemple: "G629,R2630,F310"'
            value={code}
            onChange={onChangeCode}
          />
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

PMSIFilters.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  nda: PropTypes.string,
  onChangeNda: PropTypes.func,
  code: PropTypes.string,
  onChangeCode: PropTypes.func
}

export default PMSIFilters
