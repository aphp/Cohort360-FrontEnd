import React, { useState } from 'react'

import { Alert, Button, Divider, FormLabel, Grid, IconButton, Link, Switch, TextField, Typography } from '@mui/material'

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchClaim } from 'state/pmsi'
import { CriteriaItemDataCache, CriteriaName, HierarchyTree } from 'types'
import OccurrencesNumberInputs from '../../../AdvancedInputs/OccurrencesInputs/OccurrenceNumberInputs'
import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'
import InputAutocompleteAsync from 'components/Inputs/InputAutocompleteAsync/InputAutocompleteAsync'
import services from 'services/aphp'
import { GhmDataType } from 'types/requestCriterias'

type GHMFormProps = {
  isOpen: boolean
  isEdition: boolean
  criteriaData: CriteriaItemDataCache
  selectedCriteria: GhmDataType
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const GhmForm: React.FC<GHMFormProps> = (props) => {
  const { isOpen, isEdition, criteriaData, selectedCriteria, onChangeValue, onChangeSelectedCriteria, goBack } = props

  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const currentState = { ...selectedCriteria, ...initialState }
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))

  const getGhmOptions = async (searchValue: string, signal: AbortSignal) =>
    await services.cohortCreation.fetchGhmData(searchValue, false, signal)
  const _onSubmit = () => {
    onChangeSelectedCriteria(currentState)
    dispatch(fetchClaim())
  }
  const defaultValuesCode = currentState.code
    ? currentState.code.map((code) => {
        const criteriaCode = criteriaData.data.ghmData
          ? criteriaData.data.ghmData.find((g: any) => g.id === code.id)
          : null
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

        <Alert severity="warning">
          Données actuellement disponibles : PMSI ORBIS. Pour plus d'informations sur les prochaines intégrations de
          données, veuillez vous référer au tableau trimestriel de disponibilité des données disponible{' '}
          <Link
            href="https://eds.aphp.fr/sites/default/files/2023-01/EDS_Disponibilite_donnees_site_EDS_202212.pdf"
            target="_blank"
            rel="noopener"
          >
            ici
          </Link>
        </Alert>

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

          <InputAutocompleteAsync
            multiple
            label="Codes GHM"
            variant="outlined"
            noOptionsText="Veuillez entrer un code ou un critère GHM"
            className={classes.inputItem}
            autocompleteValue={defaultValuesCode}
            autocompleteOptions={criteriaData.data.ghmData || []}
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
