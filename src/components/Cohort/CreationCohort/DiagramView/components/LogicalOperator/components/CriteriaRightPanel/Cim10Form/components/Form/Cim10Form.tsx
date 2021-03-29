import React, { useState } from 'react'

import { Autocomplete, Alert } from '@material-ui/lab'
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
  Select
} from '@material-ui/core'

import ClearIcon from '@material-ui/icons/Clear'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { InputAutocompleteAsync as AutocompleteAsync } from 'components/Inputs'

import useStyles from './styles'

type Cim10FormProps = {
  isEdition?: boolean
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const Cim10Form: React.FC<Cim10FormProps> = (props) => {
  const { isEdition, criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const classes = useStyles()

  const [error, setError] = useState(false)
  const [defaultValues, setDefaultValues] = useState(selectedCriteria)

  const _onSubmit = () => {
    if (defaultValues?.code?.length === 0 && defaultValues?.diagnosticType?.length === 0) {
      return setError(true)
    }
    onChangeSelectedCriteria(defaultValues)
  }

  const _onChangeValue = (key: string, value: any) => {
    const _defaultValues = defaultValues ? { ...defaultValues } : {}
    _defaultValues[key] = value
    setDefaultValues(_defaultValues)
  }

  // const getDiagOptions = async (searchValue: string) => await criteria.fetch.fetchCim10Diagnostic(searchValue)

  if (
    criteria?.data?.diagnosticTypes === 'loading' ||
    criteria?.data?.statusDiagnostic === 'loading' ||
    criteria?.data?.cim10Diagnostic === 'loading'
  ) {
    return <> </>
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
        {error && <Alert severity="error">Merci de renseigner au moins un code ou un type de diagnostic</Alert>}

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">Diagnostic</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            defaultValue="Critère de diagnostic"
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

          <AutocompleteAsync
            multiple
            options={[]}
            className={classes.inputItem}
            autocompleteOptions={criteria?.data?.cim10Diagnostic || []}
            getOptionLabel={(option) => option.label}
            defaultValue={defaultValues.code}
            onChange={(e, value) => _onChangeValue('code', value)}
            renderInput={(params: any) => <TextField {...params} variant="outlined" label="Code CIM10" />}
          />

          <AutocompleteAsync
            multiple
            id="criteria-cim10-type-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.diagnosticTypes || []}
            getOptionLabel={(option) => option.label}
            defaultValue={defaultValues.diagnosticType}
            onChange={(e, value) => _onChangeValue('diagnosticType', value)}
            renderInput={(params: any) => <TextField {...params} variant="outlined" label="Type de diagnostic" />}
          />

          <FormLabel style={{ padding: '0 1em 8px' }} component="legend">
            Nombre d'occurrence
          </FormLabel>

          <Grid style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', margin: '0 1em' }}>
            <Select
              style={{ marginRight: '1em' }}
              id="criteria-occurrenceComparator-select"
              value={defaultValues.occurrenceComparator}
              onChange={(e, value) => _onChangeValue('occurrenceComparator', value)}
              variant="outlined"
            >
              <MenuItem value={'<='}>{'<='}</MenuItem>
              <MenuItem value={'<'}>{'<'}</MenuItem>
              <MenuItem value={'='}>{'='}</MenuItem>
              <MenuItem value={'>'}>{'>'}</MenuItem>
              <MenuItem value={'>='}>{'>='}</MenuItem>
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
          <Button onClick={_onSubmit} type="submit" form="cim10-form" color="primary" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Cim10Form
