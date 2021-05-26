import React from 'react'

import {
  Button,
  Divider,
  Grid,
  IconButton,
  Typography
  //  FormLabel
} from '@material-ui/core'
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

  const _onSubmit = (data: any) => {
    onChangeSelectedCriteria({
      title: data.title,
      code: data.code,
      diagnosticType: data.diagnosticType,
      // encounter: data.encounter,
      // comparator: data.comparator,
      startOccurrence: data.startOccurrence,
      endOccurrence: data.endOccurrence,
      type: 'Condition'
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
              name: 'code',
              label: 'Code',
              variant: 'outlined',
              type: 'autocomplete',
              multiple: true,
              autocompleteOptions: criteria?.data?.cim10Diagnostic || [],
              getAutocompleteOptions: getDiagOptions,
              noOptionsText: 'Veuillez entrer un code ou un diagnostic'
            }
            // {
            //   name: 'diagnosticType',
            //   label: 'Type de diagnostic',
            //   variant: 'outlined',
            //   type: 'autocomplete',
            //   multiple: true,
            //   autocompleteOptions: criteria?.data?.diagnosticTypes || []
            // }
            // {
            //   type: 'custom',
            //   name: 'label',
            //   renderInput: () => (
            //     <FormLabel style={{ padding: '0 1em' }} component="legend">
            //       Nombre d'occurence :
            //     </FormLabel>
            //   )
            // },
            // {
            //   type: 'section',
            //   title: '',
            //   name: '',
            //   containerStyle: { display: 'grid', gridTemplateColumns: '100px 1fr' },
            //   properties: [
            //     {
            //       name: 'comparator',
            //       variant: 'outlined',
            //       type: 'select',
            //       selectOptions: [
            //         { id: 'le', label: '<=' },
            //         { id: 'e', label: '=' },
            //         { id: 'ge', label: '>=' }
            //       ]
            //     },
            //     {
            //       name: 'encounter',
            //       variant: 'outlined',
            //       type: 'number',
            //       validationRules: {
            //         min: 0
            //       }
            //     }
            //   ]
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
    </Grid>
  )
}

export default Cim10Form
