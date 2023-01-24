import React, { useState, useEffect } from 'react'
import _ from 'lodash'

import { Alert } from '@material-ui/lab'
import {
  Button,
  Divider,
  FormLabel,
  Grid,
  IconButton,
  Switch,
  Typography,
  TextField,
  Checkbox,
  CircularProgress
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import AdvancedInputs from '../AdvancedInputs/AdvancedInputs'

import { InputSearchDocument } from 'components/Inputs'

import useStyles from './styles'

import { DocType, DocumentDataType, errorDetails, searchInputError } from 'types'
import services from 'services'
import { useDebounce } from 'utils/debounce'

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

  const [searchCheckingLoading, setSearchCheckingLoading] = useState(false)

  const [searchInputError, setSearchInputError] = useState<searchInputError | undefined>(undefined)

  const debouncedSearchItem = useDebounce(500, defaultValues.search)

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = () => {
    if (defaultValues && defaultValues.search?.length === 0 && defaultValues.docType?.length === 0) {
      return setError(true)
    }
    onChangeSelectedCriteria(defaultValues)
  }

  const _onChangeValue = (key: string, value: any) => {
    const _defaultValues = defaultValues ? { ...defaultValues } : {}
    _defaultValues[key] = value
    setDefaultValues(_defaultValues)
  }

  useEffect(() => {
    const checkDocumentSearch = async () => {
      try {
        setSearchCheckingLoading(true)
        setSearchInputError({ ...searchInputError, isError: true })
        const checkDocumentSearch = await services.cohorts.checkDocumentSearchInput(defaultValues.search)

        setSearchInputError(checkDocumentSearch)
        setSearchCheckingLoading(false)
      } catch (error) {
        console.error('Erreur lors de la vérification du champ de recherche', error)
        setSearchCheckingLoading(false)
      }
    }

    checkDocumentSearch()
  }, [debouncedSearchItem])

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
              defaultSearchInput={defaultValues.search}
              setDefaultSearchInput={(newSearchInput: string) => _onChangeValue('search', newSearchInput)}
              onSearchDocument={() => null}
              noClearIcon
              noSearchIcon
              squareInput
            />
            {searchCheckingLoading && (
              <Grid container item alignItems="center" direction="column" justifyContent="center">
                <CircularProgress />
                <Typography>Vérification du champ de recherche en cours...</Typography>
              </Grid>
            )}
            {!searchCheckingLoading && searchInputError && searchInputError.isError && (
              <Grid className={classes.errorContainer}>
                <Typography style={{ fontWeight: 'bold' }}>
                  Des erreurs ont été détectées dans votre recherche :
                </Typography>
                {!searchInputError.errorsDetails && (
                  <Typography>Vérifiez que le champ de recherche contient au moins une lettre.</Typography>
                )}
                {searchInputError.errorsDetails &&
                  searchInputError.errorsDetails.map((detail: errorDetails, count: number) => (
                    <Typography key={count}>
                      {`- ${
                        detail.errorPositions && detail.errorPositions.length > 0
                          ? detail.errorPositions.length === 1
                            ? `Au caractère ${detail.errorPositions[0]} : `
                            : `Aux caractères ${detail.errorPositions.join(', ')} : `
                          : ''
                      }
              ${detail.errorName ? `${detail.errorName}.` : ''}
              ${detail.errorSolution ? `${detail.errorSolution}.` : ''}`}
                    </Typography>
                  ))}
              </Grid>
            )}
          </Grid>

          <Autocomplete
            multiple
            id="criteria-doc-type-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.docTypes || []}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => _.isEqual(option, value)}
            value={defaultValues.docType}
            onChange={(e, value) => _onChangeValue('docType', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Types de documents" />}
            groupBy={(doctype) => doctype.type}
            disableCloseOnSelect
            renderGroup={(docType: any) => {
              const currentDocTypeList = criteria?.data?.docTypes
                ? criteria?.data?.docTypes.filter((doc: DocType) => doc.type === docType.group)
                : []

              const currentSelectedDocTypeList = defaultValues.docType
                ? defaultValues.docType.filter((doc: DocType) => doc.type === docType.group)
                : []

              const onClick = () => {
                if (currentDocTypeList.length === currentSelectedDocTypeList.length) {
                  _onChangeValue(
                    'docType',
                    defaultValues.docType.filter((doc: DocType) => doc.type !== docType.group)
                  )
                } else {
                  _onChangeValue('docType', _.uniqWith([...defaultValues.docType, ...currentDocTypeList], _.isEqual))
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
            disabled={searchInputError?.isError}
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
