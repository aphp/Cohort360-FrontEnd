import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Pagination from '@material-ui/lab/Pagination'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'

import { ReactComponent as SearchIcon } from '../../../assets/icones/search.svg'
import { ReactComponent as FilterList } from '../../../assets/icones/filter.svg'
import InfoIcon from '@material-ui/icons/Info'

import DocumentSearchHelp from '../../DocumentSearchHelp/DocumentSearchHelp'
import DocumentFilters from '../../Filters/DocumentFilters/DocumentFilters'
import DocumentList from '../../Cohort/Documents/DocumentList/DocumentList'
import { fetchDocuments } from '../../../services/patient.js'

import useStyles from './style'
import { Typography } from '@material-ui/core'

const PatientDocs = ({ patientId, documents, total }) => {
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

  const documentLines = 20 // Number of desired lines in the document array

  const handleChangeSelect = (event) => {
    setSelectedDocTypes(event.target.value)
  }

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const handleCloseDialog = () => {
    setOpen(false)
    handleChangePage(1)
  }

  const handleChangeInput = (event) => {
    setSearchInput(event.target.value)
  }

  const handleChangeNdaInput = (event) => {
    setNda(event.target.value)
  }

  const handleChangePage = (event, value) => {
    setPage(value || 1)
    setLoadingStatus(true)
    fetchDocuments(value || 1, patientId, searchInput, selectedDocTypes, nda)
      .then(({ docsTotal, docsList }) => {
        setDocs(docsList)
        setTotalDocs(docsTotal)
      })
      .catch((error) => console.log(error))
      .then(() => setLoadingStatus(false))
  }

  const onSearchDocument = () => {
    if (searchInput !== '') {
      setSearchMode(true)
    } else {
      setSearchMode(false)
    }
    handleChangePage(1)
  }

  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchDocument()
    }
  }

  return (
    <Grid
      container
      item
      xs={11}
      justify="flex-end"
      className={classes.documentTable}
    >
      <Grid container justify="space-between" alignItems="center">
        <Typography variant="button">
          {totalDocs} / {total} document(s)
        </Typography>
        <div className={classes.documentButtons}>
          <Grid
            item
            container
            xs={10}
            alignItems="center"
            className={classes.searchBar}
          >
            <InputBase
              placeholder="Rechercher"
              className={classes.input}
              value={searchInput}
              onChange={handleChangeInput}
              onKeyDown={onKeyDown}
            />
            <IconButton
              type="submit"
              aria-label="search"
              onClick={onSearchDocument}
            >
              <SearchIcon fill="#ED6D91" height="15px" />
            </IconButton>
          </Grid>
          <IconButton type="submit" onClick={() => setHelpOpen(true)}>
            <InfoIcon />
          </IconButton>
          <DocumentSearchHelp
            open={helpOpen}
            onClose={() => setHelpOpen(false)}
          />
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
        documentLines={documentLines}
        documents={docs}
        page={page}
        loading={loadingStatus}
        searchMode={searchMode}
        showIpp={false}
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
        onChangeNda={handleChangeNdaInput}
        selectedDocTypes={selectedDocTypes}
        onChangeSelectedDocTypes={handleChangeSelect}
      />
    </Grid>
  )
}
PatientDocs.propTypes = {
  patientId: PropTypes.string.isRequired,
  total: PropTypes.number,
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string,
      type: PropTypes.object,
      description: PropTypes.string,
      status: PropTypes.string,
      docStatus: PropTypes.string,
      securityLabel: PropTypes.arrayOf(
        PropTypes.shape({
          coding: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string }))
        })
      ),
      content: PropTypes.arrayOf(
        PropTypes.shape({
          attachment: PropTypes.shape({ url: PropTypes.string.isRequired })
        })
      )
    })
  ).isRequired
}
export default PatientDocs
