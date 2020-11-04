import React, { useEffect, useState } from 'react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Grid from '@material-ui/core/Grid'
import TableContainer from '@material-ui/core/TableContainer'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Pagination from '@material-ui/lab/Pagination'
import useStyles from './styles'
import PropTypes from 'prop-types'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'

import PMSIFilters from '../../Filters/PMSIFilters/PMSIFilters'
import { ReactComponent as SearchIcon } from '../../../assets/icones/search.svg'
import { ReactComponent as FilterList } from '../../../assets/icones/filter.svg'

import { fetchPMSI } from '../../../services/patient'

const PatientPMSI = ({ patientId, diagnostic, ccam, ghm }) => {
  const classes = useStyles()
  const [selectedTab, selectTab] = useState('CIM10')
  const [data, setData] = useState([])
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [open, setOpen] = useState(false)
  const [nda, setNda] = useState('')
  const [code, setCode] = useState('')

  const documentLines = 20 // Number of desired lines in the document array
  const diagTotal = diagnostic.total || 0
  const ccamTotal = ccam.total || 0
  const ghmTotal = ghm.total || 0

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const handleCloseDialog = () => {
    setOpen(false)
    handleChangePage(1)
  }

  const handleChangeSearchInput = (event) => {
    setSearchInput(event.target.value)
  }

  const handleChangeNdaInput = (event) => {
    setNda(event.target.value)
  }

  const handleChangeCodeInput = (event) => {
    setCode(event.target.value)
  }

  const handleChangePage = (event, value) => {
    setPage(value ? value : 1)
    setLoadingStatus(true)
    fetchPMSI(value ? value : 1, patientId, selectedTab, searchInput, nda, code)
      .then(({ pmsiData, pmsiTotal }) => {
        setData(pmsiData.entry)
        setTotal(pmsiTotal)
      })
      .catch((error) => console.log(error))
      .then(() => setLoadingStatus(false))
  }

  const onSearchPMSI = async () => {
    handleChangePage(1)
  }

  const onKeyDown = async (e) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchPMSI()
    }
  }

  useEffect(() => {
    setPage(1)
    setSearchInput('')
    switch (selectedTab) {
      case 'CIM10':
        setData(diagnostic.entry)
        setTotal(diagnostic.total)
        break
      case 'CCAM':
        setData(ccam.entry)
        setTotal(ccam.total)
        break
      case 'GHM':
        setData(ghm.entry)
        setTotal(ghm.total)
        break
      default:
        setData([])
        break
    }
  }, [patientId, selectedTab])

  return (
    <Grid
      container
      item
      xs={11}
      justify="flex-end"
      className={classes.documentTable}
    >
      <Grid item container justify="space-between" alignItems="center">
        <Tabs
          classes={{
            root: classes.root,
            indicator: classes.indicator
          }}
          value={selectedTab}
          onChange={(event, value) => selectTab(value)}
        >
          <Tab
            classes={{ selected: classes.selected }}
            className={classes.tabTitle}
            label="Diagnostics CIM10"
            value="CIM10"
          />
          <Tab
            classes={{ selected: classes.selected }}
            className={classes.tabTitle}
            label="Actes CCAM"
            value="CCAM"
          />
          <Tab
            classes={{ selected: classes.selected }}
            className={classes.tabTitle}
            label="GHM"
            value="GHM"
          />
        </Tabs>
        <Typography variant="button">
          {total || 0} /{' '}
          {selectedTab === 'CIM10'
            ? `${diagTotal} diagnostic(s)`
            : selectedTab === 'CCAM'
            ? `${ccamTotal} acte(s)`
            : `${ghmTotal} GHM`}
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
              onChange={handleChangeSearchInput}
              onKeyDown={onKeyDown}
            />
            <IconButton
              type="submit"
              aria-label="search"
              onClick={onSearchPMSI}
            >
              <SearchIcon
                className={classes.searchIcon}
                fill="#ED6D91"
                height="15px"
              />
            </IconButton>
          </Grid>
          <Button
            variant="contained"
            disableElevation
            startIcon={<FilterList height="15px" fill="#FFF" />}
            className={classes.searchButton}
            onClick={handleOpenDialog}
          >
            Filtrer
          </Button>
          <PMSIFilters
            open={open}
            onClose={() => setOpen(false)}
            onSubmit={handleCloseDialog}
            nda={nda}
            onChangeNda={handleChangeNdaInput}
            code={code}
            onChangeCode={handleChangeCodeInput}
          />
        </div>
      </Grid>
      {loadingStatus ? (
        <Grid container justify="center">
          <CircularProgress />
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell align="left" className={classes.tableHeadCell}>
                  NDA
                </TableCell>
                <TableCell align="left" className={classes.tableHeadCell}>
                  Codage le
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  Code
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  Libellé
                </TableCell>
                {selectedTab === 'CIM10' && (
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Type
                  </TableCell>
                )}
                <TableCell align="center" className={classes.tableHeadCell}>
                  Unité exécutrice
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data ? (
                <>
                  {data.map((row) => {
                    if (row.resource_type !== 'OperationOutcome') {
                      return (
                        <TableRow
                          className={classes.tableBodyRows}
                          key={row.id}
                        >
                          <TableCell align="left">{row.NDA}</TableCell>
                          <TableCell align="left">
                            {row.performed
                              ? new Date(
                                  row.performed[0].performedDateTime
                                ).toLocaleDateString('fr-FR')
                              : row.meta
                              ? new Date(
                                  row.meta.lastUpdated
                                ).toLocaleDateString('fr-FR')
                              : 'unknown'}
                          </TableCell>
                          <TableCell align="center">
                            {row.diagnosis
                              ? row.diagnosis[0].packageCode.coding[0].code
                              : row.class?.code || row.code?.coding[0].code}
                          </TableCell>
                          <TableCell align="center" className={classes.libelle}>
                            {row.diagnosis
                              ? row.diagnosis[0].packageCode.coding[0].display
                              : row.class?.code || row.code?.coding[0].display}
                          </TableCell>
                          {selectedTab === 'CIM10' && (
                            <TableCell align="center">
                              {row.extension
                                ? row.extension[0].valueString
                                : '-'}
                            </TableCell>
                          )}
                          <TableCell align="center">
                            {row.serviceProvider}
                          </TableCell>
                        </TableRow>
                      )
                    }
                  })}
                </>
              ) : (
                <Grid container justify="center">
                  <Typography variant="button">
                    Aucun document à afficher
                  </Typography>
                </Grid>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Pagination
        className={classes.pagination}
        count={Math.ceil(total / documentLines)}
        shape="rounded"
        onChange={handleChangePage}
        page={page}
      />
    </Grid>
  )
}

PatientPMSI.propTypes = {
  patientId: PropTypes.string,
  diagnosis: PropTypes.array,
  ccam: PropTypes.object,
  ghm: PropTypes.object
}
export default PatientPMSI
