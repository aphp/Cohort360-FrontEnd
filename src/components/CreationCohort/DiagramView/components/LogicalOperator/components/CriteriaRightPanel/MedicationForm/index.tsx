import React, { useEffect, useState } from 'react'

import { CriteriaDrawerComponentProps } from 'types'

import { useAppDispatch, useAppSelector } from 'state'
import { initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { EXPLORATION } from '../../../../../../../../constants'
import { Comparators, MedicationDataType, CriteriaType } from 'types/requestCriterias'
import { HierarchyElementWithSystem, HierarchyWithLabel, HierarchyWithLabelAndSystem } from 'types/hierarchy'
import {
  Grid,
  IconButton,
  Divider,
  Typography,
  Alert,
  TextField,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete,
  Button,
  Switch
} from '@mui/material'
import { getConfig } from 'config'
import ValueSetField from 'components/SearchValueSet/ValueSetField'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import { BlockWrapper } from 'components/ui/Layout'
import { Reference, References, ReferencesLabel } from 'types/searchValueSet'
import useStyles from './styles'
import { SourceType } from 'types/scope'
import AdvancedInputs from '../AdvancedInputs'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

enum Error {
  ADVANCED_INPUTS_ERROR,
  NO_ERROR
}

export const defaultMedication: Omit<MedicationDataType, 'id'> = {
  type: CriteriaType.MEDICATION_REQUEST,
  title: 'Critère de médicament',
  code: [],
  administration: [],
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER_OR_EQUAL,
  startOccurrence: [null, null],
  endOccurrence: [null, null],
  encounterEndDate: [null, null],
  encounterStartDate: [null, null],
  isInclusive: true,
  encounterStatus: []
}

const MedicationForm = (props: CriteriaDrawerComponentProps) => {
  const { criteriaData, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const isEdition = selectedCriteria !== null
  //const [selectedTab, setSelectedTab] = useState<'form' | 'exploration'>(selectedCriteria ? 'form' : 'exploration')
  /*const [defaultCriteria, setDefaultCriteria] = useState<MedicationDataType>(
    (selectedCriteria as MedicationDataType) || defaultMedication
  )*/

  //const dispatch = useAppDispatch()
  //const medicationHierarchy = useAppSelector((state) => state.medication.list || {})

  /*const _onChangeSelectedHierarchy = (
    newSelectedItems: HierarchyElementWithSystem[] | null | undefined,
    newHierarchy?: HierarchyElementWithSystem[]
  ) => {
    _onChangeFormValue('code', newSelectedItems, newHierarchy)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any*/
  /*const _onChangeFormValue = (key: string, value: any, hierarchy: HierarchyElementWithSystem[] = medicationHierarchy) =>

    syncOnChangeFormValue(key, value, hierarchy, setDefaultCriteria, selectedTab, defaultMedication.type, dispatch)*/

  /*const _initSyncHierarchyTableEffect = async () => {
    await initSyncHierarchyTableEffect(
      medicationHierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchMedication,
      defaultMedication.type,
      dispatch,
      true
    )
  }
  useEffect(() => {
    _initSyncHierarchyTableEffect()
  }, [])*/

  const { classes } = useStyles()
  //const dispatch = useAppDispatch()

  //const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const [currentCriteria, setCurrentCriteria] = useState((selectedCriteria as MedicationDataType) || defaultMedication)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  // const [occurrence, setOccurrence] = useState(currentCriteria.occurrence || 1)
  /*const [occurrenceComparator, setOccurrenceComparator] = useState(
    currentCriteria.occurrenceComparator || Comparators.GREATER_OR_EQUAL
  )*/
  const [error, setError] = useState(Error.NO_ERROR)

  useEffect(() => {
    if (currentCriteria.type === CriteriaType.MEDICATION_ADMINISTRATION) {
      setCurrentCriteria({ ...currentCriteria, endOccurrence: [null, null] })
      //onChangeValue('endOccurrence', [null, null])
    }
  }, [currentCriteria.type])

  /*const getMedicationOptions = async (searchValue: string, signal: AbortSignal) => {
    const response = await services.cohortCreation.fetchMedicationData(searchValue, false, signal)
    return response.map((elem) => {
      return { ...elem, label: displaySystem(elem.system) + elem.label }
    })
  }*/

  const _onSubmit = () => {
    onChangeSelectedCriteria({
      ...currentCriteria /*, occurrence: occurrence, occurrenceComparator: occurrenceComparator*/
    })
    //dispatch(fetchMedication())
  }

  if (criteriaData?.data?.prescriptionTypes === 'loading' || criteriaData?.data?.administrations === 'loading') {
    return <></>
  }

  const selectedCriteriaPrescriptionType =
    currentCriteria.type === CriteriaType.MEDICATION_REQUEST && currentCriteria.prescriptionType
      ? currentCriteria.prescriptionType.map((prescriptionType) => {
          const criteriaPrescriptionType = criteriaData.data.prescriptionTypes
            ? criteriaData.data.prescriptionTypes.find((p: HierarchyWithLabelAndSystem) => p.id === prescriptionType.id)
            : null
          return {
            id: prescriptionType.id,
            label: prescriptionType.label ? prescriptionType.label : criteriaPrescriptionType?.label ?? '?'
          }
        })
      : []

  const selectedCriteriaAdministration = currentCriteria.administration
    ? currentCriteria.administration.map((administration) => {
        const criteriaAdministration = criteriaData.data.administrations
          ? criteriaData.data.administrations.find((p: HierarchyWithLabelAndSystem) => p.id === administration.id)
          : null
        return {
          id: administration.id,
          label: administration.label ? administration.label : criteriaAdministration?.label ?? '?'
        }
      })
    : []

  /*const defaultValuesCode = currentCriteria.code
    ? currentCriteria.code.map((code: HierarchyWithLabelAndSystem) => {
        const criteriaCode = criteriaData.data.medicationData
          ? criteriaData.data.medicationData.find((g: HierarchyWithLabelAndSystem) => g.id === code.id)
          : null
        return {
          id: code.id,
          label: code.label ? code.label : criteriaCode?.label ?? '?',
          system: code.system ? code.system : criteriaCode?.system ?? '?'
        }
      })
    : []*/
  const medicationReferences: Reference[] = [
    {
      id: References.ATC,
      title: 'Toute la hiérarchie',
      label: ReferencesLabel.ATC,
      standard: true,
      url: getConfig().features.medication.valueSets.medicationAtc.url,
      checked: true,
      isHierarchy: true,
      joinDisplayWithCode: true,
      filterRoots: (code: HierarchyWithLabel) => /^[A-WZ]$/.test(code.id)
      /*code.id.search(new RegExp(/^[A-Z] - /, 'gi')) !== -1 && code.id.search(new RegExp(/^[X-Y] - /, 'gi')) !== 0*/
    },
    {
      id: References.UCD,
      title: 'Toute la hiérarchie',
      label: ReferencesLabel.UCD,
      standard: true,
      url: getConfig().features.medication.valueSets.medicationUcd.url,
      checked: true,
      joinDisplayWithCode: true,
      isHierarchy: false,
      filterRoots: () => true
    }
  ]
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
            value={currentCriteria.title}
            onChange={(e) => setCurrentCriteria({ ...currentCriteria, title: e.target.value })}
          />
          <Grid style={{ display: 'flex' }}>
            <FormLabel
              onClick={() => setCurrentCriteria({ ...currentCriteria, isInclusive: !currentCriteria.isInclusive })}
              style={{ margin: 'auto 1em' }}
              component="legend"
            >
              Exclure les patients qui suivent les règles suivantes
            </FormLabel>
            <Switch
              id="criteria-inclusive"
              checked={!currentCriteria.isInclusive}
              onChange={(e) => setCurrentCriteria({ ...currentCriteria, isInclusive: !e.target.checked })}
              color="secondary"
            />
          </Grid>
          <BlockWrapper className={classes.inputItem}>
            <OccurenceInput
              value={currentCriteria.occurrence || 1}
              comparator={currentCriteria.occurrenceComparator || Comparators.GREATER_OR_EQUAL}
              onchange={(newOccurence, newComparator) =>
                setCurrentCriteria({
                  ...currentCriteria,
                  occurrence: newOccurence,
                  occurrenceComparator: newComparator
                })
              }
              withHierarchyInfo
            />
          </BlockWrapper>
          <RadioGroup
            row
            style={{ justifyContent: 'space-around' }}
            className={classes.inputItem}
            aria-label="mode"
            name="criteria-mode-radio"
            value={currentCriteria.type}
            onChange={(e, value) =>
              setCurrentCriteria({ ...currentCriteria, type: value as CriteriaType.MEDICATION_ADMINISTRATION })
            }
          >
            <FormControlLabel value="MedicationRequest" control={<Radio color="secondary" />} label="Prescription" />
            <FormControlLabel
              value="MedicationAdministration"
              control={<Radio color="secondary" />}
              label="Administration"
            />
          </RadioGroup>

          <Grid container marginBottom={1} marginTop={1} className={classes.inputItem}>
            <ValueSetField
              value={currentCriteria.code}
              references={medicationReferences}
              onSelect={(value) => setCurrentCriteria({ ...currentCriteria, code: value })}
              placeholder="Sélectionner les codes"
            />
          </Grid>

          {currentCriteria.type === CriteriaType.MEDICATION_REQUEST && (
            <Autocomplete
              multiple
              id="criteria-prescription-type-autocomplete"
              className={classes.inputItem}
              options={criteriaData?.data?.prescriptionTypes || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={selectedCriteriaPrescriptionType}
              onChange={(e, value) => setCurrentCriteria({ ...currentCriteria, prescriptionType: value })}
              renderInput={(params) => <TextField {...params} label="Type de prescription" />}
            />
          )}
          {currentCriteria.type === CriteriaType.MEDICATION_ADMINISTRATION && (
            <Autocomplete
              multiple
              id="criteria-prescription-type-autocomplete"
              className={classes.inputItem}
              options={criteriaData.data.administrations || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={selectedCriteriaAdministration}
              onChange={(e, value) => setCurrentCriteria({ ...currentCriteria, administration: value })}
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
            value={currentCriteria.encounterStatus}
            onChange={(e, value) => setCurrentCriteria({ ...currentCriteria, encounterStatus: value })}
            renderInput={(params) => <TextField {...params} label="Statut de la visite associée" />}
          />
          <AdvancedInputs
            sourceType={SourceType.MEDICATION}
            selectedCriteria={currentCriteria}
            onChangeValue={(key, value) => setCurrentCriteria((prevValues) => ({ ...prevValues, [key]: value }))}
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
  )
}
export default MedicationForm
