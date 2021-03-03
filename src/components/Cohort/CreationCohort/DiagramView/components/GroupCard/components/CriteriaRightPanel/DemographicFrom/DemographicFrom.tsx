import React from 'react'

import { Button, Divider, Grid, IconButton, Typography, FormLabel } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { FormBuilder } from '@arkhn/ui'

import useStyles from './styles'

import { DemographicDataType } from 'types'

type DemographicFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultDemographic = {
  title: 'Critère démographique',
  vitalStatus: [],
  gender: [],
  ageType: { id: 'year', label: 'années' },
  years: [0, 130]
}

const DemographicForm: React.FC<DemographicFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const defaultValues = selectedCriteria || defaultDemographic

  const classes = useStyles()

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = (data: any) => {
    onChangeSelectedCriteria({
      title: data.title,
      vitalStatus: data.vitalStatus,
      gender: data.gender,
      ageType: data.ageType,
      years: data.years,
      type: 'Patient'
    })
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
        <FormBuilder<DemographicDataType>
          defaultValues={defaultValues}
          title={'Démographie patient'}
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
              name: 'gender',
              label: 'Genre',
              variant: 'outlined',
              type: 'autocomplete',
              multiple: true,
              autocompleteOptions: criteria?.data?.gender || []
            },
            {
              name: 'vitalStatus',
              variant: 'outlined',
              label: 'Status vital',
              type: 'autocomplete',
              multiple: true,
              autocompleteOptions: criteria?.data?.status || []
            },
            {
              type: 'custom',
              name: 'label',
              renderInput: () => (
                <FormLabel style={{ padding: '0 1em 8px' }} component="legend">
                  Fourchette d'âge :
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
            }
          ]}
          submit={_onSubmit}
          formId="demographic-form"
          formFooter={
            <Grid className={classes.criteriaActionContainer}>
              {!isEdition && (
                <Button onClick={goBack} color="primary" variant="outlined">
                  Annuler
                </Button>
              )}
              <Button type="submit" form="demographic-form" color="primary" variant="contained">
                Confirmer
              </Button>
            </Grid>
          }
        />
      </Grid>
    </Grid>
  )
}

export default DemographicForm
