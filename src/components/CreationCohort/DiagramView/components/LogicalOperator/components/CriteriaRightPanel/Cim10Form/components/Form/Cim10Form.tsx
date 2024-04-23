import React, { useState } from 'react'

import {
  Alert,
  Autocomplete,
  Button,
  Divider,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Link,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'

import InfoIcon from '@mui/icons-material/Info'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchCondition } from 'state/pmsi'
import { CriteriaItemDataCache, CriteriaName, HierarchyTree } from 'types'
import AsyncAutocomplete from 'components/ui/Inputs/AsyncAutocomplete'
import services from 'services/aphp'
import { Cim10DataType, Comparators } from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import OccurenceInput from 'components/ui/Inputs/Occurences'

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
    onChangeSelectedCriteria({ ...currentState, occurrence: occurrence, occurrenceComparator: occurrenceComparator })
    dispatch(fetchCondition())
  }
  const [occurrence, setOccurrence] = useState(currentState.occurrence || 1)
  const [occurrenceComparator, setOccurrenceComparator] = useState(
    currentState.occurrenceComparator || Comparators.GREATER_OR_EQUAL
  )

  const getDiagOptions = async (searchValue: string, signal: AbortSignal) =>
    await services.cohortCreation.fetchCim10Diagnostic(searchValue, false, signal)

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

        {/* <Alert severity="warning">
          Données actuellement disponibles : PMSI ORBIS. Pour plus d'informations sur les prochaines intégrations de
          données, veuillez vous référer au tableau trimestriel de disponibilité des données disponible{' '}
          <Link
            href="https://eds.aphp.fr/sites/default/files/2023-01/EDS_Disponibilite_donnees_site_EDS_202212.pdf"
            target="_blank"
            rel="noopener"
          >
            ici
          </Link>
        </Alert> */}

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

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              <BlockWrapper container justifyItems="center">
                Nombre d'occurrences
                <Tooltip
                  title={
                    <span>
                      Si vous choisissez un chapitre, le nombre d'occurrences ne s'applique pas sur un unique élément de
                      ce chapitre, mais sur l'ensemble des éléments de ce chapitre. <br /> Exemple: Nombre d'occurrences
                      &ge; 3 sur un chapitre signifie que l'on inclus les patients qui ont eu au moins 3 éléments de ce
                      chapitre, distincts ou non`
                    </span>
                  }
                >
                  <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
                </Tooltip>
              </BlockWrapper>
            </FormLabel>
            <OccurenceInput
              value={occurrence}
              comparator={occurrenceComparator}
              onchange={(newOccurence, newComparator) => {
                setOccurrence(newOccurence)
                setOccurrenceComparator(newComparator)
              }}
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

          <Grid>
            <Alert severity="info">
              Les données PMSI d'ORBIS sont codées au quotidien par les médecins. Les données PMSI AREM sont validées,
              remontées aux tutelles et disponibles dans le SNDS.
            </Alert>
          </Grid>

          <AsyncAutocomplete
            label="Code CIM10"
            variant="outlined"
            noOptionsText="Veuillez entrer un code ou un diagnostic CIM10"
            className={classes.inputItem}
            values={defaultValuesCode}
            onFetch={getDiagOptions}
            onChange={(value) => {
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
          <Autocomplete
            multiple
            options={criteriaData.data.encounterStatus || []}
            className={classes.inputItem}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={currentState.encounterStatus}
            onChange={(e, value) => onChangeValue('encounterStatus', value)}
            renderInput={(params) => <TextField {...params} label="Statut de la visite associée" />}
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
