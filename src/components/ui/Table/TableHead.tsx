import React from 'react'
import { Column } from 'types/table'
import {
  Box,
  Checkbox,
  SxProps,
  TableCell,
  TableHead as TableHeadMui,
  TableRow,
  TableSortLabel,
  Theme,
  Tooltip
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { Direction, Order, OrderBy } from 'types/searchCriterias'

type RowProps = {
  columns: Column[]
  sx?: SxProps<Theme>
  orderBy?: OrderBy
  onSort?: (orderBy: OrderBy) => void
}

export const renderTableHeadCellContent = (col: Column, orderBy?: OrderBy, onSort?: (orderBy: OrderBy) => void) => {
  if (col.isCheckbox) {
    return (
      <Checkbox
        size="small"
        checked={col.checkboxProps?.isChecked}
        indeterminate={col.checkboxProps?.isIndeterminate}
        onChange={col.checkboxProps?.onSelectAll}
      />
    )
  }

  if (orderBy && col.code) {
    const isActive = orderBy.orderBy === col.code
    const direction = isActive && orderBy.orderDirection === Direction.DESC ? Direction.DESC : Direction.ASC
    const handleClick = () => {
      onSort?.({
        orderBy: col.code as Order,
        orderDirection: isActive && direction === Direction.ASC ? Direction.DESC : Direction.ASC
      })
    }

    return (
      <TableSortLabel active={isActive} direction={direction} onClick={handleClick}>
        {col.label}
      </TableSortLabel>
    )
  }

  if (col.tooltip) {
    return (
      <Box display="flex" alignItems="center" gap={0.2}>
        {col.label}
        <Tooltip title={col.tooltip}>
          <InfoIcon fontSize="small" htmlColor="#5bc5f4" />
        </Tooltip>
      </Box>
    )
  }

  return col.label
}

const TableHead = ({ columns, orderBy, sx, onSort }: RowProps) => {
  return (
    <TableHeadMui>
      <TableRow sx={{ ...sx }}>
        {columns.map((col, index) => (
          <TableCell
            sx={{
              fontSize: 12,
              fontWeight: 600,
              padding: index === 0 ? '4px 8px 4px 12px' : index === columns.length - 1 ? '4px 12px 4px 8px' : '4px 8px',
              ...sx
            }}
            size="small"
            key={index}
            align={col.align ?? 'left'}
          >
            {renderTableHeadCellContent(col, orderBy, onSort)}
          </TableCell>
        ))}
      </TableRow>
    </TableHeadMui>
  )
}

export default TableHead
