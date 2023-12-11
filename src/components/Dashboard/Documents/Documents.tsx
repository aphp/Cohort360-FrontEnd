import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Checkbox, CircularProgress, Grid, TextField, Tooltip, Typography } from '@mui/material'
import DataTableComposition from 'components/DataTable/DataTableComposition'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'
import {
  CohortComposition,
  CriteriaName,
  DocumentsData,
  LoadingStatus,
  DTTB_ResultsType as ResultsType,
  ScopeTreeRow
} from 'types'
import services from 'services/aphp'
import {
  AllDocumentsFilters,
  FilterKeys,
  Filters,
  FiltersTypes,
  SavedFilter,
  SavedFiltersResults,
  searchByListDocuments,
  SearchByTypes,
  SearchCriterias
} from 'types/searchCriterias'
import allDocTypesList from 'assets/docTypes.json'
import { ErrorType, SearchInputError } from 'types/error'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Searchbar from 'components/ui/Searchbar'
import Select from 'components/ui/Searchbar/Select'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import { selectFiltersAsArray } from 'utils/filters'
import Chip from 'components/ui/Chip'
import { cancelPendingRequest } from 'utils/abortController'
import { BlockWrapper } from 'components/ui/Layout'
import useSearchCriterias, { initAllDocsSearchCriterias } from 'reducers/searchCriteriasReducer'
import { AlertWrapper } from 'components/ui/Alert'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import DocTypesFilter from 'components/Filters/DocTypesFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import IppFilter from 'components/Filters/IppFilter'
import NdaFilter from 'components/Filters/NdaFilter'
import {
  deleteFiltersService,
  fetchPerimeterFromPerimeterId,
  getFiltersService,
  patchFiltersService,
  postFiltersService
} from 'services/aphp/servicePatients'
import { RessourceType } from 'types/requestCriterias'
import { Save, SavedSearch } from '@mui/icons-material'
import { mapStringToSearchCriteria } from 'mappers/filters'
import { useAppSelector } from 'state'
import { MeState } from 'state/me'
import FiltersList from 'components/Filters/FiltersList'
import FiltersNameFilter from 'components/Filters/FiltersNameFilter'

type DocumentsProps = {
  groupId?: string
  deidentified: boolean
}

type SavedFilterInfoModal = {
  filterUuid?: string
  filterName: string
  filterParams: SearchCriterias<AllDocumentsFilters>
}

