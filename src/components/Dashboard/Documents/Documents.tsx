import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Checkbox, CircularProgress, Grid, Typography } from '@mui/material'
import DataTableComposition from 'components/DataTable/DataTableComposition'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'
import { CohortComposition, CriteriaName, DocumentsData, LoadingStatus, DTTB_ResultsType as ResultsType } from 'types'
import services from 'services/aphp'
import { ActionTypes, FilterKeys, SearchByTypes, searchByListDocuments } from 'types/searchCriterias'
import allDocTypesList from 'assets/docTypes.json'
import useSearchCriterias, { initAllDocsSearchCriterias } from 'hooks/useSearchCriterias'
import { SearchInputError } from 'types/error'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter/DatesRangeFilter'
import DocTypesFilter from 'components/Filters/DocTypesFilter/DocTypesFilter'
import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter/ExecutiveUnitsFilter'
import NdaFilter from 'components/Filters/NdaFilter/NdaFilter'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Searchbar from 'components/ui/Searchbar/Searchbar'
import Select from 'components/ui/Searchbar/Select'
import Button from 'components/ui/Button/Button'
import Modal from 'components/ui/Modal/Modal'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import IppFilter from 'components/Filters/IppFilter/IppFilter'
import { selectFiltersAsArray } from 'utils/filters'
import Chip from 'components/ui/Chips/Chip'
import { AlertWrapper } from 'components/ui/Alert/styles'
import { _cancelPendingRequest } from 'utils/abortController'
import { BlockWrapper } from 'components/ui/Layout/styles'

type DocumentsProps = {
  groupId?: string
  deidentified: boolean
}

const Documents: React.FC<DocumentsProps> = ({ groupId, deidentified }) => {
  const [documentsResult, setDocumentsResult] = useState<ResultsType>({ nb: 0, total: 0, label: 'document(s)' })
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total: 0, label: 'patient(s)' })
  const [documents, setDocuments] = useState<CohortComposition[]>([])

  const [page, setPage] = useState(1)
  const [toggleModal, setToggleModal] = useState(false)
  const [searchInputError, setSearchInputError] = useState<SearchInputError | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [
    {
      orderBy,
      searchInput,
      searchBy,
      filters,
      filters: { nda, executiveUnits, onlyPdfAvailable, docTypes, startDate, endDate, ipp }
    },
    dispatchSearchCriteriasAction
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

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [onlyPdfAvailable, ipp, nda, docTypes, startDate, endDate, executiveUnits, orderBy, searchBy, searchInput])

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
      <BlockWrapper item xs={12} margin={'20px 0px'}>
        {deidentified ? (
          <AlertWrapper severity="info">
            Attention : Les données identifiantes des patients sont remplacées par des informations fictives dans les
            résultats de la recherche et dans les documents prévisualisés.
          </AlertWrapper>
        ) : (
          <AlertWrapper severity="info">
            Attention : La recherche textuelle est pseudonymisée (les données identifiantes des patients sont remplacées
            par des informations fictives). Vous retrouverez les données personnelles de votre patient en cliquant sur
            l'aperçu.
          </AlertWrapper>
        )}
      </BlockWrapper>

      <BlockWrapper item xs={12} margin={'20px 0px 10px 0px'}>
        <Searchbar>
          <Select
            selectedValue={searchBy || SearchByTypes.TEXT}
            label="Rechercher dans :"
            width={'170px'}
            items={searchByListDocuments}
            onchange={(newValue) =>
              dispatchSearchCriteriasAction({ type: ActionTypes.CHANGE_SEARCH_BY, payload: newValue })
            }
          />
          <SearchInput
            value={searchInput}
            placeholder={'Rechercher dans les documents'}
            displayHelpIcon
            error={searchInputError}
            onchange={(newValue) =>
              dispatchSearchCriteriasAction({ type: ActionTypes.CHANGE_SEARCH_INPUT, payload: newValue })
            }
          />
          <Button width={'150px'} icon={<FilterList height="15px" fill="#FFF" />} onClick={() => setToggleModal(true)}>
            Filtrer
          </Button>
        </Searchbar>
        <Grid item xs={12}>
          {filtersAsArray.map((filter, index) => (
            <Chip
              key={index}
              label={filter.label}
              onDelete={() => {
                dispatchSearchCriteriasAction({
                  type: ActionTypes.REMOVE_FILTER,
                  payload: { key: filter.category, value: filter.value }
                })
              }}
            />
          ))}
        </Grid>
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
                  dispatchSearchCriteriasAction({
                    type: ActionTypes.ADD_FILTERS,
                    payload: {
                      nda,
                      ipp,
                      executiveUnits,
                      docTypes,
                      startDate,
                      endDate,
                      onlyPdfAvailable: !onlyPdfAvailable
                    }
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
        searchMode={searchInput !== ''}
        groupId={groupId}
        documentsList={documents ?? []}
        orderBy={orderBy}
        setOrderBy={(orderBy) => dispatchSearchCriteriasAction({ type: ActionTypes.CHANGE_ORDER_BY, payload: orderBy })}
        page={page}
        setPage={(newPage: number) => setPage(newPage)}
        total={documentsResult.nb}
      />
      <Modal
        title="Filtrer par :"
        open={toggleModal}
        width={'600px'}
        onClose={() => setToggleModal(false)}
        onSubmit={(newFilters) => {
          dispatchSearchCriteriasAction({
            type: ActionTypes.ADD_FILTERS,
            payload: { ...filters, ...newFilters }
          })
        }}
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
    </Grid>
  )
}

export default Documents
