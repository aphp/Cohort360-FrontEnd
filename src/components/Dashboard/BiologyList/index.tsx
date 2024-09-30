import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAppSelector } from 'state'

import { Checkbox, Chip, CircularProgress, Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Save, SavedSearch, FilterList } from '@mui/icons-material'
import { AlertWrapper } from 'components/ui/Alert'
import { BlockWrapper } from 'components/ui/Layout'
import Button from 'components/ui/Button'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import EncounterStatusFilter from 'components/Filters/EncounterStatusFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import IppFilter from 'components/Filters/IppFilter'
import List from 'components/ui/List'
import Modal from 'components/ui/Modal'
import NdaFilter from 'components/Filters/NdaFilter'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import TextInput from 'components/Filters/TextInput'

import { ResourceType } from 'types/requestCriterias'
import { Hierarchy } from 'types/hierarchy'
import { DTTB_ResultsType as ResultsType, LoadingStatus, CohortObservation } from 'types'
import { BiologyFilters, Direction, FilterKeys, Order } from 'types/searchCriterias'
import { CanceledError } from 'axios'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import services from 'services/aphp'
import useSearchCriterias, { initBioSearchCriterias } from 'reducers/searchCriteriasReducer'
import { cancelPendingRequest } from 'utils/abortController'
import { selectFiltersAsArray } from 'utils/filters'
import DataTableObservation from 'components/DataTable/DataTableObservation'
import AnabioFilter from 'components/Filters/AnabioFilter'
import LoincFilter from 'components/Filters/LoincFilter'
import { SourceType } from 'types/scope'
import {
  fetchLoincCodes as fetchLoincCodesApi,
  fetchAnabioCodes as fetchAnabioCodesApi
} from 'services/aphp/serviceBiology'

type BiologyListProps = {
  groupId?: string
  deidentified?: boolean
}

