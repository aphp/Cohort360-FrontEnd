import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Button,
  Divider,
  FormLabel,
  Grid,
  IconButton,
  Link,
  Switch,
  TextField,
  Typography
} from '@mui/material'

import useStyles from '../formStyles'
import { CriteriaDrawerComponentProps } from 'types'
import { Comparators, GhmDataType, CriteriaType, CriteriaDataKey } from 'types/requestCriterias'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
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

export const defaultClaim: Omit<GhmDataType, 'id'> = {
  type: CriteriaType.CLAIM,
  title: 'Critères GHM',
  code: [],
  label: undefined,
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER_OR_EQUAL,
  startOccurrence: [null, null],
  isInclusive: true,
  encounterStartDate: [null, null],
  encounterEndDate: [null, null],
  encounterStatus: []
}

const GhmForm = (props: CriteriaDrawerComponentProps) => {
  const { criteriaData, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [currentCriteria, setCurrentCriteria] = useState<GhmDataType>((selectedCriteria as GhmDataType) ?? defaultClaim)

  const isEdition = selectedCriteria !== null
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const [error, setError] = useState(Error.NO_ERROR)
  const { classes } = useStyles()

  const ghmReferences = useMemo(() => {
    return getValueSetsFromSystems([getConfig().features.claim.valueSets.claimHierarchy.url])
  }, [])

  useEffect(() => {
    const code = mappingHierarchyCriteria(currentCriteria?.code, CriteriaDataKey.GHM_DATA, criteriaData) || []
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
            <Typography className={classes.titleLabel}>Ajouter un critère de GHM</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de GHM</Typography>
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

        <Alert severity="warning">
          Données actuellement disponibles : PMSI ORBIS. Pour plus d'informations sur les prochaines intégrations de
          données, veuillez vous référer au tableau trimestriel de disponibilité des données disponible{' '}
          <Link
            href="https://eds.aphp.fr/sites/default/files/2023-01/EDS_Disponibilite_donnees_site_EDS_202212.pdf"
            target="_blank"
            rel="noopener"
          >
            ici
          </Link>
        </Alert>

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">GHM</Typography>

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

          <Grid className={classes.inputItem}>
            <ValueSetField
              value={currentCriteria.code}
              references={ghmReferences}
              onSelect={(value) => setCurrentCriteria({ ...currentCriteria, code: value })}
              placeholder="Sélectionner les codes GHM"
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
            sourceType={SourceType.GHM}
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
            form="ghm-form"
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
export default GhmForm
