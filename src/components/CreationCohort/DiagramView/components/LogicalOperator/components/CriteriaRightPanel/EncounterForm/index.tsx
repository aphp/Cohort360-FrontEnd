import React, { useEffect, useState } from 'react'

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import {
  Alert,
  Autocomplete,
  Button,
  Divider,
  FormLabel,
  Grid,
  IconButton,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

import useStyles from './styles'
import { useAppSelector } from 'state'

import { CriteriaDrawerComponentProps, CriteriaName, ScopeTreeRow } from 'types'
import PopulationCard from '../../../../PopulationCard/PopulationCard'
import { STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE } from 'utils/cohortCreation'
import { DurationRangeType, LabelObject } from 'types/searchCriterias'
import { Comparators, CriteriaDataKey, EncounterDataType, CriteriaType } from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import Collapse from 'components/ui/Collapse'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import DurationRange from 'components/ui/Inputs/DurationRange'
import { mappingCriteria } from '../DemographicForm'

enum Error {
  EMPTY_FORM,
  EMPTY_DURATION_ERROR,
  EMPTY_AGE_ERROR,
  MIN_MAX_AGE_ERROR,
  MIN_MAX_DURATION_ERROR,
  INCOHERENT_DURATION_ERROR,
  INCOHERENT_AGE_ERROR,
  INCOHERENT_DURATION_ERROR_AND_INCOHERENT_AGE_ERROR,
  NO_ERROR
}

const EncounterForm = ({
  criteriaData,
  selectedCriteria,
  goBack,
  onChangeSelectedCriteria
}: CriteriaDrawerComponentProps) => {
  const criteria = selectedCriteria as EncounterDataType
  const [title, setTitle] = useState(criteria?.title || 'Critère de prise en charge')
  const [age, setAge] = useState<DurationRangeType>(criteria?.age || [null, null])
  const [duration, setDuration] = useState<DurationRangeType>(criteria?.duration || [null, null])
  const [admissionMode, setAdmissionMode] = useState<LabelObject[]>(
    mappingCriteria(criteria?.admissionMode, CriteriaDataKey.ADMISSION_MODE, criteriaData) || []
  )
  const [entryMode, setEntryMode] = useState<LabelObject[]>(
    mappingCriteria(criteria?.entryMode, CriteriaDataKey.ENTRY_MODES, criteriaData) || []
  )
  const [exitMode, setExitMode] = useState<LabelObject[]>(
    mappingCriteria(criteria?.exitMode, CriteriaDataKey.EXIT_MODES, criteriaData) || []
  )
  const [priseEnChargeType, setPriseEnChargeType] = useState<LabelObject[]>(
    mappingCriteria(criteria?.priseEnChargeType, CriteriaDataKey.PRISE_EN_CHARGE_TYPE, criteriaData) || []
  )
  const [typeDeSejour, setTypeDeSejour] = useState<LabelObject[]>(
    mappingCriteria(criteria?.typeDeSejour, CriteriaDataKey.TYPE_DE_SEJOUR, criteriaData) || []
  )
  const [reason, setReason] = useState<LabelObject[]>(
    mappingCriteria(criteria?.reason, CriteriaDataKey.REASON, criteriaData) || []
  )
  const [destination, setDestination] = useState<LabelObject[]>(
    mappingCriteria(criteria?.destination, CriteriaDataKey.DESTINATION, criteriaData) || []
  )
  const [provenance, setProvenance] = useState<LabelObject[]>(
    mappingCriteria(criteria?.provenance, CriteriaDataKey.PROVENANCE, criteriaData) || []
  )
  const [admission, setAdmission] = useState<LabelObject[]>(
    mappingCriteria(criteria?.admission, CriteriaDataKey.ADMISSION, criteriaData) || []
  )
  const [encounterService, setEncounterService] = useState<ScopeTreeRow[]>(criteria?.encounterService || [])
  const [encounterStartDate, setEncounterStartDate] = useState<string | null | undefined>(
    criteria?.encounterStartDate || null
  )
  const [encounterEndDate, setEncounterEndDate] = useState<string | null | undefined>(
    criteria?.encounterEndDate || null
  )
  const [occurrence, setOccurrence] = useState<number>(criteria?.occurrence || 1)
  const [occurrenceComparator, setOccurrenceComparator] = useState<Comparators>(
    criteria?.occurrenceComparator || Comparators.GREATER_OR_EQUAL
  )
  const [isInclusive, setIsInclusive] = useState<boolean>(
    selectedCriteria?.isInclusive === undefined ? true : selectedCriteria?.isInclusive
  )
  const [encounterStatus, setEncounterStatus] = useState<LabelObject[]>(
    mappingCriteria(criteria?.encounterStatus, CriteriaDataKey.ENCOUNTER_STATUS, criteriaData) || []
  )

  const { classes } = useStyles()
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const isEdition = selectedCriteria !== null ? true : false
  const [error, setError] = useState(Error.NO_ERROR)
  const selectedPopulation = useAppSelector((state) => state.cohortCreation.request.selectedPopulation || [])

  const deidentified: boolean | undefined =
    selectedPopulation === null
      ? undefined
      : selectedPopulation
          .map((population) => population && population.access)
          .filter((elem) => elem && elem === 'Pseudonymisé').length > 0

  useEffect(() => {
    setError(Error.NO_ERROR)
    if (
      (occurrence === 0 && occurrenceComparator === Comparators.EQUAL) ||
      (occurrence === 1 && occurrenceComparator === Comparators.LESS) ||
      (occurrence === 0 && occurrenceComparator === Comparators.LESS_OR_EQUAL)
    ) {
      setError(Error.EMPTY_FORM)
    }
  }, [occurrence, occurrenceComparator])

  const onSubmit = () => {
    onChangeSelectedCriteria({
      id: criteria?.id,
      age,
      duration,
      admissionMode,
      entryMode,
      exitMode,
      priseEnChargeType,
      typeDeSejour,
      reason,
      destination,
      provenance,
      admission,
      encounterService,
      encounterStartDate,
      encounterEndDate,
      occurrence,
      occurrenceComparator,
      encounterStatus,
      isInclusive,
      title,
      type: CriteriaType.ENCOUNTER
    })
  }
  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack}>
              <KeyboardBackspaceIcon />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Typography className={classes.titleLabel}>Ajouter un critère prise en charge</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère prise en charge</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        {error === Error.NO_ERROR && !multiFields && (
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
        {error === Error.EMPTY_FORM && (
          <Alert severity="error">Merci de renseigner au moins un nombre d'occurence supérieur ou égal à 1</Alert>
        )}
        <Grid className={classes.inputContainer} container>
          <BlockWrapper>
            <Typography variant="h6">Prise en charge</Typography>
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <TextField
              required
              fullWidth
              id="criteria-name-required"
              placeholder="Nom du critère"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem} container alignItems="center">
            <FormLabel component="legend">Exclure les patients qui suivent les règles suivantes</FormLabel>
            <Switch
              id="criteria-inclusive"
              checked={!isInclusive}
              onChange={(event) => setIsInclusive(!event.target.checked)}
              color="secondary"
            />
          </BlockWrapper>
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

          <BlockWrapper className={classes.inputItem}>
            <PopulationCard
              form={CriteriaName.VisitSupport}
              label={STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE}
              title={STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE}
              executiveUnits={encounterService || []}
              isAcceptEmptySelection={true}
              isDeleteIcon={true}
              onChangeExecutiveUnits={(newValue) => setEncounterService(newValue)}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              <BlockWrapper container justifyItems="center">
                Âge au moment de la prise en charge
                <Tooltip title="La valeur par défaut sera prise en compte si le sélecteur d'âge n'a pas été modifié.">
                  <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
                </Tooltip>
              </BlockWrapper>
            </FormLabel>

            <DurationRange
              value={age}
              onChange={(value) => setAge(value)}
              onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
              deidentified={deidentified}
              placeholderType="encounter"
            />
          </BlockWrapper>

          <BlockWrapper container className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Durée de la prise en charge
            </FormLabel>
            <DurationRange
              value={duration}
              unit={'Durée'}
              onChange={(value) => setDuration(value)}
              onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
              placeholderType="encounter"
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Date de prise en charge
            </FormLabel>
            <CalendarRange
              inline
              value={[encounterStartDate, encounterEndDate]}
              onChange={([start, end]) => {
                setEncounterStartDate(start)
                setEncounterEndDate(end)
              }}
              onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
            />
          </BlockWrapper>
          <BlockWrapper className={classes.inputItem}>
            <Autocomplete
              multiple
              id="criteria-PriseEnChargeType-autocomplete"
              options={criteriaData.data.priseEnChargeType || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={priseEnChargeType}
              onChange={(e, value) => setPriseEnChargeType(value)}
              renderInput={(params) => <TextField {...params} label="Type de prise en charge" />}
            />
          </BlockWrapper>
          <BlockWrapper className={classes.inputItem}>
            <Autocomplete
              multiple
              id="criteria-TypeDeSejour-autocomplete"
              options={criteriaData.data.typeDeSejour || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={typeDeSejour}
              onChange={(e, value) => setTypeDeSejour(value)}
              renderInput={(params) => <TextField {...params} label="Type séjour" />}
            />
          </BlockWrapper>
          <BlockWrapper className={classes.inputItem}>
            <Autocomplete
              multiple
              options={criteriaData.data.encounterStatus || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={encounterStatus}
              onChange={(e, value) => setEncounterStatus(value)}
              renderInput={(params) => <TextField {...params} label="Statut de la visite" />} // TODO Mehdi
            />
          </BlockWrapper>
          <BlockWrapper className={classes.inputItem}>
            <Collapse title="Admission" value={false}>
              <Autocomplete
                multiple
                id="criteria-admissionMode-autocomplete"
                options={criteriaData.data.admissionModes || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={admissionMode}
                onChange={(e, value) => setAdmissionMode(value)}
                renderInput={(params) => <TextField {...params} label="Motif Admission" />}
              />

              <Autocomplete
                multiple
                id="criteria-admission-autocomplete"
                options={criteriaData.data.admission || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={admission}
                onChange={(e, value) => setAdmission(value)}
                renderInput={(params) => <TextField {...params} label="Type Admission" />}
              />
            </Collapse>
          </BlockWrapper>
          <BlockWrapper className={classes.inputItem}>
            <Collapse title="Entrée / Sortie" value={false}>
              <Autocomplete
                multiple
                id="criteria-entryMode-autocomplete"
                options={criteriaData.data.entryModes || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={entryMode}
                onChange={(e, value) => setEntryMode(value)}
                renderInput={(params) => <TextField {...params} label="Mode entrée" />}
              />

              <Autocomplete
                multiple
                id="criteria-exitMode-autocomplete"
                options={criteriaData.data.exitModes || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={exitMode}
                onChange={(e, value) => setExitMode(value)}
                renderInput={(params) => <TextField {...params} label="Mode sortie" />}
              />

              <Autocomplete
                multiple
                id="criteria-reason-autocomplete"
                options={criteriaData.data.reason || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={reason}
                onChange={(e, value) => setReason(value)}
                renderInput={(params) => <TextField {...params} label="Type sortie" />}
              />
            </Collapse>
          </BlockWrapper>
          <BlockWrapper className={classes.inputItem}>
            <Collapse title="Destination / Provenance" value={false}>
              <Autocomplete
                multiple
                id="criteria-destination-autocomplete"
                options={criteriaData.data.destination || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={destination}
                onChange={(e, value) => setDestination(value)}
                renderInput={(params) => <TextField {...params} label="Destination" />}
              />

              <Autocomplete
                multiple
                id="criteria-provenance-autocomplete"
                options={criteriaData.data.provenance || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={provenance}
                onChange={(e, value) => setProvenance(value)}
                renderInput={(params) => <TextField {...params} label="Provenance" />}
              />
            </Collapse>
          </BlockWrapper>
          <Grid className={classes.criteriaActionContainer}>
            {!isEdition && (
              <Button onClick={goBack} variant="outlined">
                Annuler
              </Button>
            )}
            <Button
              onClick={onSubmit}
              type="submit"
              form="supported-form"
              variant="contained"
              disabled={error === Error.INCOHERENT_AGE_ERROR || error === Error.EMPTY_FORM}
            >
              Confirmer
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default EncounterForm
