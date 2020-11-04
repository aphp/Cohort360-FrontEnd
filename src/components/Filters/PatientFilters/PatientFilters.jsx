import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'
import Slider from '@material-ui/core/Slider'

import useStyles from './style'

const PatientFilters = ({
  open,
  onClose,
  onSubmit,
  gender,
  onChangeGender,
  age,
  onChangeAge,
  vitalStatus,
  onChangeVitalStatus
}) => {
  const classes = useStyles()

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.title}>
        Filtrer les patients :
      </DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Genre :</Typography>
          <RadioGroup
            name="Gender"
            value={gender}
            onChange={onChangeGender}
            row={true}
          >
            <FormControlLabel value="male" control={<Radio />} label="Hommes" />
            <FormControlLabel
              value="female"
              control={<Radio />}
              label="Femmes"
            />
            <FormControlLabel
              value="other"
              control={<Radio />}
              label="Autres"
            />
            <FormControlLabel
              value="all"
              control={<Radio />}
              label="Tous les genres"
            />
          </RadioGroup>
        </Grid>
        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Âge :</Typography>
          <Slider
            value={age}
            onChange={onChangeAge}
            valueLabelDisplay="on"
            max={130}
            className={classes.slider}
          />
        </Grid>
        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Statut vital :</Typography>
          <RadioGroup
            name="VitalStatus"
            value={vitalStatus}
            onChange={onChangeVitalStatus}
            row={true}
          >
            <FormControlLabel
              value="alive"
              control={<Radio />}
              label="Patients vivants"
            />
            <FormControlLabel
              value="deceased"
              control={<Radio />}
              label="Patients décédés"
            />
            <FormControlLabel
              value="all"
              control={<Radio />}
              label="Tous les patients"
            />
          </RadioGroup>
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

PatientFilters.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  gender: PropTypes.string,
  onChangeGender: PropTypes.func,
  age: PropTypes.array,
  onChangeAge: PropTypes.func,
  vitalStatus: PropTypes.string,
  onChangeVitalStatus: PropTypes.func
}

export default PatientFilters
