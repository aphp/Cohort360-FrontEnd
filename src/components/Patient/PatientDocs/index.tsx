import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Checkbox, CircularProgress, Grid, Tooltip, Typography } from '@mui/material'
import FilterList from 'assets/icones/filter.svg?react'
import DataTableComposition from 'components/DataTable/DataTableComposition'
import { LoadingStatus } from 'types'
import { useAppSelector, useAppDispatch } from 'state'
import { fetchDocuments } from 'state/patient'
import allDocTypesList from 'assets/docTypes.json'
import { cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import {
  Direction,
  FilterKeys,
  Order,
  DocumentsFilters,
  searchByListDocuments,
  SearchByTypes,
  FilterByDocumentStatus,
  LabelObject
} from 'types/searchCriterias'
import Modal from 'components/ui/Modal'
import Button from 'components/ui/Button'
import Searchbar from 'components/ui/Searchbar'
import { selectFiltersAsArray } from 'utils/filters'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Select from 'components/ui/Searchbar/Select'
import { AlertWrapper } from 'components/ui/Alert'
import { BlockWrapper } from 'components/ui/Layout'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import useSearchCriterias, { initPatientDocsSearchCriterias } from 'reducers/searchCriteriasReducer'
import Chip from 'components/ui/Chip'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import DocTypesFilter from 'components/Filters/DocTypesFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import { ResourceType } from 'types/requestCriterias'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { Save, SavedSearch } from '@mui/icons-material'
import TextInput from 'components/Filters/TextInput'
import List from 'components/ui/List'
import { SourceType } from 'types/scope'
import { useSearchParams } from 'react-router-dom'
import { checkIfPageAvailable, cleanSearchParams, handlePageError } from 'utils/paginationUtils'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { getConfig } from 'config'
import { v4 as uuidv4 } from 'uuid'
import MultiSelectInput from 'components/Filters/MultiSelectInput'

const PatientDocs = () => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const getPageParam = searchParams.get('page')
  const groupId = searchParams.get('groupId') ?? undefined
  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
  const [encounterStatusList, setEncounterStatusList] = useState<LabelObject[]>([])
  const patient = useAppSelector((state) => state.patient)
  const searchResults = {
    deidentified: patient?.deidentified ?? false,
    totalDocs: patient?.documents?.count ?? 0,
    totalAllDoc: patient?.documents?.total ?? 0,
    patientDocumentsList: patient?.documents?.list ?? [],
    searchInputError: patient?.documents?.searchInputError ?? undefined,
    label: 'document(s)'
  }

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
  } = useSavedFilters<DocumentsFilters>(ResourceType.DOCUMENTS)

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [page, setPage] = useState(getPageParam ? parseInt(getPageParam, 10) : 1)
  const [
    {
      orderBy,
      searchInput,
      searchBy,
      filters,
      filters: { nda, executiveUnits, onlyPdfAvailable, docStatuses, docTypes, startDate, endDate, encounterStatus }
    },
    { changeOrderBy, changeSearchInput, changeSearchBy, addFilters, removeFilter, addSearchCriterias }
  ] = useSearchCriterias(initPatientDocsSearchCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({
      nda,
      executiveUnits,
      onlyPdfAvailable,
      docStatuses,
      docTypes,
      startDate,
      endDate,
      encounterStatus
    })
  }, [nda, executiveUnits, onlyPdfAvailable, docStatuses, docTypes, startDate, endDate, encounterStatus])

  const controllerRef = useRef<AbortController>(new AbortController())
  const meState = useAppSelector((state) => state.me)
  const maintenanceIsActive = meState?.maintenance?.active
  const isFirstRender = useRef(true)

  const docStatusesList = [
    { id: FilterByDocumentStatus.VALIDATED, label: FilterByDocumentStatus.VALIDATED },
    { id: FilterByDocumentStatus.NOT_VALIDATED, label: FilterByDocumentStatus.NOT_VALIDATED }
  ]
  const fetchDocumentsList = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchDocuments({
          options: {
            page,
            searchCriterias: {
              orderBy,
              searchBy,
              searchInput,
              filters: {
                nda,
                executiveUnits,
                onlyPdfAvailable,
                docStatuses,
                docTypes,
                startDate,
                endDate,
                encounterStatus
              }
            }
          },
          groupId,
          signal: controllerRef.current?.signal
        })
      )
      if (response) {
        checkIfPageAvailable(searchResults.totalDocs, page, setPage, dispatch)
      }
      if (response.payload.error) {
        throw response.payload.error
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      }
    }
  }

  useEffect(() => {
    const fetch = async () => {
      const encounterStatus = await getCodeList(getConfig().core.valueSets.encounterStatus.url)
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
  }, [
    onlyPdfAvailable,
    nda,
    docStatuses,
    docTypes,
    startDate,
    endDate,
    executiveUnits,
    orderBy,
    searchBy,
    searchInput,
    encounterStatus
  ])

  useEffect(() => {
    setSearchParams(cleanSearchParams({ page: page.toString(), groupId: groupId }))

    handlePageError(page, setPage, dispatch, setLoadingStatus)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      fetchDocumentsList()
    }
  }, [loadingStatus])

  return (
    <Grid container alignItems="center" gap="20px">
      <BlockWrapper item xs={12}>
        {searchResults.deidentified ? (
          <AlertWrapper severity="warning">
            Attention : Les données identifiantes des patients sont remplacées par des informations fictives dans les
            résultats de la recherche et dans les documents prévisualisés.
          </AlertWrapper>
        ) : (
          <AlertWrapper severity="warning">
            Attention : La recherche textuelle est pseudonymisée (les données identifiantes des patients sont remplacées
            par des informations fictives). Vous retrouverez les données personnelles de votre patient en cliquant sur
            l'aperçu.
          </AlertWrapper>
        )}
      </BlockWrapper>
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
          <Select
            value={searchBy ?? SearchByTypes.TEXT}
            label="Rechercher dans :"
            width={'190px'}
            items={searchByListDocuments}
            onchange={(newValue) => changeSearchBy(newValue)}
          />
          <SearchInput
            value={searchInput}
            placeholder={'Rechercher dans les documents'}
            displayHelpIcon
            error={searchResults.searchInputError}
            onchange={(newValue) => changeSearchInput(newValue)}
          />
        </Searchbar>
      </BlockWrapper>
      {filtersAsArray.length > 0 && (
        <Grid item xs={12}>
          {filtersAsArray.map((filter) => (
            <Chip key={uuidv4()} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
          ))}
        </Grid>
      )}

      <BlockWrapper container justifyContent="space-between" alignItems="center">
        <Grid item xs={12} md={3}>
          {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && <CircularProgress />}
          {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
            <DisplayDigits nb={searchResults.totalDocs} total={searchResults.totalAllDoc} label={searchResults.label} />
          )}
        </Grid>
        <Grid item xs={12} lg={6}>
          {!searchResults.deidentified && (
            <Grid container alignItems="center" justifyContent="flex-end">
              <Checkbox
                checked={onlyPdfAvailable}
                onChange={() =>
                  addFilters({
                    nda,
                    executiveUnits,
                    docStatuses,
                    docTypes,
                    startDate,
                    endDate,
                    onlyPdfAvailable: !onlyPdfAvailable,
                    encounterStatus
                  })
                }
              />
              <Typography style={{ color: '#000' }}>
                N'afficher que les documents dont les PDF sont disponibles
              </Typography>
            </Grid>
          )}
        </Grid>
      </BlockWrapper>
      <DataTableComposition
        loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
        deidentified={patient?.deidentified ?? false}
        searchMode={!!searchInput && searchBy === SearchByTypes.TEXT}
        groupId={groupId}
        documentsList={searchResults.patientDocumentsList}
        orderBy={orderBy}
        setOrderBy={(orderBy) => changeOrderBy(orderBy)}
        page={page}
        setPage={(newPage: number) => setPage(newPage)}
        total={searchResults.totalDocs}
      />

      <Modal
        title="Filtrer par :"
        open={toggleFilterByModal}
        color="secondary"
        onClose={() => setToggleFilterByModal(false)}
        onSubmit={(newFilters) => {
          addFilters({ ...filters, ...newFilters })
        }}
      >
        {!searchResults.deidentified && (
          <TextInput name={FilterKeys.NDA} value={nda} label="NDA :" placeholder="Exemple: 6601289264,141740347" />
        )}
        <MultiSelectInput
          options={docStatusesList}
          label="Statut de documents :"
          name={FilterKeys.DOC_STATUSES}
          value={docStatuses}
        />
        <DocTypesFilter allDocTypesList={allDocTypesList.docTypes} value={docTypes} name={FilterKeys.DOC_TYPES} />
        <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
        <ExecutiveUnitsFilter
          sourceType={SourceType.DOCUMENT}
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
              searchBy,
              nda,
              executiveUnits,
              startDate,
              endDate,
              docTypes,
              docStatuses,
              onlyPdfAvailable,
              encounterStatus
            }) => {
              patchSavedFilter(
                filterName,
                {
                  searchInput,
                  searchBy,
                  orderBy: { orderBy: Order.DATE, orderDirection: Direction.ASC },
                  filters: {
                    nda,
                    executiveUnits,
                    startDate,
                    endDate,
                    docStatuses,
                    docTypes,
                    onlyPdfAvailable,
                    encounterStatus
                  }
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
                  items={searchByListDocuments}
                  name="searchBy"
                />
              </Grid>

              <Grid item>
                {!searchResults.deidentified && (
                  <TextInput
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.NDA}
                    value={selectedSavedFilter?.filterParams.filters.nda ?? ''}
                    label="NDA :"
                    placeholder="Exemple: 6601289264,141740347"
                  />
                )}
                <MultiSelectInput
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.docStatuses ?? []}
                  options={docStatusesList}
                  label="Statut de documents :"
                  name={FilterKeys.DOC_STATUSES}
                />
                <DocTypesFilter
                  disabled={isReadonlyFilterInfoModal}
                  allDocTypesList={allDocTypesList.docTypes}
                  value={selectedSavedFilter?.filterParams.filters.docTypes ?? []}
                  name={FilterKeys.DOC_TYPES}
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
                  disabled={isReadonlyFilterInfoModal}
                  sourceType={SourceType.DOCUMENT}
                  value={selectedSavedFilter?.filterParams.filters.executiveUnits ?? []}
                  name={FilterKeys.EXECUTIVE_UNITS}
                />
                <MultiSelectInput
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.encounterStatus ?? []}
                  name={FilterKeys.ENCOUNTER_STATUS}
                  options={encounterStatusList}
                  label="Statut de la visite associée :"
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
          postSavedFilter(filtersName, { searchBy, searchInput, filters, orderBy }, searchResults.deidentified ?? true)
        }
      >
        <TextInput name="filtersName" error={savedFiltersErrors} label="Nom" minLimit={2} maxLimit={50} />
      </Modal>
    </Grid>
  )
}

export default PatientDocs
