import React, { useEffect, useState } from 'react'

import { Button, Divider, FormLabel, Grid, IconButton, Switch, Typography, TextField } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import InputSearchDocumentSimple from 'components/Inputs/InputSearchDocument/components/InputSearchDocumentSimple'

import { IPPListDataType } from 'types'

import useStyles from './styles'

type IPPFormProps = {
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultIPPList: IPPListDataType = {
  title: "Liste d'IPP",
  type: 'IPPList',
  search: '',
  isInclusive: true
}

const IPPForm: React.FC<IPPFormProps> = (props) => {
  const { selectedCriteria, goBack, onChangeSelectedCriteria } = props

  const classes = useStyles()

  const [error, setError] = useState(false)
  const [formatError, setFormatError] = useState(false)
  const [defaultValues, setDefaultValues] = useState(selectedCriteria || defaultIPPList)
  const [ippCount, setIppCount] = useState(0)

  const isEdition = selectedCriteria !== null ? true : false

  const _onChangeValue = (key: string, value: any) => {
    const _defaultValues = defaultValues ? { ...defaultValues } : {}
    _defaultValues[key] = value
    setDefaultValues(_defaultValues)
  }

  const _onSubmit = () => {
    if (defaultValues && defaultValues.search?.length === 0) {
      return setError(true)
    }
    const cleanSearch = defaultValues.search.replace(/\s+/g, '')
    const _defaultValues = { ...defaultValues, search: cleanSearch }
    onChangeSelectedCriteria(_defaultValues)
  }

  useEffect(() => {
    // check if no forbidden character
    if (defaultValues.search.match(/[^0-9,\s]/g)) {
      setFormatError(true)
    } else {
      setFormatError(false)
    }

    const ippCount = ((defaultValues.search || '').match(/\d{10,13}/g) || []).length
    setIppCount(ippCount)

    if (ippCount > 0) {
      setError(false)
    }
  }, [defaultValues.search])

  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack}>
              <KeyboardBackspaceIcon />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Typography className={classes.titleLabel}>Ajouter un critère de liste d'IPP</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de liste d'IPP</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        {error && <Alert severity="error">Merci de renseigner au moins un IPP</Alert>}

        <Alert severity="info">Merci de bien vouloir entrer une liste d'IPP séparée par des virgules</Alert>

        {formatError && <Alert severity="error">La liste d'IPP contient des caractères non autorisés</Alert>}

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">Liste d'IPP</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            variant="outlined"
            value={defaultValues.title}
            onChange={(e) => _onChangeValue('title', e.target.value)}
          />

          <Grid style={{ display: 'flex' }}>
            <FormLabel
              onClick={() => _onChangeValue('isInclusive', !defaultValues.isInclusive)}
              style={{ margin: 'auto 1em' }}
              component="legend"
            >
              Exclure les patients qui suivent les règles suivantes
            </FormLabel>
            <Switch
              id="criteria-inclusive"
              checked={!defaultValues.isInclusive}
              onChange={(event) => _onChangeValue('isInclusive', !event.target.checked)}
            />
          </Grid>

          <Typography className={classes.inputItem} style={{ fontWeight: 'bold' }}>
            {ippCount} IPP détectés.
          </Typography>

          <Grid className={classes.inputItem}>
            <InputSearchDocumentSimple
              placeholder="Ajouter une liste d'IPP séparés par des virgules"
              defaultSearchInput={defaultValues.search}
              setDefaultSearchInput={(newSearchInput: string) => _onChangeValue('search', newSearchInput)}
              onSearchDocument={() => null}
              noInfoIcon
              noClearIcon
              noSearchIcon
              squareInput
              minRows={5}
            />
          </Grid>
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} color="primary" variant="outlined">
              Annuler
            </Button>
          )}
          <Button
            onClick={_onSubmit}
            disabled={error || formatError}
            type="submit"
            form="ipp-form"
            color="primary"
            variant="contained"
          >
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default IPPForm
