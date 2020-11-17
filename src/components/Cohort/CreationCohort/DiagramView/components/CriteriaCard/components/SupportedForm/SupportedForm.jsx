import React, { useState } from 'react'

import {
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  Typography,
  InputBase,
  TextField,
  CircularProgress
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import useStyles from './styles'

const ERROR_TITLE = 'error_title'
const ERROR_CODE = 'error_code'

const defaultSupported = {
  title: 'Critère de prise en charge',
  admissionMode: '',
  entry: '',
  exit: '',
  admissionPattern: '',
  admissionType: '',
  origin: '',
  fileStatus: '',
  supportedType: '',
  supportedStatus: '',
  patientType: '',
  type: 'Encounter'
}

const SupportedForm = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const classes = useStyles()

  const isEdition = selectedCriteria !== null ? true : false
  const [_selectedCriteria, onChangeCriteria] = useState(selectedCriteria ?? defaultSupported)
  const [error, setError] = useState(null)

  const _onChangeCriteriaValue = (key, value) => {
    if (error) setError(null)

    const savedCriteria = { ..._selectedCriteria }
    savedCriteria[key] = value
    onChangeCriteria(savedCriteria)
  }

  const _onSubmit = () => {
    if (!_selectedCriteria.title) return setError(ERROR_TITLE)

    onChangeSelectedCriteria(_selectedCriteria)
  }

  if (
    criteria.data.admissionModes === 'loading' ||
    criteria.data.entryModes === 'loading' ||
    criteria.data.exitModes === 'loading' ||
    criteria.data.fileStatus === 'loading'
  ) {
    return (
      <Grid className={classes.root}>
        <CircularProgress />
      </Grid>
    )
  }

  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        <IconButton className={classes.backButton} onClick={goBack}>
          <KeyboardBackspaceIcon />
        </IconButton>
        <Divider className={classes.divider} orientation="vertical" flexItem />
        <Typography className={classes.titleLabel}>
          {isEdition ? 'Modifier un critère de prise en charge' : 'Ajouter un critère de prise en charge'}
        </Typography>
      </Grid>

      <Grid className={classes.formContainer}>
        <Typography variant="h2">Prise en charge</Typography>

        <FormControl className={classes.formControl}>
          <InputBase
            placeholder="Nom du critère"
            classes={{
              root: classes.inputText,
              error: classes.inputTextError
            }}
            error={error === ERROR_TITLE}
            value={_selectedCriteria.title}
            onChange={(e) => _onChangeCriteriaValue('title', e.target.value)}
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <Typography variant="h6">Age au moment de la prise en charge</Typography>

          <Grid className={classes.yearInputContainer}>
            <InputBase placeholder="Année" className={classes.inputText} />
            <InputBase placeholder="Mois" className={classes.inputText} />
            <InputBase placeholder="Jour" className={classes.inputText} />
          </Grid>
        </FormControl>

        <FormControl className={classes.formControl}>
          <Typography variant="h6">Durée de la prise en charge</Typography>

          <Grid className={classes.yearInputContainer}>
            <InputBase placeholder="Jours" className={classes.inputText} />
          </Grid>
        </FormControl>

        {/* TODO Replace Select by AutoComplete */}

        <FormControl className={classes.formControl}>
          <Autocomplete
            defaultValue={isEdition ? _selectedCriteria.admissionMode : null}
            options={criteria.data.admissionModes}
            getOptionLabel={(option) => `${option['code']} - ${option['display']}`}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Mode d'admission"
                classes={{ error: classes.inputTextError }}
                error={error === ERROR_CODE}
              />
            )}
            onChange={(e, value) => _onChangeCriteriaValue('admissionMode', value)}
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <Autocomplete
            defaultValue={isEdition ? _selectedCriteria.entryMode : null}
            options={criteria.data.entryModes}
            getOptionLabel={(option) => `${option['code']} - ${option['display']}`}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Mode d'entré"
                classes={{ error: classes.inputTextError }}
                error={error === ERROR_CODE}
              />
            )}
            onChange={(e, value) => _onChangeCriteriaValue('entryMode', value)}
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <Autocomplete
            defaultValue={isEdition ? _selectedCriteria.exitMode : null}
            options={criteria.data.exitModes}
            getOptionLabel={(option) => `${option['code']} - ${option['display']}`}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Mode de sortie"
                classes={{ error: classes.inputTextError }}
                error={error === ERROR_CODE}
              />
            )}
            onChange={(e, value) => _onChangeCriteriaValue('exitMode', value)}
          />
        </FormControl>

        {/* <FormControl className={classes.formControl}>
          <Grid container className={classes.selectGridContainer}>
            <Grid item>
              <Typography variant="h6">Motif d'admission</Typography>
            </Grid>

            <Grid item>
              <Select
                id="motif-d'admission"
                value={_selectedCriteria.admissionPattern}
                onChange={(e) => _onChangeCriteriaValue('admissionPattern', e.target.value)}
              >
                <MenuItem value={1}>Motif d'admission A</MenuItem>
                <MenuItem value={2}>Motif d'admission B</MenuItem>
                <MenuItem value={3}>Motif d'admission C</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </FormControl> */}

        {/* <FormControl className={classes.formControl}>
          <Grid container className={classes.selectGridContainer}>
            <Grid item>
              <Typography variant="h6">Type d'admission</Typography>
            </Grid>

            <Grid item>
              <Select
                id="type-d'admission"
                value={_selectedCriteria.admissionType}
                onChange={(e) => _onChangeCriteriaValue('admissionType', e.target.value)}
              >
                <MenuItem value={1}>Type d'admission A</MenuItem>
                <MenuItem value={2}>Type d'admission B</MenuItem>
                <MenuItem value={3}>Type d'admission C</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </FormControl> */}

        {/* <FormControl className={classes.formControl}>
          <Grid container className={classes.selectGridContainer}>
            <Grid item>
              <Typography variant="h6">Provenance</Typography>
            </Grid>

            <Grid item>
              <Select
                id="provenance"
                value={_selectedCriteria.origin}
                onChange={(e) => _onChangeCriteriaValue('origin', e.target.value)}
              >
                <MenuItem value={1}>Provenance A</MenuItem>
                <MenuItem value={2}>Provenance B</MenuItem>
                <MenuItem value={3}>Provenance C</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </FormControl> */}

        <FormControl className={classes.formControl}>
          <Autocomplete
            defaultValue={isEdition ? _selectedCriteria.fileStatus : null}
            options={criteria.data.fileStatus}
            getOptionLabel={(option) => `${option['code']} - ${option['display']}`}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Status Dossier"
                classes={{ error: classes.inputTextError }}
                error={error === ERROR_CODE}
              />
            )}
            onChange={(e, value) => _onChangeCriteriaValue('fileStatus', value)}
          />
        </FormControl>

        {/* <FormControl className={classes.formControl}>
          <Grid container className={classes.selectGridContainer}>
            <Grid item>
              <Typography variant="h6">Type de prise en charge</Typography>
            </Grid>

            <Grid item>
              <Select
                id="type-de-prise-en-charge"
                value={_selectedCriteria.supportedType}
                onChange={(e) => _onChangeCriteriaValue('supportedType', e.target.value)}
              >
                <MenuItem value={1}>Type de prise en charge A</MenuItem>
                <MenuItem value={2}>Type de prise en charge B</MenuItem>
                <MenuItem value={3}>Type de prise en charge C</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </FormControl>

        <FormControl className={classes.formControl}>
          <Grid container className={classes.selectGridContainer}>
            <Grid item>
              <Typography variant="h6">Status vital au moment de la prise en charge</Typography>
            </Grid>

            <Grid item>
              <Select
                id="type-de-prise-en-charge"
                value={_selectedCriteria.supportedStatus}
                onChange={(e) => _onChangeCriteriaValue('supportedStatus', e.target.value)}
              >
                <MenuItem value={1}>Vivant</MenuItem>
                <MenuItem value={2}>Décédé.e</MenuItem>
                <MenuItem value={3}>Non renseigné</MenuItem>
                <MenuItem value={4}>Inconnu</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </FormControl>

        <FormControl className={classes.formControl}>
          <Grid container className={classes.selectGridContainer}>
            <Grid item>
              <Typography variant="h6">Status vital au moment de la prise en charge</Typography>
            </Grid>

            <Grid item>
              <Select
                id="type-de-prise-en-charge"
                value={_selectedCriteria.supportedType}
                onChange={(e) => _onChangeCriteriaValue('supportedType', e.target.value)}
              >
                <MenuItem value={1}>Vivant</MenuItem>
                <MenuItem value={2}>Décédé.e</MenuItem>
                <MenuItem value={3}>Non renseigné</MenuItem>
                <MenuItem value={4}>Inconnu</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </FormControl> */}
      </Grid>
      <Grid className={classes.criteriaActionContainer}>
        <Button onClick={goBack} color="primary" variant="outlined">
          Annuler
        </Button>
        <Button onClick={_onSubmit} color="primary" variant="contained">
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default SupportedForm
