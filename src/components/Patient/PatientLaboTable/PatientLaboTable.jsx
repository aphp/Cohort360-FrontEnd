import React, { useState, useEffect } from 'react'
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

import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

const PatientLaboTable = ({ patient }) => {
  const classes = useStyles()

  const [page, setPage] = useState(1)
  const [labResults, setLabResults] = useState([])

  useEffect(() => {
    if (patient.labResults) {
      setLabResults(
        patient.labResults.map((labResult) => ({
          id: labResult.resource.id,
          type: labResult.resource.code.coding[0].display,
          sampleType: labResult.resource.bodySite ? labResult.resource.bodySite.coding[0].code : '-',
          date: new Date(labResult.resource.effectiveDateTime).toLocaleDateString('fr-FR'),
          value: labResult.resource.valueQuantity
            ? `${labResult.resource.valueQuantity.value} ${labResult.resource.valueQuantity.unit}`
            : labResult.resource.interpretation
            ? labResult.resource.interpretation[0].coding[0].code
            : '-'
        }))
      )
    }
  }, [patient])

  const labItemNumber = 5 //Number of desired lines in the lab item array
  const handleChange = (event, value) => {
    setPage(value)
  }

  return (
    <Grid container item xs={11} justify="flex-end" className={classes.labTable}>
      <div className={classes.labButtons}>
        <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
          <InputBase placeholder="Rechercher" className={classes.input} disabled />
          <IconButton type="submit" aria-label="search" disabled>
            <SearchIcon className={classes.searchIcon} fill="#ED6D91" height="15px" />
          </IconButton>
        </Grid>
        <Button
          variant="contained"
          disableElevation
          startIcon={<FilterList height="15px" fill="#FFF" />}
          className={classes.searchButton}
          disabled
        >
          Filtrer
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead className={classes.tableHead}>
            <TableRow>
              <TableCell align="left" className={classes.tableHeadCell}>
                Type d'analyse
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                Type de prélèvement
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                Date
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                Valeur
              </TableCell>
              {/* It would be possible to add information about practitioner here */}
            </TableRow>
          </TableHead>
          <TableBody>
            {labResults.slice((page - 1) * labItemNumber, page * labItemNumber).map((res) => {
              return (
                <TableRow className={classes.tableBodyRows} key={res.id}>
                  <TableCell align="left">{res.type}</TableCell>
                  <TableCell align="center">{res.sampleType}</TableCell>
                  <TableCell align="center">{res.date}</TableCell>
                  <TableCell align="center">{res.value}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        className={classes.pagination}
        count={Math.ceil(labResults.length / labItemNumber)}
        shape="rounded"
        onChange={handleChange}
      />
    </Grid>
  )
}

PatientLaboTable.propTypes = {
  patient: PropTypes.shape()
}
export default PatientLaboTable
