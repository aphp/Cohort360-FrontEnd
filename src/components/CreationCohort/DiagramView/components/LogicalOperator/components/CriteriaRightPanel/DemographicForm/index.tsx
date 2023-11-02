import React, { useState } from 'react'

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

import { useAppSelector } from 'state'

import { DurationRangeType, LabelObject, VitalStatusLabel } from 'types/searchCriterias'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import DurationRange from 'components/ui/Inputs/DurationRange'
import { CriteriaDataKey, DemographicDataType, RessourceType } from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import { CriteriaDrawerComponentProps, CriteriaItemDataCache } from 'types'

enum Error {
  INCOHERENT_AGE_ERROR,
  NO_ERROR
}

export const mappingCriteria = (criteriaToMap: any, key: CriteriaDataKey, mapping: CriteriaItemDataCache) => {
  if (criteriaToMap) {
    return criteriaToMap.map((criteria: any) => {
      const mappedCriteria = mapping.data?.[key]?.find((c: any) => c?.id === criteria?.id)
      return mappedCriteria
    })
  } else {
    return []
  }
}

const DemographicForm = (props: CriteriaDrawerComponentProps) => {
  const { criteriaData, onChangeSelectedCriteria, goBack } = props
  const selectedCriteria: DemographicDataType | null = props.selectedCriteria as DemographicDataType
  const [birthdates, setBirthdates] = useState<DurationRangeType>(selectedCriteria?.birthdates || [null, null])
  const [deathDates, setDeathDates] = useState<DurationRangeType>(selectedCriteria?.deathDates || [null, null])
  const [age, setAge] = useState<DurationRangeType>(selectedCriteria?.age || [null, null])
  const [vitalStatus, setVitalStatus] =
    useState(mappingCriteria(selectedCriteria?.vitalStatus, CriteriaDataKey.VITALSTATUS, criteriaData)) || []
  const [genders, setGenders] =
    useState(mappingCriteria(selectedCriteria?.genders, CriteriaDataKey.GENDER, criteriaData)) || []
  const [title, setTitle] = useState(selectedCriteria?.title || 'Critère démographique')
  const [isInclusive, setIsInclusive] = useState<boolean>(
    selectedCriteria?.isInclusive === undefined ? true : selectedCriteria?.isInclusive
  )

  const selectedPopulation = useAppSelector((state) => state.cohortCreation.request.selectedPopulation || [])

  const deidentified: boolean | undefined =
    selectedPopulation === null
      ? undefined
      : selectedPopulation
          .map((population) => population && population.access)
          .filter((elem) => elem && elem === 'Pseudonymisé').length > 0

  const { classes } = useStyles()

  const [error, setError] = useState(Error.NO_ERROR)
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const isEdition = selectedCriteria !== null ? true : false

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
            options={criteriaData.data.gender || []}
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
            options={criteriaData.data.status}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={vitalStatus}
            onChange={(e, value) => {
              setVitalStatus(value)
              if (value.length === 1 && value[0].label === VitalStatusLabel.ALIVE) setDeathDates([null, null])
            }}
            renderInput={(params) => <TextField {...params} label="Statut vital" />}
          />

          {!deidentified && (
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
          )}

          <BlockWrapper margin="1em">
            <DurationRange
              value={age}
              disabled={birthdates[0] === null && birthdates[1] === null}
              label={
                vitalStatus &&
                vitalStatus.length === 1 &&
                vitalStatus.find((status: LabelObject) => status.label === VitalStatusLabel.DECEASED)
                  ? 'Âge au décès'
                  : 'Âge actuel'
              }
              onChange={(value) => setAge(value)}
              onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
              deidentified={deidentified}
            />
          </BlockWrapper>
          {!deidentified &&
            vitalStatus &&
            (vitalStatus.length === 0 ||
              (vitalStatus.length === 1 &&
                vitalStatus.find((status: LabelObject) => status.label === VitalStatusLabel.DECEASED))) && (
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
            disabled={error === Error.INCOHERENT_AGE_ERROR}
          >
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default DemographicForm
