import React, { useState, useMemo, useEffect } from 'react'
import {
  TextField,
  Grid,
  IconButton,
  Divider,
  Typography,
  Alert,
  FormLabel,
  Switch,
  Select,
  MenuItem,
  Autocomplete,
  Button
} from '@mui/material'
import useStyles from '../formStyles'
import { Comparators, ObservationDataType, CriteriaType, CriteriaDataKey } from 'types/requestCriterias'
import { CriteriaDrawerComponentProps } from 'types'
import { getConfig } from 'config'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import { BlockWrapper } from 'components/ui/Layout'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import { CriteriaLabel } from 'components/ui/CriteriaLabel'
import ValueSetField from 'components/SearchValueSet/ValueSetField'
import { ErrorWrapper } from 'components/ui/Searchbar/styles'
import AdvancedInputs from '../AdvancedInputs'
import { SourceType } from 'types/scope'
import { checkIsLeaf, getValueSetsFromSystems } from 'utils/valueSets'
import { mappingCriteria, mappingHierarchyCriteria } from 'utils/mappers'
import { useAppSelector } from 'state'
import { selectValueSetCodes } from 'state/valueSets'

enum Error {
  NO_ERROR,
  INCOHERENT_VALUE_ERROR,
  INVALID_VALUE_ERROR,
  MISSING_VALUE_ERROR,
  ADVANCED_INPUTS_ERROR
}

export const defaultBiology: Omit<ObservationDataType, 'id'> = {
  type: CriteriaType.OBSERVATION,
  title: 'Critères de biologie',
  code: [],
  valueComparator: Comparators.GREATER_OR_EQUAL,
  searchByValue: [null, null],
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER_OR_EQUAL,
  startOccurrence: [null, null],
  isInclusive: true,
  encounterStartDate: [null, null],
  encounterEndDate: [null, null],
  encounterStatus: []
}

