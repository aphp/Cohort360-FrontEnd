import React, { useState } from 'react'

import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem
} from '@material-ui/core'

import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import useStyles from './styles'

const ERROR_TITLE = 'error_title'
const ERROR_SEARCH = 'error_search'

const defaultDocuments = {
  title: 'Critère de document',
  search: '',
  doc: '55188-7',
  type: 'documents_cliniques'
}

const DocumentsFrom = (props) => {
  const { selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const classes = useStyles()

  const isEdition = selectedCriteria !== null ? true : false
  const [_selectedCriteria, onChangeCriteria] = useState(selectedCriteria ?? defaultDocuments)
  const [error, setError] = useState(null)

  const _onChangeCriteriaValue = (key, value) => {
    if (error) setError(null)

    const savedCriteria = { ..._selectedCriteria }
    savedCriteria[key] = value
    onChangeCriteria(savedCriteria)
  }

  const _onSubmit = () => {
    if (!_selectedCriteria.title) return setError(ERROR_TITLE)
    if (!_selectedCriteria.search) return setError(ERROR_SEARCH)

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
            <Typography className={classes.titleLabel}>Ajouter un critère de documents médicaux</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de documents médicaux</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        <Typography variant="subtitle1">Documents médicaux</Typography>

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
          <InputBase
            type="search"
            placeholder="Recherche"
            classes={{
              root: classes.inputText,
              error: classes.inputTextError
            }}
            error={error === ERROR_SEARCH}
            value={_selectedCriteria.search}
            onChange={(e) => _onChangeCriteriaValue('search', e.target.value)}
          />
        </FormControl>

        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Rechercher dans :</FormLabel>
          <Select value={_selectedCriteria.doc} onChange={(e) => _onChangeCriteriaValue('doc', e.target.value)}>
            <MenuItem value="55188-7">Tout type de documents</MenuItem>
            <MenuItem value="11336-5">Comptes rendus d'hospitalisation</MenuItem>
            <MenuItem value="57833-6">Ordonnances</MenuItem>
          </Select>
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

export default DocumentsFrom
