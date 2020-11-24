import React from 'react'

import { Button, Divider, Grid, IconButton, Typography } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import Form from '../../../../../../../FormBuilder/FormBuilder'

import useStyles from './styles'

type FormData = {
  title: string
  code: { id: string; label: string }[]
  label: undefined
  startOccurrence: Date
  endOccurrence: Date
}

type TestGeneratedFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultDemographic = {
  title: "Critères d'actes CCAM",
  code: [],
  startOccurrence: '',
  endOccurrence: ''
}

const TestGeneratedForm: React.FC<TestGeneratedFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const defaultValues = selectedCriteria || defaultDemographic

  const classes = useStyles()

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = (data: any) => {
    onChangeSelectedCriteria({
      title: data.title,
      code: data.code,
      startOccurrence: data.startOccurrence,
      endOccurrence: data.endOccurrence,
      type: 'ccam'
    })
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
            <Typography className={classes.titleLabel}>Ajouter un critère d'acte CCAM</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère d'acte CCAM</Typography>
        )}
      </Grid>

      <Form<FormData>
        defaultValues={defaultValues}
        title="Actes CCAM"
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
            name: 'code',
            label: "Codes d'actes CCAM",
            variant: 'outlined',
            type: 'autocomplete',
            autocompleteOptions: criteria?.data?.ccamData?.map((ccamData: any) => ({
              id: ccamData['CCAM CODE'],
              label: `${ccamData['CCAM CODE']} - ${ccamData['LONG DESCRIPTION']}`
            }))
          },
          {
            name: 'label',
            label: "Date d'occurrence :",
            type: 'label'
          },
          {
            name: 'startOccurrence',
            label: 'Avant le',
            type: 'date'
          },
          {
            name: 'endOccurrence',
            label: 'Après le',
            type: 'date'
          }
        ]}
        submit={_onSubmit}
        formId="ccam-form"
        noSubmitButton
      />

      <Grid className={classes.criteriaActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} color="primary" variant="outlined">
            Annuler
          </Button>
        )}
        <Button type="submit" form="ccam-form" color="primary" variant="contained">
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default TestGeneratedForm
