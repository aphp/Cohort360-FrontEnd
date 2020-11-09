import React, { useState } from 'react'

import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  FormControlLabel,
  Grid,
  IconButton,
  InputBase,
  RadioGroup,
  Radio,
  Slider,
  Typography
} from '@material-ui/core'

import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import useStyles from './styles'

const ERROR_TITLE = 'error_title'

const defaultDemographic = {
  title: 'Critère démographique',
  gender: 0,
  years: [0, 100],
  type: 'patients'
}

const DemographicFrom = (props) => {
  const { selectedCriteria, onChangeSelectedCriteria, goBack } = props

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
            classes={{
              root: classes.inputText,
              error: classes.inputTextError
            }}
            error={error === ERROR_TITLE}
            value={_selectedCriteria.title}
            onChange={(e) => _onChangeCriteriaValue('title', e.target.value)}
          />
        </FormControl>

        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Genre</FormLabel>
          <RadioGroup
            value={_selectedCriteria.gender}
            onChange={(e) => _onChangeCriteriaValue('gender', +e.target.value)}
          >
            <FormControlLabel value={0} control={<Radio />} label="Homme" />
            <FormControlLabel value={1} control={<Radio />} label="Femme" />
            <FormControlLabel value={2} control={<Radio />} label="Autre" />
            <FormControlLabel value={3} control={<Radio />} label="Tous" />
          </RadioGroup>
        </FormControl>

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
