import React, { useState } from 'react'

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

import AdmissionInputs from './SupportedInputs/AdmissionInputs'
import EntryExitInputs from './SupportedInputs/EntryExitInputs'
import ProvenanceDestinationInputs from './SupportedInputs/ProvenanceDestinationInputs'
import OtherInputs from './SupportedInputs/OtherInputs'

import useStyles from './styles'

import { CriteriaName, EncounterDataType, ScopeTreeRow, CalendarLabel, Calendar, CalendarRequestLabel } from 'types'
import OccurrencesNumberInputs from '../AdvancedInputs/OccurrencesInputs/OccurrenceNumberInputs'
import PopulationCard from '../../../../PopulationCard/PopulationCard'
import { STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE } from 'utils/cohortCreation'
import VisitInputs from '../AdvancedInputs/VisitInputs/VisitInputs'

type SupportedFormProps = {
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
  NO_ERROR
}

const defaultEncounter: EncounterDataType = {
  type: 'Encounter',
  title: 'Critère de prise en charge',
  age: [null, null],
  ageType: [
    { id: Calendar.YEAR, criteriaLabel: CalendarLabel.YEAR, requestLabel: CalendarRequestLabel.YEAR },
    { id: Calendar.YEAR, criteriaLabel: CalendarLabel.YEAR, requestLabel: CalendarRequestLabel.YEAR }
  ],
  duration: [null, null],
  durationType: [
    { id: Calendar.DAY, criteriaLabel: CalendarLabel.DAY, requestLabel: CalendarRequestLabel.DAY },
    { id: Calendar.DAY, criteriaLabel: CalendarLabel.DAY, requestLabel: CalendarRequestLabel.DAY }
  ],
  admissionMode: [],
  entryMode: [],
  exitMode: [],
  priseEnChargeType: [],
  typeDeSejour: [],
  fileStatus: [],
  discharge: [],
  reason: [],
  destination: [],
  provenance: [],
  admission: [],
  encounterStartDate: '',
  encounterEndDate: '',
  occurrence: 1,
  occurrenceComparator: '>=',
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true
}

