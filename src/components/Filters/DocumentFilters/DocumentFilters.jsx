import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Input from '@material-ui/core/Input'
import Checkbox from '@material-ui/core/Checkbox'
import ListItemText from '@material-ui/core/ListItemText'
import TextField from '@material-ui/core/TextField'

import { docTypes } from '../../../assets/docTypes.json'

import useStyles from './style'

const DocumentFilters = ({
  open,
  onClose,
  onSubmit,
  nda,
  onChangeNda,
  selectedDocTypes,
  onChangeSelectedDocTypes
}) => {
  const classes = useStyles()

  const docTypesList = docTypes

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.title}>Filtrer les :</DialogTitle>
      <DialogContent className={classes.dialog}>
        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Type de documents :</Typography>
          <Select
            multiple
            value={selectedDocTypes}
            onChange={onChangeSelectedDocTypes}
            input={<Input />}
            renderValue={(selected) => selected.join(', ')}
            className={classes.select}
          >
            {docTypesList.map((docType) => (
              <MenuItem key={docType.code} value={docType.code}>
                <Checkbox
                  checked={selectedDocTypes.indexOf(docType.code) > -1}
                />
                <ListItemText primary={docType.label} />
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid container direction="column" className={classes.filter}>
          <Typography variant="h3">Filtrer par NDA :</Typography>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            label="NDA"
            autoFocus
            placeholder='Exemple: "6601289264,141740347"'
            value={nda}
            onChange={onChangeNda}
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

DocumentFilters.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  nda: PropTypes.string,
  onChangeNda: PropTypes.func,
  selectedDocTypes: PropTypes.array,
  onChangeSelectedDocTypes: PropTypes.func
}

export default DocumentFilters
