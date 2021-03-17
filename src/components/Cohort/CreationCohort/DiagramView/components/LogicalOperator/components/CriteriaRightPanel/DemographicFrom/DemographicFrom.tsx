import React, { useState } from 'react'

import { Alert } from '@material-ui/lab'
import { Button, Divider, FormLabel, Grid, IconButton, Typography, Switch } from '@material-ui/core'
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
  years: [0, 130],
  isInclusive: true
}

const DemographicForm: React.FC<DemographicFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const defaultValues = selectedCriteria || defaultDemographic

  const classes = useStyles()

  const [error, setError] = useState(false)

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = (data: any) => {
    if (
      data &&
      data.vitalStatus &&
      data.vitalStatus.length === 0 &&
      data.gender &&
      data.gender.length === 0 &&
      data.years &&
      +data.years[0] === 0 &&
      +data.years[1] === 130
    ) {
      // If no input has been set
      return setError(true)
    }

    onChangeSelectedCriteria({
      ...defaultValues,
      title: data.title,
      vitalStatus: data.vitalStatus,
      gender: data.gender,
      ageType: data.ageType,
      years: data.years,
      type: 'Patient',
      isInclusive: data.isInclusive
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
        {error && <Alert severity="error">Merci de renseigner un champs</Alert>}
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
              label: 'Statut vital',
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
          displaySubmitButton={false}
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
