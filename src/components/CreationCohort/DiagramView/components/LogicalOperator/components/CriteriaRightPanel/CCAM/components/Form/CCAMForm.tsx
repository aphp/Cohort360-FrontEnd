import React, { useState } from 'react'

import { Alert, Button, Divider, FormLabel, Grid, IconButton, Switch, TextField, Typography } from '@mui/material'

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import { InputAutocompleteAsync as AutocompleteAsync } from 'components/Inputs'

import AdvancedInputs from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/AdvancedInputs/AdvancedInputs'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchProcedure } from 'state/pmsi'
import { HierarchyTree } from 'types'

type CcamFormProps = {
  isOpen: boolean
  isEdition: boolean
  criteria: any
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const CcamForm: React.FC<CcamFormProps> = (props) => {
  const { isOpen, isEdition, criteria, selectedCriteria, onChangeValue, onChangeSelectedCriteria, goBack } = props

  const classes = useStyles()
  const dispatch = useAppDispatch()
  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const currentState = { ...selectedCriteria, ...initialState }
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))

  const _onSubmit = () => {
    onChangeSelectedCriteria(currentState)
    dispatch<any>(fetchProcedure())
  }

  const getCCAMOptions = async (searchValue: string) => {
    const ccamOptions = await criteria.fetch.fetchCcamData(searchValue, false)

    return ccamOptions && ccamOptions.length > 0 ? ccamOptions : []
  }

  const defaultValuesCode = currentState.code
    ? currentState.code.map((code: any) => {
        const criteriaCode = criteria.data.ccamData ? criteria.data.ccamData.find((g: any) => g.id === code.id) : null
        return {
          id: code.id,
          label: code.label ? code.label : criteriaCode?.label ?? '?'
        }
      })
    : []

  return isOpen ? (
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
        {!multiFields && (
          <Alert
            severity="info"
            onClose={() => {
              localStorage.setItem('multiple_fields', 'ok')
              setMultiFields('ok')
            }}
          >
            Tous les éléments des champs multiples sont liés par une contrainte OU
          </Alert>
        )}

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">Actes CCAM</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            variant="outlined"
            value={currentState.title}
            onChange={(e) => onChangeValue('title', e.target.value)}
          />

          <Grid style={{ display: 'flex' }}>
            <FormLabel
              onClick={() => onChangeValue('isInclusive', !currentState.isInclusive)}
              style={{ margin: 'auto 1em' }}
              component="legend"
            >
              Exclure les patients qui suivent les règles suivantes
            </FormLabel>
            <Switch
              id="criteria-inclusive"
              checked={!currentState.isInclusive}
              onChange={(event) => onChangeValue('isInclusive', !event.target.checked)}
              color="secondary"
            />
          </Grid>

          <AutocompleteAsync
            multiple
            label="Codes d'actes CCAM"
            variant="outlined"
            noOptionsText="Veuillez entrer un code ou un acte CCAM"
            className={classes.inputItem}
            autocompleteValue={defaultValuesCode}
            autocompleteOptions={criteria?.data?.ccamData || []}
            getAutocompleteOptions={getCCAMOptions}
            onChange={(e, value) => onChangeValue('code', value)}
          />

          <AdvancedInputs form="ccam" selectedCriteria={currentState} onChangeValue={onChangeValue} />
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} type="submit" form="ccam-form" color="primary" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <></>
  )
}

export default CcamForm
