import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Pagination from '@material-ui/lab/Pagination'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'

import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import DocumentTable from './DocumentTable/DocumentTable'

import useStyles from './styles'

const PatientDocs = ({ documents }) => {
  const classes = useStyles()
  const [page, setPage] = useState(1)

  const documentLines = 4 // Number of desired lines in the document array

  const handleChange = (event, value) => {
    setPage(value)
  }
  return (
    <Grid container item xs={11} justify="flex-end" className={classes.documentTable}>
      <div className={classes.documentButtons}>
        <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
          <InputBase placeholder="Rechercher" className={classes.input} />
          <IconButton type="submit" aria-label="search">
            <SearchIcon className={classes.searchIcon} fill="#ED6D91" height="15px" />
          </IconButton>
        </Grid>
        <Button
          variant="contained"
          disableElevation
          startIcon={<FilterList height="15px" fill="#FFF" />}
          className={classes.searchButton}
        >
          Filtrer
        </Button>
      </div>
      <DocumentTable documentLines={documentLines} documents={documents} page={page} />
      <Pagination
        className={classes.pagination}
        count={Math.ceil(documents.length / documentLines)}
        shape="rounded"
        onChange={handleChange}
      />
    </Grid>
  )
}
PatientDocs.propTypes = {
  patientId: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string,
      type: PropTypes.string,
      description: PropTypes.string.isRequired,
      status: PropTypes.string,
      docStatus: PropTypes.string.isRequired,
      securityLabel: PropTypes.arrayOf(
        PropTypes.shape({
          coding: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string }))
        })
      ),
      content: PropTypes.arrayOf(
        PropTypes.shape({
          attachment: PropTypes.shape({ url: PropTypes.string.isRequired })
        })
      ).isRequired
    })
  ).isRequired
}
export default PatientDocs
