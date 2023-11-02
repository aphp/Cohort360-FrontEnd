import React, { useState } from 'react'

import {
  Alert,
  Autocomplete,
  Button,
  Divider,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography
} from '@mui/material'

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchMedication } from 'state/medication'
import { CriteriaItemDataCache, CriteriaName, HierarchyTree } from 'types'
import OccurrencesNumberInputs from '../../../AdvancedInputs/OccurrencesInputs/OccurrenceNumberInputs'
import AsyncAutocomplete from 'components/ui/Inputs/AsyncAutocomplete'
import services from 'services/aphp'
import { MedicationDataType } from 'types/requestCriterias'
import { displaySystem } from 'utils/displayValueSetSystem'

type MedicationFormProps = {
  isOpen: boolean
  isEdition: boolean
  criteriaData: CriteriaItemDataCache
  selectedCriteria: MedicationDataType
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const MedicationForm: React.FC<MedicationFormProps> = (props) => {
  const { isOpen, isEdition, criteriaData, selectedCriteria, onChangeValue, onChangeSelectedCriteria, goBack } = props

  const { classes } = useStyles()
  const dispatch = useAppDispatch()

  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const currentState = { ...selectedCriteria, ...initialState }
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))

  const getMedicationOptions = async (searchValue: string, signal: AbortSignal) => {
    const response = await services.cohortCreation.fetchMedicationData(searchValue, false, signal)
    return response.map((elem) => {
      return { ...elem, label: displaySystem(elem.system) + elem.label }
    })
  }

  const _onSubmit = () => {
    onChangeSelectedCriteria(currentState)
    dispatch(fetchMedication())
  }

  if (criteriaData?.data?.prescriptionTypes === 'loading' || criteriaData?.data?.administrations === 'loading') {
    return <></>
  }

  const selectedCriteriaPrescriptionType = currentState.prescriptionType
    ? currentState.prescriptionType.map((prescriptionType) => {
        const criteriaPrescriptionType = criteriaData.data.prescriptionTypes
          ? criteriaData.data.prescriptionTypes.find((p: any) => p.id === prescriptionType.id)
          : null
        return {
          id: prescriptionType.id,
          label: prescriptionType.label ? prescriptionType.label : criteriaPrescriptionType?.label ?? '?'
        }
      })
    : []

  const selectedCriteriaAdministration = currentState.administration
    ? currentState.administration.map((administration) => {
        const criteriaAdministration = criteriaData.data.administrations
          ? criteriaData.data.administrations.find((p: any) => p.id === administration.id)
          : null
        return {
          id: administration.id,
          label: administration.label ? administration.label : criteriaAdministration?.label ?? '?'
        }
      })
    : []

  const defaultValuesCode = currentState.code
    ? currentState.code.map((code: any) => {
        const criteriaCode = criteriaData.data.medicationData
          ? criteriaData.data.medicationData.find((g: any) => g.id === code.id)
          : null
        return {
          id: code.id,
          label: code.label ? code.label : criteriaCode?.label ?? '?',
          system: code.system ? code.system : criteriaCode?.system ?? '?'
        }
      })
    : []

  return isOpen ? (
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
        {!multiFields && (
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
            variant="outlined"
            value={currentState.title}
            onChange={(e) => onChangeValue('title', e.target.value)}
          />
          <Grid style={{ display: 'flex' }}>
            <FormLabel
              onClick={() => onChangeValue('isInclusive', !currentState.isInclusive)}
              style={{ margin: 'auto 1em' }}
              component="legend"
            >
              Exclure les patients qui suivent les règles suivantes
            </FormLabel>
            <Switch
              id="criteria-inclusive"
              checked={!currentState.isInclusive}
              onChange={(event) => onChangeValue('isInclusive', !event.target.checked)}
              color="secondary"
            />
          </Grid>
          <OccurrencesNumberInputs
            form={CriteriaName.Medication}
            selectedCriteria={currentState}
            onChangeValue={onChangeValue}
          />
          <Grid style={{ display: 'flex' }}>
            <RadioGroup
              row
              style={{ justifyContent: 'space-around' }}
              className={classes.inputItem}
              aria-label="mode"
              name="criteria-mode-radio"
              value={currentState.type}
              onChange={(e, value) => onChangeValue('type', value)}
            >
              <FormControlLabel value="MedicationRequest" control={<Radio color="secondary" />} label="Prescription" />
              <FormControlLabel
                value="MedicationAdministration"
                control={<Radio color="secondary" />}
                label="Administration"
              />
            </RadioGroup>
          </Grid>

          <AsyncAutocomplete
            label="Code(s) sélectionné(s)"
            variant="outlined"
            noOptionsText="Veuillez entrer un code de médicament"
            className={classes.inputItem}
            values={defaultValuesCode}
            onFetch={getMedicationOptions}
            onChange={(value) => {
              onChangeValue('code', value)
            }}
          />
          {currentState.type === 'MedicationRequest' && (
            <Autocomplete
              multiple
              id="criteria-prescription-type-autocomplete"
              className={classes.inputItem}
              options={criteriaData?.data?.prescriptionTypes || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={selectedCriteriaPrescriptionType}
              onChange={(e, value) => onChangeValue('prescriptionType', value)}
              renderInput={(params) => <TextField {...params} label="Type de prescription" />}
            />
          )}
          <Autocomplete
            multiple
            id="criteria-prescription-type-autocomplete"
            className={classes.inputItem}
            options={criteriaData.data.administrations || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selectedCriteriaAdministration}
            onChange={(e, value) => onChangeValue('administration', value)}
            renderInput={(params) => <TextField {...params} label="Voie d'administration" />}
          />
          <AdvancedInputs
            form={CriteriaName.Medication}
            selectedCriteria={currentState}
            onChangeValue={onChangeValue}
          />
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} type="submit" form="medication-form" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <></>
  )
}

export default MedicationForm
