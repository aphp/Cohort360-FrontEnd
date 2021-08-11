import React, { useState } from 'react'

import { Alert } from '@material-ui/lab'
import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  Input,
  InputLabel,
  IconButton,
  MenuItem,
  Switch,
  Typography,
  TextField,
  Select,
  Checkbox
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

import InfoIcon from '@material-ui/icons/Info'
import ClearIcon from '@material-ui/icons/Clear'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import DocumentSearchHelp from 'components/DocumentSearchHelp/DocumentSearchHelp'

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
  docType: [],
  occurrence: 1,
  occurrenceComparator: '>=',
  startOccurrence: null,
  endOccurrence: null,
  isInclusive: true
}

const CompositionForm: React.FC<TestGeneratedFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const classes = useStyles()

  const [helpOpen, setHelpOpen] = useState(false)
  const [error, setError] = useState(false)
  const [defaultValues, setDefaultValues] = useState(selectedCriteria || defaultComposition)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))

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
            <Typography className={classes.titleLabel}>Ajouter un critère de document médicaux</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de document médicaux</Typography>
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
            defaultValue="Critère de document"
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

          <Grid style={{ display: 'flex' }}>
            <TextField
              required
              className={classes.inputItem}
              id="criteria-search-required"
              placeholder="Recherche dans les documents"
              variant="outlined"
              value={defaultValues.search}
              onChange={(e) => _onChangeValue('search', e.target.value)}
            />

            <IconButton type="submit" onClick={() => setHelpOpen(true)} style={{ outline: 'none' }}>
              <InfoIcon />
            </IconButton>
            <DocumentSearchHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
          </Grid>

          <Autocomplete
            multiple
            id="criteria-doc-type-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.docTypes || []}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.id === value.id}
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

          <FormLabel style={{ padding: '0 1em 8px' }} component="legend">
            Nombre d'occurrence
          </FormLabel>

          <Grid style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', margin: '0 1em' }}>
            <Select
              style={{ marginRight: '1em' }}
              id="criteria-occurrenceComparator-select"
              value={defaultValues.occurrenceComparator}
              onChange={(event) => _onChangeValue('occurrenceComparator', event.target.value as string)}
              variant="outlined"
            >
              <MenuItem value="<=">{'<='}</MenuItem>
              <MenuItem value="<">{'<'}</MenuItem>
              <MenuItem value="=">{'='}</MenuItem>
              <MenuItem value=">">{'>'}</MenuItem>
              <MenuItem value=">=">{'>='}</MenuItem>
            </Select>

            <TextField
              required
              inputProps={{
                min: 1
              }}
              type="number"
              id="criteria-occurrence-required"
              variant="outlined"
              value={defaultValues.occurrence}
              onChange={(e) => _onChangeValue('occurrence', e.target.value)}
            />
          </Grid>

          <FormLabel style={{ padding: '1em 1em 0 1em' }} component="legend">
            Date d'occurrence
          </FormLabel>

          <Grid style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <FormControl className={classes.inputItem}>
              <InputLabel shrink htmlFor="date-start-occurrence">
                Avant le
              </InputLabel>
              <Input
                id="date-start-occurrence"
                type="date"
                value={defaultValues.startOccurrence}
                endAdornment={
                  <IconButton size="small" onClick={() => _onChangeValue('startOccurrence', '')}>
                    <ClearIcon />
                  </IconButton>
                }
                onChange={(e) => _onChangeValue('startOccurrence', e.target.value)}
              />
            </FormControl>

            <FormControl className={classes.inputItem}>
              <InputLabel shrink htmlFor="date-end-occurrence">
                Après le
              </InputLabel>
              <Input
                id="date-end-occurrence"
                type="date"
                value={defaultValues.endOccurrence}
                endAdornment={
                  <IconButton size="small" onClick={() => _onChangeValue('endOccurrence', '')}>
                    <ClearIcon />
                  </IconButton>
                }
                onChange={(e) => _onChangeValue('endOccurrence', e.target.value)}
              />
            </FormControl>
          </Grid>
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} color="primary" variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} type="submit" form="documents-form" color="primary" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default CompositionForm
