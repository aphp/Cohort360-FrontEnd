import React, { useState, useEffect } from 'react'

import { Button, Divider, FormControl, Grid, IconButton, InputBase, TextField, Typography } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import useStyles from './styles'

const ERROR_TITLE = 'error_title'
const ERROR_CODE = 'error_code'

const defaultDocuments = {
  title: 'Critère de diagnostic',
  code: '',
  type: 'diagnostics'
}

const Cim10Form = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const classes = useStyles()

  const isEdition = selectedCriteria !== null ? true : false
  const [_selectedCriteria, onChangeCriteria] = useState(selectedCriteria ?? defaultDocuments)
  const [error, setError] = useState(null)

  const [searchValue, setSearchValue] = useState('')
  const [CIMData, setCIMData] = useState(criteria?.data)

  useEffect(() => {
    const _searchValue = searchValue ? searchValue.toLowerCase() : ''

    const filteredCimData = criteria?.data
      .filter(
        (data) =>
          data['DIAGNOSIS CODE'].toLowerCase().startsWith(_searchValue) ||
          data['LONG DESCRIPTION'].toLowerCase().startsWith(_searchValue) ||
          `${data['DIAGNOSIS CODE']} - ${data['LONG DESCRIPTION']}`.toLowerCase().startsWith(_searchValue)
      )
      .slice(0, 200)
    setCIMData(filteredCimData)
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
            <Typography className={classes.titleLabel}>Ajouter un critère de diagnostic</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de diagnostic</Typography>
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
            options={CIMData}
            getOptionLabel={(option) => `${option['DIAGNOSIS CODE']} - ${option['LONG DESCRIPTION']}`}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="CIM 10 Diag Code"
                classes={{ error: classes.inputTextError }}
                error={error === ERROR_CODE}
              />
            )}
            onChange={(e, value) => _onChangeCriteriaValue('code', value)}
            onInputChange={(event, value) => setSearchValue(value)}
          />
        </FormControl>
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

export default Cim10Form
