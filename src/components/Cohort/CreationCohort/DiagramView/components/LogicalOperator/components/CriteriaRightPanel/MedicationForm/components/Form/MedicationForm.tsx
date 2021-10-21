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

import { InputAutocompleteAsync as AutocompleteAsync } from 'components/Inputs'

import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'

import useStyles from './styles'

type MedicationFormProps = {
  isEdition: boolean
  criteria: any
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const MedicationForm: React.FC<MedicationFormProps> = (props) => {
  const { isEdition, criteria, selectedCriteria, onChangeValue, goBack, onChangeSelectedCriteria } = props

  const classes = useStyles()

  const [error, setError] = useState(false)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))

  const getAtcOptions = async (searchValue: string) => await criteria.fetch.fetchAtcData(searchValue, false)

  const _onSubmit = () => {
    if (
      (selectedCriteria.type === 'MedicationRequest' &&
        selectedCriteria.code.length === 0 &&
        selectedCriteria.prescriptionType.length === 0 &&
        selectedCriteria.administration.length === 0) ||
      (selectedCriteria.type !== 'MedicationRequest' &&
        selectedCriteria.code.length === 0 &&
        selectedCriteria.administration.length === 0)
    ) {
      return setError(true)
    }

    onChangeSelectedCriteria(selectedCriteria)
  }

  if (criteria?.data?.prescriptionTypes === 'loading' || criteria?.data?.administrations === 'loading') {
    return <></>
  }

  const selectedCriteriaPrescriptionType = selectedCriteria.prescriptionType
    ? selectedCriteria.prescriptionType.map((prescriptionType: any) => {
        const criteriaPrescriptionType = criteria.data.prescriptionTypes
          ? criteria.data.prescriptionTypes.find((p: any) => p.id === prescriptionType.id)
          : null
        return {
          id: prescriptionType.id,
          label: prescriptionType.label ? prescriptionType.label : criteriaPrescriptionType?.label ?? '?'
        }
      })
    : []

  const selectedCriteriaAdministration = selectedCriteria.administration
    ? selectedCriteria.administration.map((administration: any) => {
        const criteriaAdministration = criteria.data.administrations
          ? criteria.data.administrations.find((p: any) => p.id === administration.id)
          : null
        return {
          id: administration.id,
          label: administration.label ? administration.label : criteriaAdministration?.label ?? '?'
        }
      })
    : []

  const defaultValuesCode = selectedCriteria.code
    ? selectedCriteria.code.map((code: any) => {
        const criteriaCode = criteria.data.atcData ? criteria.data.atcData.find((g: any) => g.id === code.id) : null
        return {
          id: code.id,
          label: code.label ? code.label : criteriaCode?.label ?? '?'
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

          <Grid style={{ display: 'flex' }}>
            <RadioGroup
              row
              style={{ justifyContent: 'space-around' }}
              className={classes.inputItem}
              aria-label="mode"
              name="criteria-mode-radio"
              value={selectedCriteria.type}
              onChange={(e, value) => onChangeValue('type', value)}
            >
              <FormControlLabel value="MedicationRequest" control={<Radio />} label="Prescription" />
              {/* <FormControlLabel value="dispensation" control={<Radio />} label="Dispensation" /> */}
              <FormControlLabel value="MedicationAdministration" control={<Radio />} label="Administration" />
            </RadioGroup>
          </Grid>

          <AutocompleteAsync
            multiple
            label="Codes ATC / UCD"
            variant="outlined"
            noOptionsText="Veuillez entrer un code ou un critère ATC / UCD"
            className={classes.inputItem}
            autocompleteValue={defaultValuesCode}
            autocompleteOptions={criteria?.data?.atcData || []}
            getAutocompleteOptions={getAtcOptions}
            onChange={(e, value) => onChangeValue('code', value)}
          />

          {selectedCriteria.type === 'MedicationRequest' && (
            <Autocomplete
              multiple
              id="criteria-prescription-type-autocomplete"
              className={classes.inputItem}
              options={criteria?.data?.prescriptionTypes || []}
              getOptionLabel={(option) => option.label}
              getOptionSelected={(option, value) => option.id === value.id}
              value={selectedCriteriaPrescriptionType}
              onChange={(e, value) => onChangeValue('prescriptionType', value)}
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
            value={selectedCriteriaAdministration}
            onChange={(e, value) => onChangeValue('administration', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Voie d'aministration" />}
          />

          <AdvancedInputs form="medication" selectedCriteria={selectedCriteria} onChangeValue={onChangeValue} />
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
