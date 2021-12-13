import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { Button, Chip, Grid, IconButton, InputAdornment, InputBase, Typography } from '@material-ui/core'
import { Pagination } from '@material-ui/lab'

import ClearIcon from '@material-ui/icons/Clear'
import InfoIcon from '@material-ui/icons/Info'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import DocumentSearchHelp from '../../DocumentSearchHelp/DocumentSearchHelp'
import DocumentFilters from '../../Filters/DocumentFilters/DocumentFilters'
import DocumentList from '../../Cohort/Documents/DocumentList/DocumentList'

import services from 'services'
import { IDocumentReference } from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortComposition } from 'types'

import { docTypes } from 'assets/docTypes.json'

import useStyles from './styles'

type PatientDocsTypes = {
  groupId?: string
  patientId: string
  documents?: (CohortComposition | IDocumentReference)[]
  total: number
  deidentifiedBoolean: boolean
}
const PatientDocs: React.FC<PatientDocsTypes> = ({ groupId, patientId, documents, total, deidentifiedBoolean }) => {
  const classes = useStyles()
  const [page, setPage] = useState(1)
  const [totalDocs, setTotalDocs] = useState(total)
  const [docs, setDocs] = useState(documents)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchMode, setSearchMode] = useState(false)
  const [open, setOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [nda, setNda] = useState('')
  const [selectedDocTypes, setSelectedDocTypes] = useState<any[]>([])
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showFilterChip, setShowFilterChip] = useState(false)

  const documentLines = 20 // Number of desired lines in the document array

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

  const fetchDocumentsList = async (newSortBy: string, newSortDirection: string, input = searchInput, page = 1) => {
    if (typeof services.patients.fetchDocuments !== 'function') return
    setLoadingStatus(true)

    const selectedDocTypesCodes = selectedDocTypes.map((docType) => docType.code)

    const docResp = await services.patients.fetchDocuments(
      deidentifiedBoolean,
      newSortBy,
      newSortDirection,
      page,
      patientId,
      input,
      selectedDocTypesCodes,
      nda,
      startDate,
      endDate,
      groupId
    )
    if (!docResp) return
    setDocs(docResp?.docsList ?? [])
    setTotalDocs(docResp?.docsTotal ?? 0)
    setLoadingStatus(false)
  }

  const handleClearInput = () => {
    setSearchInput('')
    fetchDocumentsList(sortBy, sortDirection, '')
  }

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value?: number) => {
    setPage(value || 1)
    setLoadingStatus(true)
    fetchDocumentsList(sortBy, sortDirection, searchInput, value || 1)
  }

  useEffect(() => {
    handleChangePage()
  }, [patientId, nda, selectedDocTypes, startDate, endDate, sortBy, sortDirection]) // eslint-disable-line

  const handleCloseDialog = (submit: boolean) => () => {
    setOpen(false)
    if (submit) {
      setShowFilterChip(true)
    }
  }

  const handleChangeInput = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSearchInput(event.target.value)
  }

  const onSearchDocument = () => {
    if (searchInput !== '') {
      setSearchMode(true)
    } else {
      setSearchMode(false)
    }
    handleChangePage()
  }

  const onKeyDown = (e: { keyCode: number; preventDefault: () => void }) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchDocument()
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

  return (
    <Grid container item xs={11} justify="flex-end" className={classes.documentTable}>
      <Grid container justify="space-between" alignItems="center">
        <Typography variant="button">
          {totalDocs} / {total} document(s)
        </Typography>
        <Grid container direction="row" alignItems="center" className={classes.filterAndSort}>
          <div className={classes.documentButtons}>
            <IconButton size="small" onClick={() => setHelpOpen(true)}>
              <InfoIcon />
            </IconButton>

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
              <IconButton type="submit" aria-label="search" onClick={onSearchDocument}>
                <SearchIcon fill="#ED6D91" height="15px" />
              </IconButton>
            </Grid>

            <DocumentSearchHelp open={helpOpen} onClose={() => setHelpOpen(false)} />

            <Button
              variant="contained"
              disableElevation
              startIcon={<FilterList height="15px" fill="#FFF" />}
              className={classes.searchButton}
              onClick={handleOpenDialog}
            >
              Filtrer
            </Button>
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
        loading={loadingStatus}
        documents={docs}
        searchMode={searchMode}
        showIpp={false}
        deidentified={deidentifiedBoolean}
        sortBy={sortBy}
        onChangeSortBy={setSortBy}
        sortDirection={sortDirection}
        onChangeSortDirection={setSortDirection}
      />
      <Pagination
        className={classes.pagination}
        count={Math.ceil(totalDocs / documentLines)}
        shape="rounded"
        onChange={handleChangePage}
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
  )
}

export default PatientDocs
