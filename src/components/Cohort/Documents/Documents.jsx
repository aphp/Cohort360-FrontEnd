import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Pagination from '@material-ui/lab/Pagination'

import DocumentFilters from '../../Filters/DocumentFilters/DocumentFilters'
import DocumentList from './DocumentList/DocumentList'
// import WordCloud from '../Preview/Charts/WordCloud'
import DocumentSearchHelp from '../../DocumentSearchHelp/DocumentSearchHelp'
import { fetchDocuments } from '../../../services/cohortInfos'

import InfoIcon from '@material-ui/icons/Info'
import { ReactComponent as SearchIcon } from '../../../assets/icones/search.svg'
import { ReactComponent as FilterList } from '../../../assets/icones/filter.svg'

import useStyles from './style'

const Documents = ({ groupId, total, docs,
//  wordcloud,
  loading }) => {
  const classes = useStyles()
  const [page, setPage] = useState(1)
  const [totalDocs, setTotalDocs] = useState(total)
  const [documents, setDocuments] = useState(docs)
  const [loadingStatus, setLoadingStatus] = useState(loading)
  const [searchInput, setSearchInput] = useState('')
  const [searchMode, setSearchMode] = useState(false)
  // const [wordcloudData, setWordcloudData] = useState(wordcloud)
  const [open, setOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [nda, setNda] = useState('')
  const [selectedDocTypes, setSelectedDocTypes] = useState(['all'])

  const documentLines = 20

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
    fetchDocuments(value || 1, groupId, searchInput, selectedDocTypes, nda)
      .then(({ docsTotal, docsList
      // , wordcloudData
      }) => {
        setDocuments(docsList)
        // if (wordcloudData) {
        //   setWordcloudData(wordcloudData)
        // }
        setTotalDocs(docsTotal)
      })
      .catch((error) => console.log(error))
      .then(() => {
        setLoadingStatus(false)
      })
  }

  const onSearchDocument = () => {
    if (searchInput !== '') {
      setSearchMode(true)
    } else {
      setSearchMode(false)
    }
    handleChangePage(1)
  }

  const onKeyDown = async (e) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchDocument()
    }
  }

  useEffect(() => {
    setDocuments(documents)
  }, [documents])

  return (
    <Grid container maxwidth="xs" direction="column" alignItems="center">
      <CssBaseline />
      <Grid container item xs={11} justify="space-between">
        <Typography variant="h2" className={classes.pageTitle}>
          Documents cliniques
        </Typography>
        {/* <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.chartOverlay}>
              <Grid container item className={classes.chartTitle}>
                <Typography variant="h3" color="primary">
                  Mots les plus fréquents
                </Typography>
              </Grid>
              <WordCloud wordcloudData={wordcloudData[0].extension} />
            </Paper>
          </Grid>
        </Grid> */}
        <Grid container item justify="flex-end"
        // className={classes.tableGrid}
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
            documents={documents}
            page={page}
            loading={loadingStatus}
            searchMode={searchMode}
            showIpp={true}
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
      </Grid>
    </Grid>
  )
}

Documents.propTypes = {
  groupId: PropTypes.string,
  total: PropTypes.number,
  docs: PropTypes.array,
  // wordcloud: PropTypes.array,
  loading: PropTypes.bool
}

export default Documents
