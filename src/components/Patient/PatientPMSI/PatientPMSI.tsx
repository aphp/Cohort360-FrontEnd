import React, { useEffect, useMemo, useRef, useState } from 'react'

import { CircularProgress, Grid, Tooltip } from '@mui/material'
import Chip from 'components/ui/Chip'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import DataTablePmsi from 'components/DataTable/DataTablePmsi'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchPmsi } from 'state/patient'

import { HierarchyElement, LoadingStatus, TabType } from 'types'

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
import { RessourceType } from 'types/requestCriterias'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { Save, SavedSearch } from '@mui/icons-material'
import TextInput from 'components/ui/TextInput'
import { Claim, Condition, Procedure } from 'fhir/r4'
import { mapToPmsiObjectAttributeName, mapToCriteriaName, mapToPmsiLabelObject } from 'mappers/pmsi'
import List from 'components/ui/List'

export type PatientPMSIProps = {
  groupId?: string
}

type PmsiTab = TabType<RessourceType.CLAIM | RessourceType.CONDITION | RessourceType.PROCEDURE, PMSILabel>

type PmsiTabs = PmsiTab[]

type PmsiSearchResults = {
  deidentified: boolean
  list: Condition[] | Procedure[] | Claim[]
  nb: number
  total: number
  label: PMSILabel
}

