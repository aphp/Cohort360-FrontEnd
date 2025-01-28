import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'state'
import { MedicationAdministration, MedicationRequest } from 'fhir/r4'

import { Chip, CircularProgress, Grid, Tooltip, useMediaQuery, useTheme } from '@mui/material'
import { Save, SavedSearch, FilterList } from '@mui/icons-material'
import Button from 'components/ui/Button'
import DataTableMedication from 'components/DataTable/DataTableMedication'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import List from 'components/ui/List'
import Modal from 'components/ui/Modal'
import { medicationTabs } from 'components/Patient/PatientMedication'
import MultiSelectInput from 'components/Filters/MultiSelectInput'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Tabs from 'components/ui/Tabs'
import TextInput from 'components/Filters/TextInput'
import { MedicationLabel, ResourceType } from 'types/requestCriterias'
import { DTTB_ResultsType as ResultsType, LoadingStatus, TabType, MedicationTab, CohortMedication } from 'types'
import { SourceType } from 'types/scope'
import { Direction, FilterKeys, LabelObject, MedicationFilters, Order } from 'types/searchCriterias'
import { CanceledError } from 'axios'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import services from 'services/aphp'
import useSearchCriterias, { initMedSearchCriterias } from 'reducers/searchCriteriasReducer'
import { cancelPendingRequest } from 'utils/abortController'
import { selectFiltersAsArray } from 'utils/filters'
import { mapToLabel } from 'mappers/pmsi'
import { checkIfPageAvailable, cleanSearchParams, handlePageError } from 'utils/paginationUtils'
import { getMedicationTab } from 'utils/tabsUtils'
import { useSearchParams } from 'react-router-dom'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { getConfig } from 'config'
import { getValueSetsFromSystems } from 'utils/valueSets'
import CodeFilter from 'components/Filters/CodeFilter'

type MedicationListProps = {
  deidentified?: boolean
}

