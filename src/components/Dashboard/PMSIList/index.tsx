import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAppSelector } from 'state'

import { Chip, CircularProgress, Grid, Tooltip } from '@mui/material'
import { Save, SavedSearch, FilterList } from '@mui/icons-material'
import { AlertWrapper } from 'components/ui/Alert'
import { BlockWrapper } from 'components/ui/Layout'
import Button from 'components/ui/Button'
import CodeFilter from 'components/Filters/CodeFilter'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import DataTablePmsi from 'components/DataTable/DataTablePmsi'
import DiagnosticTypesFilter from 'components/Filters/DiagnosticTypesFilter'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import EncounterStatusFilter from 'components/Filters/EncounterStatusFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import IppFilter from 'components/Filters/IppFilter'
import List from 'components/ui/List'
import Modal from 'components/ui/Modal'
import NdaFilter from 'components/Filters/NdaFilter'
import { PMSITabs } from 'components/Patient/PatientPMSI'
import SourceFilter from 'components/Filters/SourceFilter'
import Searchbar from 'components/ui/Searchbar'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Tabs from 'components/ui/Tabs'
import TextInput from 'components/Filters/TextInput'

import { PMSILabel } from 'types/patient'
import { ResourceType } from 'types/requestCriterias'
import { Hierarchy } from 'types/hierarchy'
import { CohortPMSI, DTTB_ResultsType as ResultsType, LoadingStatus, PmsiTab } from 'types'
import { Direction, FilterKeys, Order, PMSIFilters } from 'types/searchCriterias'

import { CanceledError } from 'axios'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import services from 'services/aphp'
import useSearchCriterias, { initPmsiSearchCriterias } from 'reducers/searchCriteriasReducer'
import { cancelPendingRequest } from 'utils/abortController'
import { selectFiltersAsArray } from 'utils/filters'
import { mapToLabel, mapToSourceType } from 'mappers/pmsi'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { getConfig } from 'config'

type PMSIListProps = {
  groupId?: string
  deidentified?: boolean
}

