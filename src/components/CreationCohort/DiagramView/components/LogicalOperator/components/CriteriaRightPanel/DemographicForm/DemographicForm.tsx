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
  Switch
} from '@mui/material'

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import useStyles from './styles'

import { SelectedCriteriaType } from 'types'
import { VitalStatusLabel, VitalStatus, DurationRangeType } from 'types/searchCriterias'
import { Calendar, CalendarLabel, CalendarRequestLabel } from 'types/dates'
import CalendarRange from 'components/ui/Inputs/Calendar/CalendarRange'
import DurationRange from 'components/ui/Inputs/Duration/DurationRange'
import { BlockWrapper } from 'components/ui/Layout'
import { RESSOURCE_TYPE_PATIENT } from 'utils/cohortCreation'

enum Error {
  EMPTY_FORM,
  INCOHERENT_AGE_ERROR,
  NO_ERROR
}
type DemographicFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: SelectedCriteriaType) => void
}

const allVitalStatuses = [
  {
    id: VitalStatus.ALL,
    label: VitalStatusLabel.ALL
  },
  {
    id: VitalStatus.ALIVE,
    label: VitalStatusLabel.ALIVE
  },
  {
    id: VitalStatus.DECEASED,
    label: VitalStatusLabel.DECEASED
  }
]
/* 
const defaultDemographic: DemographicDataType = {
  type: 'Patient',
  title: 'Critère démographique',
  vitalStatus: [],
  genders: [],
  age: [null, null],
  birthdates: [null, null],
  deathDates: [null, null],
  // ageType: { id: Calendar.YEAR, criteriaLabel: CalendarLabel.YEAR, requestLabel: CalendarRequestLabel.YEAR },
  //years: [0, 130],
  isInclusive: true
}
 */
const DemographicForm = (props: DemographicFormProps) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [birthdates, setBirthdates] = useState<DurationRangeType>(selectedCriteria?.birthdates || [null, null])
  const [deathDates, setDeathDates] = useState<DurationRangeType>(selectedCriteria?.deathDates || [null, null])
  const [age, setAge] = useState<DurationRangeType>(selectedCriteria?.age || [null, null])
  const [vitalStatus, setVitalStatus] = useState(selectedCriteria?.age || VitalStatus.ALL)
  const [genders, setGenders] = useState(selectedCriteria?.genders || [])
  const [title, setTitle] = useState(selectedCriteria?.title || 'Critère démographique')
  const [isInclusive, setIsInclusive] = useState(selectedCriteria?.isInclusive || true)

  const { classes } = useStyles()

  const [error, setError] = useState(Error.NO_ERROR)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const isEdition = selectedCriteria !== null ? true : false

  useEffect(() => {
    setError(Error.NO_ERROR)
    if (
      vitalStatus === VitalStatus.ALL &&
      genders.length === 0 &&
      birthdates[0] === null &&
      birthdates[1] === null &&
      age[0] === null &&
      age[1] === null &&
      deathDates[0] === null &&
      deathDates[1] === null
    ) {
      setError(Error.EMPTY_FORM)
    }
  }, [vitalStatus, genders, birthdates, age, deathDates])

  const _onSubmit = () => {
    onChangeSelectedCriteria({
      age,
      birthdates,
      deathDates,
      genders,
      isInclusive,
      vitalStatus,
      title,
      type: RESSOURCE_TYPE_PATIENT
    })
  }

  /*const _onChangeValue = (key: string, value: any) => {
    const _defaultValues = defaultValues ? { ...defaultValues } : {}
    _defaultValues[key] = value
    setDefaultValues(_defaultValues)
  }*/

  /*const defaultValuesGender =
    genders && criteria.data.gender !== 'loading'
      ? genders.map((gender: any) => {
          const criteriaGender = criteria.data.gender ? criteria.data.gender.find((g: any) => g.id === gender.id) : null
          return {
            id: gender.id,
            label: gender.label ? gender.label : criteriaGender?.label ?? '?'
          }
        })
      : []*/
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

  /*useEffect(() => {
    if (!Number.isInteger(defaultValues.years[0]) || !Number.isInteger(defaultValues.years[1])) {
      setAgeError(true)
    } else {
      setAgeError(false)
    }
  }, [defaultValues.years])*/

  /* const handleOptionsChange = (values: Options) => {
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
  }*/

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
          <Typography variant="h6">Démographie patient</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Grid style={{ display: 'flex' }}>
            <FormLabel style={{ margin: 'auto 1em' }} component="legend">
              Exclure les patients qui suivent les règles suivantes
            </FormLabel>
            <Switch
              id="criteria-inclusive"
              checked={!isInclusive}
              onChange={(event) => setIsInclusive(!event.target.checked)}
              color="secondary"
            />
          </Grid>

          <Autocomplete
            multiple
            id="criteria-gender-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.gender || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={genders}
            onChange={(e, value) => setGenders(value)}
            renderInput={(params) => <TextField {...params} label="Genre" />}
          />

          <Autocomplete
            id="criteria-vitalStatus-autocomplete"
            className={classes.inputItem}
            options={allVitalStatuses}
            getOptionLabel={(option) =>
              option.label || VitalStatusLabel[option?.toUpperCase() as keyof typeof VitalStatusLabel]
            }
            isOptionEqualToValue={(option, value) => option.id === value}
            value={vitalStatus}
            onChange={(e, value) => {
              setVitalStatus(value.id)
            }}
            renderInput={(params) => <TextField {...params} label="Statut vital" />}
          />

          <BlockWrapper margin="1em">
            <CalendarRange
              inline
              disabled={age[0] !== null || age[1] !== null}
              value={birthdates}
              label={'Date de naissance'}
              onChange={(value) => setBirthdates(value)}
              onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
            />
          </BlockWrapper>

          <BlockWrapper margin="1em">
            <DurationRange
              value={age}
              disabled={birthdates[0] !== null || birthdates[1] !== null}
              label={vitalStatus === VitalStatus.DECEASED ? 'Âge au décès' : 'Âge actuel'}
              onChange={(value) => setAge(value)}
              onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
            />
          </BlockWrapper>

          {(vitalStatus === VitalStatus.DECEASED || vitalStatus === VitalStatus.ALL) && (
            <BlockWrapper margin="1em">
              <CalendarRange
                inline
                value={deathDates}
                label={'Date de décès'}
                onChange={(value) => setDeathDates(value)}
                onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
              />
            </BlockWrapper>
          )}
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} variant="outlined">
              Annuler
            </Button>
          )}
          <Button
            onClick={_onSubmit}
            type="submit"
            form="demographic-form"
            variant="contained"
            disabled={error === Error.INCOHERENT_AGE_ERROR || error === Error.EMPTY_FORM}
          >
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default DemographicForm
