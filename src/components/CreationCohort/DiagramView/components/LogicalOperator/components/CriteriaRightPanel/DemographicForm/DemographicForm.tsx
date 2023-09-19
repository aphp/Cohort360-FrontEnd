import React, { useEffect, useState } from 'react'

import {
  Alert,
  Autocomplete,
  Button,
  Divider,
  FormLabel,
  Grid,
  IconButton,
  Typography,
  TextField,
  Switch,
  Slider
} from '@mui/material'

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import useStyles from './styles'

import { Calendar, CalendarLabel, CalendarRequestLabel, DemographicDataType } from 'types'
import { VitalStatusOptions, VitalStatusOptionsLabel, VitalStatusLabel, VitalStatus } from 'types/searchCriterias'

enum Error {
  EMPTY_FORM,
  INCOHERENT_AGE_ERROR,
  NO_ERROR
}
type DemographicFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

type Option = {
  id: VitalStatusOptions
  label: VitalStatusOptionsLabel
  checked: boolean
}

type Options = Option[]

const defaultDemographic: DemographicDataType = {
  type: 'Patient',
  title: 'Critère démographique',
  vitalStatus: [],
  gender: [],
  ageType: { id: Calendar.YEAR, criteriaLabel: CalendarLabel.YEAR, requestLabel: CalendarRequestLabel.YEAR },
  years: [0, 130],
  isInclusive: true
}

