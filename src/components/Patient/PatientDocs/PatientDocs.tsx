import React, { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'
import { Alert } from '@mui/lab'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import ModalDocumentFilters from 'components/Filters/DocumentFilters/DocumentFilters'
import DataTableComposition from 'components/DataTable/DataTableComposition'
import DataTableTopBar from 'components/DataTable/DataTableTopBar'
import MasterChips from 'components/MasterChips/MasterChips'

import { Order, DocumentFilters } from 'types'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchDocuments } from 'state/patient'

import { buildDocumentFiltersChips } from 'utils/chips'
import docTypes from 'assets/docTypes.json'

import useStyles from './styles'

type PatientDocsProps = {
  groupId?: string
}
const PatientDocs: React.FC<PatientDocsProps> = ({ groupId }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const deidentified = patient?.deidentified ?? true

  const loading = patient?.documents?.loading ?? false
  const totalDocs = patient?.documents?.count ?? 0
  const totalAllDoc = patient?.documents?.total ?? 0

  const patientDocumentsList = patient?.documents?.list ?? []

  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState<DocumentFilters>({
    nda: '',
    selectedDocTypes: [],
    startDate: null,
    endDate: null
  })

  const [searchInput, setSearchInput] = useState('')
  const [order, setOrder] = useState<Order>({
    orderBy: 'date',
    orderDirection: 'asc'
  })

  const [searchMode, setSearchMode] = useState(false)
  const [open, setOpen] = useState<'filter' | null>(null)

  const fetchDocumentsList = async (page: number) => {
    const selectedDocTypesCodes = filters.selectedDocTypes.map((docType) => docType.code)
    dispatch<any>(
      fetchDocuments({
        groupId,
        options: {
          page,
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
    handleChangePage()
  }, [
    searchInput,
    filters.nda,
    filters.selectedDocTypes,
    filters.startDate,
    filters.endDate,
    order.orderBy,
    order.orderDirection
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

  return (
    <Grid container item xs={11} justifyContent="flex-end" className={classes.documentTable}>
      <DataTableTopBar
        results={{ nb: totalDocs, total: totalAllDoc, label: 'document(s)' }}
        searchBar={{
          type: 'document',
          value: searchInput ? searchInput.replace(/^\/\(\.\)\*|\(\.\)\*\/$/gi, '') : '',
          onSearch: (newSearchInput: string) => setSearchInput(newSearchInput)
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
