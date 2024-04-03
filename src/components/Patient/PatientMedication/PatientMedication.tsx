import React, { useEffect, useMemo, useRef, useState } from 'react'

import Grid from '@mui/material/Grid'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import DataTableMedication from 'components/DataTable/DataTableMedication'

import { CriteriaName, HierarchyElement, LoadingStatus, TabType } from 'types'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchMedication } from 'state/patient'

import useStyles from './styles'
import { cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import { CircularProgress, Tooltip, useMediaQuery, useTheme } from '@mui/material'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Tabs from 'components/ui/Tabs'
import { Direction, FilterKeys, MedicationFilters, Order } from 'types/searchCriterias'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import { selectFiltersAsArray } from 'utils/filters'
import useSearchCriterias, { initMedSearchCriterias } from 'reducers/searchCriteriasReducer'
import Chip from 'components/ui/Chip'
import AdministrationTypesFilter from 'components/Filters/AdministrationTypesFilter'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import NdaFilter from 'components/Filters/NdaFilter'
import PrescriptionTypesFilter from 'components/Filters/PrescriptionTypesFilter'
import { Save, SavedSearch } from '@mui/icons-material'
import { ResourceType } from 'types/requestCriterias'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { MedicationAdministration, MedicationRequest } from 'fhir/r4'
import { MedicationLabel } from 'types/patient'
import TextInput from 'components/Filters/TextInput'
import List from 'components/ui/List'
import { mapToAttribute, mapToLabel } from 'mappers/pmsi'
import services from 'services/aphp'

type PatientMedicationProps = {
  groupId?: string
}

type MedicationSearchResults = {
  deidentified: boolean
  list: MedicationRequest[] | MedicationAdministration[]
  nb: number
  total: number
  label: string
}

const PatientMedication = ({ groupId }: PatientMedicationProps) => {
  const { classes } = useStyles()
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.down('md'))
  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
  const [triggerClean, setTriggerClean] = useState<boolean>(false)

  const dispatch = useAppDispatch()
  const patient = useAppSelector((state) => state.patient)

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [page, setPage] = useState(1)
  const [selectedTab, setSelectedTab] = useState<
    TabType<ResourceType.MEDICATION_ADMINISTRATION | ResourceType.MEDICATION_REQUEST, MedicationLabel>
  >({
    id: ResourceType.MEDICATION_REQUEST,
    label: MedicationLabel.PRESCRIPTION
  })
  const medicationTabs: TabType<
    ResourceType.MEDICATION_ADMINISTRATION | ResourceType.MEDICATION_REQUEST,
    MedicationLabel
  >[] = [
    { id: ResourceType.MEDICATION_REQUEST, label: MedicationLabel.PRESCRIPTION },
    { id: ResourceType.MEDICATION_ADMINISTRATION, label: MedicationLabel.ADMINISTRATION }
  ]
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
      filters: { nda, prescriptionTypes, startDate, endDate, administrationRoutes, executiveUnits }
    },
    { changeOrderBy, changeSearchInput, addFilters, removeFilter, removeSearchCriterias, addSearchCriterias }
  ] = useSearchCriterias(initMedSearchCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ nda, prescriptionTypes, administrationRoutes, startDate, endDate, executiveUnits })
  }, [nda, prescriptionTypes, administrationRoutes, startDate, endDate, executiveUnits])

  const [allAdministrationRoutes, setAllAdministrationRoutes] = useState<HierarchyElement[]>([])
  const [allPrescriptionTypes, setAllPrescriptionTypes] = useState<HierarchyElement[]>([])
  const [searchResults, setSearchResults] = useState<MedicationSearchResults>({
    deidentified: false,
    list: [],
    nb: 0,
    total: 0,
    label: mapToLabel(ResourceType.MEDICATION_REQUEST)
  })

  const controllerRef = useRef<AbortController | null>(null)
  const meState = useAppSelector((state) => state.me)
  const maintenanceIsActive = meState?.maintenance?.active

  const _fetchMedication = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchMedication({
          options: {
            selectedTab: selectedTab.id,
            page,
            searchCriterias: {
              orderBy,
              searchInput,
              filters: {
                nda,
                administrationRoutes,
                prescriptionTypes,
                startDate,
                endDate,
                executiveUnits
              }
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
    const fetch = async () => {
      const [administrations, prescriptions] = await Promise.all([
        services.cohortCreation.fetchAdministrations(),
        services.cohortCreation.fetchPrescriptionTypes()
      ])
      setAllAdministrationRoutes(administrations)
      setAllPrescriptionTypes(prescriptions)
    }
    fetch()
  }, [])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [searchInput, nda, startDate, endDate, prescriptionTypes, administrationRoutes, orderBy, executiveUnits])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchMedication()
    }
  }, [loadingStatus])

  useEffect(() => {
    setPage(1)
    removeSearchCriterias()
    setTriggerClean(!triggerClean)
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [selectedTab])

  useEffect(() => {
    const medicationIndex = mapToAttribute(selectedTab.id)
    setSearchResults({
      deidentified: patient?.deidentified || false,
      list: patient?.medication?.[medicationIndex]?.list || [],
      nb: patient?.medication?.[medicationIndex]?.count ?? 0,
      total: patient?.medication?.[medicationIndex]?.total ?? 0,
      label: mapToLabel(selectedTab.id)
    })
  }, [patient, selectedTab.id])

  return (
    <Grid container className={classes.documentTable} gap="20px">
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
          <Grid container item xs={12} md={!!allSavedFilters?.count ? 7 : 3} justifyContent="space-between">
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

      <Grid container item xs={12} style={isSm ? { flexWrap: 'wrap-reverse' } : {}}>
        <Grid item xs={12} md={4}>
          <Tabs
            values={medicationTabs}
            active={selectedTab}
            onchange={(
              value: TabType<ResourceType.MEDICATION_ADMINISTRATION | ResourceType.MEDICATION_REQUEST, MedicationLabel>
            ) => setSelectedTab(value)}
          />
        </Grid>
        <Grid container justifyContent="center" item xs={12} md={4}>
          {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && <CircularProgress />}
          {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
            <DisplayDigits nb={searchResults.nb} total={searchResults.total} label={searchResults.label} />
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
          medicationsList={searchResults.list}
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
        {selectedTab.id === ResourceType.MEDICATION_REQUEST && prescriptionTypes && (
          <PrescriptionTypesFilter
            value={prescriptionTypes}
            name={FilterKeys.PRESCRIPTION_TYPES}
            allPrescriptionTypes={allPrescriptionTypes}
          />
        )}
        {selectedTab.id === ResourceType.MEDICATION_ADMINISTRATION && administrationRoutes && (
          <AdministrationTypesFilter
            value={administrationRoutes}
            name={FilterKeys.ADMINISTRATION_ROUTES}
            allAdministrationTypes={allAdministrationRoutes}
          />
        )}
        <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
        <ExecutiveUnitsFilter
          value={executiveUnits}
          name={FilterKeys.EXECUTIVE_UNITS}
          criteriaName={CriteriaName.Medication}
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
            open={toggleFilterInfoModal}
            color="secondary"
            readonly={isReadonlyFilterInfoModal}
            onClose={() => setToggleFilterInfoModal(false)}
            onSubmit={({
              filterName,
              searchInput,
              nda,
              prescriptionTypes,
              startDate,
              endDate,
              administrationRoutes,
              executiveUnits
            }) => {
              patchSavedFilter(
                filterName,
                {
                  searchInput,
                  orderBy: { orderBy: Order.PERIOD_START, orderDirection: Direction.DESC },
                  filters: { nda, prescriptionTypes, startDate, endDate, administrationRoutes, executiveUnits }
                },
                searchResults.deidentified ?? true
              )
            }}
            validationText="Sauvegarder"
          >
            <Grid container direction="column" gap="8px">
              <Grid item container direction="column">
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
              {!searchResults.deidentified && (
                <Grid item container direction="column" paddingBottom="8px">
                  <TextInput
                    name="searchInput"
                    label="Recherche textuelle :"
                    disabled={isReadonlyFilterInfoModal}
                    value={selectedSavedFilter?.filterParams.searchInput}
                  />
                </Grid>
              )}
              <Grid item>
                {!searchResults.deidentified && (
                  <NdaFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.NDA}
                    value={selectedSavedFilter?.filterParams.filters.nda || ''}
                  />
                )}
                {selectedTab.id === ResourceType.MEDICATION_REQUEST && (
                  <PrescriptionTypesFilter
                    value={selectedSavedFilter?.filterParams.filters.prescriptionTypes || []}
                    name={FilterKeys.PRESCRIPTION_TYPES}
                    allPrescriptionTypes={allPrescriptionTypes}
                    disabled={isReadonlyFilterInfoModal}
                  />
                )}
                {selectedTab.id === ResourceType.MEDICATION_ADMINISTRATION && (
                  <AdministrationTypesFilter
                    disabled={isReadonlyFilterInfoModal}
                    value={selectedSavedFilter?.filterParams.filters.administrationRoutes || []}
                    name={FilterKeys.ADMINISTRATION_ROUTES}
                    allAdministrationTypes={allAdministrationRoutes}
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
                  criteriaName={CriteriaName.Medication}
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
export default PatientMedication