const Documents: React.FC<DocumentsProps> = ({ groupId, deidentified }) => {
  const [toggleModal, setToggleModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [displaySaveFilters, setDisplaySaveFilters] = useState(false)

  const [documentsResult, setDocumentsResult] = useState<ResultsType>({ nb: 0, total: 0, label: 'document(s)' })
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total: 0, label: 'patient(s)' })
  const [documents, setDocuments] = useState<CohortComposition[]>([])

  const [page, setPage] = useState(1)
  const [searchInputError, setSearchInputError] = useState<SearchInputError | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)

  const [savedFilters, setSavedFilters] = useState<SavedFiltersResults | null>(null)
  const [savedFiltersErrors, setSavedFiltersErrors] = useState<ErrorType>({ isError: false })

  const [displayedSavedFilter, setDisplayedSavedFilter] = useState<SavedFilterInfoModal>()
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)

  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const maintenanceIsActive = meState?.maintenance?.active

  const [
    {
      orderBy,
      searchInput,
      searchBy,
      filters,
      filters: { nda, executiveUnits, onlyPdfAvailable, docTypes, startDate, endDate, ipp }
    },
    { changeOrderBy, changeSearchInput, changeSearchBy, addFilters, removeFilter }
  ] = useSearchCriterias(initAllDocsSearchCriterias)

  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ nda, executiveUnits, onlyPdfAvailable, docTypes, startDate, endDate, ipp })
  }, [nda, ipp, executiveUnits, onlyPdfAvailable, docTypes, startDate, endDate])

  const controllerRef = useRef<AbortController>(new AbortController())

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
            filters: { nda, executiveUnits, onlyPdfAvailable, docTypes, ipp, startDate, endDate }
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
      } else {
        setDocuments([])
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      console.error('Erreur lors de la récupération des documents', error)
      setDocuments([])
      setSearchInputError(error as SearchInputError)
      setLoadingStatus(LoadingStatus.SUCCESS)
    }
  }

  const applySelectedSavedFilter = async ({ savedFilters }: { savedFilters: SavedFilter }) => {
    const newFilter = mapStringToSearchCriteria(
      savedFilters.filter,
      FiltersTypes.ALL_DOCUMENTS
    ) as SearchCriterias<AllDocumentsFilters>
    changeSearchBy(newFilter.searchBy ?? SearchByTypes.TEXT)
    changeSearchInput(newFilter.searchInput)
    const mapExecutiveFilters = await Promise.all(
      newFilter.filters.executiveUnits.map(async (executiveUnit) => {
        const response = await fetchPerimeterFromPerimeterId(executiveUnit.id)
        return response
      })
    )
    addFilters({ ...newFilter.filters, executiveUnits: mapExecutiveFilters })
  }

  const displaySelectedFilterInfoModal = async (selectedItem: SavedFilter, isReadonly: boolean) => {
    const filterParamsToDisplay = mapStringToSearchCriteria(
      selectedItem.filter,
      FiltersTypes.ALL_DOCUMENTS
    ) as SearchCriterias<AllDocumentsFilters>

    const fetchedExecutiveUnits = await Promise.all<Promise<ScopeTreeRow>>(
      filterParamsToDisplay.filters.executiveUnits.map(async (executiveUnit) => {
        const response = await fetchPerimeterFromPerimeterId(executiveUnit.id)
        return response
      })
    )

    setDisplayedSavedFilter({
      filterUuid: selectedItem.uuid,
      filterName: selectedItem.name,
      filterParams: {
        ...filterParamsToDisplay,
        filters: { ...filterParamsToDisplay.filters, executiveUnits: fetchedExecutiveUnits }
      }
    })
    setToggleFilterInfoModal(true)
    setIsReadonlyFilterInfoModal(isReadonly)
  }

  const getSavedFilters = async (next?: string | null) => {
    try {
      const response = await getFiltersService(RessourceType.DOCUMENTS, next)
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
      await postFiltersService(RessourceType.DOCUMENTS, name, { searchBy, searchInput, filters, orderBy })
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
      RessourceType.DOCUMENTS,
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
  }, [nda, ipp, executiveUnits, onlyPdfAvailable, docTypes, startDate, endDate, searchBy, searchInput])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [nda, ipp, executiveUnits, onlyPdfAvailable, docTypes, startDate, endDate, orderBy, searchBy, searchInput])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      fetchDocumentsList()
    }
  }, [loadingStatus])

  return (
    <Grid container alignItems="center">
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

      <BlockWrapper item xs={12} margin="10px 0px 10px">
        <Searchbar wrap>
          <Grid container direction="column" gap="10px">
            <Grid container item alignItems="flex-start" justifyContent="flex-end" maxWidth="555px" gap="8px">
              <Grid item>
                <Button
                  width={'150px'}
                  icon={<FilterList height="15px" fill="#FFF" />}
                  onClick={() => setToggleModal(true)}
                >
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
            <Grid container item gap="8px">
              <Select
                selectedValue={searchBy || SearchByTypes.TEXT}
                label="Rechercher dans :"
                width={'170px'}
                items={searchByListDocuments}
                onchange={(newValue) => changeSearchBy(newValue)}
              />
              <SearchInput
                value={searchInput}
                placeholder={'Rechercher dans les documents'}
                displayHelpIcon
                error={searchInputError}
                onchange={(newValue) => changeSearchInput(newValue)}
              />
            </Grid>

            <Grid item xs={12}>
              {filtersAsArray.map((filter, index) => (
                <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
              ))}
            </Grid>
          </Grid>
        </Searchbar>
      </BlockWrapper>

      <BlockWrapper container justifyContent="space-between" alignItems="center" margin={'0px 0px 5px 0px'}>
        <Grid item xs={12} lg={6}>
          <Grid item xs={12}>
            {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && (
              <CircularProgress />
            )}
          </Grid>
          {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
            <Grid container item xs={12}>
              <DisplayDigits
                nb={documentsResult.nb}
                total={documentsResult.total}
                label={documentsResult.label ?? ''}
              />
              <span style={{ width: 15 }}></span>
              <DisplayDigits nb={patientsResult.nb} total={patientsResult.total} label={patientsResult.label ?? ''} />
            </Grid>
          )}
        </Grid>
        <Grid item xs={12} lg={6}>
          {!deidentified && (
            <Grid container alignItems="center" justifyContent="flex-end">
              <Checkbox
                checked={onlyPdfAvailable}
                onChange={() =>
                  addFilters({
                    nda,
                    ipp,
                    executiveUnits,
                    docTypes,
                    startDate,
                    endDate,
                    onlyPdfAvailable: !onlyPdfAvailable
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
        open={toggleModal}
        width={'600px'}
        onClose={() => setToggleModal(false)}
        onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
      >
        {!deidentified && <NdaFilter name={FilterKeys.NDA} value={nda} />}
        {!deidentified && <IppFilter name={FilterKeys.IPP} value={ipp} />}
        <DocTypesFilter allDocTypesList={allDocTypesList.docTypes} value={docTypes} name={FilterKeys.DOC_TYPES} />
        <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
        <ExecutiveUnitsFilter
          value={executiveUnits}
          name={FilterKeys.EXECUTIVE_UNITS}
          criteriaName={CriteriaName.Document}
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
            width={'560px'}
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
                    placeholder={isReadonlyFilterInfoModal ? 'Aucune recherche textuelle' : 'Votre recherche textuelle'}
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
                {!deidentified && (
                  <NdaFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.NDA}
                    value={displayedSavedFilter?.filterParams.filters.nda || ''}
                  />
                )}
                {!deidentified && (
                  <IppFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.IPP}
                    value={displayedSavedFilter?.filterParams.filters.ipp || ''}
                  />
                )}
                <DocTypesFilter
                  disabled={isReadonlyFilterInfoModal}
                  allDocTypesList={allDocTypesList.docTypes}
                  value={displayedSavedFilter?.filterParams.filters.docTypes || []}
                  name={FilterKeys.DOC_TYPES}
                />
                <DatesRangeFilter
                  disabled={isReadonlyFilterInfoModal}
                  values={[
                    displayedSavedFilter?.filterParams.filters.startDate,
                    displayedSavedFilter?.filterParams.filters.endDate
                  ]}
                  names={[FilterKeys.START_DATE, FilterKeys.END_DATE]}
                />
                <ExecutiveUnitsFilter
                  disabled={isReadonlyFilterInfoModal}
                  value={displayedSavedFilter?.filterParams.filters.executiveUnits || []}
                  name={FilterKeys.EXECUTIVE_UNITS}
                  criteriaName={CriteriaName.Document}
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

export default Documents
