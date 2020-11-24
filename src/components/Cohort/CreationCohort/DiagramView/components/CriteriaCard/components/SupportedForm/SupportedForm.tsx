import React from 'react'

import { Button, Divider, Grid, IconButton, Typography } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import Form from '../../../../../../../FormBuilder/FormBuilder'

import useStyles from './styles'

type FormData = {
  label: undefined
  title: string
  ageType: string
  age: [number, number]
  duration: [number, number]
  admissionMode: []
  entryMode: []
  exitMode: []
  fileStatus: []
}

type SupportedFormFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultDemographic = {
  title: 'Critère de prise en charge',
  label: '',
  ageType: { id: 'year', label: 'En années' },
  age: [0, 100],
  duration: [0, 100],
  admissionMode: [],
  entryMode: [],
  exitMode: [],
  fileStatus: []
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
      age: data.age,
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
            <Typography className={classes.titleLabel}>Ajouter un critère démographique</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère démographique</Typography>
        )}
      </Grid>

      <Form<FormData>
        defaultValues={defaultValues}
        title="Prise en charge"
        properties={[
          {
            name: 'title',
            placeholder: 'Nom du critère',
            type: 'text',
            variant: 'outlined',
            options: {
              required: 'Merci de renseigné un titre'
            }
          },
          {
            name: 'label',
            type: 'label',
            label: 'Age au moment de la prise en charge'
          },
          {
            name: 'ageType',
            variant: 'outlined',
            type: 'autocomplete',
            autocompleteOptions: [
              { id: 'year', label: 'En années' },
              { id: 'month', label: 'En mois' },
              { id: 'day', label: 'En jours' }
            ]
          },
          {
            name: 'age',
            type: 'slider',
            minValue: 0,
            maxValue: 100
          },
          {
            label: 'Durée de la prise en charge',
            name: 'duration',
            type: 'slider',
            minValue: 0,
            maxValue: 100
          },
          {
            name: 'admissionMode',
            variant: 'outlined',
            label: "Mode d'admission",
            type: 'autocomplete',
            autocompleteOptions: criteria?.data?.admissionModes?.map((admissionModes: any) => ({
              id: admissionModes.code,
              label: admissionModes.display
            }))
          },
          {
            name: 'entryMode',
            variant: 'outlined',
            label: "Mode d'entré",
            type: 'autocomplete',
            autocompleteOptions: criteria?.data?.entryModes?.map((entryModes: any) => ({
              id: entryModes.code,
              label: entryModes.display
            }))
          },
          {
            name: 'exitMode',
            variant: 'outlined',
            label: 'Mode de sortie',
            type: 'autocomplete',
            autocompleteOptions: criteria?.data?.exitModes?.map((exitModes: any) => ({
              id: exitModes.code,
              label: exitModes.display
            }))
          },
          {
            name: 'fileStatus',
            variant: 'outlined',
            label: 'Status Dossier',
            type: 'autocomplete',
            autocompleteOptions: criteria?.data?.fileStatus?.map((fileStatus: any) => ({
              id: fileStatus.code,
              label: fileStatus.display
            }))
          }
        ]}
        submit={_onSubmit}
        formId="supported-form"
        noSubmitButton
      />

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
    </Grid>
  )
}

export default SupportedFormForm
