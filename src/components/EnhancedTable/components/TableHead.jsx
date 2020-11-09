import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Checkbox from '@material-ui/core/Checkbox'
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox'
// Example:
// const headCells = [
//   { id: 'name',     numeric: false, disablePadding: true,  label: 'Dessert (100g serving)' },
//   { id: 'calories', numeric: true,  disablePadding: false, label: 'Calories' },
//   { id: 'fat',      numeric: true,  disablePadding: false, label: 'Fat (g)' },
//   { id: 'carbs',    numeric: true,  disablePadding: false, label: 'Carbs (g)' },
//   { id: 'protein',  numeric: true,  disablePadding: false, label: 'Protein (g)' },
// ];

function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props
  const headCells = props.headCells ? props.headCells : []

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        {!props.noCheckbox && (
          <TableCell align="center" padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              indeterminateIcon={<IndeterminateCheckBoxIcon color="primary" />}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ 'aria-label': 'select all desserts' }}
            />
          </TableCell>
        )}
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id || Math.random()}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              hideSortIcon={headCell.disableOrderBy}
              classes={{ root: classes.tableHeadLabel, active: classes.tableHeadActiveLabel }}
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'desc'}
              onClick={headCell.disableOrderBy ? null : createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
}

export default EnhancedTableHead
