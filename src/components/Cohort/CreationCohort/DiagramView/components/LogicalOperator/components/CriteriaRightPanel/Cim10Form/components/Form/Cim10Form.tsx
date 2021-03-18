import React, { useState } from 'react'

import { Alert } from '@material-ui/lab'
import { Button, Divider, Grid, IconButton, Switch, Typography, FormLabel } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { FormBuilder } from '@arkhn/ui'

import useStyles from './styles'

import { Cim10DataType } from 'types'

type Cim10FormProps = {
  isEdition?: boolean
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const Cim10Form: React.FC<Cim10FormProps> = (props) => {
  const { isEdition, criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const classes = useStyles()

  const [error, setError] = useState(false)

  const _onSubmit = (data: any) => {
    if (data?.code?.length === 0 && data?.diagnosticType?.length === 0) {
      return setError(true)
    }

    onChangeSelectedCriteria({
      ...selectedCriteria,
      title: data.title,
      code: data.code,
      diagnosticType: data.diagnosticType,
      occurrence: +data.occurrence,
      occurrenceComparator: data.occurrenceComparator,
      startOccurrence: data.startOccurrence,
      endOccurrence: data.endOccurrence,
      type: 'Condition',
      isInclusive: data.isInclusive
    })
  }

  const getDiagOptions = async (searchValue: string) => await criteria.fetch.fetchCim10Diagnostic(searchValue)

  if (
    criteria?.data?.diagnosticTypes === 'loading' ||
    criteria?.data?.statusDiagnostic === 'loading' ||
    criteria?.data?.cim10Diagnostic === 'loading'
  ) {
    return <> </>
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

      <Grid className={classes.formContainer}>
        {error && <Alert severity="error">Merci de renseigner au moins un code ou un type de diagnostic</Alert>}
        <FormBuilder<Cim10DataType>
          defaultValues={selectedCriteria}
          title="Diagnostic"
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
              name: 'code',
              label: 'Code CIM10',
              variant: 'outlined',
              type: 'autocomplete',
              multiple: true,
              autocompleteOptions: criteria?.data?.cim10Diagnostic || [],
              getAutocompleteOptions: getDiagOptions,
              noOptionsText: 'Veuillez entrer un code ou un diagnostic CIM10'
            },
            {
              name: 'diagnosticType',
              label: 'Type de diagnostic',
              variant: 'outlined',
              type: 'autocomplete',
              multiple: true,
              autocompleteOptions: criteria?.data?.diagnosticTypes || []
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
                    min: 1,
                    required: 'Merci de renseigner une occurrence supérieure à 1'
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
          formId="cim10-form"
          displaySubmitButton={false}
          formFooter={
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
          }
        />
      </Grid>
    </Grid>
  )
}

export default Cim10Form
