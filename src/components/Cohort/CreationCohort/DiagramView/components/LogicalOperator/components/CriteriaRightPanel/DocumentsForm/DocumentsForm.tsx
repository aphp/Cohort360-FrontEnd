import React from 'react'

import { Button, Divider, Grid, IconButton, Switch, Typography, FormLabel } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { FormBuilder } from '@arkhn/ui'

import useStyles from './styles'

import { DocumentDataType } from 'types'

type TestGeneratedFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultComposition = {
  title: 'Critère de document',
  search: '',
  docType: [],
  occurrence: 0,
  occurrenceComparator: '<=',
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true
}

const CompositionForm: React.FC<TestGeneratedFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const defaultValues = selectedCriteria || defaultComposition

  const classes = useStyles()

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = (data: any) => {
    console.log('data', data)
    onChangeSelectedCriteria({
      ...defaultValues,
      title: data.title,
      search: data.search,
      docType: data.docType,
      occurrence: data.occurrence,
      occurrenceComparator: data.occurrenceComparator,
      startOccurrence: data.startOccurrence,
      endOccurrence: data.endOccurrence,
      type: 'Composition',
      isInclusive: data.isInclusive
    })
  }

  console.log('defaultValues ::>>', defaultValues)

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
              name: 'search',
              placeholder: 'Recherche dans les documents',
              type: 'text',
              variant: 'outlined'
              //   validationRules: {
              //     required: 'Merci de renseigner une recherche'
              //   }
            },
            {
              name: 'docType',
              variant: 'outlined',
              label: 'Type de document',
              type: 'autocomplete',
              multiple: true,
              autocompleteOptions: criteria?.data?.docTypes || []
            },
            {
              type: 'custom',
              name: 'label',
              renderInput: () => (
                <FormLabel style={{ padding: '0 1em' }} component="legend">
                  Nombre d'occurrence :
                </FormLabel>
              )
            },
            {
              type: 'section',
              title: '',
              name: '',
              containerStyle: { display: 'grid', gridTemplateColumns: '100px 1fr' },
              properties: [
                {
                  name: 'occurrenceComparator',
                  variant: 'outlined',
                  type: 'select',
                  selectOptions: [
                    { id: '<=', label: '<=' },
                    { id: '<', label: '<' },
                    { id: '=', label: '=' },
                    { id: '>', label: '>' },
                    { id: '>=', label: '>=' }
                  ]
                },
                {
                  name: 'occurrence',
                  variant: 'outlined',
                  type: 'number',
                  validationRules: {
                    min: 0
                  }
                }
              ]
            },
            {
              type: 'custom',
              name: 'label',
              renderInput: () => (
                <FormLabel style={{ padding: '12px 12px 0 12px', marginBottom: -12 }} component="legend">
                  Date d'occurrence :
                </FormLabel>
              )
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
          formId="documents-form"
          displaySubmitButton={false}
          formFooter={
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
          }
        />
      </Grid>
    </Grid>
  )
}

export default CompositionForm
