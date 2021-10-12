import React, { useState } from 'react'

import { Alert, Autocomplete } from '@material-ui/lab'
import {
  Button,
  Divider,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Switch,
  Typography,
  TextField
} from '@material-ui/core'

import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import AdvancedInputs from '../AdvancedInputs/AdvancedInputs'

import useStyles from './styles'

import { MedicationDataType } from 'types'

type MedicationFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultMedication: MedicationDataType = {
  type: 'Medication',
  title: 'Critère de médicament',
  mode: 'prescription',
  prescriptionType: [],
  administration: [],
  occurrence: 1,
  occurrenceComparator: '>=',
  startOccurrence: null,
  endOccurrence: null,
  isInclusive: true
}

const MedicationForm: React.FC<MedicationFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const [defaultValues, setDefaultValues] = useState(selectedCriteria || defaultMedication)

  const classes = useStyles()

  const [error, setError] = useState(false)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = () => {
    if (
      defaultValues.mode === 'prescription' &&
      defaultValues.prescriptionType.length === 0 &&
      defaultValues.administration.length === 0 &&
      defaultValues.encounterStartDate === null &&
      defaultValues.encounterEndDate === null
    ) {
      return setError(true)
    }

    onChangeSelectedCriteria(defaultValues)
  }

  const _onChangeValue = (key: string, value: any) => {
    const _defaultValues = defaultValues ? { ...defaultValues } : {}
    _defaultValues[key] = value
    setDefaultValues(_defaultValues)
  }

  if (criteria?.data?.prescriptionTypes === 'loading' || criteria?.data?.administrations === 'loading') {
    return <></>
  }

  const defaultValuesPrescriptionType = defaultValues.prescriptionType
    ? defaultValues.prescriptionType.map((prescriptionType: any) => {
        const criteriaPrescriptionType = criteria.data.prescriptionTypes
          ? criteria.data.prescriptionTypes.find((p: any) => p.id === prescriptionType.id)
          : null
        return {
          id: prescriptionType.id,
          label: prescriptionType.label ? prescriptionType.label : criteriaPrescriptionType?.label ?? '?'
        }
      })
    : []

  const defaultValuesAdministration = defaultValues.administration
    ? defaultValues.administration.map((administration: any) => {
        const criteriaAdministration = criteria.data.administrations
          ? criteria.data.administrations.find((p: any) => p.id === administration.id)
          : null
        return {
          id: administration.id,
          label: administration.label ? administration.label : criteriaAdministration?.label ?? '?'
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
            <Typography className={classes.titleLabel}>Ajouter un critère de médicament</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de médicament</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        {error && <Alert severity="error">Merci de renseigner un champs</Alert>}

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
          <Typography variant="h6">Médicaments</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            defaultValue="Critère démographique"
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
            <RadioGroup
              row
              style={{ justifyContent: 'space-around' }}
              className={classes.inputItem}
              aria-label="mode"
              name="criteria-mode-radio"
              value={defaultValues.mode}
              onChange={(e, value) => _onChangeValue('mode', value)}
            >
              <FormControlLabel value="prescription" control={<Radio />} label="Prescription" />
              <FormControlLabel value="dispensation" control={<Radio />} label="Dispensation" />
              <FormControlLabel value="administration" control={<Radio />} label="Administration" />
            </RadioGroup>
          </Grid>

          {defaultValues.mode === 'prescription' && (
            <Autocomplete
              multiple
              id="criteria-prescription-type-autocomplete"
              className={classes.inputItem}
              options={criteria?.data?.prescriptionTypes || []}
              getOptionLabel={(option) => option.label}
              getOptionSelected={(option, value) => option.id === value.id}
              value={defaultValuesPrescriptionType}
              onChange={(e, value) => _onChangeValue('prescriptionType', value)}
              renderInput={(params) => <TextField {...params} variant="outlined" label="Type de prescription" />}
            />
          )}

          <Autocomplete
            multiple
            id="criteria-prescription-type-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.administrations || []}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.id === value.id}
            value={defaultValuesAdministration}
            onChange={(e, value) => _onChangeValue('prescriptionType', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Voie d'aministration" />}
          />

          <AdvancedInputs form="medication" selectedCriteria={defaultValues} onChangeValue={_onChangeValue} />
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} color="primary" variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} type="submit" form="supported-form" color="primary" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default MedicationForm
