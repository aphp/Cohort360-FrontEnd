import React, { useEffect, useState, useRef, useMemo } from 'react'

import { Checkbox, CircularProgress, Grid, Tooltip, Typography } from '@mui/material'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import DataTableComposition from 'components/DataTable/DataTableComposition'

import { CriteriaName, LoadingStatus } from 'types'

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
  SearchByTypes
} from 'types/searchCriterias'
import { PatientTypes } from 'types/patient'
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
import NdaFilter from 'components/Filters/NdaFilter'
import { RessourceType } from 'types/requestCriterias'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { Save, SavedSearch } from '@mui/icons-material'
import TextInput from 'components/ui/TextInput'
import List from 'components/ui/List'

const PatientDocs: React.FC<PatientTypes> = ({ groupId }) => {
  const dispatch = useAppDispatch()
  const [toggleFiltersModal, setToggleFiltersModal] = useState(false)
  const [toggleSaveFiltersModal, setToggleSaveFiltersModal] = useState(false)
  const [toggleSavedFiltersModal, setToggleSavedFiltersModal] = useState(false)
  const [toggleFilterInfoModal, setToggleFilterInfoModal] = useState(false)
  const [isReadonlyFilterInfoModal, setIsReadonlyFilterInfoModal] = useState(true)
  const patient = useAppSelector((state) => state.patient)
  const searchResults = {
    deidentified: patient?.deidentified || false,
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
  } = useSavedFilters<DocumentsFilters>(RessourceType.DOCUMENTS)

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [page, setPage] = useState(1)
  const [
    {
      orderBy,
      searchInput,
      searchBy,
      filters,
      filters: { nda, executiveUnits, onlyPdfAvailable, docTypes, startDate, endDate }
    },
    { changeOrderBy, changeSearchInput, changeSearchBy, addFilters, removeFilter, addSearchCriterias }
  ] = useSearchCriterias(initPatientDocsSearchCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ nda, executiveUnits, onlyPdfAvailable, docTypes, startDate, endDate })
  }, [nda, executiveUnits, onlyPdfAvailable, docTypes, startDate, endDate])

  const controllerRef = useRef<AbortController>(new AbortController())

  const meState = useAppSelector((state) => state.me)
  const maintenanceIsActive = meState?.maintenance?.active

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
              filters: { nda, executiveUnits, onlyPdfAvailable, docTypes, startDate, endDate }
            }
          },
          groupId,
          signal: controllerRef.current?.signal
        })
      )
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
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [onlyPdfAvailable, nda, docTypes, startDate, endDate, executiveUnits, orderBy, searchBy, searchInput])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      fetchDocumentsList()
    }
  }, [loadingStatus])

  const SaveFiltersButton = () => (
    <Button
      width="250px"
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
        {(filtersAsArray.length > 0 || searchInput) && (
          <Grid item>
            {maintenanceIsActive ? (
              <Tooltip
                title="Ce bouton est désactivé en raison d'une maintenance en cours."
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
            onClick={() => setToggleFiltersModal(true)}
          >
            Filtrer
          </Button>
        </Grid>
      </Grid>

      <BlockWrapper item xs={12}>
        <Searchbar>
          <Select
            value={searchBy || SearchByTypes.TEXT}
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
          {filtersAsArray.map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
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
        loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
        deidentified={patient?.deidentified || false}
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
        open={toggleFiltersModal}
        width={'600px'}
        onClose={() => setToggleFiltersModal(false)}
        onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
      >
        {!searchResults.deidentified && <NdaFilter name={FilterKeys.NDA} value={nda} />}
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
          onEdit={
            maintenanceIsActive
              ? undefined
              : () => {
                  setToggleFilterInfoModal(true)
                  setIsReadonlyFilterInfoModal(false)
                }
          }
          onSelect={(filter) => selectFilter(filter)}
          fetchPaginateData={() => getSavedFilters(allSavedFilters?.next)}
        >
          <Modal
            title={isReadonlyFilterInfoModal ? 'Informations' : 'Modifier le filtre'}
            open={toggleFilterInfoModal}
            readonly={isReadonlyFilterInfoModal}
            onClose={() => setToggleFilterInfoModal(false)}
            onSubmit={(newFilters) => {
              const {
                name,
                searchInput,
                searchBy,
                nda,
                executiveUnits,
                startDate,
                endDate,
                docTypes,
                onlyPdfAvailable
              } = newFilters
              patchSavedFilter(
                name,
                {
                  searchInput,
                  searchBy,
                  orderBy: { orderBy: Order.DATE, orderDirection: Direction.ASC },
                  filters: { nda, executiveUnits, startDate, endDate, docTypes, onlyPdfAvailable }
                },
                searchResults.deidentified ?? true
              )
            }}
            validationText={isReadonlyFilterInfoModal ? 'Fermer' : 'Sauvegarder'}
          >
            <Grid container direction="column" gap="8px">
              <Grid item container direction="column">
                <TextInput
                  name="name"
                  label="Nom :"
                  value={selectedSavedFilter?.filterName}
                  error={savedFiltersErrors}
                  disabled={isReadonlyFilterInfoModal}
                  minLimit={2}
                  maxLimit={50}
                />
              </Grid>
              {!searchResults.deidentified && (
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
              )}
              <Grid item>
                {!searchResults.deidentified && (
                  <NdaFilter
                    disabled={isReadonlyFilterInfoModal}
                    name={FilterKeys.NDA}
                    value={selectedSavedFilter?.filterParams.filters.nda || ''}
                  />
                )}
                <DocTypesFilter
                  disabled={isReadonlyFilterInfoModal}
                  allDocTypesList={allDocTypesList.docTypes}
                  value={selectedSavedFilter?.filterParams.filters.docTypes || []}
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
                  value={selectedSavedFilter?.filterParams.filters.executiveUnits || []}
                  name={FilterKeys.EXECUTIVE_UNITS}
                  criteriaName={CriteriaName.Document}
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
          postSavedFilter(filtersName, { searchBy, searchInput, filters, orderBy }, searchResults.deidentified ?? true)
        }
      >
        <TextInput name="filtersName" error={savedFiltersErrors} label="Nom" minLimit={2} maxLimit={50} />
      </Modal>
    </Grid>
  )
}

export default PatientDocs
