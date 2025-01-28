import React, { useState, useEffect, useRef, useMemo, useContext } from 'react'
import useSearchCriterias, { initImagingCriterias } from 'reducers/searchCriteriasReducer'
import services from 'services/aphp'
import { CircularProgress, Grid, Tooltip } from '@mui/material'
import { FilterList, Save, SavedSearch } from '@mui/icons-material'
import Button from 'components/ui/Button'
import Chip from 'components/ui/Chip'
import DataTableImaging from 'components/DataTable/DataTableImaging'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import Modal from 'components/ui/Modal'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { CohortImaging, LoadingStatus, DTTB_ResultsType as ResultsType } from 'types'
import { Direction, FilterKeys, ImagingFilters, LabelObject, Order } from 'types/searchCriterias'

import { cancelPendingRequest } from 'utils/abortController'
import { selectFiltersAsArray } from 'utils/filters'
import { CanceledError } from 'axios'
import { AlertWrapper } from 'components/ui/Alert'
import { ResourceType } from 'types/requestCriterias'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import TextInput from 'components/Filters/TextInput'
import List from 'components/ui/List'
import { useAppDispatch, useAppSelector } from 'state'
import { BlockWrapper } from 'components/ui/Layout'
import { SourceType } from 'types/scope'
import { AppConfig, getConfig } from 'config'
import { useSearchParams } from 'react-router-dom'
import { checkIfPageAvailable, cleanSearchParams, handlePageError } from 'utils/paginationUtils'
import { getCodeList } from 'services/aphp/serviceValueSets'
import MultiSelectInput from 'components/Filters/MultiSelectInput'

type ImagingListProps = {
  deidentified?: boolean
}

