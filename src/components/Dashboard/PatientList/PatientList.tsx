import React, { useState, useEffect, useRef, useMemo } from 'react'
import moment from 'moment'

import { CircularProgress, Grid, Tooltip } from '@mui/material'

import DataTablePatient from 'components/DataTable/DataTablePatient'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

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
import { substructAgeString } from 'utils/age'
import { cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import Searchbar from 'components/ui/Searchbar'
import Select from 'components/ui/Searchbar/Select'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import {
  Direction,
  DurationRangeType,
  FilterKeys,
  GenderStatus,
  Order,
  PatientsFilters,
  searchByListPatients,
  SearchByTypes,
  VitalStatus
} from 'types/searchCriterias'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import { BlockWrapper } from 'components/ui/Layout'
import DisplayLocked from 'components/ui/Display/DisplayLocked'
import useSearchCriterias, { initPatientsSearchCriterias } from 'reducers/searchCriteriasReducer'
import { selectFiltersAsArray } from 'utils/filters'
import Chip from 'components/ui/Chip'
import BirthdatesRangesFilter from 'components/Filters/BirthdatesRangesFilters'
import GendersFilter from 'components/Filters/GendersFilter'
import VitalStatusesFilter from 'components/Filters/VitalStatusesFilter'
import TextInput from 'components/Filters/TextInput'
import { useAppSelector } from 'state'
import { MeState } from 'state/me'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { RessourceType } from 'types/requestCriterias'
import ListFilter from 'components/Filters/ListFilter'

type PatientListProps = {
  total: number
  groupId?: string
  deidentified?: boolean | null
  loading?: boolean
}

const PatientList = ({ groupId, total, deidentified }: PatientListProps) => {
  const [toggleFiltersModal, setToggleFiltersModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [displaySaveFiltersButton, setDisplaySaveFiltersButton] = useState(false)
  const {
    allSavedFilters,
    savedFiltersErrors,
    selectedSavedFilter,
    methods: {
      getSavedFilters,
      postSavedFilter,
      deleteSavedFilters,
      patchSavedFilter,
      mapToSelectedFilter,
      selectFilter,
      resetSavedFilterError
    }
  } = useSavedFilters<PatientsFilters>(RessourceType.PATIENT)
  const [page, setPage] = useState(1)
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total, label: 'patient(s)' })
  const [patientsList, setPatientsList] = useState<CohortPatient[]>([])
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [agePyramid, setAgePyramid] = useState<AgeRepartitionType>([])
  const [patientData, setPatientData] = useState<{
    vitalStatusData?: SimpleChartDataType[]
    genderData?: SimpleChartDataType[]
  }>({})
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)

  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const maintenanceIsActive = meState?.maintenance?.active

  const [
    {
      orderBy,
      searchBy,
      searchInput,
      filters,
      filters: { genders, birthdatesRanges, vitalStatuses }
    },
    { changeOrderBy, changeSearchBy, changeSearchInput, addFilters, removeFilter }
  ] = useSearchCriterias(initPatientsSearchCriterias)

  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ genders, vitalStatuses, birthdatesRanges })
  }, [genders, vitalStatuses, birthdatesRanges])

  const controllerRef = useRef<AbortController | null>(null)

  const fetchPatients = async () => {
    try {
      const includeFacets = page === 1
      const birthdates: [string, string] = [
        moment(substructAgeString(birthdatesRanges?.[0] || '')).format('MM/DD/YYYY'),
        moment(substructAgeString(birthdatesRanges?.[1] || '')).format('MM/DD/YYYY')
      ]
      setLoadingStatus(LoadingStatus.FETCHING)
      const result = await services.cohorts.fetchPatientList(
        {
          page,
          searchCriterias: {
            orderBy,
            searchInput,
            searchBy,
            filters: { genders, vitalStatuses, birthdatesRanges: birthdates }
          }
        },
        deidentified ?? true,
        groupId,
        includeFacets,
        controllerRef.current?.signal
      )
      if (result) {
        const { totalPatients, originalPatients, genderRepartitionMap, agePyramidData } = result
        if (originalPatients) setPatientsList(originalPatients)
        if (includeFacets) {
          if (genderRepartitionMap) setPatientData(getGenderRepartitionSimpleData(genderRepartitionMap))
          if (agePyramidData) setAgePyramid(agePyramidData)
        }
        setPatientsResult((ps) => ({ ...ps, nb: totalPatients, label: 'patient(s)' }))
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    }
  }

  const applySelectedSavedFilter = () => {
    if (selectedSavedFilter) {
      changeSearchBy(selectedSavedFilter.filterParams.searchBy || SearchByTypes.TEXT)
      changeSearchInput(selectedSavedFilter.filterParams.searchInput)
      addFilters(selectedSavedFilter.filterParams.filters)
    }
  }

  const SaveFiltersButton = () => (
    <Button
      icon={<Save height="15px" fill="#FFF" />}
      onClick={() => setToggleSaveFiltersModal(true)}
      color="secondary"
      disabled={maintenanceIsActive}
    >
      Enregistrer filtres
    </Button>
  )

  useEffect(() => {
    getSavedFilters()
  }, [])

  useEffect(() => {
    if (filtersAsArray.length > 0 || searchInput) setDisplaySaveFiltersButton(true)
    else setDisplaySaveFiltersButton(false)
  }, [genders, vitalStatuses, birthdatesRanges, searchBy, searchInput])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [genders, vitalStatuses, birthdatesRanges, orderBy, searchBy, searchInput])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      fetchPatients()
    }
  }, [loadingStatus])

  return (
    <Grid container>
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
      <Grid container justifyContent="flex-end" margin={'20px 0px 10px 0px'}>
        <Grid item container justifyContent="flex-end" sx={{ gap: '8px' }}>
          <Grid item>
            <Button icon={<FilterList height="15px" fill="#FFF" />} onClick={() => setToggleFiltersModal(true)}>
              Filtrer
            </Button>
          </Grid>
          {!!allSavedFilters?.count && (
            <Grid item>
              <Button icon={<SavedSearch fill="#FFF" />} onClick={() => setToggleSavedFiltersModal(true)}>
                Filtres sauvegardés
              </Button>
            </Grid>
          )}
          {displaySaveFiltersButton && (
            <Grid item>
              {maintenanceIsActive ? (
                <Tooltip
                  title="Ce bouton est désactivé en raison de maintenance en cours."
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
        </Grid>
      </Grid>

      <BlockWrapper item xs={12} margin={'10px 0px 10px 0px'}>
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
          <Grid container item xs={12} lg={9} justifyContent="flex-end" style={{ maxWidth: 900 }}>
            {!deidentified && (
              <Select
                value={searchBy || SearchByTypes.TEXT}
                label="Rechercher dans :"
                width={'20%'}
                items={searchByListPatients}
                onchange={(newValue: SearchByTypes) => changeSearchBy(newValue)}
              />
            )}
            {deidentified ? (
              <DisplayLocked />
            ) : (
              <SearchInput
                value={searchInput}
                placeholder="Rechercher"
                width={'40%'}
                onchange={(newValue) => changeSearchInput(newValue)}
              />
            )}
          </Grid>
        </Searchbar>
      </BlockWrapper>

      <Grid item xs={12} container marginBottom={1}>
        {filtersAsArray
          .filter((filter) => filter.label)
          .map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
          ))}
      </Grid>
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
        title="Filtrer les patients"
        open={toggleFiltersModal}
        onClose={() => setToggleFiltersModal(false)}
        onSubmit={(newFilters) => addFilters({ genders, birthdatesRanges, vitalStatuses, ...newFilters })}
      >
        <GendersFilter name={FilterKeys.GENDERS} value={genders} />
        <VitalStatusesFilter name={FilterKeys.VITAL_STATUSES} value={vitalStatuses} />
        <BirthdatesRangesFilter
          name={FilterKeys.BIRTHDATES}
          value={birthdatesRanges}
          deidentified={deidentified || false}
        />
      </Modal>
      <Modal
        title="Filtres sauvegardés"
        open={toggleSavedFiltersModal}
        onClose={() => {
          setToggleSavedFiltersModal(false)
          resetSavedFilterError()
        }}
        onSubmit={applySelectedSavedFilter}
        validationText="Appliquer le filtre"
      >
        <ListFilter
          values={allSavedFilters?.results || []}
          count={allSavedFilters?.count || 0}
          onDelete={deleteSavedFilters}
          onDisplay={() => {
            setToggleFilterInfoModal(true)
            setIsReadonlyFilterInfoModal(true)
          }}
          onEdit={() => {
            setToggleFilterInfoModal(true)
            setIsReadonlyFilterInfoModal(false)
          }}
          onSelect={(filter) => selectFilter(mapToSelectedFilter(filter))}
          fetchPaginateData={() => getSavedFilters(allSavedFilters?.next)}
        >
          <Modal
            title={isReadonlyFilterInfoModal ? 'Informations' : 'Modifier le filtre'}
            open={toggleFilterInfoModal}
            readonly={isReadonlyFilterInfoModal}
            onClose={() => setToggleFilterInfoModal(false)}
            onSubmit={(newFilters) => {
              const name = newFilters.filterName
              const searchInput = newFilters.searchInput as string
              const searchBy = newFilters.searchBy as SearchByTypes
              const genders = newFilters.genders as GenderStatus[]
              const vitalStatuses = newFilters.vitalStatuses as VitalStatus[]
              const birthdatesRanges = newFilters.birthdatesRanges as DurationRangeType
              patchSavedFilter(name, {
                searchInput,
                searchBy,
                orderBy: { orderBy: Order.FAMILY, orderDirection: Direction.ASC },
                filters: { genders, vitalStatuses, birthdatesRanges }
              })
            }}
            validationText={isReadonlyFilterInfoModal ? 'Fermer' : 'Sauvegarder'}
          >
            <Grid container direction="column" sx={{ gap: '16px' }}>
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

              <Grid item container direction="column" sx={{ gap: '16px' }}>
                <Grid item container direction="column" sx={{ gap: '8px' }}>
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
              </Grid>
              <Grid item container direction="column" sx={{ gap: '8px' }}></Grid>
              <Grid item>
                <GendersFilter
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.GENDERS}
                  value={selectedSavedFilter?.filterParams.filters.genders || []}
                />
                <VitalStatusesFilter
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.VITAL_STATUSES}
                  value={selectedSavedFilter?.filterParams.filters.vitalStatuses || []}
                />
                <BirthdatesRangesFilter
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.BIRTHDATES}
                  value={selectedSavedFilter?.filterParams.filters.birthdatesRanges || [null, null]}
                  deidentified={deidentified || false}
                />
              </Grid>
            </Grid>
          </Modal>
        </ListFilter>
      </Modal>
      <Modal
        title="Sauvegarder les filtres"
        open={toggleSaveFiltersModal}
        onClose={() => {
          setToggleSaveFiltersModal(false)
          resetSavedFilterError()
        }}
        onSubmit={({ filtersName }) => postSavedFilter(filtersName, { searchBy, searchInput, filters, orderBy })}
      >
        <TextInput name="filtersName" error={savedFiltersErrors} label="Nom" minLimit={2} maxLimit={50} />
      </Modal>
    </Grid>
  )
}

export default PatientList
