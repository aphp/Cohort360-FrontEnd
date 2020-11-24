import React from 'react'

import { Button, Divider, Grid, IconButton, Typography } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import Form from '../../../../../../../FormBuilder/FormBuilder'

import useStyles from './styles'

type FormData = {
  title: string
  gender: { id: string; label: string }
  vitalStatus: { id: string; label: string }
  years: [number, number]
}

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
  years: [0, 100]
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
      years: data.years,
      type: 'Patient'
    })
  }

  if (criteria.data.gender === 'loading') {
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
        title={'Démographie patient'}
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
            name: 'gender',
            label: 'Genre',
            variant: 'outlined',
            type: 'autocomplete',
            autocompleteOptions: criteria?.data?.gender?.map((gender: any) => ({
              id: gender.value,
              label: gender.display
            }))
          },
          {
            name: 'vitalStatus',
            variant: 'outlined',
            label: 'Status vital',
            type: 'autocomplete',
            autocompleteOptions: criteria?.data?.deceased?.map((deceased: any) => ({
              id: deceased.code,
              label: deceased.display
            }))
          },
          {
            name: 'years',
            label: "Fourchette d'âge",
            type: 'slider',
            minValue: 0,
            maxValue: 100
          }
        ]}
        submit={_onSubmit}
        formId="demographic-form"
        noSubmitButton
      />

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
    </Grid>
  )
}

export default DemographicForm
