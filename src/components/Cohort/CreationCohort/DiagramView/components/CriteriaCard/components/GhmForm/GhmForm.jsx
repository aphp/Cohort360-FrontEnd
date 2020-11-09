import React, { useState, useEffect } from 'react'

import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  InputBase,
  TextField,
  Typography
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { InputNumber, InputDate } from '../../../../../../../Inputs'

import useStyles from './styles'

const ERROR_TITLE = 'error_title'
const ERROR_OCCURRENCE = 'error_occurrence'
const ERROR_CODE = 'error_code'
const ERROR_START_OCCURRENCE = 'error_start_occurrence'
const ERROR_END_OCCURRENCE = 'error_end_occurrence'

const defaultDocuments = {
  title: 'Critère de GHM',
  occurrence: 1,
  start_occurrence: null,
  end_occurrence: null,
  attribute: '',
  code: '',
  status: '',
  type: 'ghm'
}

const GhmForm = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const isEdition = selectedCriteria !== null ? true : false

  const classes = useStyles()

  const [_selectedCriteria, onChangeCriteria] = useState(selectedCriteria ?? defaultDocuments)
  const [error, setError] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [GHMData, setGHMData] = useState(criteria?.data || [])

  useEffect(() => {
    const _searchValue = searchValue ? searchValue.toLowerCase() : ''

    const filteredGhmData = (criteria?.data || [])
      .filter(
        (data) =>
          data['GHM CODE'].toLowerCase().startsWith(_searchValue) ||
          data['LONG DESCRIPTION'].toLowerCase().startsWith(_searchValue) ||
          `${data['GHM CODE']} - ${data['LONG DESCRIPTION']}`.toLowerCase().startsWith(_searchValue)
      )
      .slice(0, 200)
    setGHMData(filteredGhmData)
  }, [searchValue]) // eslint-disable-line

  const _onChangeCriteriaValue = (key, value) => {
    if (error) setError(null)

    const savedCriteria = { ..._selectedCriteria }
    savedCriteria[key] = value
    onChangeCriteria(savedCriteria)
  }

  const _onSubmit = () => {
    if (!_selectedCriteria.title) return setError(ERROR_TITLE)
    if (!_selectedCriteria.code) return setError(ERROR_CODE)

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
            <Typography className={classes.titleLabel}>Ajouter un critère de GHM</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de GHM</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        <Typography variant="subtitle1">Diagnostic</Typography>

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

        <FormControl className={classes.formControl}>
          <Autocomplete
            defaultValue={isEdition ? _selectedCriteria.code : null}
            options={GHMData}
            getOptionLabel={(option) => `${option['GHM CODE']} - ${option['LONG DESCRIPTION']}`}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="GHM 10 Diag Code"
                classes={{ error: classes.inputTextError }}
                error={error === ERROR_CODE}
              />
            )}
            onChange={(e, value) => _onChangeCriteriaValue('code', value)}
            onInputChange={(event, value) => setSearchValue(value)}
          />
        </FormControl>

        <InputNumber
          label={'Nombre d’occurrences :'}
          error={error === ERROR_OCCURRENCE}
          value={_selectedCriteria.occurrence}
          onChange={(occurrence) => _onChangeCriteriaValue('occurrence', occurrence)}
        />

        <FormControl component="fieldset" style={{ margin: '0 1em' }}>
          <FormLabel component="legend">Date d’occurrence :</FormLabel>
        </FormControl>

        <InputDate
          label={'Avant le :'}
          error={error === ERROR_START_OCCURRENCE}
          value={_selectedCriteria.start_occurrence}
          onChange={(start_occurrence) => _onChangeCriteriaValue('start_occurrence', start_occurrence)}
        />

        <InputDate
          label={'Avant le :'}
          error={error === ERROR_END_OCCURRENCE}
          value={_selectedCriteria.end_occurrence}
          onChange={(end_occurrence) => _onChangeCriteriaValue('end_occurrence', end_occurrence)}
        />
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

export default GhmForm
