import React, { useState, useEffect, useRef, useMemo } from 'react'

import { CircularProgress, Grid } from '@mui/material'

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
import { cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import Searchbar from 'components/ui/Searchbar'
import Select from 'components/ui/Searchbar/Select'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import {
  Direction,
  FilterKeys,
  Order,
  PatientsFilters,
  searchByListPatients,
  SearchByTypes
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
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { RessourceType } from 'types/requestCriterias'
import List from 'components/ui/List'

type PatientListProps = {
  total: number
  groupId?: string
  deidentified?: boolean | null
  loading?: boolean
}

const PatientList = ({ groupId, total, deidentified }: PatientListProps) => {
  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
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

  const fetchPatients = async () => {
    try {
      const includeFacets = page === 1
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
        {(filtersAsArray.length > 0 || searchInput) && (
          <Grid item>
            <Button
              width="250px"
              icon={<Save height="15px" fill="#FFF" />}
              onClick={() => {
                setToggleSaveFiltersModal(true)
                resetSavedFilterError()
              }}
              color="secondary"
            >
              Enregistrer filtres
            </Button>
          </Grid>
        )}

        {!!allSavedFilters?.count && (
          <Grid item>
            <Button icon={<SavedSearch fill="#FFF" />} width={'170px'} onClick={() => setToggleSavedFiltersModal(true)}>
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
                  value={searchBy || SearchByTypes.TEXT}
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
            .map((filter, index) => (
              <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
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
        title="Filtrer les patients"
        open={toggleFilterByModal}
        onClose={() => setToggleFilterByModal(false)}
        onSubmit={(newFilters) => addFilters({ genders, birthdatesRanges, vitalStatuses, ...newFilters })}
      >
        <GendersFilter name={FilterKeys.GENDERS} value={genders} />
        <VitalStatusesFilter name={FilterKeys.VITAL_STATUSES} value={vitalStatuses} />
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
          onSelect={(filter) => selectFilter(filter)}
          fetchPaginateData={() => getSavedFilters(allSavedFilters?.next)}
        >
          <Modal
            title={isReadonlyFilterInfoModal ? 'Informations' : 'Modifier le filtre'}
            open={toggleFilterInfoModal}
            readonly={isReadonlyFilterInfoModal}
            onClose={() => setToggleFilterInfoModal(false)}
            onSubmit={(newFilters) => {
              const { name, searchInput, searchBy, genders, vitalStatuses, birthdatesRanges } = newFilters
              patchSavedFilter(
                name,
                {
                  searchInput,
                  searchBy,
                  orderBy: { orderBy: Order.FAMILY, orderDirection: Direction.ASC },
                  filters: { genders, vitalStatuses, birthdatesRanges }
                },
                deidentified ?? true
              )
            }}
            validationText={isReadonlyFilterInfoModal ? 'Fermer' : 'Sauvegarder'}
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
                  deidentified={deidentified ?? false}
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
          postSavedFilter(filtersName, { searchBy, searchInput, filters, orderBy }, deidentified ?? true)
        }
      >
        <TextInput name="filtersName" error={savedFiltersErrors} label="Nom" minLimit={2} maxLimit={50} />
      </Modal>
    </Grid>
  )
}

export default PatientList