const DemographicForm = (props: DemographicFormProps) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [defaultValues, setDefaultValues] = useState(selectedCriteria || defaultDemographic)

  const { classes } = useStyles()

  const [error, setError] = useState(Error.NO_ERROR)
  const [ageError, setAgeError] = useState(false)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const [vitalStatus, setVitalStatus] = useState({
    id: VitalStatus.ALL,
    label: VitalStatusLabel.all,
    options: [
      { id: VitalStatusOptions.age, label: VitalStatusOptionsLabel.age, checked: false },
      { id: VitalStatusOptions.birth, label: VitalStatusOptionsLabel.birth, checked: false },
      { id: VitalStatusOptions.deceasedDate, label: VitalStatusOptionsLabel.deceasedDate, checked: false }
    ]
  })

  const isEdition = selectedCriteria !== null ? true : false

  const _onCheckError = () => {
    if (
      defaultValues &&
      defaultValues.vitalStatus &&
      defaultValues.vitalStatus.length === 0 &&
      defaultValues.gender &&
      defaultValues.gender.length === 0 &&
      defaultValues.years &&
      defaultValues.ageType &&
      +defaultValues.years[0] === null &&
      +defaultValues.years[1] === null
    ) {
      return Error.EMPTY_FORM
    }
    if (defaultValues.years[0] > defaultValues.years[1]) {
      return Error.INCOHERENT_AGE_ERROR
    }
    return Error.NO_ERROR
  }

  const _onSubmit = () => {
    const errorType = _onCheckError()
    setError(errorType)
    if (errorType === Error.NO_ERROR) return onChangeSelectedCriteria(defaultValues)
  }

  const _onChangeValue = (key: string, value: any) => {
    const _defaultValues = defaultValues ? { ...defaultValues } : {}
    _defaultValues[key] = value
    setDefaultValues(_defaultValues)
  }

  const defaultValuesGender =
    defaultValues.gender && criteria && criteria.data.gender !== 'loading'
      ? defaultValues.gender.map((gender: any) => {
          const criteriaGender = criteria.data.gender ? criteria.data.gender.find((g: any) => g.id === gender.id) : null
          return {
            id: gender.id,
            label: gender.label ? gender.label : criteriaGender?.label ?? '?'
          }
        })
      : []
  /*const defaultValuesVitalStatus =
    defaultValues.vitalStatus && criteria.data.status !== 'loading'
      ? defaultValues.vitalStatus.map((vitalStatus: any) => {
          const criteriaStatus = criteria.data.status
            ? criteria.data.status.find((s: any) => s.id === vitalStatus.id)
            : null
          return {
            id: vitalStatus.id,
            label: vitalStatus.label ? vitalStatus.label : criteriaStatus?.label ?? '?'
          }
        })
      : []*/

  /*useEffect(() => {
     if (criteria.data.status !== 'loading') {
      let status = defaultValues.find((vitalStatus) => )
     }
       ? defaultValues.vitalStatus.map((vitalStatus: any) => {
           const criteriaStatus = criteria.data.status
             ? criteria.data.status.find((s: any) => s.id === vitalStatus.id)
             : null
           return {
             id: vitalStatus.id,
             label: vitalStatus.label ? vitalStatus.label : criteriaStatus?.label ?? '?'
           }
         })
       : []
  }, [defaultValues, criteria])*/

  useEffect(() => {
    if (!Number.isInteger(defaultValues.years[0]) || !Number.isInteger(defaultValues.years[1])) {
      setAgeError(true)
    } else {
      setAgeError(false)
    }
  }, [defaultValues.years])

  const handleOptionsChange = (values: Options) => {
    setVitalStatus({
      ...vitalStatus,
      options: vitalStatus.options.map((option) => {
        if (values.find((value) => option.id === value.id)) {
          option.checked = true
        } else {
          option.checked = false
        }
        return option
      })
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
            <Typography className={classes.titleLabel}>Ajouter un critère démographique</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère démographique</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        {error === Error.EMPTY_FORM && <Alert severity="error">Merci de renseigner un champ</Alert>}
        {error === Error.INCOHERENT_AGE_ERROR && (
          <Alert severity="error">
            L'âge minimum <b>doit être inférieur</b> à l'âge maximum.
          </Alert>
        )}

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
          <Typography variant="h6">Démographie patient</Typography>

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

          <Autocomplete
            multiple
            id="criteria-gender-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.gender !== 'loading' ? criteria?.data?.gender : []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={defaultValuesGender}
            onChange={(e, value) => _onChangeValue('gender', value)}
            renderInput={(params) => <TextField {...params} label="Genre" />}
          />

          <Autocomplete
            id="criteria-vitalStatus-autocomplete"
            className={classes.inputItem}
            options={
              criteria?.data?.status !== 'loading'
                ? [
                    {
                      id: VitalStatus.ALL,
                      label: VitalStatusLabel.all,
                      options: [
                        { id: VitalStatusOptions.age, label: VitalStatusOptionsLabel.age, checked: false },
                        { id: VitalStatusOptions.birth, label: VitalStatusOptionsLabel.birth, checked: false },
                        {
                          id: VitalStatusOptions.deceasedDate,
                          label: VitalStatusOptionsLabel.deceasedDate,
                          checked: false
                        },
                        {
                          id: VitalStatusOptions.deceasedAge,
                          label: VitalStatusOptionsLabel.deceasedAge,
                          checked: false
                        }
                      ]
                    },
                    {
                      id: VitalStatus.ALIVE,
                      label: VitalStatusLabel.alive,
                      options: [
                        { id: VitalStatusOptions.age, label: VitalStatusOptionsLabel.age, checked: false },
                        { id: VitalStatusOptions.birth, label: VitalStatusOptionsLabel.birth, checked: false }
                      ]
                    },
                    {
                      id: VitalStatus.DECEASED,
                      label: VitalStatusLabel.deceased,

                      options: [
                        { id: VitalStatusOptions.birth, label: VitalStatusOptionsLabel.birth, checked: false },
                        {
                          id: VitalStatusOptions.deceasedDate,
                          label: VitalStatusOptionsLabel.deceasedDate,
                          checked: false
                        },
                        {
                          id: VitalStatusOptions.deceasedAge,
                          label: VitalStatusOptionsLabel.deceasedAge,
                          checked: false
                        }
                      ]
                    }
                  ]
                : []
            }
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={vitalStatus}
            onChange={(e, value) => {
              _onChangeValue('vitalStatus', value)
              if (value) setVitalStatus(value)
            }}
            renderInput={(params) => <TextField {...params} label="Statut vital" />}
          />

          {vitalStatus.id === VitalStatus.ALL && (
            <Autocomplete
              multiple
              id="criteria-vitalStatus-multiple"
              className={classes.inputItem}
              options={vitalStatus.options}
              getOptionLabel={(option) => option.label}
              onChange={(e, values) => handleOptionsChange(values)}
              renderInput={(params) => <TextField {...params} label="Critères supplémentaires" />}
            />
          )}

          {vitalStatus.id === VitalStatus.ALIVE && (
            <Autocomplete
              multiple
              id="criteria-vitalStatus-multiple"
              className={classes.inputItem}
              options={vitalStatus.options}
              getOptionLabel={(option) => option.label}
              onChange={(e, values) => handleOptionsChange(values)}
              renderInput={(params) => <TextField {...params} label="Critères supplémentaires" />}
            />
          )}

          {vitalStatus.id === VitalStatus.DECEASED && (
            <Autocomplete
              multiple
              id="criteria-vitalStatus-multiple"
              className={classes.inputItem}
              options={vitalStatus.options}
              getOptionLabel={(option) => option.label}
              onChange={(e, values) => handleOptionsChange(values)}
              renderInput={(params) => <TextField {...params} label="Critères supplémentaires" />}
            />
          )}

          {vitalStatus.options.map((option) => (
            <>
              {option.id === VitalStatusOptions.age && option.checked && <h1>Age</h1>}
              {option.id === VitalStatusOptions.birth && option.checked && <h1>Date</h1>}
              {option.id === VitalStatusOptions.deceasedAge && option.checked && <h1>Age décès</h1>}
              {option.id === VitalStatusOptions.deceasedDate && option.checked && <h1>Date décès</h1>}
            </>
          ))}

          <FormLabel style={{ padding: '0 1em 8px' }} component="legend">
            Fourchette d'âge :
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
              disableClearable
              className={classes.inputItem}
              options={[
                { id: Calendar.YEAR, criteriaLabel: CalendarLabel.YEAR, requestLabel: CalendarRequestLabel.YEAR },
                { id: Calendar.MONTH, criteriaLabel: CalendarLabel.MONTH, requestLabel: CalendarRequestLabel.MONTH },
                { id: Calendar.DAY, criteriaLabel: CalendarLabel.DAY, requestLabel: CalendarRequestLabel.DAY }
              ]}
              getOptionLabel={(option) => option.criteriaLabel}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={defaultValues.ageType}
              onChange={(e, value) => _onChangeValue('ageType', value)}
              renderInput={(params) => <TextField {...params} />}
            />
          </Grid>
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} type="submit" form="demographic-form" variant="contained" disabled={ageError}>
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default DemographicForm
