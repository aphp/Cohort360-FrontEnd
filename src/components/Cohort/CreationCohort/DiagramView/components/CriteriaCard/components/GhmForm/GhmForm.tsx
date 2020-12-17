import React from 'react'

import { Button, Divider, Grid, IconButton, Typography, FormLabel } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { FormBuilder } from '@arkhn/ui'

import useStyles from './styles'

import { GhmDataType } from 'types'

type TestGeneratedFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultDemographic = {
  title: 'Critère de GHM',
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
      occurence: data.occurence,
      startOccurrence: data.startOccurrence,
      endOccurrence: data.endOccurrence,
      type: 'Claim'
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

      <FormBuilder<GhmDataType>
        defaultValues={defaultValues}
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
            name: 'code',
            label: 'GHM 10 Diag Code',
            variant: 'outlined',
            type: 'autocomplete',
            autocompleteOptions: criteria?.data?.ghmData || [],
            getAutocompleteOptions: getGhmOptions
          },
          {
            name: 'occurence',
            label: 'Nombre d’occurrences :',
            type: 'number'
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
  )
}

export default TestGeneratedForm
