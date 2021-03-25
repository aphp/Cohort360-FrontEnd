import React from 'react'

import { Button, Divider, Grid, IconButton, Typography, FormLabel } from '@material-ui/core'
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
  admissionMode: null,
  entryMode: null,
  exitMode: null,
  fileStatus: null
}

const SupportedFormForm: React.FC<SupportedFormFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const defaultValues = selectedCriteria || defaultDemographic

  const classes = useStyles()

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = (data: any) => {
    onChangeSelectedCriteria({
      title: data.title,
      ageType: data.ageType,
      years: data.years,
      durationType: data.durationType,
      duration: data.duration,
      admissionMode: data.admissionMode,
      entryMode: data.entryMode,
      exitMode: data.exitMode,
      fileStatus: data.fileStatus,
      type: 'Encounter'
    })
  }

  if (
    criteria?.data?.admissionModes === 'loading' ||
    criteria?.data?.entryModes === 'loading' ||
    criteria?.data?.exitModes === 'loading' ||
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
            },
            {
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
              name: 'onSaitPas',
              variant: 'outlined',
              label: '?????',
              type: 'autocomplete',
              autocompleteOptions: criteria?.data?.onSaitPas
            },
            {
              name: 'fileStatus',
              variant: 'outlined',
              label: 'Statut Dossier',
              type: 'autocomplete',
              autocompleteOptions: criteria?.data?.fileStatus
            }
          ]}
          submit={_onSubmit}
          formId="supported-form"
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
