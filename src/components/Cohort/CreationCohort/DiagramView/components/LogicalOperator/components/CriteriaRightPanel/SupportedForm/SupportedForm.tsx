import React, { useState } from 'react'

import { Alert } from '@material-ui/lab'
import { Button, Divider, FormLabel, Grid, IconButton, Slider, Switch, Typography, TextField } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import useStyles from './styles'

import { EncounterDataType } from 'types'

type SupportedFormFormProps = {
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
  admissionMode: null,
  entryMode: null,
  exitMode: null,
  priseEnChargeType: null,
  typeDeSejour: null,
  fileStatus: null,
  isInclusive: true
}

const SupportedFormForm: React.FC<SupportedFormFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const [defaultValues, setDefaultValues] = useState(selectedCriteria || defaultEncounter)

  const classes = useStyles()

  const [error, setError] = useState(false)

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = () => {
    if (
      defaultValues.ageType?.id === 'year' &&
      defaultValues.years[0] === 0 &&
      defaultValues.years[1] === 130 &&
      defaultValues.durationType?.id === 'day' &&
      defaultValues.duration[0] === 0 &&
      defaultValues.duration[1] === 100
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
    // criteria?.data?.admissionModes === 'loading' ||
    criteria?.data?.entryModes === 'loading' ||
    criteria?.data?.exitModes === 'loading' ||
    criteria?.data?.priseEnCharge === 'loading' ||
    criteria?.data?.typeDeSejour === 'loading' ||
    criteria?.data?.fileStatus === 'loading'
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
        {error && <Alert severity="error">Merci de renseigner un champs</Alert>}

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">Prise en charge</Typography>

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

          <FormLabel style={{ padding: '1em' }} component="legend">
            Âge au moment de la prise en charge :
          </FormLabel>

          <Grid style={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', margin: '0 1em' }}>
            <Slider
              value={defaultValues.years}
              onChange={(e, value) => _onChangeValue('years', value)}
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

          <FormLabel style={{ padding: '0 1em 8px' }} component="legend">
            Durée de la prise en charge :
          </FormLabel>

          <Grid style={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', margin: '0 1em' }}>
            <Slider
              value={defaultValues.duration}
              onChange={(e, value) => _onChangeValue('duration', value)}
              valueLabelDisplay="on"
              valueLabelFormat={(value) => (value === 100 ? '100+' : value)}
              min={0}
              max={100}
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
              defaultValue={defaultValues.durationType}
              onChange={(e, value) => _onChangeValue('durationType', value)}
              renderInput={(params) => <TextField {...params} variant="outlined" />}
            />
          </Grid>
        </Grid>

        {/* {
              name: 'admissionMode',
              variant: 'outlined',
              label: "Mode d'admission",
              type: 'autocomplete',
              autocompleteOptions: criteria?.data?.admissionModes
            },
            {
              name: 'entryMode',
              variant: 'outlined',
              label: "Mode d'entrée",
              type: 'autocomplete',
              autocompleteOptions: criteria?.data?.entryModes
            },
            {
              name: 'exitMode',
              variant: 'outlined',
              label: 'Mode de sortie',
              type: 'autocomplete',
              autocompleteOptions: criteria?.data?.exitModes
            },
            {
              name: 'priseEnChargeType',
              variant: 'outlined',
              label: 'Type de prise en charge',
              type: 'autocomplete',
              autocompleteOptions: criteria?.data?.priseEnChargeType
            },
            {
              name: 'typeDeSejour',
              variant: 'outlined',
              label: 'Type de séjour',
              type: 'autocomplete',
              autocompleteOptions: criteria?.data?.typeDeSejour
            },
            {
              name: 'fileStatus',
              variant: 'outlined',
              label: 'Statut Dossier',
              type: 'autocomplete',
              autocompleteOptions: criteria?.data?.fileStatus
            
            } */}
        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} color="primary" variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} type="submit" form="supported-form" color="primary" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SupportedFormForm
