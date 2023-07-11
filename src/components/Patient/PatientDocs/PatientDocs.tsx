import React, { useEffect, useState, useRef } from 'react'

import { Alert, Checkbox, Grid, Typography } from '@mui/material'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import ModalDocumentFilters from 'components/Filters/DocumentFilters/DocumentFilters'
import DataTableComposition from 'components/DataTable/DataTableComposition'
import DataTableTopBar from 'components/DataTable/DataTableTopBar'
import MasterChips from 'components/MasterChips/MasterChips'

import { Order, DocumentFilters, SearchByTypes } from 'types'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchDocuments } from 'state/patient'

import { buildDocumentFiltersChips } from 'utils/chips'
import docTypes from 'assets/docTypes.json'
import { useDebounce } from 'utils/debounce'

import useStyles from './styles'
import { _cancelPendingRequest } from 'utils/abortController'

type PatientDocsProps = {
  groupId?: string
}
const PatientDocs: React.FC<PatientDocsProps> = ({ groupId }) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const deidentified = patient?.deidentified ?? true

  const loading = patient?.documents?.loading ?? true
  const totalDocs = patient?.documents?.count ?? 0
  const totalAllDoc = patient?.documents?.total ?? 0
  const searchInputError = patient?.documents?.searchInputError ?? undefined

  const patientDocumentsList = patient?.documents?.list ?? []

  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState<DocumentFilters>({
    nda: '',
    selectedDocTypes: [],
    startDate: null,
    endDate: null,
    onlyPdfAvailable: deidentified ? false : true
  })

  const [searchInput, setSearchInput] = useState('')
  const [order, setOrder] = useState<Order>({
    orderBy: 'date',
    orderDirection: 'desc'
  })

  const [searchMode, setSearchMode] = useState(false)
  const [searchBy, setSearchBy] = useState<SearchByTypes>(SearchByTypes.text)
  const [open, setOpen] = useState<'filter' | null>(null)
  const debouncedSearchInput = useDebounce(500, searchInput)
  const controllerRef = useRef<AbortController>(new AbortController())

  const fetchDocumentsList = async (page: number) => {
    const selectedDocTypesCodes = filters.selectedDocTypes.map((docType) => docType.code)
    dispatch(
      fetchDocuments({
        signal: controllerRef.current?.signal,
        groupId,
        options: {
          page,
          searchBy: searchBy,
          sort: {
            by: order.orderBy,
            direction: order.orderDirection
          },
          filters: {
            ...filters,
            searchInput,
            selectedDocTypes: selectedDocTypesCodes
          }
        }
      })
    )

    setSearchMode(!!searchInput)
  }

  const handleChangePage = (value?: number) => {
    setPage(value || 1)
    fetchDocumentsList(value || 1)
  }

  useEffect(() => {
    _cancelPendingRequest(controllerRef.current)
    handleChangePage()

    /*   return () => {
     _cancelPendingRequest(controllerRef.current)
    } */
  }, [
    debouncedSearchInput,
    filters.onlyPdfAvailable,
    filters.nda,
    filters.selectedDocTypes,
    filters.startDate,
    filters.endDate,
    order.orderBy,
    order.orderDirection,
    searchBy
  ]) // eslint-disable-line

  const onChangeOptions = (key: string, value: any) => {
    setFilters((prevState) => ({
      ...prevState,
      [key]: value
    }))
  }

  const handleDeleteChip = (filterName: string, value?: string) => {
    switch (filterName) {
      case 'nda':
        onChangeOptions(filterName, value)
        break
      case 'selectedDocTypes': {
        const typesName = docTypes.docTypes
          .map((docType: any) => docType.type)
          .filter((item, index, array) => array.indexOf(item) === index)
        const isGroupItem = typesName.find((typeName) => typeName === value)

        if (!isGroupItem) {
          onChangeOptions(
            filterName,
            filters.selectedDocTypes.filter((item) => item.label !== value)
          )
        } else {
          onChangeOptions(
            filterName,
            filters.selectedDocTypes.filter((item) => item.type !== value)
          )
        }
        break
      }
      case 'startDate':
      case 'endDate':
        onChangeOptions(filterName, null)
        break
    }
  }

  const onSearch = (inputSearch: string, _searchBy: SearchByTypes) => {
    setSearchInput(inputSearch)
    setSearchBy(_searchBy)
  }

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable}>
      <DataTableTopBar
        loading={loading}
        results={{ nb: totalDocs, total: totalAllDoc, label: 'document(s)' }}
        searchBar={{
          type: 'document',
          value: searchInput ? searchInput.replace(/^\/\(\.\)\*|\(\.\)\*\/$/gi, '') : '',
          error: searchInputError,
          searchBy: searchBy,
          onSearch: (newSearchInput: string, newSearchBy: SearchByTypes) => onSearch(newSearchInput, newSearchBy)
        }}
        buttons={[
          {
            label: 'Filtrer',
            icon: <FilterList height="15px" fill="#FFF" />,
            onClick: () => setOpen('filter')
          }
        ]}
      />

      <MasterChips chips={buildDocumentFiltersChips(filters, handleDeleteChip)} />

      <Alert severity="info" style={{ backgroundColor: 'transparent' }}>
        Attention : La recherche est pseudonymisée pour la prévisualisation des documents. Vous pouvez donc trouver des
        incohérences entre les informations de votre patient et celles du document prévisualisé.
      </Alert>

      {!deidentified && (
        <Grid container item alignItems="center" justifyContent="flex-end">
          <Checkbox
            checked={filters.onlyPdfAvailable}
            onChange={() => onChangeOptions('onlyPdfAvailable', !filters.onlyPdfAvailable)}
          />
          <Typography>N'afficher que les documents dont les PDF sont disponibles</Typography>
        </Grid>
      )}

      <DataTableComposition
        loading={loading}
        deidentified={deidentified}
        searchMode={searchMode}
        groupId={groupId}
        documentsList={patientDocumentsList}
        order={order}
        setOrder={setOrder}
        page={page}
        setPage={(newPage: number) => handleChangePage(newPage)}
        total={totalDocs}
      />

      <ModalDocumentFilters
        open={open === 'filter'}
        onClose={() => setOpen(null)}
        filters={filters}
        onChangeFilters={setFilters}
        deidentified={deidentified}
      />
    </Grid>
  )
}

export default PatientDocs