const BiologyForm = (props: CriteriaDrawerComponentProps) => {
  const { criteriaData, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const { classes } = useStyles()
  const [currentCriteria, setCurrentCriteria] = useState((selectedCriteria as ObservationDataType) ?? defaultBiology)
  const [searchByValueInput, setSearchByValueInput] = useState([
    currentCriteria.searchByValue[0]?.toString() ?? '',
    currentCriteria.searchByValue[1]?.toString() ?? ''
  ])
  const isEdition = selectedCriteria !== null
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const [error, setError] = useState(Error.NO_ERROR)
  const [isLeaf, setIsLeaf] = useState(false)
  const biologyReferences = useMemo(() => {
    return getValueSetsFromSystems([
      getConfig().features.observation.valueSets.biologyHierarchyAnabio.url,
      getConfig().features.observation.valueSets.biologyHierarchyLoinc.url
    ])
  }, [])
  const cachedCodes = useAppSelector((state) =>
    selectValueSetCodes(
      state,
      biologyReferences.map((ref) => ref.url)
    )
  )

  const handleSearchValues = (newValue: string, index: number) => {
    const invalidCharRegex = /[^0-9.-]/
    if (invalidCharRegex.exec(newValue)) return
    const rawValues = searchByValueInput
    rawValues[index] = newValue
    setSearchByValueInput(rawValues)
    const parsedValue = isNaN(parseFloat(newValue)) ? null : parseFloat(newValue)
    const values: [number | null, number | null] =
      index === 0 ? [parsedValue, currentCriteria.searchByValue[1]] : [currentCriteria.searchByValue[0], parsedValue]
    checkSearchValues(values, currentCriteria.valueComparator)
  }

  const checkSearchValues = (values: [null | number, null | number], comparator: Comparators) => {
    setError(Error.NO_ERROR)
    let val1 = values[1]
    if (comparator !== Comparators.BETWEEN) {
      val1 = null
      setSearchByValueInput([searchByValueInput[0], ''])
    }
    if (values[0] !== null && val1 !== null && values[0] > val1) {
      setError(Error.INCOHERENT_VALUE_ERROR)
    } else if (comparator === Comparators.BETWEEN && (values[0] === null || val1 === null)) {
      setError(Error.MISSING_VALUE_ERROR)
    }
    setCurrentCriteria({
      ...currentCriteria,
      searchByValue: [values[0], val1],
      valueComparator: comparator
    })
  }

  useEffect(() => {
    setError(Error.NO_ERROR)
    checkIsLeaf(currentCriteria.code, cachedCodes).then((isLeaf) => {
      if (isLeaf) setIsLeaf(true)
      else {
        setIsLeaf(false)
        setCurrentCriteria({
          ...currentCriteria,
          searchByValue: [null, null],
          valueComparator: Comparators.GREATER_OR_EQUAL
        })
        setSearchByValueInput(['', ''])
      }
    })
  }, [currentCriteria.code])

  useEffect(() => {
    const encounterStatus =
      mappingCriteria(currentCriteria?.encounterStatus, CriteriaDataKey.ENCOUNTER_STATUS, criteriaData) || []
    const code = mappingHierarchyCriteria(currentCriteria?.code, CriteriaDataKey.BIOLOGY_DATA, criteriaData) || []
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
            <Typography className={classes.titleLabel}>Ajouter un critère de biologie</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de biologie</Typography>
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
          Les mesures de biologie sont pour l'instant restreintes aux 3870 codes ANABIO correspondants aux analyses les
          plus utilisées au niveau national et à l'AP-HP. De plus, les résultats concernent uniquement les analyses
          quantitatives enregistrées sur GLIMS, qui ont été validées et mises à jour depuis mars 2020.
        </Alert>

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">Biologie</Typography>

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

          <Grid container className={classes.inputItem}>
            <CriteriaLabel label="Codes de biologie" />
            <ValueSetField
              value={currentCriteria.code}
              references={biologyReferences}
              onSelect={(value) => setCurrentCriteria({ ...currentCriteria, code: value })}
              placeholder="Sélectionner les codes"
            />
          </Grid>

          <Grid className={classes.inputContainer}>
            <CriteriaLabel
              label="Recherche par valeur"
              infoIcon="Pour pouvoir rechercher par valeur, vous devez sélectionner un seul et unique analyte (élement le plus
                fin de la hiérarchie)."
            />
            <Grid
              style={{
                display: 'grid',
                gridTemplateColumns:
                  currentCriteria.valueComparator === Comparators.BETWEEN ? '100px 1fr 1fr' : '100px 1fr',
                alignItems: 'center',
                margin: '1em 0'
              }}
            >
              <Select
                style={{ marginRight: '1em' }}
                id="biology-value-comparator-select"
                value={currentCriteria.valueComparator ?? Comparators.GREATER_OR_EQUAL}
                onChange={(event) =>
                  checkSearchValues(currentCriteria.searchByValue, event.target.value as Comparators)
                }
                disabled={!isLeaf}
              >
                {(Object.keys(Comparators) as (keyof typeof Comparators)[]).map((key) => (
                  <MenuItem key={key} value={Comparators[key]}>
                    {Comparators[key]}
                  </MenuItem>
                ))}
              </Select>

              <TextField
                type="text"
                id="criteria-value"
                variant="outlined"
                value={searchByValueInput[0]}
                onChange={(e) => handleSearchValues(e.target.value, 0)}
                placeholder={currentCriteria.valueComparator === Comparators.BETWEEN ? 'Valeur minimale' : '0'}
                disabled={!isLeaf}
                error={error !== Error.NO_ERROR && error !== Error.ADVANCED_INPUTS_ERROR}
              />
              {currentCriteria.valueComparator === Comparators.BETWEEN && (
                <TextField
                  required
                  type="text"
                  id="criteria-value"
                  variant="outlined"
                  value={searchByValueInput[1]}
                  onChange={(e) => handleSearchValues(e.target.value, 1)}
                  sx={{ marginLeft: '10px' }}
                  placeholder="Valeur maximale"
                  disabled={!isLeaf}
                  error={error !== Error.NO_ERROR && error !== Error.ADVANCED_INPUTS_ERROR}
                />
              )}
            </Grid>
            <Grid container style={{ margin: '0 0 1em', textAlign: 'end' }}>
              <ErrorWrapper>
                {error === Error.INCOHERENT_VALUE_ERROR && (
                  <Typography style={{ fontWeight: 'bold' }}>
                    La valeur minimale ne peut pas être supérieure à la valeur maximale.
                  </Typography>
                )}
                {error === Error.INVALID_VALUE_ERROR && (
                  <Typography style={{ fontWeight: 'bold' }}>Veuillez entrer un nombre valide.</Typography>
                )}
                {error === Error.MISSING_VALUE_ERROR && (
                  <Typography style={{ fontWeight: 'bold' }}>Veuillez entrer 2 valeurs avec ce comparateur.</Typography>
                )}
              </ErrorWrapper>
            </Grid>

            <Autocomplete
              multiple
              options={criteriaData.data.encounterStatus ?? []}
              noOptionsText="Veuillez entrer un statut de visite associée"
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={currentCriteria.encounterStatus}
              onChange={(e, value) => setCurrentCriteria({ ...currentCriteria, encounterStatus: value })}
              renderInput={(params) => <TextField {...params} label="Statut de la visite associée" />}
            />
          </Grid>

          <AdvancedInputs
            sourceType={SourceType.BIOLOGY}
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
            form="biology-form"
            variant="contained"
            disabled={error !== Error.NO_ERROR}
          >
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}
export default BiologyForm
