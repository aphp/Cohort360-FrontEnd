import React from 'react'
import { Column } from 'types/table'
import { SxProps, TableCell, TableHead as TableHeadMui, TableRow, TableSortLabel, Theme } from '@mui/material'
import { Direction, Order, OrderBy } from 'types/searchCriterias'

type RowProps = {
  columns: Column[]
  sx?: SxProps<Theme>
  orderBy?: OrderBy
  onSort?: (orderBy: OrderBy) => void
}

const TableHead = ({ columns, orderBy, sx, onSort }: RowProps) => {
  const handleChangeSort = (property: Order) => {
    if (onSort)
      onSort({
        orderBy: property,
        orderDirection: orderBy?.orderDirection === Direction.ASC ? Direction.DESC : Direction.ASC
      })
  }

  return (
    <TableHeadMui>
      <TableRow sx={{ ...sx }}>
        {columns.map((col, index) => (
          <TableCell
            sx={{
              fontSize: 12,
              fontWeight: 600,
              padding: index === 0 ? '6px 5px 6px 20px' : index === columns.length - 1 ? '6px 20px 6px 6px' : '6px 5px',
              whiteSpace: 'nowrap',
              ...sx
            }}
            size="small"
            key={col.label}
            align={col.align ?? 'left'}
          >
            {col.label}
            {orderBy && col.code && (
              <TableSortLabel
                active={orderBy.orderBy === col.code}
                direction={orderBy.orderBy === col.code ? orderBy?.orderDirection : Direction.ASC}
                onClick={() => handleChangeSort(col.code as Order)}
              />
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHeadMui>
  )
}

export default TableHead
