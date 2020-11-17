import React, { useState } from 'react'
import clsx from 'clsx'

import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  InputBase,
  Slider,
  TextField,
  Typography
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import useStyles from './styles'

const ERROR_TITLE = 'error_title'

const defaultDemographic = {
  title: 'Critère démographique',
  vitalStatus: [],
  gender: [],
  years: [0, 100],
  type: 'Patient'
}

const DemographicFrom = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const classes = useStyles()

  const isEdition = selectedCriteria !== null ? true : false
  const [_selectedCriteria, onChangeCriteria] = useState(selectedCriteria ?? defaultDemographic)
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

  if (criteria.data.gender === 'loading') {
    return <></>
  }

  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack}>
              <KeyboardBackspaceIcon />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Typography className={classes.titleLabel}>Ajouter un critère démographique</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère démographique</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        <Typography variant="subtitle1">Démographie patient</Typography>

        <FormControl component="fieldset" className={classes.formControl}>
          <InputBase
            placeholder="Nom du critère"
            className={clsx(classes.inputText, {
              [classes.inputTextError]: error === ERROR_TITLE
            })}
            value={_selectedCriteria.title}
            onChange={(e) => _onChangeCriteriaValue('title', e.target.value)}
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <Autocomplete
            multiple
            defaultValue={isEdition ? _selectedCriteria.gender : []}
            options={criteria.data.gender}
            getOptionLabel={(option) => option['display']}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Genre" />}
            onChange={(e, value) => _onChangeCriteriaValue('gender', value)}
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <Autocomplete
            multiple
            defaultValue={isEdition ? _selectedCriteria.vitalStatus : []}
            options={criteria.data.deceased}
            getOptionLabel={(option) => option['display']}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Status vital" />}
            onChange={(e, value) => _onChangeCriteriaValue('vitalStatus', value)}
          />
        </FormControl>

        {/* <FormControl className={classes.formControl}>
          <Autocomplete
            multiple
            defaultValue={isEdition ? _selectedCriteria.gender : []}
            options={criteria.data.gender}
            getOptionLabel={(option) => option['value']}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Genre"
                classes={{ error: classes.inputTextError }}
              />
            )}
            onChange={(e, value) => _onChangeCriteriaValue('gender', value)}
          />
        </FormControl> */}

        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Fourchette d'âge</FormLabel>
          <Slider
            value={_selectedCriteria.years}
            onChange={(e, years) => _onChangeCriteriaValue('years', years)}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            defaultValue={[0, 100]}
            getAriaValueText={(value) => (value === 100 ? '100+' : value)}
          />
        </FormControl>

        <Grid className={classes.yearInputContainer}>
          <Typography>De</Typography>
          <InputBase
            placeholder="Nom du critère"
            className={classes.inputText}
            value={_selectedCriteria.years[0]}
            onChange={(e) =>
              _onChangeCriteriaValue('years', [
                e.target.value <= 0 ? 0 : e.target.value >= 100 ? 100 : +e.target.value,
                _selectedCriteria.years[1]
              ])
            }
          />

          <Typography>à</Typography>
          <InputBase
            placeholder="Nom du critère"
            className={classes.inputText}
            value={_selectedCriteria.years[1]}
            onChange={(e) =>
              _onChangeCriteriaValue('years', [
                _selectedCriteria.years[0],
                e.target.value <= 0 ? 0 : e.target.value >= 100 ? 100 : +e.target.value
              ])
            }
          />
        </Grid>
      </Grid>

      <Grid className={classes.criteriaActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} color="primary" variant="outlined">
            Annuler
          </Button>
        )}
        <Button onClick={_onSubmit} color="primary" variant="contained">
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default DemographicFrom
