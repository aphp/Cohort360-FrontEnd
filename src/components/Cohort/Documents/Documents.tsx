import React, { useState, useEffect } from 'react'
import moment from 'moment'

import { Button, CircularProgress, Chip, CssBaseline, Grid, Typography } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import Skeleton from '@material-ui/lab/Skeleton'
import Pagination from '@material-ui/lab/Pagination'

import DocumentFilters from '../../Filters/DocumentFilters/DocumentFilters'
import DocumentList from './DocumentList/DocumentList'

import { InputSearchDocumentSimple, InputSearchDocumentRegex, InputSearchDocumentButton } from 'components/Inputs'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import { CohortComposition } from 'types'
import { IDocumentReference } from '@ahryman40k/ts-fhir-types/lib/R4'

import services from 'services'
import { useAppSelector } from 'state'

import displayDigit from 'utils/displayDigit'
import { docTypes } from 'assets/docTypes.json'

import useStyles from './styles'

type DocumentsProps = {
  groupId?: string
  deidentifiedBoolean: boolean | null
  sortBy: string
  sortDirection: 'asc' | 'desc'
}

const Documents: React.FC<DocumentsProps> = ({ groupId, deidentifiedBoolean, sortBy, sortDirection }) => {
  const classes = useStyles()
  const { dashboard } = useAppSelector((state) => ({
    dashboard: state.exploredCohort
  }))
  const { encounters } = dashboard

  const [documentsNumber, setDocumentsNumber] = useState<number | undefined>(0)
  const [allDocumentsNumber, setAllDocumentsNumber] = useState<number | undefined>(0)
  const [patientDocumentsNumber, setPatientDocumentsNumber] = useState<number | undefined>(0)
  const [allPatientDocumentsNumber, setAllPatientDocumentsNumber] = useState<number | undefined>(0)

  const [documents, setDocuments] = useState<(CohortComposition | IDocumentReference)[]>([])
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [page, setPage] = useState(1)

  const [searchInput, setSearchInput] = useState('')
  const [searchMode, setSearchMode] = useState(false)

  const [openFilter, setOpenFilter] = useState(false)

  const [nda, setNda] = useState('')
  const [ipp, setIpp] = useState('')
  const [selectedDocTypes, setSelectedDocTypes] = useState<any[]>([])
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)

  const [_sortBy, setSortBy] = useState(sortBy)
  const [_sortDirection, setSortDirection] = useState<'asc' | 'desc'>(sortDirection)

  const [inputMode, setInputMode] = useState<'simple' | 'regex'>('simple')

  const documentLines = 20

  const displayingSelectedDocType: any[] = (() => {
    let displayingSelectedDocTypes: any[] = []
    const allTypes = docTypes.map((docType: any) => docType.type)

    for (const selectedDocType of selectedDocTypes) {
      const numberOfElementFromGroup = (allTypes.filter((type) => type === selectedDocType.type) || []).length
      const numberOfElementSelected = (
        selectedDocTypes.filter((selectedDoc) => selectedDoc.type === selectedDocType.type) || []
      ).length

      if (numberOfElementFromGroup === numberOfElementSelected) {
        const groupIsAlreadyAdded = displayingSelectedDocTypes.find((dsdt) => dsdt.label === selectedDocType.type)
        if (groupIsAlreadyAdded) continue

        displayingSelectedDocTypes = [
          ...displayingSelectedDocTypes,
          { type: selectedDocType.type, label: selectedDocType.type, code: selectedDocType.type }
        ]
      } else {
        displayingSelectedDocTypes = [...displayingSelectedDocTypes, selectedDocType]
      }
    }
    return displayingSelectedDocTypes.filter((item, index, array) => array.indexOf(item) === index)
  })()

  const onSearchDocument = async (sortBy: string, sortDirection: 'asc' | 'desc', input?: string, page = 1) => {
    if (input) {
      setSearchMode(true)
    } else {
      setSearchMode(false)
    }
    setLoadingStatus(true)

    const selectedDocTypesCodes = selectedDocTypes.map((docType) => docType.code)

    if (inputMode === 'regex') input = input ? `/${input}/` : ''

    const result = await services.cohorts.fetchDocuments(
      !!deidentifiedBoolean,
      sortBy,
      sortDirection,
      page,
      input ?? '',
      selectedDocTypesCodes,
      nda,
      ipp,
      startDate,
      endDate,
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
    onSearchDocument(_sortBy, _sortDirection, searchInput)
  }, [!!deidentifiedBoolean, selectedDocTypes, nda, ipp, startDate, endDate, _sortBy, _sortDirection]) // eslint-disable-line

  const handleOpenDialog = () => {
    setOpenFilter(true)
  }

  const handleCloseDialog = () => () => {
    setOpenFilter(false)
  }

  const handleDeleteChip = (filterName: string, value?: string) => {
    switch (filterName) {
      case 'nda':
        value &&
          setNda(
            nda
              .split(',')
              .filter((item) => item !== value)
              .join(',')
          )
        break
      case 'ipp':
        value &&
          setIpp(
            ipp
              .split(',')
              .filter((item) => item !== value)
              .join(',')
          )
        break
      case 'selectedDocTypes': {
        const typesName = docTypes
          .map((docType: any) => docType.type)
          .filter((item, index, array) => array.indexOf(item) === index)
        const isGroupItem = typesName.find((typeName) => typeName === value)

        if (!isGroupItem) {
          value && setSelectedDocTypes(selectedDocTypes.filter((item) => item.label !== value))
        } else {
          value && setSelectedDocTypes(selectedDocTypes.filter((item) => item.type !== value))
        }
        break
      }
      case 'startDate':
        setStartDate(null)
        break
      case 'endDate':
        setEndDate(null)
        break
    }
  }

  const documentsToDisplay =
    documents.length > documentLines ? documents.slice((page - 1) * documentLines, page * documentLines) : documents

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
                onSearchDocument={(newInputText: string) => onSearchDocument(_sortBy, _sortDirection, newInputText)}
              />
            )}

            {inputMode === 'regex' && (
              <InputSearchDocumentRegex
                defaultSearchInput={searchInput}
                setDefaultSearchInput={(newSearchInput: string) => setSearchInput(newSearchInput)}
                onSearchDocument={(newInputText: string) => onSearchDocument(_sortBy, _sortDirection, newInputText)}
              />
            )}
            <Grid>
              {nda !== '' &&
                nda
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
              {ipp !== '' &&
                ipp
                  .split(',')
                  .map((value) => (
                    <Chip
                      className={classes.chips}
                      key={value}
                      label={value}
                      onDelete={() => handleDeleteChip('ipp', value)}
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

              {startDate && (
                <Chip
                  className={classes.chips}
                  label={`Après le : ${moment(startDate).format('DD/MM/YYYY')}`}
                  onDelete={() => handleDeleteChip('startDate')}
                  color="primary"
                  variant="outlined"
                />
              )}

              {endDate && (
                <Chip
                  className={classes.chips}
                  label={`Avant le : ${moment(endDate).format('DD/MM/YYYY')}`}
                  onDelete={() => handleDeleteChip('endDate')}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Grid>

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

            {loadingStatus || deidentifiedBoolean === null ? (
              <CircularProgress className={classes.loadingSpinner} size={50} />
            ) : (
              <>
                <DocumentList
                  groupId={groupId}
                  loading={loadingStatus}
                  documents={documentsToDisplay}
                  searchMode={searchMode}
                  showIpp
                  deidentified={deidentifiedBoolean}
                  encounters={encounters}
                  sortBy={_sortBy}
                  onChangeSortBy={setSortBy}
                  sortDirection={_sortDirection}
                  onChangeSortDirection={setSortDirection}
                />

                <Pagination
                  className={classes.pagination}
                  count={Math.ceil((documentsNumber ?? 0) / documentLines)}
                  shape="rounded"
                  onChange={(event, page) => {
                    if (documents.length <= documentLines) {
                      onSearchDocument(_sortBy, _sortDirection, searchInput, page)
                    } else {
                      setPage(page)
                    }
                  }}
                  page={page}
                />
              </>
            )}
          </Grid>
        </Grid>
      </Grid>

      <DocumentFilters
        open={openFilter}
        onClose={handleCloseDialog()}
        onSubmit={handleCloseDialog()}
        nda={nda}
        onChangeNda={setNda}
        ipp={ipp}
        onChangeIpp={setIpp}
        selectedDocTypes={selectedDocTypes}
        onChangeSelectedDocTypes={setSelectedDocTypes}
        startDate={startDate}
        onChangeStartDate={setStartDate}
        endDate={endDate}
        onChangeEndDate={setEndDate}
        deidentified={deidentifiedBoolean}
      />
    </>
  )
}

export default Documents
