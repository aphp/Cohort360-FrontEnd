import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import moment from 'moment'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'

import EnhancedTableToolbar from './components/Toolbar'
import EnhancedTableHead from './components/TableHead'

function descendingComparator(a, b, orderBy) {
  const dateA = moment(new Date(a[orderBy]))
  const dateB = moment(new Date(b[orderBy]))

  if (dateA.isValid() && dateB.isValid()) {
    return dateA.isSameOrBefore(dateB) ? -1 : 1
  }
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}

const useStyles = makeStyles(() => ({
  root: {
    width: '100%'
  },
  tableHeadLabel: {
    color: 'black'
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1
  }
}))

export default function EnhancedTable(props) {
  const rows = props.rows ? props.rows : []
  const selected = props.selected ? props.selected : []
  const setSelected = props.setSelected ? props.setSelected : () => null
  const onClickRow = props.onClickRow ? props.onClickRow : () => null
  const noPagination = props.noPagination ? props.noPagination : false

  const classes = useStyles()
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
      const newSelecteds = rows.map((n) => n._id)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const handleClick = (event, _id) => {
    const selectedIndex = selected.indexOf(_id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, _id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1))
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
      <EnhancedTableToolbar headTitle={props.headTitle} headAction={props.headAction} numSelected={selected.length} />
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
            headCells={props.headCells}
          />
          <TableBody>
            {noPagination !== true
              ? stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item, index) => (
                    <React.Fragment key={index}>
                      {props.children(item, index, selected, handleClick, onClickRow)}
                    </React.Fragment>
                  ))
              : stableSort(rows, getComparator(order, orderBy)).map((item, index) => (
                  <React.Fragment key={index}>
                    {props.children(item, index, selected, handleClick, onClickRow)}
                  </React.Fragment>
                ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 76 * emptyRows }}>
                <TableCell colSpan={props.headCells ? props.headCells.length + 1 : 0} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {noPagination !== true && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      )}
    </div>
  )
}
