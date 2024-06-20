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
  Tooltip,
  Typography
} from '@mui/material'

import InfoIcon from '@mui/icons-material/Info'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchClaim } from 'state/pmsi'
import { CriteriaItemDataCache, CriteriaName, HierarchyElement, HierarchyTree } from 'types'
import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'
import AsyncAutocomplete from 'components/ui/Inputs/AsyncAutocomplete'
import services from 'services/aphp'
import { Comparators, GhmDataType, SelectedCriteriaType } from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import OccurenceInput from 'components/ui/Inputs/Occurences'

type GHMFormProps = {
  isOpen: boolean
  isEdition: boolean
  criteriaData: CriteriaItemDataCache
  selectedCriteria: GhmDataType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChangeValue: (key: string, value: any) => void
  goBack: () => void
  onChangeSelectedCriteria: (data: SelectedCriteriaType) => void
}

const GhmForm: React.FC<GHMFormProps> = (props) => {
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

  const getGhmOptions = async (searchValue: string, signal: AbortSignal) =>
    await services.cohortCreation.fetchGhmData(searchValue, false, signal)
  const _onSubmit = () => {
    onChangeSelectedCriteria({ ...currentState, occurrence: occurrence, occurrenceComparator: occurrenceComparator })
    dispatch(fetchClaim())
  }
  const defaultValuesCode = currentState.code
    ? currentState.code.map((code) => {
        const criteriaCode = criteriaData.data.ghmData
          ? criteriaData.data.ghmData.find((g: HierarchyElement) => g.id === code.id)
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

          <AsyncAutocomplete
            label="Codes GHM"
            variant="outlined"
            noOptionsText="Veuillez entrer un code ou un critère GHM"
            className={classes.inputItem}
            values={defaultValuesCode}
            onFetch={getGhmOptions}
            onChange={(value) => {
              onChangeValue('code', value)
            }}
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
