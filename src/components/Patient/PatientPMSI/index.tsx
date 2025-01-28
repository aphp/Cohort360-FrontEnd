import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CircularProgress, Grid, Tooltip } from '@mui/material'
import Chip from 'components/ui/Chip'
import FilterList from 'assets/icones/filter.svg?react'
import DataTablePmsi from 'components/DataTable/DataTablePmsi'
import { useAppSelector, useAppDispatch } from 'state'
import { fetchPmsi } from 'state/patient'
import { CohortPMSI, LoadingStatus, PmsiTab } from 'types'
import useStyles from './styles'
import { cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import Searchbar from 'components/ui/Searchbar'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import Tabs from 'components/ui/Tabs'
import { Direction, FilterKeys, LabelObject, Order, PMSIFilters } from 'types/searchCriterias'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import { PMSILabel } from 'types/patient'
import { selectFiltersAsArray } from 'utils/filters'
import { BlockWrapper } from 'components/ui/Layout'
import useSearchCriterias, { initPmsiSearchCriterias } from 'reducers/searchCriteriasReducer'
import CodeFilter from 'components/Filters/CodeFilter'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import { ResourceType } from 'types/requestCriterias'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { Save, SavedSearch } from '@mui/icons-material'
import TextInput from 'components/Filters/TextInput'
import { mapToAttribute, mapToLabel, mapToSourceType } from 'mappers/pmsi'
import List from 'components/ui/List'
import { AlertWrapper } from 'components/ui/Alert'
import { useSearchParams } from 'react-router-dom'
import { checkIfPageAvailable, cleanSearchParams, handlePageError } from 'utils/paginationUtils'
import { getPMSITab } from 'utils/tabsUtils'
import { getConfig } from 'config'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { getValueSetsFromSystems } from 'utils/valueSets'
import { v4 as uuidv4 } from 'uuid'
import MultiSelectInput from 'components/Filters/MultiSelectInput'
import RadioGroupFilter from 'components/Filters/RadioGroupFilter'

enum Source {
  AREM = 'AREM',
  ORBIS = 'ORBIS'
}

const sourceOptions = [
  {
    id: Source.AREM,
    label: Source.AREM
  },
  {
    id: Source.ORBIS,
    label: Source.ORBIS
  }
]

type PmsiSearchResults = {
  deidentified: boolean
  list: CohortPMSI[]
  nb: number
  total: number
  label: PMSILabel
}

export const PMSITabs: PmsiTab[] = [
  { label: PMSILabel.DIAGNOSTIC, id: ResourceType.CONDITION },
  { label: PMSILabel.CCAM, id: ResourceType.PROCEDURE },
  { label: PMSILabel.GHM, id: ResourceType.CLAIM }
]

const PatientPMSI = () => {
  const { classes } = useStyles()
  const [searchParams, setSearchParams] = useSearchParams()
  const getPageParam = searchParams.get('page')
  const groupId = searchParams.get('groupId') ?? undefined
  const tabId = searchParams.get('tabId') ?? undefined
  const existingParams = Object.fromEntries(searchParams.entries())

  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
  const [triggerClean, setTriggerClean] = useState<boolean>(false)
  const [encounterStatusList, setEncounterStatusList] = useState<LabelObject[]>([])
  const dispatch = useAppDispatch()

  const [selectedTab, setSelectedTab] = useState<PmsiTab>(getPMSITab(tabId))
  const [oldTabs, setOldTabs] = useState<PmsiTab | null>(null)

  const sourceType = mapToSourceType(selectedTab.id)

  const [page, setPage] = useState(getPageParam ? parseInt(getPageParam, 10) : 1)
  const {
    allSavedFilters,
    savedFiltersErrors,
    selectedSavedFilter,
    allSavedFiltersAsListItems,
    methods: {
      getSavedFilters,
      postSavedFilter,
      deleteSavedFilters,
      patchSavedFilter,
      selectFilter,
      resetSavedFilterError
    }
  } = useSavedFilters<PMSIFilters>(selectedTab.id)

  const [
    {
      orderBy,
      searchInput,
      filters,
      filters: { code, nda, diagnosticTypes, source, startDate, endDate, executiveUnits, encounterStatus }
    },
    { changeOrderBy, changeSearchInput, addFilters, removeFilter, removeSearchCriterias, addSearchCriterias }
  ] = useSearchCriterias(initPmsiSearchCriterias)
  const filtersAsArray = useMemo(
    () =>
      selectFiltersAsArray({ code, nda, diagnosticTypes, source, startDate, endDate, executiveUnits, encounterStatus }),
    [code, nda, diagnosticTypes, source, startDate, endDate, executiveUnits, encounterStatus]
  )

  const [allDiagnosticTypesList, setAllDiagnosticTypesList] = useState<LabelObject[]>([])
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const patient = useAppSelector((state) => state.patient)
  const [searchResults, setSearchResults] = useState<PmsiSearchResults>({
    deidentified: false,
    list: [],
    nb: 0,
    total: 0,
    label: PMSILabel.DIAGNOSTIC
  })

  const controllerRef = useRef<AbortController | null>(null)
  const meState = useAppSelector((state) => state.me)
  const maintenanceIsActive = meState?.maintenance?.active
  const isFirstRender = useRef(true)

  const _fetchPMSI = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchPmsi({
          options: {
            selectedTab: selectedTab.id,
            oldTab: oldTabs ? oldTabs.id : null,
            page,
            searchCriterias: {
              orderBy,
              searchInput,
              filters: { code, nda, diagnosticTypes, source, startDate, endDate, executiveUnits, encounterStatus }
            }
          },
          groupId,
          signal: controllerRef.current?.signal
        })
      )
      if (response) {
        checkIfPageAvailable(searchResults.total, page, setPage, dispatch)
      }
      if (response.payload.error) {
        throw response.payload.error
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      } else {
        setLoadingStatus(LoadingStatus.SUCCESS)
      }
    }
  }
  useEffect(() => {
    const fetch = async () => {
      try {
        const [diagnosticTypes, encounterStatus] = await Promise.all([
          getCodeList(getConfig().features.condition.valueSets.conditionStatus.url),
          getCodeList(getConfig().core.valueSets.encounterStatus.url)
        ])
        setAllDiagnosticTypesList(diagnosticTypes.results)
        setEncounterStatusList(encounterStatus.results)
      } catch (e) {
        /* empty */
      }
    }
    setOldTabs(selectedTab)
    getSavedFilters()
    fetch()
  }, [])

  useEffect(() => {
    if (!isFirstRender.current) {
      setLoadingStatus(LoadingStatus.IDDLE)
      setPage(1)
      setOldTabs(selectedTab)
    }
  }, [searchInput, nda, code, startDate, endDate, diagnosticTypes, source, orderBy, executiveUnits, encounterStatus])

  useEffect(() => {
    setOldTabs(selectedTab)

    setSearchParams(cleanSearchParams({ page: page.toString(), tabId: selectedTab.id, groupId: groupId }))

    handlePageError(page, setPage, dispatch, setLoadingStatus)
  }, [page])

  useEffect(() => {
    setOldTabs(selectedTab)
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchPMSI()
    }
  }, [loadingStatus])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      setPage(1)
    }
    removeSearchCriterias()
    setTriggerClean(!triggerClean)
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [selectedTab])

  useEffect(() => {
    const pmsiIndex = mapToAttribute(selectedTab.id)
    setSearchResults({
      deidentified: patient?.deidentified ?? false,
      list: patient?.pmsi?.[pmsiIndex]?.list ?? [],
      nb: patient?.pmsi?.[pmsiIndex]?.count ?? 0,
      total: patient?.pmsi?.[pmsiIndex]?.total ?? 0,
      label: mapToLabel(selectedTab.id)
    })
  }, [patient, selectedTab.id])

  const references = useMemo(() => {
    switch (selectedTab.id) {
      case ResourceType.CONDITION:
        return getValueSetsFromSystems([getConfig().features.condition.valueSets.conditionHierarchy.url])
      case ResourceType.PROCEDURE:
        return getValueSetsFromSystems([getConfig().features.procedure.valueSets.procedureHierarchy.url])
      default:
        return getValueSetsFromSystems([getConfig().features.claim.valueSets.claimHierarchy.url])
    }
  }, [selectedTab.id])

  return (
    <Grid container className={classes.documentTable} gap="20px">
      {(selectedTab.id === ResourceType.PROCEDURE || selectedTab.id === ResourceType.CONDITION) && (
        <BlockWrapper item xs={12}>
          <AlertWrapper severity="warning">
            {`Attention : Les données AREM sont disponibles uniquement pour la période du 07/12/2009 au 30/11/2024. Seuls
            les ${
              selectedTab.id === ResourceType.CONDITION ? 'diagnostics' : 'actes'
            } rattachés à une visite Orbis (avec un Dossier Administratif - NDA) sont actuellement disponibles.`}
          </AlertWrapper>
        </BlockWrapper>
      )}
      <Grid container justifyContent="flex-end">
        <Grid container item xs={12} md={10} lg={7} xl={5} justifyContent="flex-end" spacing={1}>
          {(filtersAsArray.length > 0 || searchInput) && (
            <Grid container item xs={12} md={5}>
              <Tooltip title={maintenanceIsActive ? "Ce bouton est desactivé en fonction d'une maintenance." : ''}>
                <Grid container>
                  <Button
                    width="100%"
                    startIcon={<Save height="15px" fill="#FFF" />}
                    onClick={() => setToggleSaveFiltersModal(true)}
                    color="secondary"
                    disabled={maintenanceIsActive}
                  >
                    Enregistrer filtres
                  </Button>
                </Grid>
              </Tooltip>
            </Grid>
          )}
          <Grid container item xs={12} md={allSavedFilters?.count ? 7 : 4} justifyContent="space-between">
            {!!allSavedFilters?.count && (
              <Button
                startIcon={<SavedSearch fill="#FFF" />}
                width="49%"
                onClick={() => setToggleSavedFiltersModal(true)}
              >
                Vos filtres
              </Button>
            )}
            <Button
              startIcon={<FilterList height="15px" fill="#FFF" />}
              width={allSavedFilters?.count ? '49%' : '100%'}
              onClick={() => setToggleFilterByModal(true)}
            >
              Filtrer
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <BlockWrapper item xs={12}>
        <Searchbar>
          <Grid container alignItems="center">
            <Grid item xs={12} md={12} lg={4} xl={4}>
              <Tabs
                values={PMSITabs}
                active={selectedTab}
                onchange={(value: PmsiTab) => {
                  setOldTabs(selectedTab)
                  setSelectedTab(value)
                  setSearchParams({ ...existingParams, tabId: value.id })
                }}
              />
            </Grid>
            <Grid item xs={12} md={12} lg={4} xl={4} container justifyContent="center">
              {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && (
                <CircularProgress />
              )}
              {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
                <DisplayDigits nb={searchResults.nb} total={searchResults.total} label={searchResults.label} />
              )}
            </Grid>

            <Grid item xs={12} md={12} lg={4} xl={4}>
              <SearchInput
                value={searchInput}
                placeholder={'Rechercher'}
                width="100%"
                onchange={(newValue) => changeSearchInput(newValue)}
              />
            </Grid>
          </Grid>
        </Searchbar>
      </BlockWrapper>

      {filtersAsArray.length > 0 && (
        <Grid item xs={12} margin="0px 0px 10px">
          {filtersAsArray.map((filter) => (
            <Chip key={uuidv4()} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
          ))}
        </Grid>
      )}
      <Grid item xs={12}>
        <DataTablePmsi
          loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
          selectedTab={selectedTab.id}
          pmsiList={searchResults.list}
          deidentified={searchResults.deidentified}
          orderBy={orderBy}
          setOrderBy={(orderBy) => changeOrderBy(orderBy)}
          page={page}
          setPage={(newPage) => setPage(newPage)}
          total={searchResults.nb}
        />
      </Grid>

      <Modal
        title="Filtrer par :"
        open={toggleFilterByModal}
        color="secondary"
        onClose={() => setToggleFilterByModal(false)}
        onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
        onClean={triggerClean}
      >
        {!searchResults.deidentified && (
          <TextInput name={FilterKeys.NDA} value={nda} label="NDA :" placeholder="Exemple: 6601289264,141740347" />
        )}
        <CodeFilter name={FilterKeys.CODE} value={code} references={references} />
        {selectedTab.id === ResourceType.CONDITION && (
          <MultiSelectInput
            name={FilterKeys.DIAGNOSTIC_TYPES}
            value={diagnosticTypes || []}
            options={allDiagnosticTypesList}
            label="Type de diagnostics :"
          />
        )}
        {selectedTab.id !== ResourceType.CLAIM && (
          <RadioGroupFilter label="Source :" name={FilterKeys.SOURCE} value={source ?? ''} options={sourceOptions} />
        )}
        <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
        <ExecutiveUnitsFilter sourceType={sourceType} value={executiveUnits} name={FilterKeys.EXECUTIVE_UNITS} />
        <MultiSelectInput
          value={encounterStatus}
          name={FilterKeys.ENCOUNTER_STATUS}
          options={encounterStatusList}
          label="Statut de la visite associée :"
        />
      </Modal>

      <Modal
        title="Filtres sauvegardés"
        open={toggleSavedFiltersModal}
        onClose={() => {
          setToggleSavedFiltersModal(false)
          resetSavedFilterError()
        }}
        onSubmit={() => {
          if (selectedSavedFilter) addSearchCriterias(selectedSavedFilter.filterParams)
        }}
        validationText="Appliquer le filtre"
      >
        <List
          values={allSavedFiltersAsListItems}
          count={allSavedFilters?.count ?? 0}
          onDisplay={() => {
            setToggleFilterInfoModal(true)
            setIsReadonlyFilterInfoModal(true)
          }}
          onEdit={
            maintenanceIsActive
              ? undefined
              : () => {
                  setToggleFilterInfoModal(true)
                  setIsReadonlyFilterInfoModal(false)
                }
          }
          onDelete={maintenanceIsActive ? undefined : deleteSavedFilters}
          onSelect={(filter) => selectFilter(filter)}
          fetchPaginateData={() => getSavedFilters(allSavedFilters?.next)}
        >
          <Modal
            title={isReadonlyFilterInfoModal ? 'Informations' : 'Modifier le filtre'}
            color="secondary"
            open={toggleFilterInfoModal}
            readonly={isReadonlyFilterInfoModal}
            onClose={() => setToggleFilterInfoModal(false)}
            onSubmit={({
              filterName,
              searchInput,
              code,
              nda,
              diagnosticTypes,
              source,
              startDate,
              endDate,
              executiveUnits,
              encounterStatus
            }) => {
              patchSavedFilter(
                filterName,
                {
                  searchInput,
                  orderBy: { orderBy: Order.DATE, orderDirection: Direction.DESC },
                  filters: { code, nda, diagnosticTypes, source, startDate, endDate, executiveUnits, encounterStatus }
                },
                searchResults.deidentified ?? true
              )
            }}
            validationText="Sauvegarder"
          >
            <Grid container gap="8px">
              <Grid item xs={12}>
                <TextInput
                  name="filterName"
                  label="Nom :"
                  value={selectedSavedFilter?.filterName}
                  error={savedFiltersErrors}
                  disabled={isReadonlyFilterInfoModal}
                  minLimit={2}
                  maxLimit={50}
                />
              </Grid>

              <Grid item xs={12}>
                <TextInput
                  name="searchInput"
                  label="Recherche textuelle :"
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.searchInput}
                />
              </Grid>
              {!searchResults.deidentified && (
                <Grid item xs={12}>
                  <TextInput
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.NDA}
                    value={selectedSavedFilter?.filterParams.filters.nda ?? ''}
                    placeholder="Exemple: 6601289264,141740347"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <CodeFilter
                  references={references}
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.CODE}
                  value={selectedSavedFilter?.filterParams.filters.code ?? []}
                />
              </Grid>
              {selectedTab.id === ResourceType.CONDITION && (
                <Grid item xs={12}>
                  <MultiSelectInput
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.DIAGNOSTIC_TYPES}
                    value={selectedSavedFilter?.filterParams.filters.diagnosticTypes ?? []}
                    options={allDiagnosticTypesList}
                    label="Type de diagnostics :"
                  />
                </Grid>
              )}
              {selectedTab.id !== ResourceType.CLAIM && (
                <Grid item xs={12}>
                  <RadioGroupFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.SOURCE}
                    value={selectedSavedFilter?.filterParams.filters.source ?? ''}
                    label="Source :"
                    options={sourceOptions}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <DatesRangeFilter
                  disabled={isReadonlyFilterInfoModal}
                  values={[
                    selectedSavedFilter?.filterParams.filters.startDate,
                    selectedSavedFilter?.filterParams.filters.endDate
                  ]}
                  names={[FilterKeys.START_DATE, FilterKeys.END_DATE]}
                />
              </Grid>
              <Grid item xs={12}>
                <ExecutiveUnitsFilter
                  sourceType={sourceType}
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.executiveUnits ?? []}
                  name={FilterKeys.EXECUTIVE_UNITS}
                />
              </Grid>
              <Grid item xs={12}>
                <MultiSelectInput
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.encounterStatus ?? []}
                  name={FilterKeys.ENCOUNTER_STATUS}
                  options={encounterStatusList}
                  label="Statut de la visite associée :"
                />
              </Grid>
            </Grid>
          </Modal>
        </List>
      </Modal>
      <Modal
        title="Sauvegarder le filtre"
        color="secondary"
        open={toggleSaveFiltersModal}
        onClose={() => {
          setToggleSaveFiltersModal(false)
          resetSavedFilterError()
        }}
        onSubmit={({ filtersName }) =>
          postSavedFilter(filtersName, { searchInput, filters, orderBy }, searchResults.deidentified ?? true)
        }
      >
        <TextInput name="filtersName" error={savedFiltersErrors} label="Nom" minLimit={2} maxLimit={50} />
      </Modal>
    </Grid>
  )
}
export default PatientPMSI
