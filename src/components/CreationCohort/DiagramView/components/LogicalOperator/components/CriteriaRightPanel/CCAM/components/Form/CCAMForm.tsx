import React, { useState } from 'react'

import {
  Alert,
  Button,
  Divider,
  FormLabel,
  Grid,
  IconButton,
  Switch,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material'

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import AdvancedInputs from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/AdvancedInputs/AdvancedInputs'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchProcedure } from 'state/pmsi'
import { CriteriaItemDataCache, CriteriaName, HierarchyTree } from 'types'
import OccurrencesNumberInputs from '../../../AdvancedInputs/OccurrencesInputs/OccurrenceNumberInputs'
import AsyncAutocomplete from 'components/ui/Inputs/AsyncAutocomplete'
import services from 'services/aphp'
import { CcamDataType } from 'types/requestCriterias'

type CcamFormProps = {
  isOpen: boolean
  isEdition: boolean
  criteriaData: CriteriaItemDataCache
  selectedCriteria: CcamDataType
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const CcamForm: React.FC<CcamFormProps> = (props) => {
  const { isOpen, isEdition, criteriaData, selectedCriteria, onChangeValue, onChangeSelectedCriteria, goBack } = props

  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const currentState = { ...selectedCriteria, ...initialState }
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))

  const _onSubmit = () => {
    onChangeSelectedCriteria(currentState)
    dispatch(fetchProcedure())
  }

  const getCCAMOptions = async (searchValue: string, signal: AbortSignal) => {
    const ccamOptions = await services.cohortCreation.fetchCcamData(searchValue, false, signal)

    return ccamOptions && ccamOptions.length > 0 ? ccamOptions : []
  }

  const defaultValuesCode = currentState.code
    ? currentState.code.map((code) => {
        const criteriaCode = criteriaData.data.ccamData
          ? criteriaData.data.ccamData.find((g: any) => g.id === code.id)
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

          <OccurrencesNumberInputs
            form={CriteriaName.Ccam}
            selectedCriteria={selectedCriteria}
            onChangeValue={onChangeValue}
          />

          <Grid style={{ display: 'flex' }}>
            <RadioGroup
              row
              style={{ justifyContent: 'space-around' }}
              className={classes.inputItem}
              aria-label="mode"
              name="criteria-mode-radio"
              value={currentState.source}
              onChange={(e, value) => onChangeValue('source', value)}
            >
              <FormControlLabel value="AREM" control={<Radio color="secondary" />} label="AREM" />
              <FormControlLabel value="ORBIS" control={<Radio color="secondary" />} label="ORBIS" />
            </RadioGroup>
          </Grid>

          <Grid>
            <Alert severity="info">
              Les données PMSI d'ORBIS sont codées au quotidien par les médecins. Les données PMSI AREM sont validées,
              remontées aux tutelles et disponibles dans le SNDS.
            </Alert>
          </Grid>

          <AsyncAutocomplete
            label="Codes d'actes CCAM"
            variant="outlined"
            noOptionsText="Veuillez entrer un code ou un acte CCAM"
            className={classes.inputItem}
            values={defaultValuesCode}
            onFetch={getCCAMOptions}
            onChange={(value) => onChangeValue('code', value)}
          />

          <AdvancedInputs form={CriteriaName.Ccam} selectedCriteria={currentState} onChangeValue={onChangeValue} />
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
