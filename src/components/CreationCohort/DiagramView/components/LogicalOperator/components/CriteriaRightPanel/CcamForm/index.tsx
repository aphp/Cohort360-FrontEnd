import React, { useEffect, useMemo, useState } from 'react'
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

import useStyles from '../formStyles'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import { CriteriaDrawerComponentProps } from 'types'
import { CcamDataType, Comparators, CriteriaDataKey, CriteriaType } from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import AdvancedInputs from '../AdvancedInputs'
import { SourceType } from 'types/scope'
import ValueSetField from 'components/SearchValueSet/ValueSetField'
import { getConfig } from 'config'
import { getValueSetsFromSystems } from 'utils/valueSets'
import { mappingCriteria, mappingHierarchyCriteria } from 'utils/mappers'

enum Error {
  ADVANCED_INPUTS_ERROR,
  NO_ERROR
}

export const defaultProcedure: Omit<CcamDataType, 'id'> = {
  type: CriteriaType.PROCEDURE,
  title: "Critères d'actes CCAM",
  label: undefined,
  code: [],
  source: 'AREM',
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER_OR_EQUAL,
  startOccurrence: [null, null],
  isInclusive: true,
  encounterStartDate: [null, null],
  encounterEndDate: [null, null],
  encounterStatus: []
}

const CcamForm = (props: CriteriaDrawerComponentProps) => {
  const { criteriaData, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [currentCriteria, setCurrentCriteria] = useState<CcamDataType>(
    (selectedCriteria as CcamDataType) ?? defaultProcedure
  )
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const [error, setError] = useState(Error.NO_ERROR)
  const isEdition = selectedCriteria !== null
  const { classes } = useStyles()

  const ccamReferences = useMemo(() => {
    return getValueSetsFromSystems([getConfig().features.procedure.valueSets.procedureHierarchy.url])
  }, [])

  useEffect(() => {
    const code = mappingHierarchyCriteria(currentCriteria?.code, CriteriaDataKey.CCAM_DATA, criteriaData) || []
    const encounterStatus =
      mappingCriteria(currentCriteria?.encounterStatus, CriteriaDataKey.ENCOUNTER_STATUS, criteriaData) || []
    setCurrentCriteria({ ...currentCriteria, code, encounterStatus })
  }, [])

  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack}>
              <KeyboardBackspaceIcon />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Typography className={classes.titleLabel}>Ajouter un critère d'acte CCAM</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère d'acte CCAM</Typography>
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
          <Typography variant="h6">Actes CCAM</Typography>

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

          <Grid style={{ display: 'flex' }}>
            <RadioGroup
              row
              style={{ justifyContent: 'space-around' }}
              className={classes.inputItem}
              aria-label="mode"
              name="criteria-mode-radio"
              value={currentCriteria.source}
              onChange={(e, value) => setCurrentCriteria({ ...currentCriteria, source: value })}
            >
              <FormControlLabel value="AREM" control={<Radio color="secondary" />} label="AREM" />
              <FormControlLabel value="ORBIS" control={<Radio color="secondary" />} label="ORBIS" />
            </RadioGroup>
          </Grid>

          <Grid
            style={{
              margin: '0 1em',
              width: 'calc(100% - 2em)'
            }}
          >
            <Alert severity="warning">
              Les données AREM sont disponibles uniquement pour la période du 07/12/2009 au 31/07/2024.
            </Alert>
            <Alert severity="warning">
              Seuls les actes rattachés à une visite Orbis (avec un Dossier Administratif - NDA) sont actuellement
              disponibles.
            </Alert>
            <Alert severity="info">
              Les données PMSI d'ORBIS sont codées au quotidien par les médecins. Les données PMSI AREM sont validées,
              remontées aux tutelles et disponibles dans le SNDS.
            </Alert>
          </Grid>
          <Grid className={classes.inputItem}>
            <ValueSetField
              value={currentCriteria.code}
              references={ccamReferences}
              onSelect={(value) => setCurrentCriteria({ ...currentCriteria, code: value })}
              placeholder="Sélectionner les codes d'actes CCAM"
            />
          </Grid>
          <Autocomplete
            multiple
            className={classes.inputItem}
            options={criteriaData.data.encounterStatus ?? []}
            noOptionsText="Veuillez entrer un statut de visite associée"
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={currentCriteria.encounterStatus}
            onChange={(e, value) => setCurrentCriteria({ ...currentCriteria, encounterStatus: value })}
            renderInput={(params) => <TextField {...params} label="Statut de la visite associée" />}
          />

          <AdvancedInputs
            sourceType={SourceType.CCAM}
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
            form="ccam-form"
            color="primary"
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
export default CcamForm
