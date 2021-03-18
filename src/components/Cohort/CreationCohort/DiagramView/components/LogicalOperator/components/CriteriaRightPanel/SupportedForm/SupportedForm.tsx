import React, { useState } from 'react'

import { Alert } from '@material-ui/lab'
import { Button, Divider, FormLabel, Grid, IconButton, Switch, Typography } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { FormBuilder } from '@arkhn/ui'

import useStyles from './styles'

import { EncounterDataType } from 'types'

type SupportedFormFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultDemographic = {
  title: 'Critère de prise en charge',
  label: '',
  ageType: { id: 'year', label: 'années' },
  years: [0, 130],
  durationType: { id: 'day', label: 'jours' },
  duration: [0, 100],
  // admissionMode: null,
  entryMode: null,
  exitMode: null,
  priseEnCharge: null,
  typeDeSejour: null,
  fileStatus: null,
  isInclusive: true
}

const SupportedFormForm: React.FC<SupportedFormFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const defaultValues = selectedCriteria || defaultDemographic

  const classes = useStyles()

  const [error, setError] = useState(false)

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = (data: any) => {
    if (
      data.ageType?.id === 'year' &&
      data.years[0] === 0 &&
      data.years[1] === 130 &&
      data.durationType?.id === 'day' &&
      data.duration[0] === 0 &&
      data.duration[1] === 100
    ) {
      return setError(true)
    }

    onChangeSelectedCriteria({
      ...defaultValues,
      title: data.title,
      ageType: data.ageType,
      years: data.years,
      durationType: data.durationType,
      duration: data.duration,
      // admissionMode: data.admissionMode,
      entryMode: data.entryMode,
      exitMode: data.exitMode,
      priseEnCharge: data.priseEnCharge,
      typeDeSejour: data.typeDeSejour,
      fileStatus: data.fileStatus,
      type: 'Encounter',
      isInclusive: data.isInclusive
    })
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
        <FormBuilder<EncounterDataType>
          defaultValues={defaultValues}
          title="Prise en charge"
          properties={[
            {
              name: 'title',
              placeholder: 'Nom du critère',
              type: 'text',
              variant: 'outlined',
              validationRules: {
                required: 'Merci de renseigner un titre'
              }
            },
            {
              name: 'isInclusive',
              type: 'custom',
              renderInput: (field: any) => (
                <Grid style={{ display: 'flex' }}>
                  <FormLabel
                    onClick={() => field.onChange(!field.value)}
                    style={{ margin: 'auto 1em' }}
                    component="legend"
                  >
                    Exclure les patients qui suivent les règles suivantes
                  </FormLabel>
                  <Switch checked={!field.value} onChange={(event) => field.onChange(!event.target.checked)} />
                </Grid>
              )
            },
            {
              type: 'custom',
              name: 'label',
              renderInput: () => (
                <FormLabel style={{ padding: '0 1em 8px' }} component="legend">
                  Âge au moment de la prise en charge :
                </FormLabel>
              )
            },
            {
              type: 'section',
              title: '',
              name: '',
              containerStyle: { display: 'grid', gridTemplateColumns: '1fr 180px' },
              properties: [
                {
                  name: 'years',
                  type: 'slider',
                  valueLabelDisplay: 'on',
                  valueLabelFormat: (value) => (value === 130 ? '130+' : value),
                  min: 0,
                  max: 130
                },
                {
                  name: 'ageType',
                  variant: 'outlined',
                  type: 'autocomplete',
                  autocompleteOptions: [
                    { id: 'year', label: 'années' },
                    { id: 'month', label: 'mois' },
                    { id: 'day', label: 'jours' }
                  ]
                }
              ]
            },
            {
              type: 'custom',
              name: 'label2',
              renderInput: () => (
                <FormLabel style={{ padding: '0 1em 8px' }} component="legend">
                  Durée de la prise en charge :
                </FormLabel>
              )
            },
            {
              type: 'section',
              title: '',
              name: '',
              containerStyle: { display: 'grid', gridTemplateColumns: '1fr 180px' },
              properties: [
                {
                  name: 'duration',
                  type: 'slider',
                  valueLabelDisplay: 'on',
                  valueLabelFormat: (value) => (value === 100 ? '100+' : value),
                  min: 0,
                  max: 100
                },
                {
                  name: 'durationType',
                  variant: 'outlined',
                  type: 'autocomplete',
                  autocompleteOptions: [
                    { id: 'year', label: 'années' },
                    { id: 'month', label: 'mois' },
                    { id: 'day', label: 'jours' }
                  ]
                }
              ]
            }
            // {
            //   name: 'admissionMode',
            //   variant: 'outlined',
            //   label: "Mode d'admission",
            //   type: 'autocomplete',
            //   autocompleteOptions: criteria?.data?.admissionModes
            // },
            // {
            //   name: 'entryMode',
            //   variant: 'outlined',
            //   label: "Mode d'entrée",
            //   type: 'autocomplete',
            //   autocompleteOptions: criteria?.data?.entryModes
            // },
            // {
            //   name: 'exitMode',
            //   variant: 'outlined',
            //   label: 'Mode de sortie',
            //   type: 'autocomplete',
            //   autocompleteOptions: criteria?.data?.exitModes
            // },
            // {
            //   name: 'priseEnChargeType',
            //   variant: 'outlined',
            //   label: 'Type de prise en charge',
            //   type: 'autocomplete',
            //   autocompleteOptions: criteria?.data?.priseEnChargeType
            // },
            // {
            //   name: 'typeDeSejour',
            //   variant: 'outlined',
            //   label: 'Type de séjour',
            //   type: 'autocomplete',
            //   autocompleteOptions: criteria?.data?.typeDeSejour
            // },
            // {
            //   name: 'fileStatus',
            //   variant: 'outlined',
            //   label: 'Statut Dossier',
            //   type: 'autocomplete',
            //   autocompleteOptions: criteria?.data?.fileStatus
            // }
          ]}
          submit={_onSubmit}
          formId="supported-form"
          displaySubmitButton={false}
          formFooter={
            <Grid className={classes.criteriaActionContainer}>
              {!isEdition && (
                <Button onClick={goBack} color="primary" variant="outlined">
                  Annuler
                </Button>
              )}
              <Button type="submit" form="supported-form" color="primary" variant="contained">
                Confirmer
              </Button>
            </Grid>
          }
        />
      </Grid>
    </Grid>
  )
}

export default SupportedFormForm
