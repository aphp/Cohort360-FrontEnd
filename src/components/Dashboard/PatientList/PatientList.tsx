import React, { useState, useEffect, useRef, useMemo } from 'react'
import moment from 'moment'

import { CircularProgress, Grid, TextField, Tooltip, Typography } from '@mui/material'

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
  FilterKeys,
  Filters,
  FiltersTypes,
  PatientsFilters,
  SavedFilter,
  SavedFiltersResults,
  searchByListPatients,
  SearchByTypes,
  SearchCriterias
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
import FiltersNameFilter from 'components/Filters/FiltersNameFilter'
import {
  deleteFiltersService,
  getFiltersService,
  patchFiltersService,
  postFiltersService
} from 'services/aphp/servicePatients'
import { RessourceType } from 'types/requestCriterias'
import FiltersList from 'components/Filters/FiltersList'
import { useAppSelector } from 'state'
import { MeState } from 'state/me'
import { mapStringToSearchCriteria } from 'mappers/filters'
import { ErrorType } from 'types/error'

type PatientListProps = {
  total: number
  groupId?: string
  deidentified?: boolean | null
  loading?: boolean
}

type SavedFilterInfoModal = {
  filterUuid?: string
  filterName: string
  filterParams: SearchCriterias<PatientsFilters>
}

