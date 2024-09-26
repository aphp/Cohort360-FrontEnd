import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Checkbox, CircularProgress, Grid, Tooltip, Typography } from '@mui/material'
import DataTableComposition from 'components/DataTable/DataTableComposition'
import FilterList from 'assets/icones/filter.svg?react'
import { CohortComposition, DocumentsData, LoadingStatus, DTTB_ResultsType as ResultsType } from 'types'
import services from 'services/aphp'
import {
  DocumentsFilters,
  Direction,
  FilterKeys,
  Order,
  searchByListDocuments,
  SearchByTypes,
  FilterByDocumentStatus
} from 'types/searchCriterias'
import allDocTypesList from 'assets/docTypes.json'
import { SearchInputError } from 'types/error'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Searchbar from 'components/ui/Searchbar'
import Select from 'components/ui/Searchbar/Select'
import Button from 'components/ui/Button'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import { selectFiltersAsArray } from 'utils/filters'
import Chip from 'components/ui/Chip'
import { cancelPendingRequest } from 'utils/abortController'
import { BlockWrapper } from 'components/ui/Layout'
import useSearchCriterias, { initAllDocsSearchCriterias } from 'reducers/searchCriteriasReducer'
import { AlertWrapper } from 'components/ui/Alert'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import DocTypesFilter from 'components/Filters/DocTypesFilter'
import DocStatusFilter from 'components/Filters/DocStatusFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import IppFilter from 'components/Filters/IppFilter'
import NdaFilter from 'components/Filters/NdaFilter'
import { ResourceType } from 'types/requestCriterias'
import { Save, SavedSearch } from '@mui/icons-material'
import TextInput from 'components/Filters/TextInput'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import List from 'components/ui/List'
import { useAppDispatch, useAppSelector } from 'state'
import Modal from 'components/ui/Modal'
import EncounterStatusFilter from 'components/Filters/EncounterStatusFilter'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import { useSearchParams } from 'react-router-dom'
import { checkIfPageAvailable, handlePageError } from 'utils/paginationUtils'

type DocumentsProps = {
  groupId?: string
  deidentified: boolean
}

