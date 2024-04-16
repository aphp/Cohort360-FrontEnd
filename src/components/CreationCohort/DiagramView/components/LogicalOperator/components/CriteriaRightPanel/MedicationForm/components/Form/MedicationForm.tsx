import React, { useEffect, useState } from 'react'

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
import { CriteriaItemDataCache, HierarchyTree } from 'types'
import { Comparators, CriteriaType, MedicationDataType, SelectedCriteriaType } from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import { SourceType } from 'types/scope'
import { HierarchyWithLabel, HierarchyWithLabelAndSystem } from 'types/hierarchy'
import { SearchOutlined } from '@mui/icons-material'
import { Reference, References, ReferencesLabel } from 'types/searchValueSet'
import Panel from 'components/ui/Panel'
import SearchValueSet from 'components/SearchValueSet'
import { getConfig } from 'config'

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
  const [openCodeResearch, setOpenCodeResearch] = useState(false)

  useEffect(() => {
    if (currentState.type === CriteriaType.MEDICATION_ADMINISTRATION) {
      onChangeValue('endOccurrence', [null, null])
    }
  }, [currentState.type])

  /*const getMedicationOptions = async (searchValue: string, signal: AbortSignal) => {
    const response = await services.cohortCreation.fetchMedicationData(searchValue, false, signal)
    return response.map((elem) => {
      return { ...elem, label: displaySystem(elem.system) + elem.label }
    })
  }*/

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
            ? criteriaData.data.prescriptionTypes.find((p: HierarchyWithLabelAndSystem) => p.id === prescriptionType.id)
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
          ? criteriaData.data.administrations.find((p: HierarchyWithLabelAndSystem) => p.id === administration.id)
          : null
        return {
          id: administration.id,
          label: administration.label ? administration.label : criteriaAdministration?.label ?? '?'
        }
      })
    : []

  const defaultValuesCode = currentState.code
    ? currentState.code.map((code: HierarchyWithLabelAndSystem) => {
        const criteriaCode = criteriaData.data.medicationData
          ? criteriaData.data.medicationData.find((g: HierarchyWithLabelAndSystem) => g.id === code.id)
          : null
        return {
          id: code.id,
          label: code.label ? code.label : criteriaCode?.label ?? '?',
          system: code.system ? code.system : criteriaCode?.system ?? '?'
        }
      })
    : []
  const medicationReferences: Reference[] = [
    {
      id: References.ATC,
      title: 'Toute la hiérarchie',
      label: ReferencesLabel.ATC,
      standard: true,
      url: getConfig().features.medication.valueSets.medicationAtc.url,
      checked: true,
      isHierarchy: true,
      filterRoots: (code: HierarchyWithLabel) =>
        code.label.search(new RegExp(/^[A-Z] - /, 'gi')) !== -1 &&
        code.label.search(new RegExp(/^[X-Y] - /, 'gi')) !== 0
    },
    {
      id: References.UCD,
      title: 'Toute la hiérarchie',
      label: ReferencesLabel.UCD,
      standard: true,
      url: getConfig().features.medication.valueSets.medicationUcd.url,
      checked: true,
      isHierarchy: false,
      filterRoots: () => true
    } /*,
    {
      id: References.UCD_13,
      label: ReferencesLabel.UCD_13,
      standard: false,
      url: `${MEDICATION_UCD_13}`,
      checked: false,
      isHierarchy: false,
      filterRoots: () => true
    }*/
  ]

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
            <OccurenceInput
              value={occurrence}
              comparator={occurrenceComparator}
              onchange={(newOccurence, newComparator) => {
                setOccurrence(newOccurence)
                setOccurrenceComparator(newComparator)
              }}
              withHierarchyInfo
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

          {/*<AsyncAutocomplete
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
          )*/}

          <Grid container justifyContent="space-between" alignItems="center" marginBottom={1} marginTop={1}>
            <Grid item xs={10}>
              {selectedCriteriaPrescriptionType.length < 1 && (
                <FormLabel style={{ margin: 'auto 1em' }} component="legend">
                  Résultats
                </FormLabel>
              )}
              {selectedCriteriaPrescriptionType.length > 0 && (
                <FormLabel style={{ margin: 'auto 1em' }} component="legend" onClick={() => setOpenCodeResearch(true)}>
                  Sélectionner les codes
                </FormLabel>
              )}
            </Grid>

            <IconButton color="primary" onClick={() => setOpenCodeResearch(true)}>
              <SearchOutlined />
            </IconButton>
          </Grid>
          <Panel
            onClose={() => setOpenCodeResearch(false)}
            onConfirm={() => setOpenCodeResearch(false)}
            open={openCodeResearch}
          >
            <SearchValueSet references={medicationReferences} />
          </Panel>
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
          {currentState.type === CriteriaType.MEDICATION_ADMINISTRATION && (
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
          )}
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
