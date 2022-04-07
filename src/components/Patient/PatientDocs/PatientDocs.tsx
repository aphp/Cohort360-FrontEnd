import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { Button, Chip, Grid, Typography } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import { InputSearchDocumentSimple, InputSearchDocumentRegex, InputSearchDocumentButton } from 'components/Inputs'

import ModalDocumentFilters from 'components/Filters/DocumentFilters/DocumentFilters'
import DataTableComposition from 'components/DataTable/DataTableComposition'

import { Order, DocumentFilters } from 'types'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchDocuments } from 'state/patient'

import { docTypes } from 'assets/docTypes.json'
import { getDisplayingSelectedDocTypes } from 'utils/documentsFormatter'

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
  const [open, setOpen] = useState<'filter' | string | null>(null)

  const [inputMode, setInputMode] = useState<'simple' | 'regex'>('simple')

  const displayingSelectedDocType: any[] = getDisplayingSelectedDocTypes(filters.selectedDocTypes)

  const fetchDocumentsList = async (page: number, input = searchInput) => {
    const selectedDocTypesCodes = filters.selectedDocTypes.map((docType) => docType.code)

    if (inputMode === 'regex') input = `/${input}/`

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
            searchInput: input,
            selectedDocTypes: selectedDocTypesCodes
          }
        }
      })
    )

    setSearchMode(!!searchInput)
  }

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value?: number) => {
    setPage(value || 1)
    fetchDocumentsList(value || 1)
  }

  useEffect(() => {
    handleChangePage()
  }, [filters.nda, filters.selectedDocTypes, filters.startDate, filters.endDate, order.orderBy, order.orderDirection]) // eslint-disable-line

  const onChangeOptions = (key: string, value: any) => {
    setFilters((prevState) => ({
      ...prevState,
      [key]: value
    }))
  }

  const handleDeleteChip = (filterName: string, value?: string) => {
    switch (filterName) {
      case 'nda':
        onChangeOptions(
          filterName,
          filters.nda
            .split(',')
            .filter((item: string) => item !== value)
            .join()
        )
        break
      case 'selectedDocTypes': {
        const typesName = docTypes
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
        onChangeOptions(filterName, null)
        break
      case 'endDate':
        onChangeOptions(filterName, null)
        break
    }
  }

  return (
    <Grid container item xs={11} justifyContent="flex-end" className={classes.documentTable}>
      <Grid container justifyContent="space-between" alignItems="center">
        <Typography variant="button">
          {totalDocs} / {totalAllDoc} document(s)
        </Typography>
        <Grid container direction="row" alignItems="center" className={classes.filterAndSort}>
          <div className={classes.documentButtons}>
            <Button
              variant="contained"
              disableElevation
              startIcon={<FilterList height="15px" fill="#FFF" />}
              className={classes.searchButton}
              onClick={() => setOpen('filter')}
            >
              Filtrer
            </Button>

            <InputSearchDocumentButton currentMode={inputMode} onChangeMode={setInputMode} />
          </div>
        </Grid>
      </Grid>

      {inputMode === 'simple' && (
        <InputSearchDocumentSimple
          defaultSearchInput={searchInput}
          setDefaultSearchInput={(newSearchInput: string) => setSearchInput(newSearchInput)}
          onSearchDocument={(newInputText: string) => fetchDocumentsList(1, newInputText)}
        />
      )}

      {inputMode === 'regex' && (
        <InputSearchDocumentRegex
          defaultSearchInput={searchInput}
          setDefaultSearchInput={(newSearchInput: string) => setSearchInput(newSearchInput)}
          onSearchDocument={(newInputText: string) => fetchDocumentsList(1, newInputText)}
        />
      )}

      <Grid>
        {filters.nda !== '' &&
          filters.nda
            .split(',')
            .map((value) => (
              <Chip
                className={classes.chips}
                key={value}
                label={value}
                onDelete={() => handleDeleteChip('nda', value)}
                color="primary"
                variant="outlined"
              />
            ))}
        {displayingSelectedDocType.length > 0 &&
          displayingSelectedDocType.map((docType) => (
            <Chip
              className={classes.chips}
              key={docType.code}
              label={docType.label}
              onDelete={() => handleDeleteChip('selectedDocTypes', docType.label)}
              color="primary"
              variant="outlined"
            />
          ))}
        {filters.startDate && (
          <Chip
            className={classes.chips}
            label={`Après le : ${moment(filters.startDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleDeleteChip('startDate')}
            color="primary"
            variant="outlined"
          />
        )}
        {filters.endDate && (
          <Chip
            className={classes.chips}
            label={`Avant le : ${moment(filters.endDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleDeleteChip('endDate')}
            color="primary"
            variant="outlined"
          />
        )}
      </Grid>

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
        setPage={setPage}
        total={totalDocs}
      />

      <ModalDocumentFilters
        open={open === 'filter'}
        onClose={() => setOpen(null)}
        showIpp
        filters={filters}
        onChangeFilters={setFilters}
        deidentified={false}
      />
    </Grid>
  )
}

export default PatientDocs
