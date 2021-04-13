import React from 'react'

import { Button, Divider, Grid, IconButton, Typography /*, FormLabel */ } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'
import { Alert } from '@material-ui/lab'

import { FormBuilder } from '@arkhn/ui'

import useStyles from './styles'

import { DocumentDataType } from 'types'

type TestGeneratedFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultDemographic = {
  title: 'Critère de document',
  search: '',
  docType: [],
  encounter: 0,
  startOccurrence: '',
  endOccurrence: ''
}

const alertInfoContent = `Les négations seront automatiquement filtrées.`
const alertInfoExample = `Exemple: si vous recherchez le mot "hypertension", les documents comportant la mention "pas d'hypertension" ne seront pas retenus.`

const TestGeneratedForm: React.FC<TestGeneratedFormProps> = (props) => {
  const { selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const defaultValues = selectedCriteria || defaultDemographic

  const classes = useStyles()

  const isEdition = selectedCriteria !== null

  const _onSubmit = (data: any) => {
    onChangeSelectedCriteria({
      title: data.title,
      search: data.search,
      docType: data.docType,
      // encounter: data.encounter,
      startOccurrence: data.startOccurrence,
      endOccurrence: data.endOccurrence,
      type: 'Composition'
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
            <Typography className={classes.titleLabel}>Ajouter un critère de documents médicaux</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de documents médicaux</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        <FormBuilder<DocumentDataType>
          defaultValues={defaultValues}
          title={'Documents médicaux'}
          formStyle={{ height: 'auto' }}
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
              name: 'search',
              placeholder: 'Recherche dans les documents',
              type: 'text',
              variant: 'outlined',
              validationRules: {
                required: 'Merci de renseigner une recherche'
              }
            }
            // {
            //   name: 'docType',
            //   variant: 'outlined',
            //   label: 'Type de document',
            //   type: 'autocomplete',
            //   multiple: true,
            //   autocompleteOptions: criteria?.data?.docTypes || []
            // }
            // {
            //   name: 'encounter',
            //   label: "Nombre d'occurence",
            //   variant: 'outlined',
            //   type: 'number'
            // }
            // {
            //   type: 'custom',
            //   name: 'label',
            //   renderInput: () => (
            //     <FormLabel style={{ padding: '12px 12px 0 12px', marginBottom: -12 }} component="legend">
            //       Date d'occurrence :
            //     </FormLabel>
            //   )
            // },
            // {
            //   name: 'startOccurrence',
            //   label: 'Avant le',
            //   type: 'date'
            // },
            // {
            //   name: 'endOccurrence',
            //   label: 'Après le',
            //   type: 'date'
            // }
          ]}
          submit={_onSubmit}
          formId="documents-form"
          displaySubmitButton={false}
        />
        <Alert color="info" className={classes.alert}>
          <Typography>
            {alertInfoContent}
            <br />
            {alertInfoExample}
          </Typography>
        </Alert>
        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} color="primary" variant="outlined">
              Annuler
            </Button>
          )}
          <Button type="submit" form="documents-form" color="primary" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default TestGeneratedForm
