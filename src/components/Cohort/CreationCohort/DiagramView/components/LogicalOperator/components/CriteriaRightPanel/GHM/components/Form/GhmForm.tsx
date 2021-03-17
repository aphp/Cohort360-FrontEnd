import React, { useState } from 'react'

import { Alert } from '@material-ui/lab'
import { Button, Divider, Grid, IconButton, Switch, Typography, FormLabel } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { FormBuilder } from '@arkhn/ui'

import useStyles from './styles'

import { GhmDataType } from 'types'

type GHMFormProps = {
  isEdition: boolean
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const GhmForm: React.FC<GHMFormProps> = (props) => {
  const { isEdition, criteria, selectedCriteria, goBack, onChangeSelectedCriteria } = props

  const classes = useStyles()

  const [error, setError] = useState(false)

  const _onSubmit = (data: any) => {
    if (data?.code?.length === 0) {
      return setError(true)
    }

    onChangeSelectedCriteria({
      ...selectedCriteria,
      title: data.title,
      code: data.code,
      occurrence: +data.occurrence,
      occurrenceComparator: data.occurrenceComparator,
      startOccurrence: data.startOccurrence,
      endOccurrence: data.endOccurrence,
      type: 'Claim',
      isInclusive: data.isInclusive
    })
  }

  const getGhmOptions = async (searchValue: string) => await criteria.fetch.fetchGhmData(searchValue)

  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack}>
              <KeyboardBackspaceIcon />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Typography className={classes.titleLabel}>Ajouter un critère de GHM</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de GHM</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        {error && <Alert severity="error">Merci de renseigner un code GHM</Alert>}
        <FormBuilder<GhmDataType>
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
              label: 'Code GHM',
              variant: 'outlined',
              type: 'autocomplete',
              multiple: true,
              autocompleteOptions: criteria?.data?.ghmData || [],
              getAutocompleteOptions: getGhmOptions,
              noOptionsText: 'Veuillez entrer un code ou un critère GHM'
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
                    required: 'Merci de renseigner une occurrence suppérieur à 1'
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
          formId="ghm-form"
          displaySubmitButton={false}
          formFooter={
            <Grid className={classes.criteriaActionContainer}>
              {!isEdition && (
                <Button onClick={goBack} color="primary" variant="outlined">
                  Annuler
                </Button>
              )}
              <Button type="submit" form="ghm-form" color="primary" variant="contained">
                Confirmer
              </Button>
            </Grid>
          }
        />
      </Grid>
    </Grid>
  )
}

export default GhmForm
