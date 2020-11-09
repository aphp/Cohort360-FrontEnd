import React, { useState } from 'react'

import { Button, Grid, IconButton, InputBase, Typography } from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'

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
}
const PatientDocs: React.FC<PatientDocsTypes> = ({ patientId, documents, total, deidentifiedBoolean }) => {
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
  const [selectedDocTypes, setSelectedDocTypes] = useState(['all'])
  const [startDate, setStartDate] = useState<string | undefined>(undefined)
  const [endDate, setEndDate] = useState<string | undefined>(undefined)

  const documentLines = 20 // Number of desired lines in the document array

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value?: number) => {
    setPage(value || 1)
    setLoadingStatus(true)
    fetchDocuments(deidentifiedBoolean, value || 1, patientId, searchInput, selectedDocTypes, nda, startDate, endDate)
      .then((docResp) => {
        setDocs(docResp?.docsList ?? [])
        setTotalDocs(docResp?.docsTotal ?? 0)
      })
      .catch((error) => console.log(error))
      .then(() => setLoadingStatus(false))
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

  return (
    <Grid container item xs={11} justify="flex-end" className={classes.documentTable}>
      <Grid container justify="space-between" alignItems="center">
        <Typography variant="button">
          {totalDocs} / {total} document(s)
        </Typography>
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