const PatientPMSI = ({ groupId }: PatientPMSIProps) => {
  const { classes } = useStyles()
  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
  const dispatch = useAppDispatch()

  const [selectedTab, setSelectedTab] = useState<PmsiTab>({
    id: RessourceType.CONDITION,
    label: PMSILabel.DIAGNOSTIC
  })
  const PMSITabs: PmsiTabs = [
    { label: PMSILabel.DIAGNOSTIC, id: RessourceType.CONDITION },
    { label: PMSILabel.CCAM, id: RessourceType.PROCEDURE },
    { label: PMSILabel.GHM, id: RessourceType.CLAIM }
  ]
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
      filters: { code, nda, diagnosticTypes, source, startDate, endDate, executiveUnits }
    },
    { changeOrderBy, changeSearchInput, addFilters, removeFilter, removeSearchCriterias, addSearchCriterias }
  ] = useSearchCriterias(initPmsiSearchCriterias)
  const filtersAsArray = useMemo(
    () => selectFiltersAsArray({ code, nda, diagnosticTypes, source, startDate, endDate, executiveUnits }),
    [code, nda, diagnosticTypes, source, startDate, endDate, executiveUnits]
  )

  const [allDiagnosticTypesList, setAllDiagnosticTypesList] = useState<HierarchyElement[]>([])
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

  const _fetchPMSI = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchPmsi({
          options: {
            selectedTab: selectedTab.id,
            page,
            searchCriterias: {
              orderBy,
              searchInput,
              filters: { code, nda, diagnosticTypes, source, startDate, endDate, executiveUnits }
            }
          },
          groupId,
          signal: controllerRef.current?.signal
        })
      )
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
    const _fetchDiagnosticTypes = async () => {
      try {
        const diagnosticTypes = await services.cohortCreation.fetchDiagnosticTypes()
        setAllDiagnosticTypesList(diagnosticTypes)
      } catch (e) {
        /* empty */
      }
    }
    getSavedFilters()
    _fetchDiagnosticTypes()
  }, [])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [searchInput, nda, code, startDate, endDate, diagnosticTypes, source, orderBy, executiveUnits])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchPMSI()
    }
  }, [loadingStatus])

  const SaveFiltersButton = () => (
    <Button
      width="250px"
      icon={<Save height="15px" fill="#FFF" />}
      onClick={() => {
        setToggleSaveFiltersModal(true)
        resetSavedFilterError()
      }}
      color="secondary"
      disabled={maintenanceIsActive}
    >
      Enregistrer filtres
    </Button>
  )

  useEffect(() => {
    setPage(1)
    removeSearchCriterias()
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [selectedTab])

  useEffect(() => {
    const pmsiIndex = mapToPmsiObjectAttributeName(selectedTab.id)
    setSearchResults({
      deidentified: patient?.deidentified || false,
      list: patient?.pmsi?.[pmsiIndex]?.list || [],
      nb: patient?.pmsi?.[pmsiIndex]?.count ?? 0,
      total: patient?.pmsi?.[pmsiIndex]?.total ?? 0,
      label: mapToPmsiLabelObject(selectedTab.id)
    })
  }, [patient, selectedTab.id])

  return (
    <Grid container className={classes.documentTable} gap="20px">
      <Grid container justifyContent="flex-end">
        <Grid container justifyContent="flex-end" gap="10px">
          {(filtersAsArray.length > 0 || searchInput) && (
            <Grid item>
              {maintenanceIsActive ? (
                <Tooltip
                  title="Ce bouton est désactivé en raison d'une maintenance en cours."
                  arrow
                  placement="bottom-start"
                >
                  <Grid>
                    <SaveFiltersButton />
                  </Grid>
                </Tooltip>
              ) : (
                <SaveFiltersButton />
              )}
            </Grid>
          )}
          {!!allSavedFilters?.count && (
            <Grid item>
              <Button
                icon={<SavedSearch fill="#FFF" />}
                width={'170px'}
                onClick={() => setToggleSavedFiltersModal(true)}
              >
                Vos filtres
              </Button>
            </Grid>
          )}
          <Grid item>
            <Button
              width={'170px'}
              icon={<FilterList height="15px" fill="#FFF" />}
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
                onchange={(
                  value: TabType<RessourceType.CONDITION | RessourceType.PROCEDURE | RessourceType.CLAIM, PMSILabel>
                ) => setSelectedTab(value)}
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
        width={'600px'}
        onClose={() => setToggleFilterByModal(false)}
        onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
      >
        {!searchResults.deidentified && <NdaFilter name={FilterKeys.NDA} value={nda} />}
        <CodeFilter name={FilterKeys.CODE} value={code} />
        {selectedTab.id === RessourceType.CONDITION && (
          <DiagnosticTypesFilter
            name={FilterKeys.DIAGNOSTIC_TYPES}
            value={diagnosticTypes || []}
            allDiagnosticTypesList={allDiagnosticTypesList}
          />
        )}
        {selectedTab.id === RessourceType.PROCEDURE && <SourceFilter name={FilterKeys.SOURCE} value={source || ''} />}
        <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
        <ExecutiveUnitsFilter
          value={executiveUnits}
          name={FilterKeys.EXECUTIVE_UNITS}
          criteriaName={mapToCriteriaName(selectedTab.id)}
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
          onDelete={deleteSavedFilters}
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
          onSelect={(filter) => selectFilter(filter)}
          fetchPaginateData={() => getSavedFilters(allSavedFilters?.next)}
        >
          <Modal
            title={isReadonlyFilterInfoModal ? 'Informations' : 'Modifier le filtre'}
            open={toggleFilterInfoModal}
            readonly={isReadonlyFilterInfoModal}
            onClose={() => setToggleFilterInfoModal(false)}
            onSubmit={(newFilters) => {
              const { name, searchInput, code, nda, diagnosticTypes, source, startDate, endDate, executiveUnits } =
                newFilters
              patchSavedFilter(
                name,
                {
                  searchInput,
                  orderBy: { orderBy: Order.DATE, orderDirection: Direction.DESC },
                  filters: { code, nda, diagnosticTypes, source, startDate, endDate, executiveUnits }
                },
                searchResults.deidentified ?? true
              )
            }}
            validationText={isReadonlyFilterInfoModal ? 'Fermer' : 'Sauvegarder'}
          >
            <Grid container direction="column" gap="8px">
              <Grid item container direction="column">
                <TextInput
                  name="name"
                  label="Nom :"
                  value={selectedSavedFilter?.filterName}
                  error={savedFiltersErrors}
                  disabled={isReadonlyFilterInfoModal}
                  minLimit={2}
                  maxLimit={50}
                />
              </Grid>

              <Grid item container direction="column" paddingBottom="8px">
                <TextInput
                  name="searchInput"
                  label="Recherche textuelle :"
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.searchInput}
                />
              </Grid>

              <Grid item>
                {!searchResults.deidentified && (
                  <NdaFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.NDA}
                    value={selectedSavedFilter?.filterParams.filters.nda || ''}
                  />
                )}
                <CodeFilter
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.CODE}
                  value={selectedSavedFilter?.filterParams.filters.code || ''}
                />

                {selectedTab.id === RessourceType.CONDITION && (
                  <DiagnosticTypesFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.DIAGNOSTIC_TYPES}
                    value={selectedSavedFilter?.filterParams.filters.diagnosticTypes || []}
                    allDiagnosticTypesList={allDiagnosticTypesList}
                  />
                )}
                {selectedTab.id === RessourceType.PROCEDURE && (
                  <SourceFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.SOURCE}
                    value={selectedSavedFilter?.filterParams.filters.source || ''}
                  />
                )}
                <DatesRangeFilter
                  disabled={isReadonlyFilterInfoModal}
                  values={[
                    selectedSavedFilter?.filterParams.filters.startDate,
                    selectedSavedFilter?.filterParams.filters.endDate
                  ]}
                  names={[FilterKeys.START_DATE, FilterKeys.END_DATE]}
                />
                <ExecutiveUnitsFilter
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.executiveUnits || []}
                  name={FilterKeys.EXECUTIVE_UNITS}
                  criteriaName={mapToCriteriaName(selectedTab.id)}
                />
              </Grid>
            </Grid>
          </Modal>
        </List>
      </Modal>
      <Modal
        title="Sauvegarder les filtres"
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
