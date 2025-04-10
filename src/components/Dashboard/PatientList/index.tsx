import React, { useState, useEffect, useRef, useMemo } from 'react'
import { CircularProgress, Grid, Tooltip } from '@mui/material'
import DataTablePatient from 'components/DataTable/DataTablePatient'
import FilterList from 'assets/icones/filter.svg?react'
import PatientCharts from './components/PatientCharts'
import services from 'services/aphp'
import {
  AgeRepartitionType,
  CohortPatient,
  SimpleChartDataType,
  DTTB_ResultsType as ResultsType,
  LoadingStatus
} from 'types'

import { getGenderRepartitionSimpleData } from 'utils/graphUtils'
import { Save, SavedSearch } from '@mui/icons-material'
import { cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import Searchbar from 'components/ui/Searchbar'
import Select from 'components/ui/Searchbar/Select'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import {
  Direction,
  FilterKeys,
  genderOptions,
  Order,
  PatientsFilters,
  searchByListPatients,
  SearchByTypes,
  vitalStatusesOptions
} from 'types/searchCriterias'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import { BlockWrapper } from 'components/ui/Layout'
import DisplayLocked from 'components/ui/Display/DisplayLocked'
import useSearchCriterias, { initPatientsSearchCriterias } from 'reducers/searchCriteriasReducer'
import { selectFiltersAsArray } from 'utils/filters'
import Chip from 'components/ui/Chip'
import BirthdatesRangesFilter from 'components/Filters/BirthdatesRangesFilters'
import CheckboxsFilter from 'components/Filters/CheckboxsFilter'
import TextInput from 'components/Filters/TextInput'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { ResourceType } from 'types/requestCriterias'
import { useAppDispatch, useAppSelector } from 'state'
import { useSearchParams } from 'react-router-dom'
import { checkIfPageAvailable, handlePageError, cleanSearchParams } from 'utils/paginationUtils'
import List from 'components/ui/List'
import { v4 as uuidv4 } from 'uuid'

type PatientListProps = {
  total: number
  deidentified?: boolean | null
}

const PatientList = ({ total, deidentified }: PatientListProps) => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const getPageParam = searchParams.get('page')
  const groupId = searchParams.get('groupId') ?? undefined

  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
  const {
    allSavedFiltersAsListItems,
    allSavedFilters,
    savedFiltersErrors,
    selectedSavedFilter,
    methods: {
      getSavedFilters,
      postSavedFilter,
      deleteSavedFilters,
      patchSavedFilter,
      selectFilter,
      resetSavedFilterError
    }
  } = useSavedFilters<PatientsFilters>(ResourceType.PATIENT)
  const [page, setPage] = useState(getPageParam ? parseInt(getPageParam, 10) : 1)
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total, label: 'patient(s)' })
  const [patientsList, setPatientsList] = useState<CohortPatient[]>([])
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [agePyramid, setAgePyramid] = useState<AgeRepartitionType>([])
  const [patientData, setPatientData] = useState<{
    vitalStatusData?: SimpleChartDataType[]
    genderData?: SimpleChartDataType[]
  }>({})

  const [
    {
      orderBy,
      searchBy,
      searchInput,
      filters,
      filters: { genders, birthdatesRanges, vitalStatuses }
    },
    { changeOrderBy, changeSearchBy, changeSearchInput, addFilters, removeFilter, addSearchCriterias }
  ] = useSearchCriterias(initPatientsSearchCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ genders, vitalStatuses, birthdatesRanges })
  }, [genders, vitalStatuses, birthdatesRanges])

  const controllerRef = useRef<AbortController | null>(null)
  const meState = useAppSelector((state) => state.me)
  const maintenanceIsActive = meState?.maintenance?.active
  const isFirstRender = useRef(true)

  const fetchPatients = async () => {
    try {
      const includeFacets = isFirstRender.current || page === 1
      if (isFirstRender.current) {
        isFirstRender.current = false
      }
      setLoadingStatus(LoadingStatus.FETCHING)
      const result = await services.cohorts.fetchPatientList(
        {
          page,
          searchCriterias: {
            orderBy,
            searchInput,
            searchBy,
            filters: { genders, vitalStatuses, birthdatesRanges }
          }
        },
        deidentified ?? true,
        groupId,
        includeFacets,
        controllerRef.current?.signal
      )
      if (result) {
        const { totalPatients, totalAllPatients, originalPatients, genderRepartitionMap, agePyramidData } = result
        if (originalPatients) setPatientsList(originalPatients)
        if (includeFacets) {
          if (genderRepartitionMap) setPatientData(getGenderRepartitionSimpleData(genderRepartitionMap))
          if (agePyramidData) setAgePyramid(agePyramidData)
        }
        setPatientsResult((ps) => ({ ...ps, nb: totalPatients, total: totalAllPatients, label: 'patient(s)' }))
        checkIfPageAvailable(totalPatients, page, setPage, dispatch)
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    }
  }

  useEffect(() => {
    getSavedFilters()
  }, [])

  useEffect(() => {
    if (!isFirstRender.current) {
      setLoadingStatus(LoadingStatus.IDDLE)
      setPage(1)
    }
  }, [genders, vitalStatuses, birthdatesRanges, orderBy, searchBy, searchInput, groupId])

  useEffect(() => {
    setSearchParams(cleanSearchParams({ page: page.toString(), groupId: groupId }))
    handlePageError(page, setPage, dispatch, setLoadingStatus)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      fetchPatients()
    }
  }, [loadingStatus])

  return (
    <Grid container gap="25px">
      <Grid item xs={12}>
        <PatientCharts
          agePyramid={
            loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE ? [] : agePyramid
          }
          patientData={
            loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE ? {} : patientData
          }
          loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
        />
      </Grid>
      <Grid container justifyContent="flex-end" gap="10px">
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

      <BlockWrapper item xs={12}>
        <Searchbar>
          <Grid item xs={12} lg={3}>
            {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && (
              <CircularProgress />
            )}
            {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
              <DisplayDigits
                nb={patientsResult.nb}
                total={patientsResult.total}
                label={patientsResult.label as string}
              />
            )}
          </Grid>
          <Grid item xs={12} lg={9} container>
            {!deidentified && (
              <>
                <Select
                  value={searchBy ?? SearchByTypes.TEXT}
                  label="Rechercher dans :"
                  width={'150px'}
                  items={searchByListPatients}
                  onchange={(newValue: SearchByTypes) => changeSearchBy(newValue)}
                />
                <SearchInput
                  value={searchInput}
                  placeholder="Rechercher"
                  width={'70%'}
                  onchange={(newValue) => changeSearchInput(newValue)}
                />
              </>
            )}
            {deidentified && (
              <Grid container justifyContent="flex-end">
                <DisplayLocked />
              </Grid>
            )}
          </Grid>
        </Searchbar>
      </BlockWrapper>

      {filtersAsArray?.length > 0 && (
        <Grid item xs={12} container>
          {filtersAsArray
            .filter((filter) => filter.label)
            .map((filter) => (
              <Chip key={uuidv4()} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
            ))}
        </Grid>
      )}
      <Grid item xs={12}>
        <DataTablePatient
          loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
          groupId={groupId}
          deidentified={deidentified ?? false}
          patientsList={patientsList ?? []}
          orderBy={orderBy}
          setOrderBy={(orderBy) => changeOrderBy(orderBy)}
          page={page}
          setPage={(newPage) => setPage(newPage)}
          total={patientsResult.nb}
        />
      </Grid>

      <Modal
        title="Filtrer par :"
        open={toggleFilterByModal}
        color="secondary"
        onClose={() => setToggleFilterByModal(false)}
        onSubmit={(newFilters) => addFilters({ genders, birthdatesRanges, vitalStatuses, ...newFilters })}
      >
        <CheckboxsFilter
          name={FilterKeys.GENDERS}
          value={genders}
          label="Genre :"
          options={genderOptions}
          //onChange={(value) => searchCriteriaForm.changeInput(FilterKeys.GENDERS, value)}
        />
        <CheckboxsFilter
          name={FilterKeys.VITAL_STATUSES}
          value={vitalStatuses}
          label="Statut vital :"
          options={vitalStatusesOptions}
          //onChange={(value) => searchCriteriaForm.changeInput(FilterKeys.VITAL_STATUSES, value)}
        />
        <BirthdatesRangesFilter
          name={FilterKeys.BIRTHDATES}
          value={birthdatesRanges}
          deidentified={deidentified ?? false}
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
            onSubmit={({ filterName, searchInput, searchBy, genders, vitalStatuses, birthdatesRanges }) => {
              patchSavedFilter(
                filterName,
                {
                  searchInput,
                  searchBy,
                  orderBy: { orderBy: Order.FAMILY, orderDirection: Direction.ASC },
                  filters: { genders, vitalStatuses, birthdatesRanges }
                },
                deidentified ?? true
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
              {!deidentified && (
                <Grid item container direction="column" paddingBottom="8px">
                  <TextInput
                    name="searchInput"
                    label="Recherche textuelle :"
                    disabled={isReadonlyFilterInfoModal}
                    value={selectedSavedFilter?.filterParams.searchInput}
                  />
                  <Select
                    label="Rechercher dans"
                    width="60%"
                    disabled={isReadonlyFilterInfoModal}
                    value={selectedSavedFilter?.filterParams.searchBy}
                    items={searchByListPatients}
                    name="searchBy"
                  />
                </Grid>
              )}
              <Grid item>
                <CheckboxsFilter
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.GENDERS}
                  value={selectedSavedFilter?.filterParams.filters.genders ?? []}
                  label="Genre :"
                  options={genderOptions}
                />
                <CheckboxsFilter
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.VITAL_STATUSES}
                  value={selectedSavedFilter?.filterParams.filters.vitalStatuses ?? []}
                  label="Statut vital :"
                  options={vitalStatusesOptions}
                />
                <BirthdatesRangesFilter
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.BIRTHDATES}
                  value={selectedSavedFilter?.filterParams.filters.birthdatesRanges ?? [null, null]}
                  deidentified={deidentified ?? false}
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
          postSavedFilter(filtersName, { searchBy, searchInput, filters, orderBy }, deidentified ?? true)
        }
      >
        <TextInput name="filtersName" error={savedFiltersErrors} label="Nom" minLimit={2} maxLimit={50} />
      </Modal>
    </Grid>
  )
}

export default PatientList
