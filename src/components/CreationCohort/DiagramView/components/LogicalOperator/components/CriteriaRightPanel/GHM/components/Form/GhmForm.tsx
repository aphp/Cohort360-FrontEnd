import React, { useState } from 'react'

import { Alert, Button, Divider, FormLabel, Grid, IconButton, Switch, TextField, Typography } from '@mui/material'

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import { InputAutocompleteAsync as AutocompleteAsync } from 'components/Inputs'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchClaim } from 'state/pmsi'
import { CriteriaName, HierarchyTree } from 'types'
import OccurrencesNumberInputs from '../../../AdvancedInputs/OccurrencesInputs/OccurrenceNumberInputs'
import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'

type GHMFormProps = {
  isOpen: boolean
  isEdition: boolean
  criteria: any
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const GhmForm: React.FC<GHMFormProps> = (props) => {
  const { isOpen, isEdition, criteria, selectedCriteria, onChangeValue, onChangeSelectedCriteria, goBack } = props

  const classes = useStyles()
  const dispatch = useAppDispatch()
  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const currentState = { ...selectedCriteria, ...initialState }
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))

  const getGhmOptions = async (searchValue: string) => await criteria.fetch.fetchGhmData(searchValue, false)
  const _onSubmit = () => {
    onChangeSelectedCriteria(currentState)
    dispatch(fetchClaim())
  }
  const defaultValuesCode = currentState.code
    ? currentState.code.map((code: any) => {
        const criteriaCode = criteria.data.ghmData ? criteria.data.ghmData.find((g: any) => g.id === code.id) : null
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
            <Typography className={classes.titleLabel}>Ajouter un critère de GHM</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de GHM</Typography>
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
          <Typography variant="h6">GHM</Typography>

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

          <OccurrencesNumberInputs
            form={CriteriaName.Ghm}
            selectedCriteria={selectedCriteria}
            onChangeValue={onChangeValue}
          />

          <AutocompleteAsync
            multiple
            label="Codes GHM"
            variant="outlined"
            noOptionsText="Veuillez entrer un code ou un critère GHM"
            className={classes.inputItem}
            autocompleteValue={defaultValuesCode}
            autocompleteOptions={criteria?.data?.ghmData || []}
            getAutocompleteOptions={getGhmOptions}
            onChange={(e, value) => {
              onChangeValue('code', value)
            }}
          />

          <AdvancedInputs form={CriteriaName.Ghm} selectedCriteria={currentState} onChangeValue={onChangeValue} />
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} type="submit" form="ghm-form" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <></>
  )
}

export default GhmForm
