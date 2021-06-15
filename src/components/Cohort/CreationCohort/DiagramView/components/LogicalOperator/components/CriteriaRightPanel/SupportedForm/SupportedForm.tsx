import React, { useState } from 'react'

import { Alert, Autocomplete } from '@material-ui/lab'
import { Button, Divider, FormLabel, Grid, IconButton, Slider, Switch, Typography, TextField } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

// import { InputAutocompleteAsync as AutocompleteAsync } from 'components/Inputs'

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
  entryMode: [],
  exitMode: [],
  priseEnChargeType: [],
  typeDeSejour: [],
  fileStatus: [],
  isInclusive: true
}

const SupportedFormForm: React.FC<SupportedFormFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const [defaultValues, setDefaultValues] = useState(selectedCriteria || defaultEncounter)

  const classes = useStyles()

  const [error, setError] = useState(false)
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
      defaultValues.entryMode.length === 0 &&
      defaultValues.exitMode.length === 0 &&
      defaultValues.priseEnChargeType.length === 0 &&
      defaultValues.typeDeSejour.length === 0 &&
      defaultValues.fileStatus.length === 0
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
    criteria?.data?.priseEnChargeType === 'loading' ||
    criteria?.data?.typeDeSejour === 'loading' ||
    criteria?.data?.fileStatus === 'loading'
  ) {
    return <></>
  }

  const defaultValuesEntryModes = defaultValues.entryMode
    ? defaultValues.entryMode.map((entryModes: any) => {
        const criteriaEntryModes = criteria.data.entryModes
          ? criteria.data.entryModes.find((c: any) => c.id === entryModes.id)
          : null
        return {
          id: entryModes.id,
          label: entryModes.label ? entryModes.label : criteriaEntryModes?.label ?? '?'
        }
      })
    : []

  const defaultValuesExitModes = defaultValues.exitMode
    ? defaultValues.exitMode.map((exitModes: any) => {
        const criteriaExitModes = criteria.data.exitModes
          ? criteria.data.exitModes.find((c: any) => c.id === exitModes.id)
          : null
        return {
          id: exitModes.id,
          label: exitModes.label ? exitModes.label : criteriaExitModes?.label ?? '?'
        }
      })
    : []

  const defaultValuesPriseEnChargeType = defaultValues.priseEnChargeType
    ? defaultValues.priseEnChargeType.map((priseEnChargeTypes: any) => {
        const criteriaPriseEnChargesTypes = criteria.data.priseEnChargeType
          ? criteria.data.priseEnChargeType.find((c: any) => c.id === priseEnChargeTypes.id)
          : null
        return {
          id: priseEnChargeTypes.id,
          label: priseEnChargeTypes.label ? priseEnChargeTypes.label : criteriaPriseEnChargesTypes?.label ?? '?'
        }
      })
    : []

  const defaultValuesTypeDeSejours = defaultValues.typeDeSejour
    ? defaultValues.typeDeSejour.map((typeDeSejours: any) => {
        const criteriaTypeDeSejours = criteria.data.typeDeSejour
          ? criteria.data.typeDeSejour.find((c: any) => c.id === typeDeSejours.id)
          : null
        return {
          id: typeDeSejours.id,
          label: typeDeSejours.label ? typeDeSejours.label : criteriaTypeDeSejours?.label ?? '?'
        }
      })
    : []

  const defaultValuesFileStatus = defaultValues.fileStatus
    ? defaultValues.fileStatus.map((fileStatus: any) => {
        const criteriaFileStatus = criteria.data.fileStatus
          ? criteria.data.fileStatus.find((c: any) => c.id === fileStatus.id)
          : null
        return {
          id: fileStatus.id,
          label: fileStatus.label ? fileStatus.label : criteriaFileStatus?.label ?? '?'
        }
      })
    : []

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
              getOptionSelected={(option, value) => option.id === value.id}
              value={defaultValues.ageType}
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
              getOptionSelected={(option, value) => option.id === value.id}
              value={defaultValues.durationType}
              onChange={(e, value) => _onChangeValue('durationType', value)}
              renderInput={(params) => <TextField {...params} variant="outlined" />}
            />
          </Grid>

          <FormLabel style={{ padding: '0 1em 8px' }} component="legend">
            Mode d'entrée :
          </FormLabel>

          <Autocomplete
            multiple
            id="criteria-entryMode-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.entryModes || []}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.id === value.id}
            value={defaultValuesEntryModes}
            onChange={(e, value) => _onChangeValue('entryMode', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Mode d'entré" />}
          />

          <FormLabel style={{ padding: '0 1em 8px' }} component="legend">
            Mode de sortie :
          </FormLabel>

          <Autocomplete
            multiple
            id="criteria-exitMode-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.exitModes || []}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.id === value.id}
            value={defaultValuesExitModes}
            onChange={(e, value) => _onChangeValue('exitMode', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Mode de sortie" />}
          />

          <FormLabel style={{ padding: '0 1em 8px' }} component="legend">
            Type de prise en charge :
          </FormLabel>

          <Autocomplete
            multiple
            id="criteria-PriseEnChargeType-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.priseEnChargeType || []}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.id === value.id}
            value={defaultValuesPriseEnChargeType}
            onChange={(e, value) => _onChangeValue('priseEnChargeType', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Type de prise en charge" />}
          />

          <FormLabel style={{ padding: '0 1em 8px' }} component="legend">
            Type de séjour :
          </FormLabel>

          <Autocomplete
            multiple
            id="criteria-TypeDeSejour-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.typeDeSejour || []}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.id === value.id}
            value={defaultValuesTypeDeSejours}
            onChange={(e, value) => _onChangeValue('typeDeSejour', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Type de séjour" />}
          />

          <FormLabel style={{ padding: '0 1em 8px' }} component="legend">
            Status dossier :
          </FormLabel>

          <Autocomplete
            multiple
            id="criteria-FileStatus-autocomplete"
            className={classes.inputItem}
            options={criteria?.data?.fileStatus || []}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.id === value.id}
            value={defaultValuesFileStatus}
            onChange={(e, value) => _onChangeValue('fileStatus', value)}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Status dossier" />}
          />
        </Grid>

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
