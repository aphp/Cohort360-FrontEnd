import React, { useState } from 'react'

import { Autocomplete, Alert } from '@material-ui/lab'
import { Button, Divider, FormLabel, Grid, IconButton, Switch, Typography, TextField } from '@material-ui/core'

import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { InputAutocompleteAsync as AutocompleteAsync } from 'components/Inputs'

import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'

import useStyles from './styles'

type Cim10FormProps = {
  isEdition?: boolean
  criteria: any
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const Cim10Form: React.FC<Cim10FormProps> = (props) => {
  const { isEdition, criteria, selectedCriteria, onChangeValue, onChangeSelectedCriteria, goBack } = props

  const classes = useStyles()

  const [error, setError] = useState(false)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))

  const _onSubmit = () => {
    if (selectedCriteria?.code?.length === 0 && selectedCriteria?.diagnosticType?.length === 0) {
      return setError(true)
    }
    onChangeSelectedCriteria(selectedCriteria)
  }

  const getDiagOptions = async (searchValue: string) => await criteria.fetch.fetchCim10Diagnostic(searchValue, false)

  if (
    criteria?.data?.diagnosticTypes === 'loading' ||
    criteria?.data?.statusDiagnostic === 'loading' ||
    criteria?.data?.cim10Diagnostic === 'loading'
  ) {
    return <> </>
  }

  const defaultValuesCode = selectedCriteria.code
    ? selectedCriteria.code.map((code: any) => {
        const criteriaCode = criteria.data.cim10Diagnostic
          ? criteria.data.cim10Diagnostic.find((c: any) => c.id === code.id)
          : null
        return {
          id: code.id,
          label: code.label ? code.label : criteriaCode?.label ?? '?'
        }
      })
    : []
  const defaultValuesType = selectedCriteria.diagnosticType
    ? selectedCriteria.diagnosticType.map((diagnosticType: any) => {
        const criteriaType = criteria.data.diagnosticTypes
          ? criteria.data.diagnosticTypes.find((g: any) => g.id === diagnosticType.id)
          : null
        return {
          id: diagnosticType.id,
          label: diagnosticType.label ? diagnosticType.label : criteriaType?.label ?? '?'
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
            <Typography className={classes.titleLabel}>Ajouter un critère de diagnostic</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de diagnostic</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        {error && <Alert severity="error">Merci de renseigner au moins un code ou un type de diagnostic</Alert>}

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
          <Typography variant="h6">Diagnostic</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            defaultValue="Critères de diagnostic"
            variant="outlined"
            value={selectedCriteria.title}
            onChange={(e) => onChangeValue('title', e.target.value)}
          />

          <Grid style={{ display: 'flex' }}>
            <FormLabel
              onClick={() => onChangeValue('isInclusive', !selectedCriteria.isInclusive)}
              style={{ margin: 'auto 1em' }}
              component="legend"
            >
              Exclure les patients qui suivent les règles suivantes
            </FormLabel>
            <Switch
              id="criteria-inclusive"
              checked={!selectedCriteria.isInclusive}
              onChange={(event) => onChangeValue('isInclusive', !event.target.checked)}
            />
          </Grid>

          <AutocompleteAsync
            multiple
            label="Code CIM10"
            variant="outlined"
            noOptionsText="Veuillez entrer un code ou un diagnostic CIM10"
            className={classes.inputItem}
            autocompleteValue={defaultValuesCode}
            autocompleteOptions={criteria?.data?.cim10Diagnostic || []}
            getAutocompleteOptions={getDiagOptions}
            onChange={(e, value) => onChangeValue('code', value)}
          />

          <Autocomplete
            multiple
            id="criteria-cim10-type-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.diagnosticTypes || []}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.id === value.id}
            value={defaultValuesType}
            onChange={(e, value) => onChangeValue('diagnosticType', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Type de diagnostic" />}
          />

          <AdvancedInputs form="cim10" selectedCriteria={selectedCriteria} onChangeValue={onChangeValue} />
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} color="primary" variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} type="submit" form="cim10-form" color="primary" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Cim10Form