const MedicationList = ({ deidentified }: MedicationListProps) => {
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.down('md'))
  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
  const [triggerClean, setTriggerClean] = useState<boolean>(false)
  const [encounterStatusList, setEncounterStatusList] = useState<LabelObject[]>([])
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const getPageParam = searchParams.get('page')
  const groupId = searchParams.get('groupId') ?? undefined
  const tabId = searchParams.get('tabId') ?? undefined
  const existingParams = Object.fromEntries(searchParams.entries())

  const [selectedTab, setSelectedTab] = useState<MedicationTab>(getMedicationTab(tabId))

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
  } = useSavedFilters<MedicationFilters>(selectedTab.id)

  const [
    {
      orderBy,
      searchInput,
      filters,
      filters: {
        code,
        nda,
        ipp,
        startDate,
        endDate,
        executiveUnits,
        encounterStatus,
        administrationRoutes,
        prescriptionTypes
      }
    },
    { changeOrderBy, changeSearchInput, addFilters, removeFilter, removeSearchCriterias, addSearchCriterias }
  ] = useSearchCriterias(initMedSearchCriterias)
  const filtersAsArray = useMemo(
    () =>
      selectFiltersAsArray({
        code,
        nda,
        ipp,
        startDate,
        endDate,
        executiveUnits,
        encounterStatus,
        administrationRoutes,
        prescriptionTypes
      }),
    [code, nda, ipp, startDate, endDate, executiveUnits, encounterStatus, administrationRoutes, prescriptionTypes]
  )

  const [allAdministrationRoutes, setAllAdministrationRoutes] = useState<LabelObject[]>([])
  const [allPrescriptionTypes, setAllPrescriptionTypes] = useState<LabelObject[]>([])
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [searchResults, setSearchResults] = useState<ResultsType>({
    nb: 0,
    total: 0,
    label: MedicationLabel.PRESCRIPTION
  })
  const [medicationList, setMedicationList] = useState<
    CohortMedication<MedicationRequest | MedicationAdministration>[]
  >([])
  const [patientsResults, setPatientsResults] = useState<ResultsType>({ nb: 0, total: 0, label: 'patient(s)' })

  const controllerRef = useRef<AbortController | null>(null)
  const meState = useAppSelector((state) => state.me)
  const maintenanceIsActive = meState?.maintenance?.active
  const isFirstRender = useRef(true)

  const _fetchMedication = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await services.cohorts.fetchMedicationList(
        {
          selectedTab: selectedTab.id,
          deidentified: !!deidentified,
          page,
          searchCriterias: {
            orderBy,
            searchInput,
            filters: {
              code,
              nda,
              ipp,
              startDate,
              endDate,
              executiveUnits,
              encounterStatus,
              administrationRoutes,
              prescriptionTypes
            }
          }
        },
        groupId,
        controllerRef.current?.signal
      )

      if (response) {
        const { total, totalAllResults, totalPatients, totalAllPatients, list } = response
        setSearchResults((prevState) => ({
          ...prevState,
          nb: total,
          total: totalAllResults,
          label: mapToLabel(selectedTab.id)
        }))
        setMedicationList(list)
        setPatientsResults((prevState) => ({
          ...prevState,
          nb: totalPatients,
          total: totalAllPatients
        }))
        checkIfPageAvailable(total, page, setPage, dispatch)
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      console.error('Erreur lors de la récupération de la liste Medication :', error)
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
        setMedicationList([])
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
      const [administrations, prescriptions, encounterStatus] = await Promise.all([
        getCodeList(getConfig().features.medication.valueSets.medicationAdministrations.url),
        getCodeList(getConfig().features.medication.valueSets.medicationPrescriptionTypes.url),
        getCodeList(getConfig().core.valueSets.encounterStatus.url)
      ])
      setAllAdministrationRoutes(administrations.results)
      setAllPrescriptionTypes(prescriptions.results)
      setEncounterStatusList(encounterStatus.results)
    }
    fetch()
  }, [])

  useEffect(() => {
    if (!isFirstRender.current) {
      setLoadingStatus(LoadingStatus.IDDLE)
      setPage(1)
    }
  }, [
    code,
    searchInput,
    orderBy,
    nda,
    ipp,
    startDate,
    endDate,
    executiveUnits,
    encounterStatus,
    administrationRoutes,
    prescriptionTypes,
    groupId
  ])

  useEffect(() => {
    setSearchParams(cleanSearchParams({ page: page.toString(), tabId: selectedTab.id, groupId: groupId }))

    handlePageError(page, setPage, dispatch, setLoadingStatus)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchMedication()
    }
  }, [loadingStatus])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      setPage(1)
      setLoadingStatus(LoadingStatus.IDDLE)
    }
    removeSearchCriterias()
    setTriggerClean(!triggerClean)
  }, [selectedTab])

  const references = useMemo(() => {
    return getValueSetsFromSystems([
      getConfig().features.medication.valueSets.medicationAtc.url,
      getConfig().features.medication.valueSets.medicationUcd.url
    ])
  }, [])

  return (
    <Grid container gap="20px">
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
          <Grid container item xs={12} md={allSavedFilters?.count ? 7 : 3} justifyContent="space-between">
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

      <Grid container item xs={12} style={isSm ? { flexWrap: 'wrap-reverse' } : {}} alignItems={'center'}>
        <Grid item xs={12} md={4}>
          <Tabs
            values={medicationTabs}
            active={selectedTab}
            onchange={(
              value: TabType<ResourceType.MEDICATION_ADMINISTRATION | ResourceType.MEDICATION_REQUEST, MedicationLabel>
            ) => {
              setSelectedTab(value)
              setSearchParams({ ...existingParams, tabId: value.id })
            }}
          />
        </Grid>
        <Grid container justifyContent="center" item xs={12} md={4}>
          {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && <CircularProgress />}
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
        <Grid container item xs={12} md={4} justifyContent="flex-end">
          <SearchInput
            value={searchInput}
            placeholder={'Rechercher'}
            onchange={(newValue: string) => changeSearchInput(newValue)}
          />
        </Grid>
      </Grid>

      {filtersAsArray.length > 0 && (
        <Grid item xs={12}>
          {filtersAsArray.map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
          ))}
        </Grid>
      )}
      <Grid item xs={12}>
        <DataTableMedication
          loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
          selectedTab={selectedTab.id}
          medicationsList={medicationList}
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
        {!deidentified && (
          <TextInput name={FilterKeys.NDA} value={nda} label="NDA :" placeholder="Exemple: 6601289264,141740347" />
        )}
        {!deidentified && (
          <TextInput
            name={FilterKeys.IPP}
            value={ipp}
            label="IPP :"
            placeholder="'Exemple: 8000000000001,8000000000002'"
          />
        )}
        {selectedTab.id === ResourceType.MEDICATION_REQUEST && prescriptionTypes && (
          <MultiSelectInput
            value={prescriptionTypes}
            name={FilterKeys.PRESCRIPTION_TYPES}
            options={allPrescriptionTypes}
            label="Type de prescriptions :"
          />
        )}
        {selectedTab.id === ResourceType.MEDICATION_ADMINISTRATION && administrationRoutes && (
          <MultiSelectInput
            value={administrationRoutes}
            name={FilterKeys.ADMINISTRATION_ROUTES}
            options={allAdministrationRoutes}
            label="Voie d'administration :"
          />
        )}
        <CodeFilter name={FilterKeys.CODE} value={code} references={references} />
        <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
        <ExecutiveUnitsFilter
          sourceType={SourceType.MEDICATION}
          value={executiveUnits}
          name={FilterKeys.EXECUTIVE_UNITS}
        />
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
            open={toggleFilterInfoModal}
            color="secondary"
            readonly={isReadonlyFilterInfoModal}
            onClose={() => setToggleFilterInfoModal(false)}
            onSubmit={({
              code,
              filterName,
              searchInput,
              nda,
              prescriptionTypes,
              startDate,
              endDate,
              administrationRoutes,
              executiveUnits,
              encounterStatus,
              ipp
            }) => {
              patchSavedFilter(
                filterName,
                {
                  searchInput,
                  orderBy: { orderBy: Order.PERIOD_START, orderDirection: Direction.DESC },
                  filters: {
                    code,
                    nda,
                    ipp,
                    prescriptionTypes,
                    startDate,
                    endDate,
                    administrationRoutes,
                    executiveUnits,
                    encounterStatus
                  }
                },
                deidentified ?? true
              )
            }}
            validationText="Sauvegarder"
          >
            <Grid container direction="column" gap="8px">
              <TextInput
                name="filterName"
                label="Nom :"
                value={selectedSavedFilter?.filterName}
                error={savedFiltersErrors}
                disabled={isReadonlyFilterInfoModal}
                minLimit={2}
                maxLimit={50}
              />
              {!deidentified && (
                <TextInput
                  name="searchInput"
                  label="Recherche textuelle :"
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.searchInput}
                />
              )}
              {!deidentified && (
                <TextInput
                  name={FilterKeys.NDA}
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.nda ?? ''}
                  label="NDA :"
                  placeholder="Exemple: 6601289264,141740347"
                />
              )}
              {!deidentified && (
                <TextInput
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.IPP}
                  value={selectedSavedFilter?.filterParams.filters.ipp ?? ''}
                  label="IPP :"
                  placeholder="'Exemple: 8000000000001,8000000000002'"
                />
              )}
              {selectedTab.id === ResourceType.MEDICATION_REQUEST && (
                <MultiSelectInput
                  label="Type de prescriptions :"
                  value={selectedSavedFilter?.filterParams.filters.prescriptionTypes || []}
                  name={FilterKeys.PRESCRIPTION_TYPES}
                  options={allPrescriptionTypes}
                  disabled={isReadonlyFilterInfoModal}
                />
              )}
              {selectedTab.id === ResourceType.MEDICATION_ADMINISTRATION && (
                <MultiSelectInput
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.administrationRoutes || []}
                  name={FilterKeys.ADMINISTRATION_ROUTES}
                  options={allAdministrationRoutes}
                  label="Voie d'administration :"
                />
              )}
              <CodeFilter
                references={references}
                disabled={isReadonlyFilterInfoModal}
                name={FilterKeys.CODE}
                value={selectedSavedFilter?.filterParams.filters.code ?? []}
              />

              <DatesRangeFilter
                disabled={isReadonlyFilterInfoModal}
                values={[
                  selectedSavedFilter?.filterParams.filters.startDate,
                  selectedSavedFilter?.filterParams.filters.endDate
                ]}
                names={[FilterKeys.START_DATE, FilterKeys.END_DATE]}
              />
              <ExecutiveUnitsFilter
                sourceType={SourceType.MEDICATION}
                disabled={isReadonlyFilterInfoModal}
                value={selectedSavedFilter?.filterParams.filters.executiveUnits || []}
                name={FilterKeys.EXECUTIVE_UNITS}
              />
              <MultiSelectInput
                label="Statut de la visite associée :"
                disabled={isReadonlyFilterInfoModal}
                value={selectedSavedFilter?.filterParams.filters.encounterStatus || []}
                name={FilterKeys.ENCOUNTER_STATUS}
                options={encounterStatusList}
              />
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

export default MedicationList
