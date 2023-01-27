import React, { useEffect, useState } from 'react'

import { Alert, Button, Divider, FormLabel, Grid, IconButton, Switch, Typography, TextField } from '@mui/material'

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

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
  const [defaultValues, setDefaultValues] = useState(selectedCriteria || defaultIPPList)
  const [ippList, setIppList] = useState<string[]>([])

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

    const _defaultValues = { ...defaultValues, search: ippList.join() }
    onChangeSelectedCriteria(_defaultValues)
  }

  useEffect(() => {
    const ippMatches = (defaultValues.search || '').matchAll(/(?:^|\D+)*(8\d{9})(?:\D+|$)/gm) || []

    const ippList = []

    for (const match of ippMatches) {
      ippList.push(match[1])
    }

    setIppList(ippList)

    if (ippList.length > 0) {
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

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">Liste d'IPP</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
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
            {ippList.length} IPP détectés.
          </Typography>

          <Grid className={classes.inputItem}>
            <InputSearchDocumentSimple
              placeholder="Ajouter une liste d'IPP"
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
            <Button onClick={goBack} variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} disabled={error} type="submit" form="ipp-form" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default IPPForm
