import React, { useEffect, useState, useRef, useMemo } from 'react'

import { Checkbox, CircularProgress, Grid, Typography } from '@mui/material'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import DataTableComposition from 'components/DataTable/DataTableComposition'

import { CriteriaName, LoadingStatus } from 'types'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchDocuments } from 'state/patient'

import allDocTypesList from 'assets/docTypes.json'

import { _cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import { FilterKeys, searchByListDocuments, SearchByTypes } from 'types/searchCriterias'
import { PatientTypes } from 'types/patient'
import Modal from 'components/ui/Modal'
import Button from 'components/ui/Button'
import NdaFilter from 'components/Filters/NdaFilter/NdaFilter'
import Searchbar from 'components/ui/Searchbar'
import { selectFiltersAsArray } from 'utils/filters'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Select from 'components/ui/Searchbar/Select'
import DocTypesFilter from 'components/Filters/DocTypesFilter/DocTypesFilter'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter/DatesRangeFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter/ExecutiveUnitsFilter'
import { AlertWrapper } from 'components/ui/Alert'
import { BlockWrapper } from 'components/ui/Layout'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import useSearchCriterias, { initPatientDocsSearchCriterias } from 'reducers/searchCriteriasReducer'
import Chip from 'components/ui/Chip'

const PatientDocs: React.FC<PatientTypes> = ({ groupId }) => {
  const dispatch = useAppDispatch()
  const [toggleModal, setToggleModal] = useState(false)
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))
  const searchResults = {
    deidentified: patient?.deidentified || false,
    totalDocs: patient?.documents?.count ?? 0,
    totalAllDoc: patient?.documents?.total ?? 0,
    patientDocumentsList: patient?.documents?.list ?? [],
    searchInputError: patient?.documents?.searchInputError ?? undefined,
    label: 'document(s)'
  }

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
    { changeOrderBy, changeSearchInput, changeSearchBy, addFilters, removeFilter }
  ] = useSearchCriterias(initPatientDocsSearchCriterias)
  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ nda, executiveUnits, onlyPdfAvailable, docTypes, startDate, endDate })
  }, [nda, executiveUnits, onlyPdfAvailable, docTypes, startDate, endDate])

  const controllerRef = useRef<AbortController>(new AbortController())

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
      controllerRef.current = _cancelPendingRequest(controllerRef.current)
      fetchDocumentsList()
    }
  }, [loadingStatus])

  return (
    <Grid container alignItems="center">
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

      <BlockWrapper item xs={12} margin={'20px 0px'}>
        <Searchbar>
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
            error={searchResults.searchInputError}
            onchange={(newValue) => changeSearchInput(newValue)}
          />
          <Button width={'150px'} icon={<FilterList height="15px" fill="#FFF" />} onClick={() => setToggleModal(true)}>
            Filtrer
          </Button>
        </Searchbar>
        <Grid item xs={12}>
          {filtersAsArray.map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
          ))}
        </Grid>
      </BlockWrapper>

      <BlockWrapper container justifyContent="space-between" alignItems="center" margin={'0px 0px 5px 0px'}>
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
        open={toggleModal}
        width={'600px'}
        onClose={() => setToggleModal(false)}
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
    </Grid>
  )
}

export default PatientDocs
