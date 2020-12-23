import React from 'react'

import { Button, Divider, Grid, IconButton, Typography, FormLabel } from '@material-ui/core'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import { FormBuilder } from '@arkhn/ui'

import useStyles from './styles'

import { CcamDataType } from 'types'

type CcamFormProps = {
  criteria: any
  selectedCriteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const defaultProcedure = {
  title: "Critères d'actes CCAM",
  code: [],
  encounter: 0,
  startOccurrence: '',
  endOccurrence: ''
}

const CcamForm: React.FC<CcamFormProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const defaultValues = selectedCriteria || defaultProcedure

  const classes = useStyles()

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = (data: any) => {
    onChangeSelectedCriteria({
      title: data.title,
      code: data.code,
      encounter: data.encounter,
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

      <FormBuilder<CcamDataType>
        defaultValues={defaultValues}
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
            autocompleteOptions: criteria?.data?.ccamData || [],
            getAutocompleteOptions: getCCAMOptions
          },
          // {
          //   name: 'hierarchy',
          //   type: 'custom',
          //   renderInput: () => (
          //     <Button className={classes.linkTable} href="/accueil">
          //       retour sur le home
          //     </Button>
          //   )
          // },
          {
            name: 'encounter',
            label: "Nombre d'occurence",
            variant: 'outlined',
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
        formId="ccam-form"
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
  )
}

export default CcamForm
