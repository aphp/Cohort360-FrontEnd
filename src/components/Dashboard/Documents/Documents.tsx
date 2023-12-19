import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Checkbox, CircularProgress, Grid, Tooltip, Typography } from '@mui/material'
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
  Direction,
  FilterKeys,
  Order,
  SavedFilter,
  searchByListDocuments,
  SearchByTypes
} from 'types/searchCriterias'
import allDocTypesList from 'assets/docTypes.json'
import { SearchInputError } from 'types/error'
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
import { RessourceType } from 'types/requestCriterias'
import { Save, SavedSearch } from '@mui/icons-material'
import { useAppSelector } from 'state'
import { MeState } from 'state/me'
import ListFilter from 'components/Filters/ListFilter'
import TextInput from 'components/Filters/TextInput'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { fetchPerimeterFromPerimeterId } from 'services/aphp/servicePatients'

type DocumentsProps = {
  groupId?: string
  deidentified: boolean
}

const Documents: React.FC<DocumentsProps> = ({ groupId, deidentified }) => {
  const [toggleModal, setToggleModal] = useState(false)
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
      selectFilter,
      mapToSelectedFilter,
      resetSavedFilterError
    }
  } = useSavedFilters<AllDocumentsFilters>(RessourceType.DOCUMENTS)

  const [documentsResult, setDocumentsResult] = useState<ResultsType>({ nb: 0, total: 0, label: 'document(s)' })
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total: 0, label: 'patient(s)' })
  const [documents, setDocuments] = useState<CohortComposition[]>([])

  const [page, setPage] = useState(1)
  const [searchInputError, setSearchInputError] = useState<SearchInputError | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)

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

  const fetchExecutiveUnits = async (dataToMap: ScopeTreeRow[]) => {
    const updatedExecutiveUnits = await Promise.all<ScopeTreeRow>(
      dataToMap.map(async (unit) => {
        if (!unit.name) {
          try {
            const fetchedData = await fetchPerimeterFromPerimeterId(unit.id)
            return fetchedData
          } catch (error) {
            console.error('Erreur lors de la récupération des données', error)
            return unit
          }
        }
        return unit
      })
    )
    return updatedExecutiveUnits
  }

  const applySelectedSavedFilter = async () => {
    if (selectedSavedFilter) {
      changeSearchBy(selectedSavedFilter.filterParams.searchBy ?? SearchByTypes.TEXT)
      changeSearchInput(selectedSavedFilter.filterParams.searchInput)
      addFilters(selectedSavedFilter.filterParams.filters)
    }
  }

  const handleSelectFilter = async (savedFilter: SavedFilter) => {
    const selectedFilter = mapToSelectedFilter(savedFilter)
    const updatedExecutiveUnits = await fetchExecutiveUnits(selectedFilter.filterParams.filters.executiveUnits)
    selectedFilter.filterParams.filters.executiveUnits = updatedExecutiveUnits
    selectFilter(selectedFilter)
  }

  const SaveFiltersButton = () => (
    <Button
      icon={<Save height="15px" fill="#FFF" />}
      onClick={() => {
        setToggleSaveFiltersModal(true)
        resetSavedFilterError()
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
    if (filtersAsArray.length > 0 || searchInput) setDisplaySaveFiltersButton(true)
    else setDisplaySaveFiltersButton(false)
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
        <Searchbar wrapped>
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
            <Grid container item gap="8px">
              <Select
                value={searchBy || SearchByTypes.TEXT}
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
        <ListFilter
          name="savedFilters"
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
          onSelect={handleSelectFilter}
          fetchPaginateData={() => getSavedFilters(allSavedFilters?.next)}
        >
          <Modal
            title={isReadonlyFilterInfoModal ? 'Informations sur le filtre' : 'Modifier le filtre'}
            open={toggleFilterInfoModal}
            readonly={isReadonlyFilterInfoModal}
            width={'560px'}
            onClose={() => setToggleFilterInfoModal(false)}
            onSubmit={(newFilters) => {
              const name = newFilters.filterName
              const searchBy = newFilters.searchBy
              const searchInput = newFilters.searchInput as string
              const nda = newFilters.nda
              const ipp = newFilters.ipp
              const docTypes = newFilters.docTypes
              const startDate = newFilters.startDate
              const endDate = newFilters.endDate
              const executiveUnits = newFilters.executiveUnits
              patchSavedFilter(name, {
                searchBy,
                searchInput,
                orderBy: { orderBy: Order.FAMILY, orderDirection: Direction.ASC },
                filters: { nda, ipp, docTypes, onlyPdfAvailable, startDate, endDate, executiveUnits }
              })
            }}
            validationText={isReadonlyFilterInfoModal ? 'Fermer' : 'Sauvegarder'}
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
              <Grid item>
                <TextInput
                  name="searchInput"
                  label="Recherche textuelle :"
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.searchInput}
                />
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
                  disabled={isReadonlyFilterInfoModal}
                  value={selectedSavedFilter?.filterParams.filters.executiveUnits || []}
                  name={FilterKeys.EXECUTIVE_UNITS}
                  criteriaName={CriteriaName.Document}
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
        <TextInput name="filtersName" error={savedFiltersErrors} />
      </Modal>
    </Grid>
  )
}

export default Documents
