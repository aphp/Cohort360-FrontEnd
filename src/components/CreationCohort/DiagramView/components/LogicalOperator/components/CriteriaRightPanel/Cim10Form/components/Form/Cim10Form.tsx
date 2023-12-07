import React, { useState } from 'react'

import {
  Alert,
  Autocomplete,
  Button,
  Divider,
  FormLabel,
  Grid,
  IconButton,
  Link,
  Switch,
  TextField,
  Typography
} from '@mui/material'

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchCondition } from 'state/pmsi'
import { CriteriaItemDataCache, CriteriaName, HierarchyTree } from 'types'
import OccurrencesNumberInputs from '../../../AdvancedInputs/OccurrencesInputs/OccurrenceNumberInputs'
import InputAutocompleteAsync from 'components/Inputs/InputAutocompleteAsync/InputAutocompleteAsync'
import services from 'services/aphp'
import { Cim10DataType } from 'types/requestCriterias'

type Cim10FormProps = {
  isOpen: boolean
  isEdition?: boolean
  criteriaData: CriteriaItemDataCache
  selectedCriteria: Cim10DataType
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const Cim10Form: React.FC<Cim10FormProps> = (props) => {
  const { isOpen, isEdition, criteriaData, selectedCriteria, onChangeValue, onChangeSelectedCriteria, goBack } = props

  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const currentState = { ...selectedCriteria, ...initialState }
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const _onSubmit = () => {
    onChangeSelectedCriteria(currentState)
    dispatch(fetchCondition())
  }
  const getDiagOptions = async (searchValue: string) =>
    await services.cohortCreation.fetchCim10Diagnostic(searchValue, false)

  const defaultValuesCode = currentState.code
    ? currentState.code.map((code) => {
        const criteriaCode = criteriaData.data.cim10Diagnostic
          ? criteriaData.data.cim10Diagnostic.find((c: any) => c.id === code.id)
          : null
        return {
          id: code.id,
          label: code.label ? code.label : criteriaCode?.label ?? '?'
        }
      })
    : []
  const defaultValuesType = currentState.diagnosticType
    ? currentState.diagnosticType.map((diagnosticType) => {
        const criteriaType = criteriaData.data.diagnosticTypes
          ? criteriaData.data.diagnosticTypes.find((g: any) => g.id === diagnosticType.id)
          : null
        return {
          id: diagnosticType.id,
          label: diagnosticType.label ? diagnosticType.label : criteriaType?.label ?? '?'
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
            <Typography className={classes.titleLabel}>Ajouter un critère de diagnostic</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de diagnostic</Typography>
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
          <Typography variant="h6">Diagnostic</Typography>
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
            form={CriteriaName.Cim10}
            selectedCriteria={selectedCriteria}
            onChangeValue={onChangeValue}
          />

          <InputAutocompleteAsync
            multiple
            label="Code CIM10"
            variant="outlined"
            noOptionsText="Veuillez entrer un code ou un diagnostic CIM10"
            className={classes.inputItem}
            autocompleteValue={defaultValuesCode}
            autocompleteOptions={criteriaData.data.cim10Diagnostic || []}
            getAutocompleteOptions={getDiagOptions}
            onChange={(e, value) => {
              onChangeValue('code', value)
            }}
          />
          <Autocomplete
            multiple
            id="criteria-cim10-type-autocomplete"
            className={classes.inputItem}
            options={criteriaData.data.diagnosticTypes || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={defaultValuesType}
            onChange={(e, value) => onChangeValue('diagnosticType', value)}
            renderInput={(params) => <TextField {...params} label="Type de diagnostic" />}
          />
          <AdvancedInputs form={CriteriaName.Cim10} selectedCriteria={currentState} onChangeValue={onChangeValue} />
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} type="submit" form="cim10-form" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <></>
  )
}

export default Cim10Form
