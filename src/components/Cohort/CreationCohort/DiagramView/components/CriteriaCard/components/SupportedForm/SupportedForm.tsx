import React from 'react'

import { Button, Divider, Grid, IconButton, Typography, FormLabel } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { FormBuilder } from '@arkhn/ui'

import useStyles from './styles'

import { EncounterDataType } from 'types'
import { capitalizeFirstLetter } from 'utils/capitalize'

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
  years: [0, 100],
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
      ageType: data.years && data.years[0] === 0 && data.years[1] === 100 ? null : data.ageType,
      years: data.years && data.years[0] === 0 && data.years[1] === 100 ? null : data.years,
      duration: data.duration && data.duration[0] === 0 && data.duration[1] === 100 ? null : data.duration,
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
              required: 'Merci de renseigné un titre'
            }
          },
          {
            type: 'custom',
            name: 'label',
            renderInput: () => <FormLabel component="legend">Âge au moment de la prise en charge :</FormLabel>
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
            name: 'years',
            type: 'slider',
            valueLabelDisplay: 'auto',
            min: 0,
            max: 100
          },
          {
            label: 'Durée de la prise en charge',
            name: 'duration',
            type: 'slider',
            valueLabelDisplay: 'auto',
            min: 0,
            max: 100
          },
          {
            name: 'admissionMode',
            variant: 'outlined',
            label: "Mode d'admission",
            type: 'autocomplete',
            autocompleteOptions: criteria?.data?.admissionModes?.map((admissionModes: any) => ({
              id: admissionModes.code,
              label: capitalizeFirstLetter(admissionModes.display)
            }))
          },
          {
            name: 'entryMode',
            variant: 'outlined',
            label: "Mode d'entrée",
            type: 'autocomplete',
            autocompleteOptions: criteria?.data?.entryModes?.map((entryModes: any) => ({
              id: entryModes.code,
              label: capitalizeFirstLetter(entryModes.display)
            }))
          },
          {
            name: 'exitMode',
            variant: 'outlined',
            label: 'Mode de sortie',
            type: 'autocomplete',
            autocompleteOptions: criteria?.data?.exitModes?.map((exitModes: any) => ({
              id: exitModes.code,
              label: capitalizeFirstLetter(exitModes.display)
            }))
          },
          {
            name: 'fileStatus',
            variant: 'outlined',
            label: 'Statut Dossier',
            type: 'autocomplete',
            autocompleteOptions: criteria?.data?.fileStatus?.map((fileStatus: any) => ({
              id: fileStatus.code,
              label: capitalizeFirstLetter(fileStatus.display)
            }))
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
  )
}

export default SupportedFormForm
