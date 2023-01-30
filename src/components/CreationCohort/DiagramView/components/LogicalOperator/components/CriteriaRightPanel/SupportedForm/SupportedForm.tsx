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
  Slider,
  Switch,
  Tooltip,
  Typography,
  TextField
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

import AdmissionInputs from './SupportedInputs/AdmissionInputs'
import EntryExitInputs from './SupportedInputs/EntryExitInputs'
import ProvenanceDestinationInputs from './SupportedInputs/ProvenanceDestinationInputs'
import OtherInputs from './SupportedInputs/OtherInputs'

import VisitInputs from '../AdvancedInputs/VisitInputs/VisitInputs'
// import { InputAutocompleteAsync as AutocompleteAsync } from 'components/Inputs'

import useStyles from './styles'

import { EncounterDataType } from 'types'

type SupportedFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultEncounter: EncounterDataType = {
  type: 'Encounter',
  title: 'Critère de prise en charge',
  ageType: { id: 'year', label: 'années' },
  years: [0, 130],
  durationType: { id: 'day', label: 'jours' },
  duration: [0, 100],
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

  const [error, setError] = useState(false)
  const [sliderError, setSliderError] = useState(false)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = () => {
    if (
      defaultValues.ageType?.id === 'year' &&
      defaultValues.years[0] === 0 &&
      defaultValues.years[1] === 130 &&
      defaultValues.durationType?.id === 'day' &&
      defaultValues.duration[0] === 0 &&
      defaultValues.duration[1] === 100 &&
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
      !defaultValues.encounterStartDate &&
      !defaultValues.encounterEndDate
    ) {
      return setError(true)
    }

    onChangeSelectedCriteria(defaultValues)
  }

  const _onChangeValue = (key: string, value: any) => {
    const _defaultValues = defaultValues ? { ...defaultValues } : {}
    _defaultValues[key] = value
    setDefaultValues(_defaultValues)
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

  useEffect(() => {
    if (
      !Number.isInteger(defaultValues.years[0]) ||
      !Number.isInteger(defaultValues.years[1]) ||
      !Number.isInteger(defaultValues.duration[0]) ||
      !Number.isInteger(defaultValues.duration[1])
    ) {
      setSliderError(true)
    } else {
      setSliderError(false)
    }
  }, [defaultValues.years, defaultValues.duration])

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
        {error && <Alert severity="error">Merci de renseigner un champ</Alert>}

        {!error && !multiFields && (
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
          <Typography variant="h6">Prise en charge</Typography>

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

          <FormLabel style={{ padding: '1em', display: 'flex', alignItems: 'center' }} component="legend">
            Âge au moment de la prise en charge
            <Tooltip title="La valeur par défaut sera prise en compte si le sélecteur d'âge n'a pas été modifié.">
              <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
            </Tooltip>
          </FormLabel>

          <Grid style={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', margin: '0 1em' }}>
            <Grid>
              <Slider
                value={defaultValues.years}
                onChange={(e, value) => _onChangeValue('years', value)}
                aria-labelledby="range-slider"
                valueLabelDisplay="off"
                valueLabelFormat={(value) => (value === 130 ? '130+' : value)}
                min={0}
                max={130}
                size="small"
              />

              <Grid container justifyContent="space-around">
                <Grid item>
                  <TextField
                    value={defaultValues.years[0]}
                    type="number"
                    onChange={(e) =>
                      _onChangeValue('years', [
                        +e.target.value >= 0 && +e.target.value <= 130 ? +e.target.value : defaultValues.years[0],
                        defaultValues.years[1]
                      ])
                    }
                    error={!Number.isInteger(defaultValues.years[0])}
                    helperText={!Number.isInteger(defaultValues.years[0]) && 'Pas de valeur décimale autorisée.'}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    value={defaultValues.years[1]}
                    type="number"
                    onChange={(e) =>
                      _onChangeValue('years', [
                        defaultValues.years[0],
                        +e.target.value >= 0 && +e.target.value <= 130 ? +e.target.value : defaultValues.years[1]
                      ])
                    }
                    error={!Number.isInteger(defaultValues.years[1])}
                    helperText={!Number.isInteger(defaultValues.years[1]) && 'Pas de valeur décimale autorisée.'}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Autocomplete
              id="criteria-ageType-autocomplete"
              className={classes.inputItem}
              options={[
                { id: 'year', label: 'années' },
                { id: 'month', label: 'mois' },
                { id: 'day', label: 'jours' }
              ]}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={defaultValues.ageType}
              onChange={(e, value) => _onChangeValue('ageType', value)}
              renderInput={(params) => <TextField {...params} />}
            />
          </Grid>

          <FormLabel style={{ padding: '0 1em 1em 1em' }} component="legend">
            Durée de la prise en charge
          </FormLabel>

          <Grid style={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', margin: '0 1em' }}>
            <Grid>
              <Slider
                value={defaultValues.duration}
                onChange={(e, value) => _onChangeValue('duration', value)}
                aria-labelledby="range-slider"
                valueLabelDisplay="off"
                valueLabelFormat={(value) => (value === 100 ? '100+' : value)}
                min={0}
                max={100}
                size="small"
              />

              <Grid container justifyContent="space-around">
                <Grid item>
                  <TextField
                    value={defaultValues.duration[0]}
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
                <Grid item>
                  <TextField
                    value={defaultValues.duration[1]}
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
              </Grid>
            </Grid>

            <Autocomplete
              id="criteria-ageType-autocomplete"
              className={classes.inputItem}
              options={[
                { id: 'year', label: 'années' },
                { id: 'month', label: 'mois' },
                { id: 'day', label: 'jours' }
              ]}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={defaultValues.durationType}
              onChange={(e, value) => _onChangeValue('durationType', value)}
              renderInput={(params) => <TextField {...params} />}
            />
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
          <Button onClick={_onSubmit} type="submit" form="supported-form" variant="contained" disabled={sliderError}>
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SupportedForm
