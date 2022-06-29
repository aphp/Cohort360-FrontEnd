import React, { useState, useMemo } from 'react'

import { Alert } from '@mui/lab'
import { Button, Divider, FormLabel, Grid, IconButton, Switch, Typography, TextField, Checkbox } from '@mui/material'
import Autocomplete from '@mui/lab/Autocomplete'

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import AdvancedInputs from '../AdvancedInputs/AdvancedInputs'

import { InputSearchDocument } from 'components/Inputs'

import { debounce } from 'utils/debounce'

import useStyles from './styles'

import { DocumentDataType } from 'types'

type TestGeneratedFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultComposition: DocumentDataType = {
  type: 'Composition',
  title: 'Critère de document',
  search: '',
  regex_search: '',
  docType: [],
  occurrence: 1,
  occurrenceComparator: '>=',
  encounterEndDate: '',
  encounterStartDate: '',
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true
}

const CompositionForm: React.FC<TestGeneratedFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const classes = useStyles()

  const [error, setError] = useState(false)
  const [defaultValues, setDefaultValues] = useState(selectedCriteria || defaultComposition)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const [inputMode, setInputMode] = useState<'simple' | 'regex'>(defaultValues.regex_search ? 'regex' : 'simple')
  const [errorRegex, setErrorRegex] = useState(false)

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = () => {
    if (
      defaultValues &&
      defaultValues.search?.length === 0 &&
      defaultValues.regex_search?.length === 0 &&
      defaultValues.docType?.length === 0
    ) {
      return setError(true)
    }
    onChangeSelectedCriteria(defaultValues)
  }

  const checkRegex = useMemo(() => {
    return debounce((query: string) => {
      try {
        // Try to create regex
        new RegExp(query)
        if (query.search(/\\$/) !== -1 && query.search(/\\\\$/) === -1) {
          // If query contain '\' but no '\\', set error variable
          setErrorRegex(true)
          return
        }
        setErrorRegex(false)
      } catch (error) {
        // If error, set error variable
        setErrorRegex(true)
      }
    }, 750)
  }, [])

  const _onChangeValue = (key: string, value: any) => {
    const _defaultValues = defaultValues ? { ...defaultValues } : {}
    _defaultValues[key] = value
    setDefaultValues(_defaultValues)

    if (key === 'regex_search' && inputMode === 'regex') {
      checkRegex(value)
    }
  }

  const defaultValuesDocType = defaultValues.docType
    ? defaultValues.docType.map((docType: any) => {
        const criteriaDocType = criteria.data.docTypes
          ? criteria.data.docTypes.find((g: any) => g.id === docType.id)
          : null
        return {
          id: docType.id,
          label: docType.label ? docType.label : criteriaDocType?.label ?? '?',
          type: docType.type
        }
      })
    : []

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
        {error && <Alert severity="error">Merci de renseigner au moins une recherche, ou un type de document</Alert>}

        {!error && !multiFields && (
          <Alert
            severity="info"
            onClose={() => {
              localStorage.setItem('multiple_fields', 'ok')
              setMultiFields('ok')
            }}
          >
            Tous les éléments des champs multiples sont liés par une contrainte OU
          </Alert>
        )}

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">Documents médicaux</Typography>

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

          <Grid className={classes.inputItem}>
            <InputSearchDocument
              placeholder="Recherche dans les documents"
              defaultSearchInput={inputMode === 'simple' ? defaultValues.search : defaultValues.regex_search}
              setDefaultSearchInput={(newSearchInput: string) =>
                _onChangeValue(inputMode === 'simple' ? 'search' : 'regex_search', newSearchInput)
              }
              defaultInputMode={inputMode}
              setdefaultInputMode={(newInputMode: 'simple' | 'regex') => {
                setInputMode(newInputMode)
                setDefaultValues((prevState: any) => ({
                  ...prevState,
                  search: newInputMode !== 'simple' ? '' : prevState.regex_search,
                  regex_search: newInputMode === 'simple' ? '' : prevState.search
                }))
              }}
              onSearchDocument={() => null}
              noClearIcon
              noSearchIcon
              sqareInput
            />
          </Grid>

          <Autocomplete
            multiple
            id="criteria-doc-type-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.docTypes || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={defaultValuesDocType}
            onChange={(e, value) => _onChangeValue('docType', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Type de document" />}
            groupBy={(doctype) => doctype.type}
            disableCloseOnSelect
            renderGroup={(docType: any) => {
              const currentDocTypeList = criteria?.data?.docTypes
                ? criteria?.data?.docTypes.filter((doc: any) => doc.type === docType.group)
                : []
              const currentSelectedDocTypeList = defaultValuesDocType
                ? defaultValuesDocType.filter((doc: any) => doc.type === docType.group)
                : []

              const onClick = () => {
                if (currentDocTypeList.length === currentSelectedDocTypeList.length) {
                  _onChangeValue(
                    'docType',
                    defaultValuesDocType.filter((doc: any) => doc.type !== docType.group)
                  )
                } else {
                  _onChangeValue(
                    'docType',
                    [...defaultValuesDocType, ...currentDocTypeList].filter(
                      (item, index, array) => array.indexOf(item) === index
                    )
                  )
                }
              }

              return (
                <React.Fragment>
                  <Grid container direction="row" alignItems="center">
                    <Checkbox
                      indeterminate={
                        currentDocTypeList.length !== currentSelectedDocTypeList.length &&
                        currentSelectedDocTypeList.length > 0
                      }
                      color="primary"
                      checked={currentDocTypeList.length === currentSelectedDocTypeList.length}
                      onClick={onClick}
                    />
                    <Typography onClick={onClick} noWrap style={{ cursor: 'pointer', width: 'calc(100% - 150px' }}>
                      {docType.group}
                    </Typography>
                  </Grid>
                  {docType.children}
                </React.Fragment>
              )
            }}
          />

          <AdvancedInputs form="document" selectedCriteria={defaultValues} onChangeValue={_onChangeValue} />
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} color="primary" variant="outlined">
              Annuler
            </Button>
          )}
          <Button
            onClick={_onSubmit}
            disabled={errorRegex}
            type="submit"
            form="documents-form"
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

export default CompositionForm
