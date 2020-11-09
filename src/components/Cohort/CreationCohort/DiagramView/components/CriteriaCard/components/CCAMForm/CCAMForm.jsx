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

import { InputDate } from '../../../../../../../Inputs'

import useStyles from './styles'

const ERROR_TITLE = 'error_title'
const ERROR_CODE = 'error_code'
const ERROR_START_OCCURRENCE = 'error_start_occurrence'
const ERROR_END_OCCURRENCE = 'error_end_occurrence'

const defaultDocuments = {
  title: "Critères d'actes CCAM",
  code: '',
  start_occurrence: null,
  end_occurrence: null,
  type: 'ccam'
}

const CCAMForm = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const classes = useStyles()

  const isEdition = selectedCriteria !== null ? true : false
  const [_selectedCriteria, onChangeCriteria] = useState(selectedCriteria ?? defaultDocuments)
  const [error, setError] = useState(null)

  const [searchValue, setSearchValue] = useState(isEdition ? 'test' : '')
  const [CCAMData, setCCAMData] = useState(criteria?.data)

  useEffect(() => {
    const _searchValue = searchValue ? searchValue.toLowerCase() : ''

    const filteredCcamData = criteria?.data
      .filter(
        (data) =>
          data['CCAM CODE'].toLowerCase().startsWith(_searchValue) ||
          data['LONG DESCRIPTION'].toLowerCase().startsWith(_searchValue) ||
          `${data['CCAM CODE']} - ${data['LONG DESCRIPTION']}`.toLowerCase().startsWith(_searchValue)
      )
      .slice(0, 200)
    setCCAMData(filteredCcamData)
    }, [searchValue]); // eslint-disable-line

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
            <Typography variant="button" className={classes.titleLabel}>
              Ajouter un critère d'acte CCAM
            </Typography>
          </>
        ) : (
          <Typography variant="button" className={classes.titleLabel}>
            Modifier un critère d'acte CCAM
          </Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        <Typography variant="button">Actes CCAM</Typography>

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
            options={CCAMData}
            getOptionLabel={(option) => `${option['CCAM CODE']} - ${option['LONG DESCRIPTION']}`}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Codes d'actes CCAM"
                classes={{ error: classes.inputTextError }}
                error={error === ERROR_CODE}
              />
            )}
            onChange={(e, value) => _onChangeCriteriaValue('code', value)}
            onInputChange={(event, value) => setSearchValue(value)}
          />
        </FormControl>

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

export default CCAMForm
