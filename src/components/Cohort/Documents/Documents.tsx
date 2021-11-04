import React, { useState, useEffect } from 'react'
import moment from 'moment'

import {
  Button,
  CircularProgress,
  Chip,
  CssBaseline,
  Grid,
  IconButton,
  InputAdornment,
  InputBase,
  Typography
  // TextField,
  // Input
} from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'

import DocumentFilters from '../../Filters/DocumentFilters/DocumentFilters'
import DocumentList from './DocumentList/DocumentList'
// import WordCloud from '../Preview/Charts/WordCloud'
import DocumentSearchHelp from '../../DocumentSearchHelp/DocumentSearchHelp'
import services from 'services'

import ClearIcon from '@material-ui/icons/Clear'
import InfoIcon from '@material-ui/icons/Info'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'
import { docTypes } from 'assets/docTypes.json'

import { CohortComposition } from 'types'
import {
  // IExtension,
  IDocumentReference
} from '@ahryman40k/ts-fhir-types/lib/R4'

import useStyles from './styles'
import { useAppSelector } from 'state'

import displayDigit from 'utils/displayDigit'

type DocumentsProps = {
  groupId?: string
  deidentifiedBoolean: boolean | null
  sortBy: string
  sortDirection: 'asc' | 'desc'
}

const Documents: React.FC<DocumentsProps> = ({ groupId, deidentifiedBoolean, sortBy, sortDirection }) => {
  const classes = useStyles()
  const encounters = useAppSelector((state) => state.exploredCohort.encounters)
  const [page, setPage] = useState(1)
  const [documentsNumber, setDocumentsNumber] = useState<number | undefined>(0)
  const [allDocumentsNumber, setAllDocumentsNumber] = useState<number | undefined>(0)
  const [documents, setDocuments] = useState<(CohortComposition | IDocumentReference)[]>([])
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [searchMode, setSearchMode] = useState(false)
  const [open, setOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [nda, setNda] = useState('')
  const [selectedDocTypes, setSelectedDocTypes] = useState<any[]>([])
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [_sortBy, setSortBy] = useState(sortBy)
  const [_sortDirection, setSortDirection] = useState<'asc' | 'desc'>(sortDirection)
  const [showFilterChip, setShowFilterChip] = useState(false)
  const [showAreaText, setShowAreaText] = useState(false)

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

  const onSearchDocument = async (sortBy: string, sortDirection: 'asc' | 'desc', input = searchInput, page = 1) => {
    if (input !== '') {
      setSearchMode(true)
    } else {
      setSearchMode(false)
    }
    setLoadingStatus(true)

    const selectedDocTypesCodes = selectedDocTypes.map((docType) => docType.code)

    const result = await services.cohorts.fetchDocuments(
      !!deidentifiedBoolean,
      sortBy,
      sortDirection,
      page,
      input,
      selectedDocTypesCodes,
      nda,
      startDate,
      endDate,
      groupId
    )

    if (result) {
      const { totalDocs, totalAllDocs, documentsList } = result
      setDocumentsNumber(totalDocs)
      setAllDocumentsNumber(totalAllDocs)
      setPage(page)
      setDocuments(documentsList)
      setLoadingStatus(false)
    }
  }

  useEffect(() => {
    onSearchDocument(_sortBy, _sortDirection)
  }, [!!deidentifiedBoolean, selectedDocTypes, nda, startDate, endDate, _sortBy, _sortDirection]) // eslint-disable-line

  const handleClearInput = () => {
    setSearchInput('')
    onSearchDocument(_sortBy, _sortDirection, '')
  }

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const handleCloseDialog = (submit: boolean) => () => {
    setOpen(false)
    submit && setShowFilterChip(true)
  }

  const handleChangeInput = (event: any) => {
    setSearchInput(event.target.value)
  }

  const onKeyDown = async (e: any) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchDocument(_sortBy, _sortDirection)
    }
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
        <Grid container item xs={11} justify="space-between">
          <Grid container item justify="flex-end" className={classes.tableGrid}>
            <Grid container justify="space-between" alignItems="center">
              <Typography variant="button">
                {displayDigit(documentsNumber ?? 0)} / {displayDigit(allDocumentsNumber ?? 0)} document(s)
              </Typography>
              <Grid item>
                <Grid container direction="row" alignItems="center" className={classes.filterAndSort}>
                  <div className={classes.documentButtons}>
                    {!showAreaText && (
                      <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
                        <InputBase
                          placeholder="Rechercher dans les documents"
                          className={classes.input}
                          value={searchInput}
                          onChange={handleChangeInput}
                          onKeyDown={onKeyDown}
                          endAdornment={
                            <InputAdornment position="end">
                              {searchInput && (
                                <IconButton onClick={handleClearInput}>
                                  <ClearIcon />
                                </IconButton>
                              )}
                            </InputAdornment>
                          }
                        />
                        <IconButton
                          type="submit"
                          aria-label="search"
                          onClick={() => onSearchDocument(_sortBy, _sortDirection)}
                        >
                          <SearchIcon fill="#ED6D91" height="15px" />
                        </IconButton>
                      </Grid>
                    )}
                    <IconButton type="submit" onClick={() => setHelpOpen(true)}>
                      <InfoIcon />
                    </IconButton>
                    <DocumentSearchHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
                    <Button
                      variant="contained"
                      disableElevation
                      onClick={handleOpenDialog}
                      startIcon={<FilterList height="15px" fill="#FFF" />}
                      className={classes.searchButton}
                    >
                      Filtrer
                    </Button>
                  </div>
                </Grid>
              </Grid>
              {showAreaText ? (
                <Grid item className={classes.gridAdvancedSearch}>
                  <InputBase
                    className={classes.advancedSearch}
                    placeholder="recherche avancée dans les documents"
                    value={searchInput}
                    onChange={handleChangeInput}
                    multiline
                    rows={3}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton onClick={() => (handleClearInput(), setShowAreaText(false))}>
                          <ClearIcon />
                        </IconButton>
                        <IconButton
                          type="submit"
                          aria-label="search"
                          onClick={() => onSearchDocument(_sortBy, _sortDirection)}
                        >
                          <SearchIcon fill="#ED6D91" height="17px" />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </Grid>
              ) : (
                <Grid item container xs={12} justify="flex-end">
                  <Typography variant="h6" style={{ cursor: 'pointer' }} onClick={() => setShowAreaText(true)}>
                    Recherche avancée
                  </Typography>
                </Grid>
              )}
            </Grid>
            <Grid>
              {showFilterChip &&
                nda !== '' &&
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
              {showFilterChip &&
                displayingSelectedDocType.length > 0 &&
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
              {showFilterChip && startDate && (
                <Chip
                  className={classes.chips}
                  label={`Après le : ${moment(startDate).format('DD/MM/YYYY')}`}
                  onDelete={() => handleDeleteChip('startDate')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {showFilterChip && endDate && (
                <Chip
                  className={classes.chips}
                  label={`Avant le : ${moment(endDate).format('DD/MM/YYYY')}`}
                  onDelete={() => handleDeleteChip('endDate')}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Grid>
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
        open={open}
        onClose={handleCloseDialog(false)}
        onSubmit={handleCloseDialog(true)}
        nda={nda}
        onChangeNda={setNda}
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
