import React from 'react'

import { Button, Divider, Grid, IconButton, Typography } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { FormBuilder } from '@arkhn/ui'

import useStyles from './styles'

import { Cim10DataType } from 'types'
import { capitalizeFirstLetter } from 'utils/capitalize'

type Cim10FormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultCondition = {
  title: 'Critère de diagnostic',
  code: [],
  diagnosticType: '',
  startOccurrence: '',
  endOccurrence: ''
}

const Cim10Form: React.FC<Cim10FormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const defaultValues = selectedCriteria || defaultCondition

  const classes = useStyles()

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = (data: any) => {
    onChangeSelectedCriteria({
      title: data.title,
      code: data.code,
      diagnosticType: data.diagnosticType,
      type: 'Condition'
    })
  }

  const getDiagOptions = async (searchValue: string) => {
    const diagOptions = await criteria.fetch.fetchCim10Diagnostic(searchValue)

    return (
      diagOptions.map((cimData: any) => ({
        id: cimData.display,
        label: `${cimData.code} - ${cimData.display}`
      })) || []
    )
  }

  if (
    criteria &&
    criteria.data &&
    (criteria.data.diagnosticTypes === 'loading' ||
      criteria.data.statusDiagnostic === 'loading' ||
      criteria.data.cim10Diagnostic === 'loading')
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

      <FormBuilder<Cim10DataType>
        defaultValues={defaultValues}
        title="Diagnostic"
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
            name: 'code',
            label: 'CIM 10 Diag Code',
            variant: 'outlined',
            type: 'autocomplete',
            autocompleteOptions:
              criteria?.data?.cim10Diagnostic?.map((cimData: any) => ({
                id: cimData.display,
                label: `${cimData.code} - ${cimData.display}`
              })) || [],
            getAutocompleteOptions: getDiagOptions
          },
          {
            name: 'diagnosticType',
            label: 'Type de diagnostic',
            variant: 'outlined',
            type: 'autocomplete',
            autocompleteOptions:
              criteria?.data?.diagnosticTypes?.map((diagType: any) => ({
                id: diagType.code,
                label: capitalizeFirstLetter(diagType.display)
              })) || []
          }
        ]}
        submit={_onSubmit}
        formId="cim10-form"
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
  )
}

export default Cim10Form
