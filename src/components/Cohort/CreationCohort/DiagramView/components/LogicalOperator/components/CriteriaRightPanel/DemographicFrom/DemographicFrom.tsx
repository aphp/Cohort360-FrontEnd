import React, { useState } from 'react'

import { Alert } from '@material-ui/lab'
import { Button, Divider, FormLabel, Grid, IconButton, Typography, TextField, Switch, Slider } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import useStyles from './styles'

import { DemographicDataType } from 'types'

type DemographicFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultDemographic: DemographicDataType = {
  type: 'Patient',
  title: 'Critère démographique',
  vitalStatus: [],
  gender: [],
  ageType: { id: 'year', label: 'années' },
  years: [0, 130],
  isInclusive: true
}

const DemographicForm: React.FC<DemographicFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [defaultValues, setDefaultValues] = useState(selectedCriteria || defaultDemographic)

  const classes = useStyles()

  const [error, setError] = useState(false)

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = () => {
    if (
      defaultValues &&
      defaultValues.vitalStatus &&
      defaultValues.vitalStatus.length === 0 &&
      defaultValues.gender &&
      defaultValues.gender.length === 0 &&
      defaultValues.years &&
      +defaultValues.years[0] === 0 &&
      +defaultValues.years[1] === 130
    ) {
      // If no input has been set
      return setError(true)
    }

    onChangeSelectedCriteria(defaultValues)
  }

  const _onChangeValue = (key: string, value: any) => {
    const _defaultValues = defaultValues ? { ...defaultValues } : {}
    _defaultValues[key] = value
    setDefaultValues(_defaultValues)
  }

  if (criteria.data.gender === 'loading' || criteria.data.status === 'loading') {
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
            <Typography className={classes.titleLabel}>Ajouter un critère démographique</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère démographique</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        {error && <Alert severity="error">Merci de renseigner un champs</Alert>}

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">Démographie patient</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            defaultValue="Critère démographique"
            variant="outlined"
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
            />
          </Grid>

          <Autocomplete
            multiple
            id="criteria-gender-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.gender || []}
            getOptionLabel={(option) => option.label}
            defaultValue={defaultValues.gender}
            onChange={(e, value) => _onChangeValue('gender', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Genre" />}
          />

          <Autocomplete
            multiple
            id="criteria-vitalStatus-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.status || []}
            getOptionLabel={(option) => option.label}
            defaultValue={defaultValues.vitalStatus}
            onChange={(e, value) => _onChangeValue('vitalStatus', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Statut vital" />}
          />

          <FormLabel style={{ padding: '0 1em 8px' }} component="legend">
            Fourchette d'âge :
          </FormLabel>

          <Grid style={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', margin: '0 1em' }}>
            <Slider
              value={defaultValues.years}
              onChange={(e, value) => _onChangeValue('years', value)}
              aria-labelledby="range-slider"
              valueLabelDisplay="on"
              valueLabelFormat={(value) => (value === 130 ? '130+' : value)}
              min={0}
              max={130}
            />

            <Autocomplete
              id="criteria-ageType-autocomplete"
              className={classes.inputItem}
              options={[
                { id: 'year', label: 'années' },
                { id: 'month', label: 'mois' },
                { id: 'day', label: 'jours' }
              ]}
              getOptionLabel={(option) => option.label}
              defaultValue={defaultValues.ageType}
              onChange={(e, value) => _onChangeValue('ageType', value)}
              renderInput={(params) => <TextField {...params} variant="outlined" />}
            />
          </Grid>
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} color="primary" variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} type="submit" form="demographic-form" color="primary" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default DemographicForm
