import React, { useState, useEffect } from 'react'

import { Button, CssBaseline, Grid, Typography } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import Skeleton from '@material-ui/lab/Skeleton'

import ModalDocumentFilters from 'components/Filters/DocumentFilters/DocumentFilters'
import DataTableComposition from 'components/DataTable/DataTableComposition'

import { InputSearchDocumentSimple, InputSearchDocumentRegex, InputSearchDocumentButton } from 'components/Inputs'
import MasterChips from 'components/MasterChips/MasterChips'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import { CohortComposition, DocumentFilters, Order } from 'types'

import services from 'services'

import displayDigit from 'utils/displayDigit'
import { buildDocumentFiltersChips } from 'utils/chips'

import { docTypes } from 'assets/docTypes.json'

import useStyles from './styles'

type DocumentsProps = {
  groupId?: string
  deidentifiedBoolean: boolean | null
}

const Documents: React.FC<DocumentsProps> = ({ groupId, deidentifiedBoolean }) => {
  const classes = useStyles()

  const [documentsNumber, setDocumentsNumber] = useState<number | undefined>(0)
  const [allDocumentsNumber, setAllDocumentsNumber] = useState<number | undefined>(0)
  const [patientDocumentsNumber, setPatientDocumentsNumber] = useState<number | undefined>(0)
  const [allPatientDocumentsNumber, setAllPatientDocumentsNumber] = useState<number | undefined>(0)

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

  const [inputMode, setInputMode] = useState<'simple' | 'regex'>('simple')

  const onSearchDocument = async (sortBy: string, sortDirection: 'asc' | 'desc', input?: string, page = 1) => {
    if (input) {
      setSearchMode(true)
    } else {
      setSearchMode(false)
    }
    setLoadingStatus(true)

    const selectedDocTypesCodes = filters.selectedDocTypes.map((docType) => docType.code)

    if (inputMode === 'regex') input = `/${input}/`

    const result = await services.cohorts.fetchDocuments(
      !!deidentifiedBoolean,
      sortBy,
      sortDirection,
      page,
      input ?? '',
      selectedDocTypesCodes,
      filters.nda,
      filters.ipp ?? '',
      filters.startDate,
      filters.endDate,
      groupId
    )

    if (result) {
      const { totalDocs, totalAllDocs, documentsList, totalPatientDocs, totalAllPatientDocs } = result
      setDocumentsNumber(totalDocs)
      setAllDocumentsNumber(totalAllDocs)
      setPatientDocumentsNumber(totalPatientDocs)
      setAllPatientDocumentsNumber(totalAllPatientDocs)
      setPage(page)
      setDocuments(documentsList)
    } else {
      setDocuments([])
    }
    setLoadingStatus(false)
  }

  useEffect(() => {
    onSearchDocument(order.orderBy, order.orderDirection)
  }, [
    !!deidentifiedBoolean,
    filters.selectedDocTypes,
    filters.nda,
    filters.ipp,
    filters.startDate,
    filters.endDate,
    order.orderBy,
    order.orderDirection
  ]) // eslint-disable-line

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
          <Grid container item justifyContent="flex-end" className={classes.tableGrid}>
            <Grid container justifyContent="space-between" alignItems="center" style={{ marginBottom: 8 }}>
              <Grid container direction="column" justifyContent="flex-start" style={{ width: 'fit-content' }}>
                {loadingStatus || deidentifiedBoolean === null ? (
                  <>
                    <Skeleton width={200} height={40} />
                    <Skeleton width={150} height={40} />
                  </>
                ) : (
                  <>
                    <Typography variant="button">
                      {displayDigit(documentsNumber ?? 0)} / {displayDigit(allDocumentsNumber ?? 0)} document(s)
                    </Typography>
                    <Typography variant="button">
                      {displayDigit(patientDocumentsNumber ?? 0)} / {displayDigit(allPatientDocumentsNumber ?? 0)}{' '}
                      patient(s)
                    </Typography>
                  </>
                )}
              </Grid>

              <Grid item>
                <Grid container direction="row" alignItems="center" className={classes.filterAndSort}>
                  <div className={classes.documentButtons}>
                    <Button
                      variant="contained"
                      disableElevation
                      onClick={handleOpenDialog}
                      startIcon={<FilterList height="15px" fill="#FFF" />}
                      className={classes.searchButton}
                    >
                      Filtrer
                    </Button>

                    <InputSearchDocumentButton currentMode={inputMode} onChangeMode={setInputMode} />
                  </div>
                </Grid>
              </Grid>
            </Grid>

            {inputMode === 'simple' && (
              <InputSearchDocumentSimple
                defaultSearchInput={searchInput}
                setDefaultSearchInput={(newSearchInput: string) => setSearchInput(newSearchInput)}
                onSearchDocument={(newInputText: string) =>
                  onSearchDocument(order.orderBy, order.orderDirection, newInputText)
                }
              />
            )}

            {inputMode === 'regex' && (
              <InputSearchDocumentRegex
                defaultSearchInput={searchInput}
                setDefaultSearchInput={(newSearchInput: string) => setSearchInput(newSearchInput)}
                onSearchDocument={(newInputText: string) =>
                  onSearchDocument(order.orderBy, order.orderDirection, newInputText)
                }
              />
            )}

            <MasterChips chips={buildDocumentFiltersChips(filters, handleDeleteChip)} />

            {deidentifiedBoolean ? (
              <Alert severity="info" style={{ backgroundColor: 'transparent' }}>
                Attention : Les données identifiantes des patients sont remplacées par des informations fictives dans
                les résultats de la recherche et dans les documents prévisualisés.
              </Alert>
            ) : (
              <Alert severity="info" style={{ backgroundColor: 'transparent' }}>
                Attention : La recherche textuelle est pseudonymisée (les données identifiantes des patients sont
                remplacées par des informations fictives). Vous retrouverez les données personnelles de votre patient en
                cliquant sur l'aperçu.
              </Alert>
            )}

            <DataTableComposition
              loading={loadingStatus ?? false}
              deidentified={deidentifiedBoolean ?? true}
              searchMode={searchMode}
              groupId={groupId}
              documentsList={documents ?? []}
              order={order}
              setOrder={setOrder}
              page={page}
              setPage={setPage}
              total={documentsNumber}
            />
          </Grid>
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