const PMSIList = ({ groupId, deidentified }: PMSIListProps) => {
  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
  const [triggerClean, setTriggerClean] = useState<boolean>(false)
  const [encounterStatusList, setEncounterStatusList] = useState<Hierarchy<any, any>[]>([])

  const [selectedTab, setSelectedTab] = useState<PmsiTab>({
    id: ResourceType.CONDITION,
    label: PMSILabel.DIAGNOSTIC
  })
  const sourceType = mapToSourceType(selectedTab.id)

  const [page, setPage] = useState(1)
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
      filters: { code, nda, diagnosticTypes, source, startDate, endDate, executiveUnits, encounterStatus, ipp }
    },
    { changeOrderBy, changeSearchInput, addFilters, removeFilter, removeSearchCriterias, addSearchCriterias }
  ] = useSearchCriterias(initPmsiSearchCriterias)
  const filtersAsArray = useMemo(
    () =>
      selectFiltersAsArray({
        code,
        nda,
        diagnosticTypes,
        source,
        startDate,
        endDate,
        executiveUnits,
        encounterStatus,
        ipp
      }),
    [code, nda, diagnosticTypes, source, startDate, endDate, executiveUnits, encounterStatus, ipp]
  )

  const [allDiagnosticTypesList, setAllDiagnosticTypesList] = useState<Hierarchy<any, any>[]>([])
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [searchResults, setSearchResults] = useState<ResultsType>({
    nb: 0,
    total: 0,
    label: PMSILabel.DIAGNOSTIC
  })
  const [pmsiList, setPmsiList] = useState<CohortPMSI[]>([])
  const [patientsResults, setPatientsResults] = useState<ResultsType>({ nb: 0, total: 0, label: 'patient(s)' })

  const controllerRef = useRef<AbortController | null>(null)
  const meState = useAppSelector((state) => state.me)
  const maintenanceIsActive = meState?.maintenance?.active

  const _fetchPMSI = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await services.cohorts.fetchPMSIList(
        {
          selectedTab: selectedTab.id,
          deidentified: !!deidentified,
          page,
          searchCriterias: {
            orderBy,
            searchInput,
            filters: { code, nda, diagnosticTypes, source, startDate, endDate, executiveUnits, encounterStatus, ipp }
          }
        },
        groupId,
        controllerRef.current?.signal
      )

      if (response) {
        const { totalPMSI, totalAllPMSI, totalPatientPMSI, totalAllPatientsPMSI, pmsiList } = response
        setSearchResults((prevState) => ({
          ...prevState,
          nb: totalPMSI,
          total: totalAllPMSI,
          label: mapToLabel(selectedTab.id)
        }))
        setPmsiList(pmsiList)
        setPatientsResults((prevState) => ({
          ...prevState,
          nb: totalPatientPMSI,
          total: totalAllPatientsPMSI
        }))
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      } else {
        setLoadingStatus(LoadingStatus.SUCCESS)
        setSearchResults((prevState) => ({
          ...prevState,
          nb: 0,
          total: 0,
          label: mapToLabel(selectedTab.id)
        }))
        setPmsiList([])
        setPatientsResults((prevState) => ({
          ...prevState,
          nb: 0,
          total: 0
        }))
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
    getSavedFilters()
    fetch()
  }, [])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [
    searchInput,
    nda,
    code,
    startDate,
    endDate,
    diagnosticTypes,
    source,
    orderBy,
    executiveUnits,
    encounterStatus,
    ipp
  ])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchPMSI()
    }
  }, [loadingStatus])

  useEffect(() => {
    setPage(1)
    removeSearchCriterias()
    setTriggerClean(!triggerClean)
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [selectedTab])

  const fetchCodes = useCallback(() => {
    switch (selectedTab.id) {
      case ResourceType.CONDITION:
        return /*fetchConditionCodes*/ () => []
      case ResourceType.PROCEDURE:
        return /*fetchProcedureCodes*/ () => []
      default:
        return () => []
    }
  }, [selectedTab.id])

  return (
    <Grid container justifyContent="flex-end" gap="20px">
      <BlockWrapper item xs={12}>
        <AlertWrapper severity="warning">
          {`Attention : Les données AREM sont disponibles uniquement pour la période du 07/12/2009 au 31/12/2022. Seuls
            les ${
              selectedTab.id === ResourceType.CONDITION ? 'diagnostics' : 'actes'
            } rattachés à une visite Orbis (avec un Dossier Administratif - NDA) sont actuellement disponibles.`}
        </AlertWrapper>
      </BlockWrapper>

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
          <Grid container item xs={12} md={allSavedFilters?.count ? 7 : 4} justifyContent="space-between">
            {!!allSavedFilters?.count && (
              <Button icon={<SavedSearch fill="#FFF" />} width="49%" onClick={() => setToggleSavedFiltersModal(true)}>
                Vos filtres
              </Button>
            )}
            <Button
              icon={<FilterList height="15px" fill="#FFF" />}
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
                  setSelectedTab(value)
                }}
              />
            </Grid>
            <Grid item xs={12} md={12} lg={4} xl={4} container justifyContent="center">
              {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && (
                <CircularProgress />
              )}
              {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
                <Grid container flexDirection={'column'} alignItems={'center'}>
                  <DisplayDigits nb={searchResults.nb} total={searchResults.total} label={searchResults.label ?? ''} />
                  <DisplayDigits
                    nb={patientsResults.nb}
                    total={patientsResults.total}
                    label={patientsResults.label ?? ''}
                  />
                </Grid>
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
          pmsiList={pmsiList}
          deidentified={!!deidentified}
          orderBy={orderBy}
          setOrderBy={(orderBy) => changeOrderBy(orderBy)}
          page={page}
          setPage={(newPage) => setPage(newPage)}
          total={searchResults.nb}
          showIpp
          groupId={groupId}
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
        {!deidentified && <NdaFilter name={FilterKeys.NDA} value={nda} />}
        {!deidentified && <IppFilter name={FilterKeys.IPP} value={ipp ?? ''} />}
        <CodeFilter name={FilterKeys.CODE} value={code} onFetch={fetchCodes()} />
        {selectedTab.id === ResourceType.CONDITION && (
          <DiagnosticTypesFilter
            name={FilterKeys.DIAGNOSTIC_TYPES}
            value={diagnosticTypes || []}
            allDiagnosticTypesList={allDiagnosticTypesList}
          />
        )}
        {selectedTab.id !== ResourceType.CLAIM && <SourceFilter name={FilterKeys.SOURCE} value={source ?? ''} />}
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
              encounterStatus,
              ipp
            }) => {
              patchSavedFilter(
                filterName,
                {
                  searchInput,
                  orderBy: { orderBy: Order.DATE, orderDirection: Direction.DESC },
                  filters: {
                    code,
                    nda,
                    diagnosticTypes,
                    source,
                    startDate,
                    endDate,
                    executiveUnits,
                    encounterStatus,
                    ipp
                  }
                },
                deidentified ?? true
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
              {!deidentified && (
                <Grid item xs={12}>
                  <NdaFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.NDA}
                    value={selectedSavedFilter?.filterParams.filters.nda ?? ''}
                  />
                </Grid>
              )}
              {!deidentified && (
                <Grid item>
                  <IppFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.IPP}
                    value={selectedSavedFilter?.filterParams.filters.ipp ?? ''}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <CodeFilter
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.CODE}
                  value={selectedSavedFilter?.filterParams.filters.code ?? []}
                  onFetch={fetchCodes()}
                />
              </Grid>
              {selectedTab.id === ResourceType.CONDITION && (
                <Grid item xs={12}>
                  <DiagnosticTypesFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.DIAGNOSTIC_TYPES}
                    value={selectedSavedFilter?.filterParams.filters.diagnosticTypes ?? []}
                    allDiagnosticTypesList={allDiagnosticTypesList}
                  />
                </Grid>
              )}
              {selectedTab.id !== ResourceType.CLAIM && (
                <Grid item xs={12}>
                  <SourceFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.SOURCE}
                    value={selectedSavedFilter?.filterParams.filters.source ?? ''}
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
                <EncounterStatusFilter
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.encounterStatus ?? []}
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
          postSavedFilter(filtersName, { searchInput, filters, orderBy }, deidentified ?? true)
        }
      >
        <TextInput name="filtersName" error={savedFiltersErrors} label="Nom" minLimit={2} maxLimit={50} />
      </Modal>
    </Grid>
  )
}

export default PMSIList
