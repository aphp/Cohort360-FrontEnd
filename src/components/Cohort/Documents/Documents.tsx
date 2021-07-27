import React, { useState, useEffect } from 'react'
import moment from 'moment'

import {
  Button,
  Chip,
  CssBaseline,
  Grid,
  IconButton,
  InputAdornment,
  InputBase,
  // Paper,
  Typography
} from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'

import DocumentFilters from '../../Filters/DocumentFilters/DocumentFilters'
import DocumentList from './DocumentList/DocumentList'
// import WordCloud from '../Preview/Charts/WordCloud'
import SortDialog from '../../Filters/SortDialog/SortDialog'
import DocumentSearchHelp from '../../DocumentSearchHelp/DocumentSearchHelp'
import { fetchDocuments } from '../../../services/cohortInfos'

import ClearIcon from '@material-ui/icons/Clear'
import InfoIcon from '@material-ui/icons/Info'
import SortIcon from '@material-ui/icons/Sort'
import { ReactComponent as SearchIcon } from '../../../assets/icones/search.svg'
import { ReactComponent as FilterList } from '../../../assets/icones/filter.svg'
import { docTypes } from '../../../assets/docTypes.json'

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
  // const [wordcloudData, setWordcloudData] = useState<IExtension[] | undefined>()
  const [open, setOpen] = useState(false)
  const [openSort, setOpenSort] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [nda, setNda] = useState('')
  const [selectedDocTypes, setSelectedDocTypes] = useState<any[]>([])
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [_sortBy, setSortBy] = useState(sortBy)
  const [_sortDirection, setSortDirection] = useState(sortDirection)
  const [showFilterChip, setShowFilterChip] = useState(false)

  const documentLines = 20

  const sortOptions = [
    { label: 'Date', code: 'date' },
    { label: 'Type de document', code: 'type' }
  ]

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

  const onSearchDocument = (sortBy: string, sortDirection: 'asc' | 'desc', input = searchInput, page = 1) => {
    if (input !== '') {
      setSearchMode(true)
    } else {
      setSearchMode(false)
    }
    setLoadingStatus(true)

    const selectedDocTypesCodes = selectedDocTypes.map((docType) => docType.code)

    fetchDocuments(
      !!deidentifiedBoolean,
      sortBy,
      sortDirection,
      page,
      input,
      selectedDocTypesCodes,
      nda,
      startDate,
      endDate,
      groupId,
      encounters?.map((encounter: any) => encounter.id ?? '').filter((id: string) => id !== '')
    )
      .then((result) => {
        if (result) {
          const {
            totalDocs,
            totalAllDocs,
            documentsList
            // wordcloudData
          } = result
          setDocuments(documentsList)
          // if (wordcloudData) {
          //   setWordcloudData(wordcloudData)
          // }
          setDocumentsNumber(totalDocs)
          setAllDocumentsNumber(totalAllDocs)
          setPage(page)
        }
      })
      .catch((error) => console.error(error))
      .then(() => {
        setLoadingStatus(false)
      })
  }

  useEffect(() => {
    onSearchDocument(_sortBy, _sortDirection)
  }, [selectedDocTypes, nda, startDate, endDate]) // eslint-disable-line

  const handleClearInput = () => {
    setSearchInput('')
    onSearchDocument(_sortBy, _sortDirection, '')
  }

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const handleOpenSortDialog = () => {
    setOpenSort(true)
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

  const handleCloseSortDialog = (submitSort: boolean) => {
    setOpenSort(false)
    submitSort && onSearchDocument(_sortBy, _sortDirection)
  }

  const handleDeleteChip = (filterName: string, value?: string) => {
    switch (filterName) {
      case 'nda':
        value &&
          setNda(
            nda
              .split(',')
              .filter((item) => item !== value)
              .join()
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

  useEffect(() => {
    onSearchDocument(_sortBy, _sortDirection)
  }, []) // eslint-disable-line

  const documentsToDisplay =
    documents.length > documentLines ? documents.slice((page - 1) * documentLines, page * documentLines) : documents

  return (
    <Grid container direction="column" alignItems="center">
      <CssBaseline />
      <Grid container item xs={11} justify="space-between">
        {/* <Grid container spacing={3}>
          <Grid item xs={12}>
            {wordcloudData && (
              <Paper className={classes.chartOverlay}>
                <Grid container item className={classes.chartTitle}>
                  <Typography variant="h3" color="primary">
                    Mots les plus fréquents
                  </Typography>
                </Grid> */}
        {/* @ts-ignore */}
        {/* <WordCloud wordcloudData={wordcloudData} />
              </Paper>
            )}
          </Grid>
        </Grid> */}

        <Grid container item justify="flex-end" className={classes.tableGrid}>
          <Grid container justify="space-between" alignItems="center">
            <Typography variant="button">
              {displayDigit(documentsNumber ?? 0)} / {displayDigit(allDocumentsNumber ?? 0)} document(s)
            </Typography>
            <Grid container direction="row" alignItems="center" className={classes.filterAndSort}>
              <div className={classes.documentButtons}>
                <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
                  <InputBase
                    placeholder="Rechercher dans les documents"
                    className={classes.input}
                    value={searchInput}
                    onChange={handleChangeInput}
                    onKeyDown={onKeyDown}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton onClick={handleClearInput}>{searchInput && <ClearIcon />}</IconButton>
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
                <Button
                  variant="contained"
                  disableElevation
                  onClick={handleOpenSortDialog}
                  startIcon={<SortIcon height="15px" fill="#FFF" />}
                  className={classes.searchButton}
                >
                  Trier
                </Button>
                <SortDialog
                  open={openSort}
                  onClose={() => handleCloseSortDialog(false)}
                  onSubmit={() => handleCloseSortDialog(true)}
                  sortOptions={sortOptions}
                  sortBy={_sortBy}
                  onChangeSortBy={setSortBy}
                  sortDirection={_sortDirection}
                  onChangeSortDirection={setSortDirection}
                />
              </div>
            </Grid>
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
          <DocumentList
            groupId={groupId}
            loading={loadingStatus ?? false}
            documents={documentsToDisplay}
            searchMode={searchMode}
            showIpp={true}
            deidentified={deidentifiedBoolean}
            encounters={encounters}
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
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Documents