const SupportedForm: React.FC<SupportedFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const [defaultValues, setDefaultValues] = useState(selectedCriteria || defaultEncounter)
  const { classes } = useStyles()
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const [error, setError] = useState(Error.NO_ERROR)

  const isEdition = selectedCriteria !== null ? true : false

  const onCheckFormError = () => {
    if (
      defaultValues.age[0] === null &&
      defaultValues.age[1] === null &&
      defaultValues.duration[0] === null &&
      defaultValues.duration[1] === null &&
      defaultValues.admissionMode?.length === 0 &&
      defaultValues.entryMode?.length === 0 &&
      defaultValues.exitMode?.length === 0 &&
      defaultValues.priseEnChargeType?.length === 0 &&
      defaultValues.typeDeSejour?.length === 0 &&
      defaultValues.fileStatus?.length === 0 &&
      defaultValues.discharge?.length === 0 &&
      defaultValues.reason?.length === 0 &&
      defaultValues.destination?.length === 0 &&
      defaultValues.provenance?.length === 0 &&
      defaultValues.admission?.length === 0 &&
      defaultValues.encounterService?.length === 0 &&
      !defaultValues.encounterStartDate &&
      !defaultValues.encounterEndDate
    ) {
      return Error.EMPTY_FORM
    }
    if (
      (defaultValues.age[0] !== null || defaultValues.age[1] !== null) &&
      ((defaultValues.age[0] < 1 && (defaultValues.age[1] < 1 || defaultValues.age[1] === null)) ||
        (defaultValues.age[1] < 1 && (defaultValues.age[0] < 1 || defaultValues.age[0] === null)))
    ) {
      return Error.EMPTY_AGE_ERROR
    }
    if (
      (defaultValues.duration[0] !== null || defaultValues.duration[1] !== null) &&
      ((defaultValues.duration[0] < 1 && (defaultValues.duration[1] < 1 || defaultValues.duration[1] === null)) ||
        (defaultValues.duration[1] < 1 && (defaultValues.duration[0] < 1 || defaultValues.duration[0] === null)))
    ) {
      return Error.EMPTY_DURATION_ERROR
    }
    return Error.NO_ERROR
  }

  const _onSubmit = () => {
    console.log('defaultValues', defaultValues)
    const errorType = onCheckFormError()
    setError(errorType)
    if (errorType === Error.NO_ERROR) onChangeSelectedCriteria(defaultValues)
  }

  const _onChangeValue = (key: string, value: any) => {
    const _defaultValues = defaultValues ? { ...defaultValues } : {}
    _defaultValues[key] = value
    setDefaultValues(_defaultValues)
  }

  const _onSubmitExecutiveUnits = (_selectedExecutiveUnits: ScopeTreeRow[] | undefined) => {
    _onChangeValue('encounterService', _selectedExecutiveUnits)
  }

  const allowOnlyPositiveIntegers = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (Number.isNaN(+event.key) && event.key !== 'Backspace') event.preventDefault()
  }

  if (
    criteria?.data?.admissionModes === 'loading' ||
    criteria?.data?.entryModes === 'loading' ||
    criteria?.data?.exitModes === 'loading' ||
    criteria?.data?.priseEnChargeType === 'loading' ||
    criteria?.data?.typeDeSejour === 'loading' ||
    criteria?.data?.fileStatus === 'loading' ||
    criteria?.data?.discharge === 'loading' ||
    criteria?.data?.reason === 'loading' ||
    criteria?.data?.destination === 'loading' ||
    criteria?.data?.provenance === 'loading' ||
    criteria?.data?.admission === 'loading'
  ) {
    return <></>
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
        {error === Error.EMPTY_DURATION_ERROR && (
          <Alert severity="error">
            Merci de renseigner au moins une <b>Durée de prise en charge</b> avec une valeur supérieure à zéro.
          </Alert>
        )}
        {error === Error.EMPTY_AGE_ERROR && (
          <Alert severity="error">
            {' '}
            Merci de renseigner au moins un <b>Âge de prise en charge</b> avec une valeur supérieure à zéro.
          </Alert>
        )}
        {error === Error.EMPTY_FORM && <Alert severity="error">Merci de renseigner un champ</Alert>}
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
          <Typography className={classes.categoryTitle} variant="h6">
            Prise en charge
          </Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            value={defaultValues.title}
            onChange={(e) => _onChangeValue('title', e.target.value)}
          />

          <Grid style={{ display: 'flex' }}>
            <FormLabel
              onClick={() => _onChangeValue('isInclusive', !defaultValues.isInclusive)}
              style={{ margin: 'auto 1em' }}
              component="legend"
            >
              Exclure les patients qui suivent les règles suivantes
            </FormLabel>
            <Switch
              id="criteria-inclusive"
              checked={!defaultValues.isInclusive}
              onChange={(event) => _onChangeValue('isInclusive', !event.target.checked)}
              color="secondary"
            />
          </Grid>
          <OccurrencesNumberInputs
            form={CriteriaName.VisitSupport}
            selectedCriteria={defaultValues}
            onChangeValue={_onChangeValue}
          />

          <Grid style={{ display: 'grid', alignItems: 'center', margin: '0 1em' }}>
            <PopulationCard
              form={CriteriaName.VisitSupport}
              label={STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE}
              title={STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE}
              executiveUnits={defaultValues?.encounterService ?? []}
              isAcceptEmptySelection={true}
              isDeleteIcon={true}
              onChangeExecutiveUnits={_onSubmitExecutiveUnits}
            />
          </Grid>

          <Grid container className={classes.durationContainer}>
            <FormLabel component="legend" className={classes.durationTitle}>
              Âge au moment de la prise en charge
              <Tooltip title="La valeur par défaut sera prise en compte si le sélecteur d'âge n'a pas été modifié.">
                <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
              </Tooltip>
            </FormLabel>

            <Grid container justifyContent="space-around">
              <Grid item container xs={12} justifyContent="space-between">
                <Grid item container xs={6} alignItems="stretch">
                  <Grid item xs={3} container direction="column" justifyContent="flex-end">
                    <Typography variant="subtitle2" className={classes.durationLegend}>
                      Min
                    </Typography>
                  </Grid>
                  <Grid item xs={2} container direction="column" justifyContent="flex-end">
                    <TextField
                      value={defaultValues.age[0] === null ? undefined : defaultValues.age[0]}
                      placeholder={defaultValues.age[0] === null ? '0' : undefined}
                      className={classes.textField}
                      variant="standard"
                      size="small"
                      onKeyDown={(e) => allowOnlyPositiveIntegers(e)}
                      onChange={(e) => {
                        _onChangeValue('age', [e.target.value === '' ? null : e.target.value, defaultValues.age[1]])
                      }}
                    />
                  </Grid>
                  <Grid item xs={7} container direction="column" justifyContent="flex-end">
                    <Autocomplete
                      id="criteria-ageType-min"
                      disableClearable
                      size="small"
                      disabled={defaultValues.age[0] === null}
                      className={classes.inputItem}
                      options={[
                        {
                          id: Calendar.YEAR,
                          criteriaLabel: CalendarLabel.YEAR,
                          requestLabel: CalendarRequestLabel.YEAR
                        },
                        {
                          id: Calendar.MONTH,
                          criteriaLabel: CalendarLabel.MONTH,
                          requestLabel: CalendarRequestLabel.MONTH
                        },
                        { id: Calendar.DAY, criteriaLabel: CalendarLabel.DAY, requestLabel: CalendarRequestLabel.DAY }
                      ]}
                      getOptionLabel={(option) => option.criteriaLabel}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={defaultValues.ageType[0]}
                      onChange={(e, value) => _onChangeValue('ageType', [value, defaultValues.ageType[1]])}
                      renderInput={(params) => <TextField variant="standard" {...params} />}
                    />
                  </Grid>
                </Grid>
                <Grid item container xs={6} alignItems="stretch">
                  <Grid item xs={3} container direction="column" justifyContent="flex-end">
                    <Typography variant="subtitle2" className={classes.durationLegend}>
                      Max
                    </Typography>
                  </Grid>
                  <Grid item xs={2} container direction="column" justifyContent="flex-end">
                    <TextField
                      value={defaultValues.age[1] === null ? undefined : defaultValues.age[1]}
                      placeholder={defaultValues.age[1] === null ? '0' : undefined}
                      className={classes.textField}
                      variant="standard"
                      size="small"
                      onKeyDown={(e) => allowOnlyPositiveIntegers(e)}
                      onChange={(e) => {
                        _onChangeValue('age', [defaultValues.age[0], e.target.value === '' ? null : e.target.value])
                      }}
                    />
                  </Grid>
                  <Grid item xs={7} container direction="column" justifyContent="flex-end">
                    <Autocomplete
                      id="criteria-ageType-max"
                      disableClearable
                      disabled={defaultValues.age[1] === null}
                      size="small"
                      className={classes.inputItem}
                      options={[
                        {
                          id: Calendar.YEAR,
                          criteriaLabel: CalendarLabel.YEAR,
                          requestLabel: CalendarRequestLabel.YEAR
                        },
                        {
                          id: Calendar.MONTH,
                          criteriaLabel: CalendarLabel.MONTH,
                          requestLabel: CalendarRequestLabel.MONTH
                        },
                        { id: Calendar.DAY, criteriaLabel: CalendarLabel.DAY, requestLabel: CalendarRequestLabel.DAY }
                      ]}
                      getOptionLabel={(option) => option.criteriaLabel}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={defaultValues.ageType[1]}
                      onChange={(e, value) => _onChangeValue('ageType', [defaultValues.ageType[0], value])}
                      renderInput={(params) => <TextField variant="standard" {...params} />}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid container className={classes.durationContainer}>
            <FormLabel component="legend" className={classes.durationTitle}>
              Durée de la prise en charge
            </FormLabel>

            <Grid container justifyContent="space-around">
              <Grid item container xs={12} justifyContent="space-between">
                <Grid item container xs={6} alignItems="stretch">
                  <Grid xs={3} container direction="column" justifyContent="flex-end">
                    <Typography variant="subtitle2" className={classes.durationLegend}>
                      Min
                    </Typography>
                  </Grid>
                  <Grid xs={2} container direction="column" justifyContent="flex-end">
                    <TextField
                      value={defaultValues.duration[0] === null ? undefined : defaultValues.duration[0]}
                      placeholder={defaultValues.duration[0] === null ? '0' : undefined}
                      className={classes.textField}
                      variant="standard"
                      size="small"
                      onKeyDown={(e) => allowOnlyPositiveIntegers(e)}
                      onChange={(e) => {
                        _onChangeValue('duration', [
                          e.target.value === '' ? null : e.target.value,
                          defaultValues.duration[1]
                        ])
                      }}
                    />
                  </Grid>
                  <Grid xs={7} container direction="column" justifyContent="flex-end">
                    <Autocomplete
                      id="criteria-durationType-min"
                      disableClearable
                      disabled={defaultValues.duration[0] === null}
                      size="small"
                      className={classes.inputItem}
                      options={[
                        {
                          id: Calendar.YEAR,
                          criteriaLabel: CalendarLabel.YEAR,
                          requestLabel: CalendarRequestLabel.YEAR
                        },
                        {
                          id: Calendar.MONTH,
                          criteriaLabel: CalendarLabel.MONTH,
                          requestLabel: CalendarRequestLabel.MONTH
                        },
                        { id: Calendar.DAY, criteriaLabel: CalendarLabel.DAY, requestLabel: CalendarRequestLabel.DAY }
                      ]}
                      getOptionLabel={(option) => option.criteriaLabel}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={defaultValues.durationType[0]}
                      onChange={(e, value) => _onChangeValue('durationType', [value, defaultValues.durationType[1]])}
                      renderInput={(params) => <TextField variant="standard" {...params} />}
                    />
                  </Grid>
                </Grid>
                <Grid item container xs={6} alignItems="stretch">
                  <Grid item xs={3} container direction="column" justifyContent="flex-end">
                    <Typography variant="subtitle2" className={classes.durationLegend}>
                      Max
                    </Typography>
                  </Grid>
                  <Grid item xs={2} container direction="column" justifyContent="flex-end">
                    <TextField
                      value={defaultValues.duration[1] === null ? undefined : defaultValues.duration[1]}
                      placeholder={defaultValues.duration[1] === null ? '0' : undefined}
                      className={classes.textField}
                      size="small"
                      variant="standard"
                      onKeyDown={(e) => allowOnlyPositiveIntegers(e)}
                      onChange={(e) => {
                        _onChangeValue('duration', [
                          defaultValues.duration[0],
                          e.target.value === '' ? null : e.target.value
                        ])
                      }}
                    />
                  </Grid>
                  <Grid item xs={7} container direction="column" justifyContent="flex-end">
                    <Autocomplete
                      id="criteria-durationType-max"
                      disabled={defaultValues.duration[1] === null}
                      size="small"
                      disableClearable
                      className={classes.inputItem}
                      options={[
                        {
                          id: Calendar.YEAR,
                          criteriaLabel: CalendarLabel.YEAR,
                          requestLabel: CalendarRequestLabel.YEAR
                        },
                        {
                          id: Calendar.MONTH,
                          criteriaLabel: CalendarLabel.MONTH,
                          requestLabel: CalendarRequestLabel.MONTH
                        },
                        { id: Calendar.DAY, criteriaLabel: CalendarLabel.DAY, requestLabel: CalendarRequestLabel.DAY }
                      ]}
                      getOptionLabel={(option) => option.criteriaLabel}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={defaultValues.durationType[1]}
                      onChange={(e, value) => _onChangeValue('durationType', [defaultValues.durationType[0], value])}
                      renderInput={(params) => <TextField variant="standard" {...params} />}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <VisitInputs selectedCriteria={defaultValues} onChangeValue={_onChangeValue} />
          <OtherInputs criteria={criteria} selectedCriteria={defaultValues} onChangeValue={_onChangeValue} />

          <AdmissionInputs criteria={criteria} selectedCriteria={defaultValues} onChangeValue={_onChangeValue} />

          <EntryExitInputs criteria={criteria} selectedCriteria={defaultValues} onChangeValue={_onChangeValue} />

          <ProvenanceDestinationInputs
            criteria={criteria}
            selectedCriteria={defaultValues}
            onChangeValue={_onChangeValue}
          />
        </Grid>
        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} type="submit" form="supported-form" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SupportedForm
