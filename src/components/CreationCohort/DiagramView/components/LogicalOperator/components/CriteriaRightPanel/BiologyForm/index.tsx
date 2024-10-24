import React, { useState, useEffect, useContext } from 'react'
import {
  Tabs,
  Tab,
  TextField,
  Grid,
  IconButton,
  Divider,
  Typography,
  Alert,
  FormLabel,
  Switch,
  Checkbox,
  Select,
  MenuItem,
  Autocomplete,
  Button
} from '@mui/material'

import useStyles from './styles'
import BiologyHierarchy from './components/Hierarchy/BiologyHierarchy'
import BiologySearch from './components/BiologySearch/BiologySearch'
import { initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { fetchBiology } from 'state/biology'
import { useAppDispatch, useAppSelector } from 'state'
import { Comparators, ObservationDataType, CriteriaType } from 'types/requestCriterias'
import { CriteriaDrawerComponentProps } from 'types'
import { AppConfig, getConfig } from 'config'
import { HierarchyElementWithSystem } from 'types/hierarchy'
import { Reference, References, ReferencesLabel } from 'types/searchValueSet'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import { BlockWrapper } from 'components/ui/Layout'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import { CriteriaLabel } from 'components/ui/CriteriaLabel'
import ValueSetField from 'components/SearchValueSet/ValueSetField'
import { ErrorWrapper } from 'components/ui/Searchbar/styles'
import AdvancedInputs from '../AdvancedInputs'
import { SourceType } from 'types/scope'

enum Error {
  NO_ERROR,
  INCOHERENT_VALUE_ERROR,
  INVALID_VALUE_ERROR,
  MISSING_VALUE_ERROR,
  ADVANCED_INPUTS_ERROR
}

export const defaultBiology: Omit<ObservationDataType, 'id'> = {
  type: CriteriaType.OBSERVATION,
  title: 'Critères de biologie',
  code: [],
  isLeaf: false,
  valueComparator: Comparators.GREATER_OR_EQUAL,
  searchByValue: [null, null],
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER_OR_EQUAL,
  startOccurrence: [null, null],
  isInclusive: true,
  encounterStartDate: [null, null],
  encounterEndDate: [null, null],
  encounterStatus: []
}

const BiologyForm = (props: CriteriaDrawerComponentProps) => {
  const { criteriaData, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const config = useContext(AppConfig)
  const { classes } = useStyles()
  /* const [selectedTab, setSelectedTab] = useState<'form' | 'hierarchy' | 'search'>(
    selectedCriteria ? 'form' : 'hierarchy'
  )*/
  const [currentCriteria, setCurrentCriteria] = useState((selectedCriteria as ObservationDataType) || defaultBiology)
  /*const [defaultCriteria, setDefaultCriteria] = useState<ObservationDataType>(
    (selectedCriteria as ObservationDataType) || defaultBiology
  )*/

  const isEdition = selectedCriteria !== null
  //const dispatch = useAppDispatch()
  //const biologyHierarchy = useAppSelector((state) => state.biology.list || {})

  /* const _onChangeSelectedHierarchy = (
    newSelectedItems: HierarchyElementWithSystem[] | null | undefined,
    newHierarchy?: HierarchyElementWithSystem[]
  ) => {
    _onChangeFormValue('code', newSelectedItems, newHierarchy)
  }*/
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /* const _onChangeFormValue = async (
    key: string,
    value: any,
    newHierarchy: HierarchyElementWithSystem[] = biologyHierarchy
  ) =>
    await syncOnChangeFormValue(
      key,
      value,
      newHierarchy,
      setDefaultCriteria,
      selectedTab,
      defaultBiology.type,
      dispatch
    )*/
  /* const _initSyncHierarchyTableEffect = async () => {
    await initSyncHierarchyTableEffect(
      biologyHierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchBiology,
      defaultBiology.type,
      dispatch
    )
  }*/
  /*useEffect(() => {
    _initSyncHierarchyTableEffect()
  }, [])*/
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const [allowSearchByValue, setAllowSearchByValue] = useState(
    typeof currentCriteria.searchByValue[0] === 'number' || typeof currentCriteria.searchByValue[1] === 'number'
  )
  const [_searchByValues, setSearchByValues] = useState<[string, string]>([
    currentCriteria.searchByValue[0] !== null ? currentCriteria.searchByValue[0].toString() : '',
    currentCriteria.searchByValue[1] !== null ? currentCriteria.searchByValue[1].toString() : ''
  ])
  const [error, setError] = useState(Error.NO_ERROR)
  const biologyReferences: Reference[] = [
    {
      id: References.ANABIO,
      title: 'Toute la hiérarchie',
      label: ReferencesLabel.ANABIO,
      standard: true,
      url: getConfig().features.observation.valueSets.biologyHierarchyAnabio.url,
      checked: true,
      isHierarchy: true,
      joinDisplayWithCode: false,
      filterRoots: (biologyItem) =>
        biologyItem.id !== '527941' &&
        biologyItem.id !== '547289' &&
        biologyItem.id !== '528247' &&
        biologyItem.id !== '981945' &&
        biologyItem.id !== '834019' &&
        biologyItem.id !== '528310' &&
        biologyItem.id !== '528049' &&
        biologyItem.id !== '527570' &&
        biologyItem.id !== '527614'
    },
    {
      id: References.LOINC,
      title: 'Toute la hiérarchie',
      label: ReferencesLabel.LOINC,
      standard: true,
      url: getConfig().features.observation.valueSets.biologyHierarchyLoinc.url,
      checked: true,
      isHierarchy: false,
      joinDisplayWithCode: true,
      filterRoots: () => true
    }
  ]

  const _onSubmit = () => {
    onChangeSelectedCriteria({
      ...currentCriteria /*, occurrence: occurrence, occurrenceComparator: occurrenceComparator*/
    })
    //dispatch(fetchMedication())
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
            <Typography className={classes.titleLabel}>Ajouter un critère de biologie</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de biologie</Typography>
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
          Les mesures de biologie sont pour l'instant restreintes aux 3870 codes ANABIO correspondants aux analyses les
          plus utilisées au niveau national et à l'AP-HP. De plus, les résultats concernent uniquement les analyses
          quantitatives enregistrées sur GLIMS, qui ont été validées et mises à jour depuis mars 2020.
        </Alert>

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">Biologie</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            variant="outlined"
            value={currentCriteria.title}
            onChange={(e) => setCurrentCriteria({ ...currentCriteria, title: e.target.value })}
          />

          <Grid style={{ display: 'flex' }}>
            <FormLabel
              onClick={() => setCurrentCriteria({ ...currentCriteria, isInclusive: !currentCriteria.isInclusive })}
              style={{ margin: 'auto 1em' }}
              component="legend"
            >
              Exclure les patients qui suivent les règles suivantes
            </FormLabel>
            <Switch
              id="criteria-inclusive"
              checked={!currentCriteria.isInclusive}
              onChange={(e) => setCurrentCriteria({ ...currentCriteria, isInclusive: !e.target.checked })}
              color="secondary"
            />
          </Grid>

          <BlockWrapper className={classes.inputItem}>
            <OccurenceInput
              value={currentCriteria.occurrence || 1}
              comparator={currentCriteria.occurrenceComparator || Comparators.GREATER_OR_EQUAL}
              onchange={(newOccurence, newComparator) =>
                setCurrentCriteria({
                  ...currentCriteria,
                  occurrence: newOccurence,
                  occurrenceComparator: newComparator
                })
              }
              withHierarchyInfo
            />
          </BlockWrapper>

          <Grid className={classes.inputContainer}>
            <CriteriaLabel label="Codes de biologie" />

            <Grid container marginBottom={2} marginTop={1}>
              <ValueSetField
                value={currentCriteria.code}
                references={biologyReferences}
                onSelect={(value) => setCurrentCriteria({ ...currentCriteria, code: value })}
                placeholder="Sélectionner les codes"
              />
            </Grid>

            {/*<Grid container item style={{ marginBottom: '1em', width: 'calc(100%-2em)' }}>
              {defaultValuesCode.length > 0 ? (
                defaultValuesCode.map((valueCode, index: number) => (
                  <Chip
                    key={index}
                    style={{ margin: 3 }}
                    label={
                      <Tooltip title={valueCode.label}>
                        <Typography style={{ maxWidth: 500 }} noWrap>
                          {valueCode.label}
                        </Typography>
                      </Tooltip>
                    }
                    onDelete={() =>
                      onChangeValue(
                        'code',
                        defaultValuesCode.filter((code) => code !== valueCode)
                      )
                    }
                  />
                ))
              ) : (
                <FormLabel style={{ margin: 'auto 1em' }} component="legend">
                  Veuillez ajouter des codes de biologie via les onglets Hiérarchie ou Recherche.
                </FormLabel>
              )}
              </Grid>*/}

            <CriteriaLabel
              label="Recherche par valeur"
              infoIcon="Pour pouvoir rechercher par valeur, vous devez sélectionner un seul et unique analyte (élement le plus
                fin de la hiérarchie)."
            />
            <Grid
              style={{
                display: 'grid',
                gridTemplateColumns:
                  currentCriteria.valueComparator === Comparators.BETWEEN ? '50px 1fr 1fr 1fr' : '50px 1fr 1fr',
                alignItems: 'center',
                margin: '1em 0'
              }}
            >
              <Checkbox
                checked={allowSearchByValue}
                onClick={() => setAllowSearchByValue(!allowSearchByValue)}
                disabled={!currentCriteria.isLeaf}
              />

              <Select
                style={{ marginRight: '1em' }}
                id="biology-value-comparator-select"
                value={currentCriteria.valueComparator ?? Comparators.GREATER_OR_EQUAL}
                onChange={(event) => setCurrentCriteria({ ...currentCriteria, valueComparator: event.target.value })}
                disabled={!allowSearchByValue}
              >
                {(Object.keys(Comparators) as (keyof typeof Comparators)[]).map((key, index) => (
                  <MenuItem key={index} value={Comparators[key]}>
                    {Comparators[key]}
                  </MenuItem>
                ))}
              </Select>

              <TextField
                required
                type="text"
                id="criteria-value"
                variant="outlined"
                value={_searchByValues[0]}
                onChange={(e) => handleValueChange(e.target.value, 0)}
                placeholder={currentCriteria.valueComparator === Comparators.BETWEEN ? 'Valeur minimale' : '0'}
                disabled={!allowSearchByValue}
                error={
                  error === Error.INCOHERENT_VALUE_ERROR ||
                  error === Error.INVALID_VALUE_ERROR ||
                  error === Error.MISSING_VALUE_ERROR
                }
              />
              {currentCriteria.valueComparator === Comparators.BETWEEN && (
                <TextField
                  required
                  type="text"
                  id="criteria-value"
                  variant="outlined"
                  value={_searchByValues[1]}
                  onChange={(e) => handleValueChange(e.target.value, 1)}
                  placeholder="Valeur maximale"
                  disabled={!allowSearchByValue}
                  error={
                    error === Error.INCOHERENT_VALUE_ERROR ||
                    error === Error.INVALID_VALUE_ERROR ||
                    error === Error.MISSING_VALUE_ERROR
                  }
                />
              )}
            </Grid>
            <Grid container style={{ margin: '0 0 1em', textAlign: 'end' }}>
              <ErrorWrapper>
                {error === Error.INCOHERENT_VALUE_ERROR && (
                  <Typography style={{ fontWeight: 'bold' }}>
                    La valeur minimale ne peut pas être supérieure à la valeur maximale.
                  </Typography>
                )}
                {error === Error.INVALID_VALUE_ERROR && (
                  <Typography style={{ fontWeight: 'bold' }}>Veuillez entrer un nombre valide.</Typography>
                )}
                {error === Error.MISSING_VALUE_ERROR && (
                  <Typography style={{ fontWeight: 'bold' }}>Veuillez entrer 2 valeurs avec ce comparateur.</Typography>
                )}
              </ErrorWrapper>
            </Grid>

            <Autocomplete
              multiple
              options={criteriaData.data.encounterStatus || []}
              noOptionsText="Veuillez entrer un statut de visite associée"
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={currentCriteria.encounterStatus}
              onChange={(e, value) => setCurrentCriteria({ ...currentCriteria, encounterStatus: value })}
              renderInput={(params) => <TextField {...params} label="Statut de la visite associée" />}
            />
          </Grid>

          <AdvancedInputs
            sourceType={SourceType.BIOLOGY}
            selectedCriteria={currentCriteria}
            onChangeValue={(key, value) => setCurrentCriteria((prevValues) => ({ ...prevValues, [key]: value }))}
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
            form="biology-form"
            variant="contained"
            disabled={
              error === Error.INCOHERENT_VALUE_ERROR ||
              error === Error.INVALID_VALUE_ERROR ||
              error === Error.MISSING_VALUE_ERROR ||
              error === Error.ADVANCED_INPUTS_ERROR
            }
          >
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )

  {
    /*<Tabs
        indicatorColor="secondary"
        className={classes.tabs}
        value={selectedTab}
        onChange={(e, tab) => setSelectedTab(tab)}
      >
        <Tab label={config.labels.exploration} value="hierarchy" />
        <Tab label="Recherche" value="search" />
        <Tab label="Formulaire" value="form" />
  </Tabs>*/
  }

  {
    /*
        <BiologyForm
          //isOpen={selectedTab === 'form'}
          isEdition={isEdition}
          criteriaData={criteriaData}
          selectedCriteria={currentCriteria}
          onChangeValue={() => {}_onChangeFormValue}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
          goBack={goBack}
        />
      */
  }
  {
    /*selectedTab === 'search' && (
        <BiologySearch
          isEdition={isEdition}
          selectedCriteria={defaultCriteria}
          onChangeSelectedCriteria={_onChangeSelectedHierarchy}
          onConfirm={() => setSelectedTab('form')}
          goBack={goBack}
        />
      )*/
  }
  {
    /*
        <BiologyHierarchy
          isOpen={selectedTab === 'hierarchy'}
          isEdition={isEdition}
          selectedCriteria={defaultCriteria}
          onChangeSelectedHierarchy={_onChangeSelectedHierarchy}
          onConfirm={() => setSelectedTab('form')}
          goBack={goBack}
        />
    */
  }
}
export default BiologyForm
