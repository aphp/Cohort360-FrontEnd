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

import { CriteriaName, ScopeTreeRow } from 'types'
import PopulationCard from '../../../../PopulationCard/PopulationCard'
import { STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE } from 'utils/cohortCreation'
import { DurationRangeType, LabelObject } from 'types/searchCriterias'
import { Comparators, CriteriaDataKey, RessourceType } from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import Collapse from 'components/ui/Collapse'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import DurationRange from 'components/ui/Inputs/DurationRange'
import { mappingCriteria } from '../DemographicForm'

type EncounterFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

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

const EncounterForm = ({ criteria, selectedCriteria, goBack, onChangeSelectedCriteria }: EncounterFormProps) => {
  const [title, setTitle] = useState(selectedCriteria?.title || 'Critère de prise en charge')
  const [age, setAge] = useState<DurationRangeType>(selectedCriteria?.age || [null, null])
  const [duration, setDuration] = useState<DurationRangeType>(selectedCriteria?.duration || [null, null])
  const [admissionMode, setAdmissionMode] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.admissionMode, CriteriaDataKey.ADMISSION_MODE, criteria) || []
  )
  const [entryMode, setEntryMode] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.entryMode, CriteriaDataKey.ENTRY_MODES, criteria) || []
  )
  const [exitMode, setExitMode] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.exitMode, CriteriaDataKey.EXIT_MODES, criteria) || []
  )
  const [priseEnChargeType, setPriseEnChargeType] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.priseEnChargeType, CriteriaDataKey.PRISE_EN_CHARGE_TYPE, criteria) || []
  )
  const [typeDeSejour, setTypeDeSejour] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.typeDeSejour, CriteriaDataKey.TYPE_DE_SEJOUR, criteria) || []
  )
  const [fileStatus, setFileStatus] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.fileStatus, CriteriaDataKey.FILE_STATUS, criteria) || []
  )
  const [reason, setReason] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.reason, CriteriaDataKey.REASON, criteria) || []
  )
  const [destination, setDestination] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.destination, CriteriaDataKey.DESTINATION, criteria) || []
  )
  const [provenance, setProvenance] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.provenance, CriteriaDataKey.PROVENANCE, criteria) || []
  )
  const [admission, setAdmission] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.admission, CriteriaDataKey.ADMISSION, criteria) || []
  )
  const [encounterService, setEncounterService] = useState<ScopeTreeRow[]>(selectedCriteria?.encounterService || [])
  const [encounterStartDate, setEncounterStartDate] = useState<string | null>(
    selectedCriteria?.encounterStartDate || null
  )
  const [encounterEndDate, setEncounterEndDate] = useState<string | null>(selectedCriteria?.encounterEndDate || null)
  const [occurrence, setOccurrence] = useState<number>(selectedCriteria?.occurrence || 1)
  const [occurrenceComparator, setOccurrenceComparator] = useState<Comparators>(
    selectedCriteria?.occurrenceComparator || Comparators.GREATER_OR_EQUAL
  )
  const [isInclusive, setIsInclusive] = useState<boolean>(selectedCriteria?.isInclusive || true)

  const { classes } = useStyles()
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const isEdition = selectedCriteria !== null ? true : false
  const [error, setError] = useState(Error.NO_ERROR)

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
      id: selectedCriteria?.id,
      age,
      duration,
      admissionMode,
      entryMode,
      exitMode,
      priseEnChargeType,
      typeDeSejour,
      fileStatus,
      reason,
      destination,
      provenance,
      admission,
      encounterService,
      encounterStartDate,
      encounterEndDate,
      occurrence,
      occurrenceComparator,
      isInclusive,
      title,
      type: RessourceType.ENCOUNTER
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
              executiveUnits={criteria?.encounterService ?? []}
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
            <Collapse title="Général" value={false}>
              <Autocomplete
                multiple
                id="criteria-PriseEnChargeType-autocomplete"
                options={criteria?.data?.priseEnChargeType || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={priseEnChargeType}
                onChange={(e, value) => setPriseEnChargeType(value)}
                renderInput={(params) => <TextField {...params} label="Type de prise en charge" />}
              />

              <Autocomplete
                multiple
                id="criteria-TypeDeSejour-autocomplete"
                options={criteria?.data?.typeDeSejour || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={typeDeSejour}
                onChange={(e, value) => setTypeDeSejour(value)}
                renderInput={(params) => <TextField {...params} label="Type séjour" />}
              />

              <Autocomplete
                multiple
                id="criteria-FileStatus-autocomplete"
                options={criteria?.data?.fileStatus || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={fileStatus}
                onChange={(e, value) => setFileStatus(value)}
                renderInput={(params) => <TextField {...params} label="Statut dossier" />}
              />
            </Collapse>
          </BlockWrapper>
          <BlockWrapper className={classes.inputItem}>
            <Collapse title="Admission" value={false}>
              <Autocomplete
                multiple
                id="criteria-admissionMode-autocomplete"
                options={criteria?.data?.admissionModes || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={admissionMode}
                onChange={(e, value) => setAdmissionMode(value)}
                renderInput={(params) => <TextField {...params} label="Motif Admission" />}
              />

              <Autocomplete
                multiple
                id="criteria-admission-autocomplete"
                options={criteria?.data?.admission || []}
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
                options={criteria?.data?.entryModes || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={entryMode}
                onChange={(e, value) => setEntryMode(value)}
                renderInput={(params) => <TextField {...params} label="Mode entrée" />}
              />

              <Autocomplete
                multiple
                id="criteria-exitMode-autocomplete"
                options={criteria?.data?.exitModes || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={exitMode}
                onChange={(e, value) => setExitMode(value)}
                renderInput={(params) => <TextField {...params} label="Mode sortie" />}
              />

              <Autocomplete
                multiple
                id="criteria-reason-autocomplete"
                options={criteria?.data?.reason || []}
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
                options={criteria?.data?.destination || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={destination}
                onChange={(e, value) => setDestination(value)}
                renderInput={(params) => <TextField {...params} label="Destination" />}
              />

              <Autocomplete
                multiple
                id="criteria-provenance-autocomplete"
                options={criteria?.data?.provenance || []}
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
