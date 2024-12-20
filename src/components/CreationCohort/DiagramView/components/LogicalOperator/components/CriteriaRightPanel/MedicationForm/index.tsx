import React, { useEffect, useMemo, useState } from 'react'

import { CriteriaDrawerComponentProps } from 'types'
import { Comparators, MedicationDataType, CriteriaType, CriteriaDataKey } from 'types/requestCriterias'
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
import useStyles from '../formStyles'
import { SourceType } from 'types/scope'
import AdvancedInputs from '../AdvancedInputs'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import { getValueSetsFromSystems } from 'utils/valueSets'
import { LabelObject } from 'types/searchCriterias'
import { mappingCriteria, mappingHierarchyCriteria } from 'utils/mappers'

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
  const { classes } = useStyles()
  const [currentCriteria, setCurrentCriteria] = useState((selectedCriteria as MedicationDataType) ?? defaultMedication)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const [error, setError] = useState(Error.NO_ERROR)

  useEffect(() => {
    if (currentCriteria.type === CriteriaType.MEDICATION_ADMINISTRATION) {
      setCurrentCriteria({ ...currentCriteria, endOccurrence: [null, null] })
    }
  }, [currentCriteria.type])

  const medicationReferences = useMemo(() => {
    return getValueSetsFromSystems([
      getConfig().features.medication.valueSets.medicationAtc.url,
      getConfig().features.medication.valueSets.medicationUcd.url
    ])
  }, [])

  useEffect(() => {
    const encounterStatus =
      mappingCriteria(currentCriteria?.encounterStatus, CriteriaDataKey.ENCOUNTER_STATUS, criteriaData) || []
    const code = mappingHierarchyCriteria(currentCriteria?.code, CriteriaDataKey.MEDICATION_DATA, criteriaData) || []
    setCurrentCriteria({ ...currentCriteria, code, encounterStatus })
  }, [])

  if (criteriaData?.data?.prescriptionTypes === 'loading' || criteriaData?.data?.administrations === 'loading') {
    return <></>
  }

  const selectedCriteriaPrescriptionType =
    currentCriteria.type === CriteriaType.MEDICATION_REQUEST && currentCriteria.prescriptionType
      ? currentCriteria.prescriptionType.map((prescriptionType) => {
          const criteriaPrescriptionType = criteriaData.data.prescriptionTypes
            ? criteriaData.data.prescriptionTypes.find((p: LabelObject) => p.id === prescriptionType.id)
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
          ? criteriaData.data.administrations.find((p: LabelObject) => p.id === administration.id)
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
              value={currentCriteria.occurrence ?? 1}
              comparator={currentCriteria.occurrenceComparator ?? Comparators.GREATER_OR_EQUAL}
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
              options={criteriaData?.data?.prescriptionTypes ?? []}
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
              options={criteriaData.data.administrations ?? []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={selectedCriteriaAdministration}
              onChange={(e, value) => setCurrentCriteria({ ...currentCriteria, administration: value })}
              renderInput={(params) => <TextField {...params} label="Voie d'administration" />}
            />
          )}
          <Autocomplete
            multiple
            options={criteriaData.data.encounterStatus ?? []}
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
            onClick={() => onChangeSelectedCriteria(currentCriteria)}
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
