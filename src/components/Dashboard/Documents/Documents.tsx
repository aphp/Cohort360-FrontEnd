import React, { useState, useEffect } from 'react'

import { CssBaseline, Grid } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

import ModalDocumentFilters from 'components/Filters/DocumentFilters/DocumentFilters'
import DataTableComposition from 'components/DataTable/DataTableComposition'
import DataTableTopBar from 'components/DataTable/DataTableTopBar'
import MasterChips from 'components/MasterChips/MasterChips'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import { CohortComposition, DocumentFilters, Order, DTTB_ResultsType as ResultsType } from 'types'

import services from 'services'

import { buildDocumentFiltersChips } from 'utils/chips'

import { docTypes } from 'assets/docTypes.json'

type DocumentsProps = {
  groupId?: string
  deidentifiedBoolean: boolean | null
}

const Documents: React.FC<DocumentsProps> = ({ groupId, deidentifiedBoolean }) => {
  const [documentsResult, setDocumentsResult] = useState<ResultsType>({ nb: 0, total: 0, label: 'document(s)' })
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total: 0, label: 'patient(s)' })

  const [documents, setDocuments] = useState<CohortComposition[]>([])
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [page, setPage] = useState(1)

  const [searchInput, setSearchInput] = useState('')
  const [searchMode, setSearchMode] = useState(false)

  const [openFilter, setOpenFilter] = useState(false)

  const [filters, setFilters] = useState<DocumentFilters>({
    nda: '',
    ipp: '',
    selectedDocTypes: [],
    startDate: null,
    endDate: null
  })

  const [order, setOrder] = useState<Order>({
    orderBy: 'date',
    orderDirection: 'asc'
  })

  const onSearchDocument = async (newPage: number) => {
    if (searchInput) {
      setSearchMode(true)
    } else {
      setSearchMode(false)
    }
    setLoadingStatus(true)
    const selectedDocTypesCodes = filters.selectedDocTypes.map((docType) => docType.code)

    const result = await services.cohorts.fetchDocuments(
      !!deidentifiedBoolean,
      order.orderBy,
      order.orderDirection,
      newPage,
      searchInput ?? '',
      selectedDocTypesCodes,
      filters.nda,
      filters.ipp ?? '',
      filters.startDate,
      filters.endDate,
      groupId
    )

    if (result) {
      const { totalDocs, totalAllDocs, documentsList, totalPatientDocs, totalAllPatientDocs } = result
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
    setLoadingStatus(false)
  }

  const handleChangePage = (newPage = 1) => {
    setPage(newPage)
    onSearchDocument(newPage)
  }

  useEffect(() => {
    handleChangePage(1)
  }, [!!deidentifiedBoolean, filters, order, searchInput]) // eslint-disable-line

  const handleOpenDialog = () => {
    setOpenFilter(true)
  }

  const handleCloseDialog = () => () => {
    setOpenFilter(false)
  }

  const handleDeleteChip = (
    filterName: 'nda' | 'ipp' | 'selectedDocTypes' | 'startDate' | 'endDate',
    value?: string
  ) => {
    switch (filterName) {
      case 'nda':
      case 'ipp':
        setFilters((prevFilters) => ({
          ...prevFilters,
          [filterName]: (prevFilters[filterName] ?? '')
            .split(',')
            .filter((item) => item !== value)
            .join(',')
        }))
        break
      case 'selectedDocTypes': {
        const typesName = docTypes
          .map((docType: any) => docType.type)
          .filter((item, index, array) => array.indexOf(item) === index)
        const isGroupItem = typesName.find((typeName) => typeName === value)

        let newSelectedDocTypes: any[] = []
        if (!isGroupItem) {
          newSelectedDocTypes = filters.selectedDocTypes.filter((item) => item.label !== value)
        } else {
          newSelectedDocTypes = filters.selectedDocTypes.filter((item) => item.type !== value)
        }
        setFilters((prevFilters) => ({ ...prevFilters, selectedDocTypes: newSelectedDocTypes }))
        break
      }
      case 'startDate':
      case 'endDate':
        setFilters((prevFilters) => ({ ...prevFilters, [filterName]: null }))
        break
    }
  }

  return (
    <>
      <Grid container direction="column" alignItems="center">
        <CssBaseline />
        <Grid container item xs={11} justifyContent="space-between">
          <DataTableTopBar
            results={[documentsResult, patientsResult]}
            searchBar={{
              type: 'document',
              value: searchInput ? searchInput.replace(/^\/|\/$/gi, '') : '',
              onSearch: (newSearchInput: string) => setSearchInput(newSearchInput)
            }}
            buttons={[
              {
                label: 'Filtrer',
                icon: <FilterList height="15px" fill="#FFF" />,
                onClick: handleOpenDialog
              }
            ]}
          />

          <MasterChips chips={buildDocumentFiltersChips(filters, handleDeleteChip)} />

          {deidentifiedBoolean ? (
            <Alert severity="info" style={{ backgroundColor: 'transparent' }}>
              Attention : Les données identifiantes des patients sont remplacées par des informations fictives dans les
              résultats de la recherche et dans les documents prévisualisés.
            </Alert>
          ) : (
            <Alert severity="info" style={{ backgroundColor: 'transparent' }}>
              Attention : La recherche textuelle est pseudonymisée (les données identifiantes des patients sont
              remplacées par des informations fictives). Vous retrouverez les données personnelles de votre patient en
              cliquant sur l'aperçu.
            </Alert>
          )}

          <DataTableComposition
            showIpp
            loading={loadingStatus ?? false}
            deidentified={deidentifiedBoolean ?? true}
            searchMode={searchMode}
            groupId={groupId}
            documentsList={documents ?? []}
            order={order}
            setOrder={setOrder}
            page={page}
            setPage={(newPage: number) => handleChangePage(newPage)}
            total={documentsResult.nb}
          />
        </Grid>
      </Grid>

      <ModalDocumentFilters
        open={openFilter}
        onClose={handleCloseDialog()}
        filters={filters}
        onChangeFilters={setFilters}
        deidentified={deidentifiedBoolean}
        showIpp
      />
    </>
  )
}

export default Documents
