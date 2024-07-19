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
  Tooltip,
  Typography
} from '@mui/material'

import InfoIcon from '@mui/icons-material/Info'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchMedication } from 'state/medication'
import { CriteriaItemDataCache, HierarchyElementWithSystem, HierarchyTree } from 'types'
import AsyncAutocomplete from 'components/ui/Inputs/AsyncAutocomplete'
import services from 'services/aphp'
import { Comparators, CriteriaType, MedicationDataType, SelectedCriteriaType } from 'types/requestCriterias'
import { displaySystem } from 'utils/displayValueSetSystem'
import { BlockWrapper } from 'components/ui/Layout'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'

type MedicationFormProps = {
  isOpen: boolean
  isEdition: boolean
  criteriaData: CriteriaItemDataCache
  selectedCriteria: MedicationDataType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChangeValue: (key: string, value: any) => void
  goBack: () => void
  onChangeSelectedCriteria: (data: SelectedCriteriaType) => void
}

enum Error {
  ADVANCED_INPUTS_ERROR,
  NO_ERROR
}

const MedicationForm: React.FC<MedicationFormProps> = (props) => {
  const { isOpen, isEdition, criteriaData, selectedCriteria, onChangeValue, onChangeSelectedCriteria, goBack } = props

  const { classes } = useStyles()
  const dispatch = useAppDispatch()

  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const currentState = { ...selectedCriteria, ...initialState }
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const [occurrence, setOccurrence] = useState(currentState.occurrence || 1)
  const [occurrenceComparator, setOccurrenceComparator] = useState(
    currentState.occurrenceComparator || Comparators.GREATER_OR_EQUAL
  )
  const [error, setError] = useState(Error.NO_ERROR)

  const getMedicationOptions = async (searchValue: string, signal: AbortSignal) => {
    const response = await services.cohortCreation.fetchMedicationData(searchValue, false, signal)
    return response.map((elem) => {
      return { ...elem, label: displaySystem(elem.system) + elem.label }
    })
  }

  const _onSubmit = () => {
    onChangeSelectedCriteria({ ...currentState, occurrence: occurrence, occurrenceComparator: occurrenceComparator })
    dispatch(fetchMedication())
  }

  if (criteriaData?.data?.prescriptionTypes === 'loading' || criteriaData?.data?.administrations === 'loading') {
    return <></>
  }

  const selectedCriteriaPrescriptionType =
    currentState.type === CriteriaType.MEDICATION_REQUEST && currentState.prescriptionType
      ? currentState.prescriptionType.map((prescriptionType) => {
          const criteriaPrescriptionType = criteriaData.data.prescriptionTypes
            ? criteriaData.data.prescriptionTypes.find((p: Hierarchy<any, any>) => p.id === prescriptionType.id)
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
          ? criteriaData.data.administrations.find((p: Hierarchy<any, any>) => p.id === administration.id)
          : null
        return {
          id: administration.id,
          label: administration.label ? administration.label : criteriaAdministration?.label ?? '?'
        }
      })
    : []

  const defaultValuesCode = currentState.code
    ? currentState.code.map((code: HierarchyElementWithSystem) => {
        const criteriaCode = criteriaData.data.medicationData
          ? criteriaData.data.medicationData.find((g: HierarchyElementWithSystem) => g.id === code.id)
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
          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              <BlockWrapper container justifyItems="center">
                Nombre d'occurrences
                <Tooltip
                  title={
                    <span>
                      Si vous choisissez un chapitre, le nombre d'occurrences ne s'applique pas sur un unique élément de
                      ce chapitre, mais sur l'ensemble des éléments de ce chapitre. <br /> Exemple: Nombre d'occurrences
                      &ge; 3 sur un chapitre signifie que l'on inclus les patients qui ont eu au moins 3 éléments de ce
                      chapitre, distincts ou non`
                    </span>
                  }
                >
                  <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
                </Tooltip>
              </BlockWrapper>
            </FormLabel>
            <OccurenceInput
              value={occurrence}
              comparator={occurrenceComparator}
              onchange={(newOccurence, newComparator) => {
                setOccurrence(newOccurence)
                setOccurrenceComparator(newComparator)
              }}
            />
          </BlockWrapper>
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
          {currentState.type === CriteriaType.MEDICATION_REQUEST && (
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
          <Autocomplete
            multiple
            options={criteriaData.data.encounterStatus || []}
            noOptionsText="Veuillez entrer un statut de visite associée"
            className={classes.inputItem}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={currentState.encounterStatus}
            onChange={(e, value) => onChangeValue('encounterStatus', value)}
            renderInput={(params) => <TextField {...params} label="Statut de la visite associée" />}
          />
          <AdvancedInputs
            sourceType={SourceType.MEDICATION}
            selectedCriteria={currentState}
            onChangeValue={onChangeValue}
            onError={(isError) => setError(isError ? Error.ADVANCED_INPUTS_ERROR : Error.NO_ERROR)}
          />
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} variant="outlined">
              Annuler
            </Button>
          )}
          <Button
            onClick={_onSubmit}
            type="submit"
            form="medication-form"
            variant="contained"
            disabled={error === Error.ADVANCED_INPUTS_ERROR}
          >
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
