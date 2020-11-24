import React from 'react'

import { Button, Divider, Grid, IconButton, Typography } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import Form from '../../../../../../../FormBuilder/FormBuilder'

import useStyles from './styles'

type FormData = {
  title: string
  code: { id: string; label: string }[]
  occurence: number
  label: undefined
  startOccurrence: Date
  endOccurrence: Date
}

type Cim10FormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultDemographic = {
  title: 'Critère de diagnostic',
  code: [],
  startOccurrence: '',
  endOccurrence: ''
}

const Cim10Form: React.FC<Cim10FormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const defaultValues = selectedCriteria || defaultDemographic

  const classes = useStyles()

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = (data: any) => {
    onChangeSelectedCriteria({
      title: data.title,
      code: data.code,
      type: 'diagnostics'
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
            <Typography className={classes.titleLabel}>Ajouter un critère de diagnostic</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de diagnostic</Typography>
        )}
      </Grid>

      <Form<FormData>
        defaultValues={defaultValues}
        title="Diagnostic"
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
            label: 'CIM 10 Diag Code',
            variant: 'outlined',
            type: 'autocomplete',
            autocompleteOptions:
              criteria?.data?.cimData?.map((cimData: any) => ({
                id: cimData['DIAGNOSIS CODE'],
                label: `${cimData['DIAGNOSIS CODE']} - ${cimData['LONG DESCRIPTION']}`
              })) || []
          }
        ]}
        submit={_onSubmit}
        formId="cim10-form"
        noSubmitButton
      />

      <Grid className={classes.criteriaActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} color="primary" variant="outlined">
            Annuler
          </Button>
        )}
        <Button type="submit" form="cim10-form" color="primary" variant="contained">
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default Cim10Form
