import React, { useState } from 'react'

import {
  Button,
  FormControlLabel,
  Grid,
  IconButton,
  InputBase,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@material-ui/core'
import { Autocomplete, Pagination } from '@material-ui/lab'

import { ReactComponent as SearchIcon } from '../../../assets/icones/search.svg'
import { ReactComponent as FilterList } from '../../../assets/icones/filter.svg'
import InfoIcon from '@material-ui/icons/Info'

import DocumentSearchHelp from '../../DocumentSearchHelp/DocumentSearchHelp'
import DocumentFilters from '../../Filters/DocumentFilters/DocumentFilters'
import DocumentList from '../../Cohort/Documents/DocumentList/DocumentList'

import { fetchDocuments } from '../../../services/patient'
import { IDocumentReference } from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortComposition } from 'types'

import useStyles from './styles'

type PatientDocsTypes = {
  patientId: string
  documents?: (CohortComposition | IDocumentReference)[]
  total: number
  deidentifiedBoolean: boolean
  sortBy: string
  sortDirection: 'asc' | 'desc'
}
const PatientDocs: React.FC<PatientDocsTypes> = ({
  patientId,
  documents,
  total,
  deidentifiedBoolean,
  sortBy,
  sortDirection
}) => {
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
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([])
  const [startDate, setStartDate] = useState<string | undefined>(undefined)
  const [endDate, setEndDate] = useState<string | undefined>(undefined)
  const [_sortBy, setSortBy] = useState(sortBy)
  const [_sortDirection, setSortDirection] = useState(sortDirection)

  const documentLines = 20 // Number of desired lines in the document array

  const sortByNames = [
    { label: 'Date', code: 'date' },
    { label: 'Type de document', code: 'type' }
  ]

  const fetchDocumentsList = (newSortBy: string, newSortDirection: string, page = 1) => {
    setLoadingStatus(true)
    fetchDocuments(
      deidentifiedBoolean,
      newSortBy,
      newSortDirection,
      page,
      patientId,
      searchInput,
      selectedDocTypes,
      nda,
      startDate,
      endDate
    )
      .then((docResp) => {
        setDocs(docResp?.docsList ?? [])
        setTotalDocs(docResp?.docsTotal ?? 0)
      })
      .catch((error) => console.log(error))
      .then(() => setLoadingStatus(false))
  }

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value?: number) => {
    setPage(value || 1)
    setLoadingStatus(true)
    fetchDocumentsList(_sortBy, _sortDirection, value || 1)
  }

  const handleCloseDialog = () => {
    setOpen(false)
    handleChangePage()
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

  const onChangeSortBy = (
    event: React.ChangeEvent<{}>,
    value: {
      label: string
      code: string
    } | null
  ) => {
    if (value) {
      setSortBy(value.code)
      setPage(1)
      fetchDocumentsList(value.code, _sortDirection)
    }
  }

  const onChangeSortDirection = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    if (value === 'asc' || value === 'desc') {
      setSortDirection(value)
      setPage(1)
      fetchDocumentsList(_sortBy, value)
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
            <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
              <InputBase
                placeholder="Rechercher"
                className={classes.input}
                value={searchInput}
                onChange={handleChangeInput}
                onKeyDown={onKeyDown}
              />
              <IconButton type="submit" aria-label="search" onClick={onSearchDocument}>
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
          </div>
          <Autocomplete
            options={sortByNames}
            getOptionLabel={(option) => option.label}
            value={sortByNames.find((value) => value.code === _sortBy)}
            renderInput={(params) => <TextField {...params} label="Trier par :" variant="outlined" />}
            onChange={onChangeSortBy}
            className={classes.autocomplete}
          />
          <Typography variant="button">Ordre :</Typography>
          <RadioGroup value={_sortDirection} onChange={onChangeSortDirection} classes={{ root: classes.radioGroup }}>
            <FormControlLabel value="asc" control={<Radio />} label="Croissant" />
            <FormControlLabel value="desc" control={<Radio />} label="Décroissant" />
          </RadioGroup>
        </Grid>
      </Grid>
      <DocumentList
        loading={loadingStatus}
        documents={docs}
        searchMode={searchMode}
        showIpp={false}
        deidentified={deidentifiedBoolean}
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
        onClose={() => setOpen(false)}
        onSubmit={handleCloseDialog}
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
