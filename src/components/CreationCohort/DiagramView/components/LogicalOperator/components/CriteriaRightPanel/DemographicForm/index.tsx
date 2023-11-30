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

import { DurationRangeType, LabelObject, VitalStatusLabel } from 'types/searchCriterias'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import DurationRange from 'components/ui/Inputs/DurationRange'
import { CriteriaDataKey, SelectedCriteriaType, RessourceType } from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import { convertStringToDuration, checkMinMaxValue } from 'utils/age'

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

export const mappingCriteria = (criteriaToMap: any, key: string, mapping: any) => {
  if (criteriaToMap) {
    return criteriaToMap.map((criteria: any) => {
      const mappedCriteria = mapping.data[key]?.find((c: any) => c?.id === criteria?.id)
      return mappedCriteria
    })
  }
}

const DemographicForm = (props: DemographicFormProps) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [birthdates, setBirthdates] = useState<DurationRangeType>(selectedCriteria?.birthdates || [null, null])
  const [deathDates, setDeathDates] = useState<DurationRangeType>(selectedCriteria?.deathDates || [null, null])
  const [age, setAge] = useState<DurationRangeType>(selectedCriteria?.age || [null, null])
  const [vitalStatus, setVitalStatus] =
    useState(mappingCriteria(selectedCriteria?.vitalStatus, CriteriaDataKey.VITALSTATUS, criteria)) || []
  const [genders, setGenders] =
    useState(mappingCriteria(selectedCriteria?.genders, CriteriaDataKey.GENDER, criteria)) || []
  const [title, setTitle] = useState(selectedCriteria?.title || 'Critère démographique')
  const [isInclusive, setIsInclusive] = useState<boolean>(selectedCriteria?.isInclusive || true)

  const { classes } = useStyles()

  const [error, setError] = useState(Error.NO_ERROR)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const isEdition = selectedCriteria !== null ? true : false

  useEffect(() => {
    setError(Error.NO_ERROR)
    const _age0 = convertStringToDuration(age[0])
    const _age1 = convertStringToDuration(age[1])
    if (
      vitalStatus?.length === 0 &&
      genders?.length === 0 &&
      birthdates[0] === null &&
      birthdates[1] === null &&
      age[0] === null &&
      age[1] === null &&
      deathDates[0] === null &&
      deathDates[1] === null
    ) {
      setError(Error.EMPTY_FORM)
    }
    if (_age0 !== null && _age1 === null) {
      setError(Error.INCOHERENT_AGE_ERROR)
    }
    if (_age0 !== null && _age1 !== null && !checkMinMaxValue(_age0, _age1)) {
      setError(Error.INCOHERENT_AGE_ERROR)
    }
  }, [vitalStatus, genders, birthdates, age, deathDates])

  const onSubmit = () => {
    onChangeSelectedCriteria({
      id: selectedCriteria?.id,
      age,
      birthdates,
      deathDates,
      genders,
      isInclusive,
      vitalStatus,
      title,
      type: RessourceType.PATIENT
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
              onChange={(event) => setIsInclusive(!event.target.checked as boolean)}
              color="secondary"
            />
          </Grid>

          <Autocomplete
            multiple
            id="criteria-gender-autocomplete"
            className={classes.inputItem}
            options={criteria.data.gender || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={genders}
            onChange={(e, value) => setGenders(value)}
            renderInput={(params) => <TextField {...params} label="Genre" />}
          />

          <Autocomplete
            multiple
            id="criteria-vitalStatus-autocomplete"
            className={classes.inputItem}
            options={criteria.data.status}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={vitalStatus}
            onChange={(e, value) => {
              setVitalStatus(value)
              if (value.length === 1 && value[0].label === VitalStatusLabel.ALIVE) setDeathDates([null, null])
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
              label={
                vitalStatus &&
                vitalStatus.length === 1 &&
                vitalStatus.find((status: LabelObject) => status.label === VitalStatusLabel.DECEASED)
                  ? 'Âge au décès'
                  : 'Âge actuel'
              }
              onChange={(value) => setAge(value)}
              onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
            />
          </BlockWrapper>
          {vitalStatus &&
            (vitalStatus.length === 0 ||
              vitalStatus.find((status: LabelObject) => status.label === VitalStatusLabel.DECEASED)) && (
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
            onClick={onSubmit}
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