const PatientList = ({ groupId, total, deidentified }: PatientListProps) => {
  const [toggleFiltersModal, setToggleFiltersModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [displaySaveFilters, setDisplaySaveFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total, label: 'patient(s)' })
  const [patientsList, setPatientsList] = useState<CohortPatient[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFiltersResults | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [agePyramid, setAgePyramid] = useState<AgeRepartitionType>([])
  const [patientData, setPatientData] = useState<{
    vitalStatusData?: SimpleChartDataType[]
    genderData?: SimpleChartDataType[]
  }>({})

  const [savedFiltersErrors, setSavedFiltersErrors] = useState<ErrorType>({ isError: false })

  const [displayedSavedFilter, setDisplayedSavedFilter] = useState<SavedFilterInfoModal>()
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)

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

  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const maintenanceIsActive = meState?.maintenance?.active

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

  const applySelectedSavedFilter = ({ savedFilters }: { savedFilters: SavedFilter }) => {
    const newFilter = mapStringToSearchCriteria(
      savedFilters.filter,
      FiltersTypes.PATIENTS
    ) as SearchCriterias<PatientsFilters>
    changeSearchBy(newFilter.searchBy ?? SearchByTypes.TEXT)
    changeSearchInput(newFilter.searchInput)
    addFilters(newFilter.filters)
  }

  const displaySelectedFilterInfoModal = (selectedItem: SavedFilter, isReadonly: boolean) => {
    setDisplayedSavedFilter({
      filterUuid: selectedItem.uuid,
      filterName: selectedItem.name,
      filterParams: mapStringToSearchCriteria(
        selectedItem.filter,
        FiltersTypes.PATIENTS
      ) as SearchCriterias<PatientsFilters>
    })
    setToggleFilterInfoModal(true)
    setIsReadonlyFilterInfoModal(isReadonly)
  }

  const getSavedFilters = async (next?: string | null) => {
    try {
      const response = await getFiltersService(RessourceType.PATIENT, next)
      if (next) {
        setSavedFilters({
          ...response,
          results: [...(savedFilters?.results || []), ...response.results]
        } as SavedFiltersResults)
      } else {
        setSavedFilters(response)
      }
    } catch (err) {
      setSavedFilters(null)
    }
  }

  const postSavedFilter = async (name: string) => {
    try {
      await postFiltersService(RessourceType.PATIENT, name, { searchBy, searchInput, filters, orderBy })
      setSavedFiltersErrors({ isError: false })
      await getSavedFilters()
    } catch {
      setSavedFiltersErrors({ isError: true, errorMessage: 'Nom déjà existant.' })
      throw 'Nom déjà existant'
    }
  }

  const deleteSavedFilters = async (filtersUuids: string[]) => {
    await deleteFiltersService(filtersUuids)
    await getSavedFilters()
  }

  const patchSavedFilter = async (newFilterInfos: Filters): Promise<void> => {
    await patchFiltersService(
      RessourceType.PATIENT,
      displayedSavedFilter?.filterUuid || '',
      displayedSavedFilter?.filterName || '',
      {
        ...displayedSavedFilter?.filterParams,
        filters: newFilterInfos
      } as SearchCriterias<Filters>
    )
    await getSavedFilters()
  }

  const SaveFiltersButton = () => (
    <Button
      icon={<Save height="15px" fill="#FFF" />}
      onClick={() => {
        setToggleSaveFiltersModal(true)
        setSavedFiltersErrors({ isError: false })
      }}
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
    if (filtersAsArray.length > 0 || searchInput) setDisplaySaveFilters(true)
    else setDisplaySaveFilters(false)
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
          {!!savedFilters?.count && (
            <Grid item>
              <Button icon={<SavedSearch fill="#FFF" />} onClick={() => setToggleSavedFiltersModal(true)}>
                Filtres sauvegardés
              </Button>
            </Grid>
          )}
          {displaySaveFilters && (
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
                selectedValue={searchBy || SearchByTypes.TEXT}
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
        onClose={() => setToggleSavedFiltersModal(false)}
        onSubmit={applySelectedSavedFilter}
        validationText="Ouvrir"
      >
        <FiltersList
          name="savedFilters"
          values={savedFilters?.results || []}
          count={savedFilters?.count || 0}
          onDelete={deleteSavedFilters}
          onDisplay={displaySelectedFilterInfoModal}
          fetchPaginateData={() => getSavedFilters(savedFilters?.next)}
        >
          <Modal
            title={isReadonlyFilterInfoModal ? 'Informations sur le filtre' : 'Modifier le filtre'}
            open={toggleFilterInfoModal}
            readonly={isReadonlyFilterInfoModal}
            onClose={() => setToggleFilterInfoModal(false)}
            onSubmit={patchSavedFilter}
            validationText={isReadonlyFilterInfoModal ? 'Fermer' : 'Sauvegarder'}
          >
            <Grid container direction="column" sx={{ gap: '16px' }}>
              <Grid item container direction="column" sx={{ gap: '8px' }}>
                <Grid item>
                  <Typography variant="h3">Nom :</Typography>
                </Grid>
                <Grid item>
                  <TextField
                    size="small"
                    disabled={isReadonlyFilterInfoModal}
                    value={displayedSavedFilter?.filterName}
                    fullWidth
                    onChange={(e) =>
                      !isReadonlyFilterInfoModal &&
                      setDisplayedSavedFilter({
                        ...displayedSavedFilter,
                        filterName: e.target.value
                      } as SavedFilterInfoModal)
                    }
                  />
                </Grid>
              </Grid>
              <Grid item container direction="column" sx={{ gap: '8px' }}>
                <Grid item>
                  <Typography variant="h3">Recherche textuelle :</Typography>
                </Grid>
                <Grid item>
                  <TextField
                    size="small"
                    disabled={isReadonlyFilterInfoModal}
                    value={displayedSavedFilter?.filterParams.searchInput}
                    fullWidth
                    placeholder="Votre recherche textuelle"
                    onChange={(e) =>
                      !isReadonlyFilterInfoModal &&
                      setDisplayedSavedFilter({
                        ...displayedSavedFilter,
                        filterParams: { ...displayedSavedFilter?.filterParams, searchInput: e.target.value }
                      } as SavedFilterInfoModal)
                    }
                  />
                </Grid>
              </Grid>
              <Grid item>
                <GendersFilter
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.GENDERS}
                  value={displayedSavedFilter?.filterParams.filters.genders || []}
                />
                <VitalStatusesFilter
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.VITAL_STATUSES}
                  value={displayedSavedFilter?.filterParams.filters.vitalStatuses || []}
                />
                <BirthdatesRangesFilter
                  disabled={isReadonlyFilterInfoModal}
                  name={FilterKeys.BIRTHDATES}
                  value={displayedSavedFilter?.filterParams.filters.birthdatesRanges || [null, null]}
                  deidentified={deidentified || false}
                />
              </Grid>
            </Grid>
          </Modal>
        </FiltersList>
      </Modal>
      <Modal
        title="Sauvegarder les filtres"
        open={toggleSaveFiltersModal}
        onClose={() => setToggleSaveFiltersModal(false)}
        onSubmit={({ filtersName }) => postSavedFilter(filtersName)}
      >
        <FiltersNameFilter name="filtersName" error={savedFiltersErrors} />
      </Modal>
    </Grid>
  )
}

export default PatientList