const ImagingList = ({ deidentified }: ImagingListProps) => {
  const appConfig = useContext(AppConfig)
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const getPageParam = searchParams.get('page')
  const groupId = searchParams.get('groupId') ?? undefined

  const [searchResults, setSearchResults] = useState<ResultsType>({ nb: 0, total: 0, label: 'résultats' })
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total: 0, label: 'patient(s)' })
  const [imagingList, setImagingList] = useState<CohortImaging[]>([])

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
  const [allModalities, setAllModalities] = useState<LabelObject[]>([])
  const [encounterStatusList, setEncounterStatusList] = useState<LabelObject[]>([])

  const [page, setPage] = useState(getPageParam ? parseInt(getPageParam, 10) : 1)
  const [
    {
      orderBy,
      searchInput,
      filters,
      filters: { ipp, nda, startDate, endDate, executiveUnits, modality, encounterStatus }
    },
    { changeOrderBy, changeSearchInput, addFilters, removeFilter, addSearchCriterias }
  ] = useSearchCriterias(initImagingCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ ipp, nda, startDate, endDate, executiveUnits, modality, encounterStatus })
  }, [ipp, nda, startDate, endDate, executiveUnits, modality, encounterStatus])
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
  } = useSavedFilters<ImagingFilters>(ResourceType.IMAGING)

  const controllerRef = useRef<AbortController | null>(null)
  const meState = useAppSelector((state) => state.me)
  const maintenanceIsActive = meState?.maintenance?.active
  const isFirstRender = useRef(true)

  const _fetchImaging = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)

      const response = await services.cohorts.fetchImagingList(
        {
          deidentified: !!deidentified,
          page,
          searchCriterias: {
            searchInput,
            orderBy,
            filters: {
              ipp,
              nda,
              startDate,
              endDate,
              executiveUnits,
              modality,
              encounterStatus
            }
          }
        },
        groupId,
        controllerRef.current?.signal
      )

      if (response) {
        const { total, totalAllResults, totalPatients, totalAllPatients, list } = response
        setImagingList(list)
        setSearchResults((prevState) => ({
          ...prevState,
          nb: total,
          total: totalAllResults
        }))

        checkIfPageAvailable(total, page, setPage, dispatch)

        setPatientsResult((prevState) => ({
          ...prevState,
          nb: totalPatients,
          total: totalAllPatients
        }))
      }

      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      console.error("Erreur lors de la récupération de la liste d'imagerie :", error)
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      } else {
        setImagingList([])
        setSearchResults((prevState) => ({
          ...prevState,
          nb: 0,
          total: 0
        }))
        setPatientsResult((prevState) => ({
          ...prevState,
          nb: 0,
          total: 0
        }))
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    }
  }

  useEffect(() => {
    const fetch = async () => {
      const [modalities, encounterStatus] = await Promise.all([
        getCodeList(getConfig().features.imaging.valueSets.imagingModalities.url, true),
        getCodeList(getConfig().core.valueSets.encounterStatus.url)
      ])
      setAllModalities(modalities.results)
      setEncounterStatusList(encounterStatus.results)
    }
    fetch()
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      setLoadingStatus(LoadingStatus.IDDLE)
      setPage(1)
    }
  }, [ipp, nda, startDate, endDate, orderBy, searchInput, executiveUnits, modality, groupId, encounterStatus])

  useEffect(() => {
    setSearchParams(cleanSearchParams({ page: page.toString(), groupId: groupId }))

    handlePageError(page, setPage, dispatch, setLoadingStatus)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchImaging()
    }
  }, [loadingStatus])

  return (
    <Grid container justifyContent="flex-end" gap="20px">
      <BlockWrapper item xs={12}>
        <AlertWrapper severity="warning">
          Seuls les examens présents dans le PACS Philips et rattachés à un Dossier Administratif (NDA) sont
          actuellement disponibles. Le flux alimentant les métadonnées associées aux séries et aux examens est suspendu
          depuis le 01/02/2023 suite à la migration du PACS AP-HP. Aucun examen produit après cette date n'est
          disponible via Cohort360.
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
      <Grid container alignItems="center" item xs={12}>
        <Grid container item xs={12} lg={5}>
          {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && <CircularProgress />}
          {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
            <Grid item xs={12} container>
              <DisplayDigits nb={searchResults.nb} total={searchResults.total} label={searchResults.label as string} />
              <span style={{ width: '25px' }} />
              <DisplayDigits nb={patientsResult.nb} total={patientsResult.total} label={patientsResult.label ?? ''} />
            </Grid>
          )}
        </Grid>

        <Grid container item xs={12} lg={7} justifyContent="flex-end">
          <SearchInput
            value={searchInput}
            placeholder={'Rechercher'}
            onchange={(newValue: string) => changeSearchInput(newValue)}
          />
        </Grid>
      </Grid>
      {filtersAsArray.length > 0 && (
        <Grid item xs={12} margin="0px 0px 10px">
          {filtersAsArray.map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
          ))}
        </Grid>
      )}

      <Grid item xs={12}>
        <DataTableImaging
          loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
          deidentified={!!deidentified}
          imagingList={imagingList}
          orderBy={orderBy}
          setOrderBy={(orderBy) => changeOrderBy(orderBy)}
          page={page}
          setPage={setPage}
          total={searchResults.nb}
          showIpp
        />
      </Grid>
      <Modal
        title="Filtrer par :"
        open={toggleFilterByModal}
        color="secondary"
        onClose={() => setToggleFilterByModal(false)}
        onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
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
        <MultiSelectInput value={modality} name={FilterKeys.MODALITY} options={allModalities} label="Modalités :" />
        <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
        <ExecutiveUnitsFilter
          sourceType={SourceType.IMAGING}
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
            readonly={isReadonlyFilterInfoModal}
            color="secondary"
            onClose={() => setToggleFilterInfoModal(false)}
            onSubmit={({
              filterName,
              searchInput,
              modality,
              nda,
              startDate,
              endDate,
              executiveUnits,
              encounterStatus
            }) => {
              patchSavedFilter(
                filterName,
                {
                  searchInput,
                  orderBy: {
                    orderBy: Order.STUDY_DATE,
                    orderDirection: Direction.DESC
                  },
                  filters: { modality, nda, startDate, endDate, executiveUnits, encounterStatus }
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
                </Grid>
              )}
              <Grid item>
                {!deidentified && (
                  <TextInput
                    name={FilterKeys.NDA}
                    disabled={isReadonlyFilterInfoModal}
                    value={selectedSavedFilter?.filterParams.filters.nda ?? ''}
                    label="NDA :"
                    placeholder="Exemple: 6601289264,141740347"
                  />
                )}
                <MultiSelectInput
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.modality || []}
                  name={FilterKeys.MODALITY}
                  options={allModalities}
                  label="Modalités :"
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
                  sourceType={SourceType.IMAGING}
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.executiveUnits || []}
                  name={FilterKeys.EXECUTIVE_UNITS}
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

export default ImagingList
