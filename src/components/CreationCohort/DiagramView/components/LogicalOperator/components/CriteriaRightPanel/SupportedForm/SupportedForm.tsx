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

import { EncounterDataType, ScopeTreeRow, CalendarLabel, Calendar, CalendarRequestLabel } from 'types'
import PopulationCard from '../../../../PopulationCard/PopulationCard'
import { STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE } from 'utils/cohortCreation'
import VisitInputs from '../AdvancedInputs/VisitInputs/VisitInputs'

type SupportedFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultEncounter: EncounterDataType = {
  type: 'Encounter',
  title: 'Critère de prise en charge',
  age: [0, 130],
  ageType: [
    { id: Calendar.DAY, criteriaLabel: CalendarLabel.DAY, requestLabel: CalendarRequestLabel.DAY },
    { id: Calendar.YEAR, criteriaLabel: CalendarLabel.YEAR, requestLabel: CalendarRequestLabel.YEAR }
  ],
  duration: [0, 100],
  durationType: [
    { id: Calendar.DAY, criteriaLabel: CalendarLabel.DAY, requestLabel: CalendarRequestLabel.DAY },
    { id: Calendar.YEAR, criteriaLabel: CalendarLabel.YEAR, requestLabel: CalendarRequestLabel.YEAR }
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
  isInclusive: true
}

const SupportedForm: React.FC<SupportedFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const [defaultValues, setDefaultValues] = useState(selectedCriteria || defaultEncounter)

  const classes = useStyles()

  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = () => {
    onChangeSelectedCriteria(defaultValues)
  }

  const _onChangeValue = (key: string, value: any) => {
    const _defaultValues = defaultValues ? { ...defaultValues } : {}
    _defaultValues[key] = value
    setDefaultValues(_defaultValues)
  }

  const _onSubmitExecutiveUnits = (_selectedExecutiveUnits: ScopeTreeRow[] | undefined) => {
    _onChangeValue('encounterService', _selectedExecutiveUnits)
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

          <Grid style={{ display: 'grid', alignItems: 'center', margin: '0 1em' }}>
            <PopulationCard
              form={'supported'}
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
                      value={defaultValues.age[0]}
                      className={classes.textField}
                      variant="standard"
                      size="small"
                      type="number"
                      onChange={(e) =>
                        _onChangeValue('age', [
                          +e.target.value >= 0 && +e.target.value <= 130 ? +e.target.value : defaultValues.age[0],
                          defaultValues.age[1]
                        ])
                      }
                      error={!Number.isInteger(defaultValues.age[0])}
                      helperText={!Number.isInteger(defaultValues.age[0]) && 'Pas de valeur décimale autorisée.'}
                    />
                  </Grid>
                  <Grid item xs={7} container direction="column" justifyContent="flex-end">
                    <Autocomplete
                      id="criteria-ageType-autocomplete"
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
                      value={defaultValues.age[1]}
                      className={classes.textField}
                      variant="standard"
                      size="small"
                      type="number"
                      onChange={(e) =>
                        _onChangeValue('age', [
                          defaultValues.age[0],
                          +e.target.value >= 0 && +e.target.value <= 130 ? +e.target.value : defaultValues.age[1]
                        ])
                      }
                      error={!Number.isInteger(defaultValues.age[1])}
                      helperText={!Number.isInteger(defaultValues.age[1]) && 'Pas de valeur décimale autorisée.'}
                    />
                  </Grid>
                  <Grid item xs={7} container direction="column" justifyContent="flex-end">
                    <Autocomplete
                      id="criteria-ageType-autocomplete"
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
                      value={defaultValues.duration[0]}
                      className={classes.textField}
                      variant="standard"
                      size="small"
                      type="number"
                      onChange={(e) =>
                        _onChangeValue('duration', [
                          +e.target.value >= 0 && +e.target.value <= 100 ? +e.target.value : +defaultValues.duration[0],
                          defaultValues.duration[1]
                        ])
                      }
                      error={!Number.isInteger(defaultValues.duration[0])}
                      helperText={!Number.isInteger(defaultValues.duration[0]) && 'Pas de valeur décimale autorisée.'}
                    />
                  </Grid>
                  <Grid xs={7} container direction="column" justifyContent="flex-end">
                    <Autocomplete
                      id="criteria-ageType-autocomplete"
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
                      value={defaultValues.duration[1]}
                      className={classes.textField}
                      size="small"
                      variant="standard"
                      type="number"
                      onChange={(e) =>
                        _onChangeValue('duration', [
                          defaultValues.duration[0],
                          +e.target.value >= 0 && +e.target.value <= 100 ? +e.target.value : +defaultValues.duration[1]
                        ])
                      }
                      error={!Number.isInteger(defaultValues.duration[1])}
                      helperText={!Number.isInteger(defaultValues.duration[1]) && 'Pas de valeur décimale autorisée.'}
                    />
                  </Grid>
                  <Grid item xs={7} container direction="column" justifyContent="flex-end">
                    <Autocomplete
                      id="criteria-ageType-autocomplete"
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