const BiologyList = ({ groupId, deidentified }: BiologyListProps) => {
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.down('lg'))

  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
  const [encounterStatusList, setEncounterStatusList] = useState<Hierarchy<any, any>[]>([])

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
  } = useSavedFilters<BiologyFilters>(ResourceType.OBSERVATION)

  const [
    {
      orderBy,
      searchInput,
      filters,
      filters: { validatedStatus, nda, ipp, loinc, anabio, startDate, endDate, executiveUnits, encounterStatus }
    },
    { changeOrderBy, changeSearchInput, addFilters, removeFilter, addSearchCriterias }
  ] = useSearchCriterias(initBioSearchCriterias)
  const filtersAsArray = useMemo(
    () =>
      selectFiltersAsArray({
        validatedStatus,
        nda,
        ipp,
        loinc,
        anabio,
        startDate,
        endDate,
        executiveUnits,
        encounterStatus
      }),
    [validatedStatus, nda, ipp, loinc, anabio, startDate, endDate, executiveUnits, encounterStatus]
  )

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [searchResults, setSearchResults] = useState<ResultsType>({
    nb: 0,
    total: 0,
    label: 'résultat(s)'
  })
  const [biologyList, setBiologyList] = useState<CohortObservation[]>([])
  const [patientsResults, setPatientsResults] = useState<ResultsType>({ nb: 0, total: 0, label: 'patient(s)' })

  const controllerRef = useRef<AbortController | null>(null)
  const meState = useAppSelector((state) => state.me)
  const maintenanceIsActive = meState?.maintenance?.active

  const _fetchBiology = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await services.cohorts.fetchBiologyList(
        {
          deidentified: !!deidentified,
          page,
          searchCriterias: {
            orderBy,
            searchInput,
            filters: { validatedStatus, nda, ipp, loinc, anabio, startDate, endDate, executiveUnits, encounterStatus }
          }
        },
        groupId,
        controllerRef.current?.signal
      )

      if (response) {
        const { totalBiology, totalAllBiology, totalPatientBiology, totalAllPatientsBiology, biologyList } = response
        setSearchResults((prevState) => ({
          ...prevState,
          nb: totalBiology,
          total: totalAllBiology
        }))
        setBiologyList(biologyList)
        setPatientsResults((prevState) => ({
          ...prevState,
          nb: totalPatientBiology,
          total: totalAllPatientsBiology
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
          total: 0
        }))
        setBiologyList([])
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
        const encounterStatus = await services.cohortCreation.fetchEncounterStatus()
        setEncounterStatusList(encounterStatus)
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
    orderBy,
    validatedStatus,
    nda,
    ipp,
    loinc,
    anabio,
    startDate,
    endDate,
    executiveUnits,
    encounterStatus
  ])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchBiology()
    }
  }, [loadingStatus])

  return (
    <Grid container justifyContent="flex-end" gap="20px">
      <BlockWrapper item xs={12}>
        <AlertWrapper severity="warning">
          Les mesures de biologie sont pour l'instant restreintes aux 3870 codes ANABIO correspondants aux analyses les
          plus utilisées au niveau national et à l'AP-HP. De plus, les résultats concernent uniquement les analyses
          quantitatives enregistrées sur GLIMS, qui ont été validées et mises à jour depuis mars 2020.
        </AlertWrapper>
      </BlockWrapper>
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
        <Grid container item xs={12} md={allSavedFilters?.count ? 7 : 3} justifyContent="space-between">
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
      <Grid item xs={12} container alignItems="center" style={isMd ? { flexWrap: 'wrap-reverse', gap: '10px' } : {}}>
        <Grid container item xs={12} lg={4} alignItems="center" wrap="nowrap">
          <Checkbox checked={validatedStatus} disabled />
          <Typography style={{ color: '#505050' }}>
            N'afficher que les analyses dont les résultats ont été validés
          </Typography>
        </Grid>
        <Grid item xs={12} lg={4} container justifyContent={isMd ? 'left' : 'center'}>
          {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && <CircularProgress />}
          {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
            <Grid item xs={12} container>
              <DisplayDigits nb={searchResults.nb} total={searchResults.total} label={searchResults.label as string} />
              <span style={{ width: '25px' }} />
              <DisplayDigits
                nb={patientsResults.nb}
                total={patientsResults.total}
                label={patientsResults.label ?? ''}
              />
            </Grid>
          )}
        </Grid>
        <Grid item md={12} lg={4} container>
          <SearchInput
            width="100%"
            value={searchInput}
            placeholder="Rechercher"
            onchange={(newValue) => changeSearchInput(newValue)}
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
        <DataTableObservation
          loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
          deidentified={!!deidentified}
          observationsList={biologyList}
          orderBy={orderBy}
          setOrderBy={(orderBy) => changeOrderBy(orderBy)}
          page={page}
          setPage={(newPage) => setPage(newPage)}
          total={searchResults.nb}
          groupId={groupId}
          showIpp
        />
      </Grid>

      <Modal
        title="Filtrer par :"
        color="secondary"
        open={toggleFilterByModal}
        onClose={() => setToggleFilterByModal(false)}
        onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
      >
        {!deidentified && <NdaFilter name={FilterKeys.NDA} value={nda} />}
        {!deidentified && <IppFilter name={FilterKeys.IPP} value={ipp ?? ''} />}
        <AnabioFilter name={FilterKeys.ANABIO} value={anabio} onFetch={fetchAnabioCodesApi} />
        <LoincFilter name={FilterKeys.LOINC} value={loinc} onFetch={fetchLoincCodesApi} />
        <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
        <ExecutiveUnitsFilter
          sourceType={SourceType.BIOLOGY}
          value={executiveUnits}
          name={FilterKeys.EXECUTIVE_UNITS}
        />
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
              nda,
              ipp,
              anabio,
              loinc,
              startDate,
              endDate,
              validatedStatus,
              executiveUnits,
              encounterStatus
            }) => {
              patchSavedFilter(
                filterName,
                {
                  searchInput,
                  orderBy: { orderBy: Order.FAMILY, orderDirection: Direction.ASC },
                  filters: {
                    nda,
                    ipp,
                    anabio,
                    loinc,
                    startDate,
                    endDate,
                    validatedStatus,
                    executiveUnits,
                    encounterStatus
                  }
                },
                deidentified ?? true
              )
            }}
            validationText="Sauvegarder"
          >
            <Grid container gap="8px">
              <Grid item container>
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
                      name="nda"
                      disabled={isReadonlyFilterInfoModal}
                      value={selectedSavedFilter?.filterParams.filters.nda ?? ''}
                    />
                  </Grid>
                )}
                {!deidentified && (
                  <Grid item xs={12}>
                    <IppFilter
                      disabled={isReadonlyFilterInfoModal}
                      name={FilterKeys.IPP}
                      value={selectedSavedFilter?.filterParams.filters.ipp ?? ''}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <AnabioFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.ANABIO}
                    value={selectedSavedFilter?.filterParams.filters.anabio || []}
                    onFetch={fetchAnabioCodesApi}
                  />
                </Grid>
                <Grid item xs={12}>
                  <LoincFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.LOINC}
                    value={selectedSavedFilter?.filterParams.filters.loinc || []}
                    onFetch={fetchLoincCodesApi}
                  />
                </Grid>
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
                    sourceType={SourceType.BIOLOGY}
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

export default BiologyList
