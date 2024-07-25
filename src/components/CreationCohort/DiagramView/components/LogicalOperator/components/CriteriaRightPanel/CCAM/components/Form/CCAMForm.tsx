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
  FormControlLabel,
  Autocomplete
} from '@mui/material'

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import AdvancedInputs from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/AdvancedInputs/AdvancedInputs'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchProcedure } from 'state/pmsi'
import { CriteriaItemDataCache, HierarchyTree } from 'types'
import AsyncAutocomplete from 'components/ui/Inputs/AsyncAutocomplete'
import services from 'services/aphp'
import { CcamDataType, Comparators, SelectedCriteriaType } from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'

type CcamFormProps = {
  isOpen: boolean
  isEdition: boolean
  criteriaData: CriteriaItemDataCache
  selectedCriteria: CcamDataType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChangeValue: (key: string, value: any) => void
  goBack: () => void
  onChangeSelectedCriteria: (data: SelectedCriteriaType) => void
}

enum Error {
  ADVANCED_INPUTS_ERROR,
  NO_ERROR
}

const CcamForm: React.FC<CcamFormProps> = (props) => {
  const { isOpen, isEdition, criteriaData, selectedCriteria, onChangeValue, onChangeSelectedCriteria, goBack } = props

  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const currentState = { ...selectedCriteria, ...initialState }
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const [occurrence, setOccurrence] = useState(currentState.occurrence || 1)
  const [occurrenceComparator, setOccurrenceComparator] = useState(
    currentState.occurrenceComparator || Comparators.GREATER_OR_EQUAL
  )
  const [error, setError] = useState(Error.NO_ERROR)

  const _onSubmit = () => {
    onChangeSelectedCriteria({ ...currentState, occurrence: occurrence, occurrenceComparator: occurrenceComparator })
    dispatch(fetchProcedure())
  }

  const getCCAMOptions = async (searchValue: string, signal: AbortSignal) => {
    const ccamOptions = await services.cohortCreation.fetchCcamData(searchValue, false, signal)

    return ccamOptions && ccamOptions.length > 0 ? ccamOptions : []
  }

  const defaultValuesCode = currentState.code
    ? currentState.code.map((code) => {
        const criteriaCode = criteriaData.data.ccamData
          ? criteriaData.data.ccamData.find((g: Hierarchy<any, any>) => g.id === code.id)
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

          <BlockWrapper className={classes.inputItem}>
            <OccurenceInput
              value={occurrence}
              comparator={occurrenceComparator}
              onchange={(newOccurence, newComparator) => {
                setOccurrence(newOccurence)
                setOccurrenceComparator(newComparator)
              }}
              withHierarchyInfo
            />
          </BlockWrapper>

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

          <Grid
            style={{
              margin: '0 1em',
              width: 'calc(100% - 2em)'
            }}
          >
            <Alert severity="warning">
              Les données AREM sont disponibles uniquement pour la période du 07/12/2009 au 31/12/2022.
            </Alert>
            <Alert severity="warning">
              Seuls les actes rattachés à une visite Orbis (avec un Dossier Administratif - NDA) sont actuellement
              disponibles.
            </Alert>
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

          <Autocomplete
            multiple
            className={classes.inputItem}
            options={criteriaData.data.encounterStatus || []}
            noOptionsText="Veuillez entrer un statut de visite associée"
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={currentState.encounterStatus}
            onChange={(e, value) => onChangeValue('encounterStatus', value)}
            renderInput={(params) => <TextField {...params} label="Statut de la visite associée" />}
          />

          <AdvancedInputs
            sourceType={SourceType.CCAM}
            selectedCriteria={currentState}
            onChangeValue={onChangeValue}
            onError={(isError) => setError(isError ? Error.ADVANCED_INPUTS_ERROR : Error.NO_ERROR)}
          />
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} variant="outlined">
              Annuler
            </Button>
          )}
          <Button
            onClick={_onSubmit}
            type="submit"
            form="ccam-form"
            color="primary"
            variant="contained"
            disabled={error === Error.ADVANCED_INPUTS_ERROR}
          >
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