const Documents: React.FC<DocumentsProps> = ({ groupId, deidentified }) => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const getPageParam = searchParams.get('page')

  const [toggleFilterByModal, setToggleFilterByModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)

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

  const [documentsResult, setDocumentsResult] = useState<ResultsType>({ nb: 0, total: 0, label: 'document(s)' })
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total: 0, label: 'patient(s)' })
  const [documents, setDocuments] = useState<CohortComposition[]>([])

  const [page, setPage] = useState(getPageParam ? parseInt(getPageParam, 10) : 1)
  const [searchInputError, setSearchInputError] = useState<SearchInputError | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [encounterStatusList, setEncounterStatusList] = useState<Hierarchy<any, any>[]>([])

  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)

  const meState = useAppSelector((state) => state.me)
  const maintenanceIsActive = meState?.maintenance?.active

  const [
    {
      orderBy,
      searchInput,
      searchBy,
      filters,
      filters: {
        nda,
        executiveUnits,
        onlyPdfAvailable,
        docStatuses,
        docTypes,
        startDate,
        endDate,
        ipp,
        encounterStatus
      }
    },
    { changeOrderBy, changeSearchInput, changeSearchBy, addFilters, removeFilter, addSearchCriterias }
  ] = useSearchCriterias(initAllDocsSearchCriterias)

  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({
      nda,
      executiveUnits,
      onlyPdfAvailable,
      docStatuses,
      docTypes,
      startDate,
      endDate,
      ipp,
      encounterStatus
    })
  }, [nda, ipp, executiveUnits, onlyPdfAvailable, docStatuses, docTypes, startDate, endDate, encounterStatus])

  const controllerRef = useRef<AbortController>(new AbortController())
  const isFirstRender = useRef(true)

  const docStatusesList = [FilterByDocumentStatus.VALIDATED, FilterByDocumentStatus.NOT_VALIDATED]

  const fetchDocumentsList = async () => {
    try {
      setSearchInputError(null)
      setLoadingStatus(LoadingStatus.FETCHING)
      const result = await services.cohorts.fetchDocuments(
        {
          deidentified: !!deidentified,
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
              ipp,
              startDate,
              endDate,
              encounterStatus
            }
          }
        },
        groupId,
        controllerRef.current?.signal
      )
      if (result) {
        const { totalDocs, totalAllDocs, documentsList, totalPatientDocs, totalAllPatientDocs } =
          result as DocumentsData
        setDocumentsResult((prevState) => ({
          ...prevState,
          nb: totalDocs,
          total: totalAllDocs
        }))
        setPatientsResult((prevState) => ({
          ...prevState,
          nb: totalPatientDocs,
          total: totalAllPatientDocs
        }))
        setDocuments(documentsList)

        checkIfPageAvailable(totalDocs, page, setPage, dispatch)
      } else {
        setDocuments([])
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      console.error('Erreur lors de la récupération des documents', error)
      setDocuments([])
      setSearchInputError(error as SearchInputError)
      setLoadingStatus(LoadingStatus.SUCCESS)
      setDocumentsResult((prevState) => ({
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
  }

  useEffect(() => {
    const fetch = async () => {
      const encounterStatus = await services.cohortCreation.fetchEncounterStatus()
      setEncounterStatusList(encounterStatus)
    }
    fetch()
    getSavedFilters()
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      setLoadingStatus(LoadingStatus.IDDLE)
      setPage(1)
    }
  }, [
    nda,
    ipp,
    executiveUnits,
    onlyPdfAvailable,
    docStatuses,
    docTypes,
    startDate,
    endDate,
    orderBy,
    searchBy,
    searchInput,
    groupId,
    encounterStatus
  ])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setSearchParams({ page: page.toString() })

    handlePageError(page, setPage, dispatch)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      fetchDocumentsList()
    }
  }, [loadingStatus])

  return (
    <Grid container alignItems="center" gap="25px">
      <BlockWrapper item xs={12}>
        {deidentified ? (
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

      {!deidentified && (
        <Grid item xs={12}>
          <Grid item container justifyContent="flex-end" alignItems="center">
            <Checkbox
              checked={onlyPdfAvailable}
              onChange={() =>
                addFilters({
                  ...filters,
                  onlyPdfAvailable: !onlyPdfAvailable
                })
              }
            />
            <Typography style={{ color: '#000' }}>
              N'afficher que les documents dont les PDF sont disponibles
            </Typography>
          </Grid>
        </Grid>
      )}
      <Grid container justifyContent="flex-end" gap="10px">
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

      <BlockWrapper item xs={12}>
        <Searchbar>
          <Grid item xs={12} md={12} lg={5} xl={4} container alignItems="center" gap="inherit">
            {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && (
              <CircularProgress />
            )}
            {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
              <Grid item xs={12} container>
                <DisplayDigits
                  nb={documentsResult.nb}
                  total={documentsResult.total}
                  label={documentsResult.label ?? ''}
                />
                <span style={{ width: '25px' }} />
                <DisplayDigits nb={patientsResult.nb} total={patientsResult.total} label={patientsResult.label ?? ''} />
              </Grid>
            )}
          </Grid>
          <Grid container item xs={12} md={12} lg={7} xl={8} justifyContent="flex-end">
            <Select
              value={searchBy || SearchByTypes.TEXT}
              label="Rechercher dans :"
              width={'150px'}
              items={searchByListDocuments}
              onchange={(newValue) => changeSearchBy(newValue)}
            />
            <SearchInput
              value={searchInput}
              width={'70%'}
              placeholder={'Rechercher dans les documents'}
              displayHelpIcon
              error={searchInputError}
              onchange={(newValue) => changeSearchInput(newValue)}
            />
          </Grid>
        </Searchbar>
      </BlockWrapper>

      {filtersAsArray.length > 0 && (
        <Grid item xs={12}>
          {filtersAsArray.map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
          ))}
        </Grid>
      )}
      <DataTableComposition
        showIpp
        loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
        deidentified={deidentified}
        searchMode={searchInput !== '' && searchBy === SearchByTypes.TEXT}
        groupId={groupId}
        documentsList={documents ?? []}
        orderBy={orderBy}
        setOrderBy={(orderBy) => changeOrderBy(orderBy)}
        page={page}
        setPage={(newPage: number) => setPage(newPage)}
        total={documentsResult.nb}
      />
      <Modal
        title="Filtrer par :"
        open={toggleFilterByModal}
        onClose={() => setToggleFilterByModal(false)}
        onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
        color="secondary"
      >
        {!deidentified && <NdaFilter name={FilterKeys.NDA} value={nda} />}
        {!deidentified && <IppFilter name={FilterKeys.IPP} value={ipp || ''} />}
        <DocStatusFilter docStatusesList={docStatusesList} name={FilterKeys.DOC_STATUSES} value={docStatuses} />
        <DocTypesFilter allDocTypesList={allDocTypesList.docTypes} value={docTypes} name={FilterKeys.DOC_TYPES} />
        <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
        <ExecutiveUnitsFilter
          sourceType={SourceType.DOCUMENT}
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
        onClose={() => setToggleSavedFiltersModal(false)}
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
          onSelect={selectFilter}
          fetchPaginateData={() => getSavedFilters(allSavedFilters?.next)}
        >
          <Modal
            title={isReadonlyFilterInfoModal ? 'Informations sur le filtre' : 'Modifier le filtre'}
            open={toggleFilterInfoModal}
            color="secondary"
            readonly={isReadonlyFilterInfoModal}
            onClose={() => setToggleFilterInfoModal(false)}
            onSubmit={({
              searchBy,
              searchInput,
              nda,
              executiveUnits,
              ipp,
              docStatuses,
              docTypes,
              endDate,
              startDate,
              onlyPdfAvailable,
              filterName,
              encounterStatus
            }) => {
              patchSavedFilter(
                filterName,
                {
                  searchBy,
                  searchInput,
                  orderBy: { orderBy: Order.DATE, orderDirection: Direction.DESC },
                  filters: {
                    nda,
                    executiveUnits,
                    ipp,
                    docStatuses,
                    docTypes,
                    endDate,
                    startDate,
                    onlyPdfAvailable,
                    encounterStatus
                  }
                },
                deidentified ?? true
              )
            }}
            validationText="Sauvegarder"
          >
            <Grid container direction="column">
              <Grid item>
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

              <Grid item container direction="column" paddingBottom="16px">
                <Grid item>
                  <TextInput
                    name="searchInput"
                    label="Recherche textuelle :"
                    disabled={isReadonlyFilterInfoModal}
                    value={selectedSavedFilter?.filterParams.searchInput}
                  />
                </Grid>
                <Grid item>
                  <Select
                    label="Rechercher dans"
                    width="60%"
                    disabled={isReadonlyFilterInfoModal}
                    value={selectedSavedFilter?.filterParams.searchBy}
                    items={searchByListDocuments}
                    name="searchBy"
                  />
                </Grid>
              </Grid>

              <Grid item>
                {!deidentified && (
                  <NdaFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.NDA}
                    value={selectedSavedFilter?.filterParams.filters.nda || ''}
                  />
                )}
              </Grid>
              <Grid item>
                {!deidentified && (
                  <IppFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.IPP}
                    value={selectedSavedFilter?.filterParams.filters.ipp || ''}
                  />
                )}
              </Grid>
              <Grid item>
                <DocStatusFilter
                  disabled={isReadonlyFilterInfoModal}
                  docStatusesList={docStatusesList}
                  value={selectedSavedFilter?.filterParams.filters.docStatuses || []}
                  name={FilterKeys.DOC_STATUSES}
                />
              </Grid>
              <Grid item>
                <DocTypesFilter
                  disabled={isReadonlyFilterInfoModal}
                  allDocTypesList={allDocTypesList.docTypes}
                  value={selectedSavedFilter?.filterParams.filters.docTypes || []}
                  name={FilterKeys.DOC_TYPES}
                />
              </Grid>
              <Grid item>
                <DatesRangeFilter
                  disabled={isReadonlyFilterInfoModal}
                  values={[
                    selectedSavedFilter?.filterParams.filters.startDate,
                    selectedSavedFilter?.filterParams.filters.endDate
                  ]}
                  names={[FilterKeys.START_DATE, FilterKeys.END_DATE]}
                />
              </Grid>
              <Grid item>
                <ExecutiveUnitsFilter
                  sourceType={SourceType.DOCUMENT}
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.executiveUnits || []}
                  name={FilterKeys.EXECUTIVE_UNITS}
                />
              </Grid>
              <Grid item>
                <EncounterStatusFilter
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.encounterStatus || []}
                  name={FilterKeys.ENCOUNTER_STATUS}
                  encounterStatusList={encounterStatusList}
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

export default Documents
