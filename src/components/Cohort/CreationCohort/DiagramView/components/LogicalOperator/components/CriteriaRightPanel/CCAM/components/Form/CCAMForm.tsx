import React from 'react'

import {
  Button,
  Divider,
  Grid,
  IconButton,
  Typography
  // FormLabel
} from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { FormBuilder } from '@arkhn/ui'

import useStyles from './styles'

import { CcamDataType } from 'types'

type CcamFormProps = {
  isEdition: boolean
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const CcamForm: React.FC<CcamFormProps> = (props) => {
  const { isEdition, criteria, selectedCriteria, goBack, onChangeSelectedCriteria } = props

  const classes = useStyles()

  const _onSubmit = (data: any) => {
    onChangeSelectedCriteria({
      ...selectedCriteria,
      title: data.title,
      code: data.code,
      // encounter: data.encounter,
      // comparator: data.comparator,
      startOccurrence: data.startOccurrence,
      endOccurrence: data.endOccurrence,
      type: 'Procedure'
    })
  }

  const getCCAMOptions = async (searchValue: string) => {
    const ccamOptions = await criteria.fetch.fetchCcamData(searchValue)

    return ccamOptions && ccamOptions.length > 0 ? ccamOptions : []
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

      <Grid className={classes.formContainer}>
        <FormBuilder<CcamDataType>
          defaultValues={selectedCriteria}
          title="Actes CCAM"
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
              label: "Codes d'actes CCAM",
              variant: 'outlined',
              type: 'autocomplete',
              multiple: true,
              autocompleteOptions: criteria?.data?.ccamData || [],
              getAutocompleteOptions: getCCAMOptions,
              noOptionsText: 'Veuillez entrer un code ou un acte CCAM'
            }
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
          formId="ccam-form"
          displaySubmitButton={false}
          formFooter={
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
          }
        />
      </Grid>
    </Grid>
  )
}

export default CcamForm
