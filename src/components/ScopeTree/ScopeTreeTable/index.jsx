import React from 'react'
import useStyles from 'components/ScopeTree/ScopeTreeTable/styles'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'

import EnhancedTableHead from 'components/ScopeTree/ScopeTreeTable/components/TableHead'
import { getComparator, stableSort } from 'utils/alphabeticalSort'
import { Typography } from '@mui/material'

export default function EnhancedTable(props) {
  const rows = props.rows ? props.rows : []
  const selected = props.selected ? props.selected : []
  const setSelected = props.setSelected ? props.setSelected : () => null
  const onClickRow = props.onClickRow ? props.onClickRow : () => null
  const noPagination = props.noPagination ? props.noPagination : false
  const emptyRowsMessage = props.emptyRowsMessage
  const headCells = props.headCells

  const { classes } = useStyles()

  const [order, setOrder] = React.useState('desc')
  const [orderBy, setOrderBy] = React.useState(props.defaultSort || '_id')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'desc'
    setOrder(isAsc ? 'asc' : 'desc')
    setOrderBy(property)
  }

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(rows)
    } else {
      setSelected([])
    }
  }

  const handleClick = (event, _id) => {
    const selectedIndex = selected.indexOf(_id)
    let newSelected = []

    if (selectedIndex !== -1) {
      newSelected = selected.filter((selected) => selected !== _id)
    } else {
      newSelected = [...selected, _id]
    }
    setSelected(newSelected)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const emptyRows = noPagination ? 0 : rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage)

  return (
    <div className={classes.root}>
      <TableContainer>
        <Table className={classes.table} aria-labelledby="tableTitle" size={'medium'} aria-label="enhanced table">
          <EnhancedTableHead
            noCheckbox={props.noCheckbox}
            classes={classes}
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
            headCells={headCells}
          />

          <TableBody>
            {emptyRowsMessage ? (
              <TableRow>
                <TableCell colSpan={headCells.length}>
                  <Typography className={classes.loadingSpinnerContainer}>Aucun résultat à afficher</Typography>
                </TableCell>
              </TableRow>
            ) : noPagination !== true ? (
              stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => (
                  <React.Fragment key={index}>
                    {props.children(item, index, selected, handleClick, onClickRow)}
                  </React.Fragment>
                ))
            ) : (
              stableSort(rows, getComparator(order, orderBy)).map((item, index) => (
                <React.Fragment key={index}>
                  {props.children(item, index, selected, handleClick, onClickRow)}
                </React.Fragment>
              ))
            )}

            {emptyRows > 0 && (
              <TableRow style={{ height: 76 * emptyRows }}>
                <TableCell colSpan={props.headCells ? props.headCells.length + 1 : 0} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {noPagination !== true && !emptyRowsMessage && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </div>
  )
}
