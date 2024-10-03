import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { CircularProgress, Grid, Tooltip } from '@mui/material'
import Chip from 'components/ui/Chip'
import FilterList from 'assets/icones/filter.svg?react'

import DataTablePmsi from 'components/DataTable/DataTablePmsi'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchPmsi } from 'state/patient'
import { CohortPMSI, LoadingStatus, PmsiTab, PmsiTabs } from 'types'
import useStyles from './styles'
import { cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import Searchbar from 'components/ui/Searchbar'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import Tabs from 'components/ui/Tabs'
import { Direction, FilterKeys, Order, PMSIFilters } from 'types/searchCriterias'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import { PMSILabel } from 'types/patient'
import { selectFiltersAsArray } from 'utils/filters'
import { BlockWrapper } from 'components/ui/Layout'
import useSearchCriterias, { initPmsiSearchCriterias } from 'reducers/searchCriteriasReducer'
import services from 'services/aphp'
import CodeFilter from 'components/Filters/CodeFilter'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import DiagnosticTypesFilter from 'components/Filters/DiagnosticTypesFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import NdaFilter from 'components/Filters/NdaFilter'
import SourceFilter from 'components/Filters/SourceFilter'
import { ResourceType } from 'types/requestCriterias'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { Save, SavedSearch } from '@mui/icons-material'
import TextInput from 'components/Filters/TextInput'
import { mapToAttribute, mapToLabel, mapToSourceType } from 'mappers/pmsi'
import List from 'components/ui/List'
import { fetchClaimCodes, fetchConditionCodes, fetchProcedureCodes } from 'services/aphp/servicePmsi'
import EncounterStatusFilter from 'components/Filters/EncounterStatusFilter'
import { AlertWrapper } from 'components/ui/Alert'
import { Hierarchy } from 'types/hierarchy'
import { useSearchParams } from 'react-router-dom'
import { checkIfPageAvailable, handlePageError } from 'utils/paginationUtils'

type PatientPMSIProps = {
  groupId?: string
}

type PmsiSearchResults = {
  deidentified: boolean
  list: CohortPMSI[]
  nb: number
  total: number
  label: PMSILabel
}

export const PMSITabs: PmsiTabs = [
  { label: PMSILabel.DIAGNOSTIC, id: ResourceType.CONDITION },
  { label: PMSILabel.CCAM, id: ResourceType.PROCEDURE },
  { label: PMSILabel.GHM, id: ResourceType.CLAIM }
]

const PatientPMSI = ({ groupId }: PatientPMSIProps) => {
  const { classes } = useStyles()
  const [searchParams, setSearchParams] = useSearchParams()
  const getPageParam = searchParams.get('page')

  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
  const [triggerClean, setTriggerClean] = useState<boolean>(false)
  const [encounterStatusList, setEncounterStatusList] = useState<Hierarchy<any, any>[]>([])
  const dispatch = useAppDispatch()

  const [selectedTab, setSelectedTab] = useState<PmsiTab>({
    id: ResourceType.CONDITION,
    label: PMSILabel.DIAGNOSTIC
  })
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

  const [allDiagnosticTypesList, setAllDiagnosticTypesList] = useState<Hierarchy<any, any>[]>([])
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
          services.cohortCreation.fetchDiagnosticTypes(),
          services.cohortCreation.fetchEncounterStatus()
        ])
        setAllDiagnosticTypesList(diagnosticTypes)
        setEncounterStatusList(encounterStatus)
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

    const updatedSearchParams = new URLSearchParams(searchParams)
    updatedSearchParams.set('page', page.toString())
    setSearchParams(updatedSearchParams)

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
      deidentified: patient?.deidentified || false,
      list: patient?.pmsi?.[pmsiIndex]?.list || [],
      nb: patient?.pmsi?.[pmsiIndex]?.count ?? 0,
      total: patient?.pmsi?.[pmsiIndex]?.total ?? 0,
      label: mapToLabel(selectedTab.id)
    })
  }, [patient, selectedTab.id])

  const fetchCodes = useCallback(() => {
    switch (selectedTab.id) {
      case ResourceType.CONDITION:
        return fetchConditionCodes
      case ResourceType.PROCEDURE:
        return fetchProcedureCodes
      default:
        return fetchClaimCodes
    }
  }, [selectedTab.id])

  return (
    <Grid container className={classes.documentTable} gap="20px">
      {(selectedTab.id === ResourceType.PROCEDURE || selectedTab.id === ResourceType.CONDITION) && (
        <BlockWrapper item xs={12}>
          <AlertWrapper severity="warning">
            {`Attention : Les données AREM sont disponibles uniquement pour la période du 07/12/2009 au 31/12/2022. Seuls
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
                    icon={<Save height="15px" fill="#FFF" />}
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
          <Grid container item xs={12} md={!!allSavedFilters?.count ? 7 : 4} justifyContent="space-between">
            {!!allSavedFilters?.count && (
              <Button icon={<SavedSearch fill="#FFF" />} width="49%" onClick={() => setToggleSavedFiltersModal(true)}>
                Vos filtres
              </Button>
            )}
            <Button
              icon={<FilterList height="15px" fill="#FFF" />}
              width={!!allSavedFilters?.count ? '49%' : '100%'}
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
          {filtersAsArray.map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
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
        {!searchResults.deidentified && <NdaFilter name={FilterKeys.NDA} value={nda} />}
        <CodeFilter name={FilterKeys.CODE} value={code} onFetch={fetchCodes()} />
        {selectedTab.id === ResourceType.CONDITION && (
          <DiagnosticTypesFilter
            name={FilterKeys.DIAGNOSTIC_TYPES}
            value={diagnosticTypes || []}
            allDiagnosticTypesList={allDiagnosticTypesList}
          />
        )}
        {selectedTab.id !== ResourceType.CLAIM && <SourceFilter name={FilterKeys.SOURCE} value={source || ''} />}
        <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
        <ExecutiveUnitsFilter sourceType={sourceType} value={executiveUnits} name={FilterKeys.EXECUTIVE_UNITS} />
        <EncounterStatusFilter
          value={encounterStatus}
          name={FilterKeys.ENCOUNTER_STATUS}
          encounterStatusList={encounterStatusList}
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
          count={allSavedFilters?.count || 0}
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
                  <NdaFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.NDA}
                    value={selectedSavedFilter?.filterParams.filters.nda || ''}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <CodeFilter
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.CODE}
                  value={selectedSavedFilter?.filterParams.filters.code || []}
                  onFetch={fetchCodes()}
                />
              </Grid>
              {selectedTab.id === ResourceType.CONDITION && (
                <Grid item xs={12}>
                  <DiagnosticTypesFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.DIAGNOSTIC_TYPES}
                    value={selectedSavedFilter?.filterParams.filters.diagnosticTypes || []}
                    allDiagnosticTypesList={allDiagnosticTypesList}
                  />
                </Grid>
              )}
              {selectedTab.id !== ResourceType.CLAIM && (
                <Grid item xs={12}>
                  <SourceFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.SOURCE}
                    value={selectedSavedFilter?.filterParams.filters.source || ''}
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
                  value={selectedSavedFilter?.filterParams.filters.executiveUnits || []}
                  name={FilterKeys.EXECUTIVE_UNITS}
                />
              </Grid>
              <Grid item xs={12}>
                <EncounterStatusFilter
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.encounterStatus || []}
                  name={FilterKeys.ENCOUNTER_STATUS}
                  encounterStatusList={encounterStatusList}
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
