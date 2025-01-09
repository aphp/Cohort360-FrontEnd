import React from 'react'
import { Column } from 'types/table'
import { SxProps, TableCell, TableHead as TableHeadMui, TableRow, TableSortLabel, Theme } from '@mui/material'
import { Direction, OrderBy } from 'types/searchCriterias'

type RowProps = {
  columns: Column[]
  sx?: SxProps<Theme>
  orderBy: OrderBy
  onSort: (orderBy: OrderBy) => void
}

const TableHead = ({ columns, orderBy, sx, onSort }: RowProps) => {
  /*const createSortHandler = (property: Order) => () => {
    setOrder({
      orderBy: property,
      orderDirection: order?.orderDirection === Direction.ASC ? Direction.DESC : Direction.ASC
    })
  }*/
  return (
    <TableHeadMui>
      <TableRow sx={{ ...sx }}>
        {columns.map((col) => (
          <TableCell
            sx={{ fontSize: 11, fontWeight: 600 }}
            size="small"
            key={col.label}
            // sortDirection={order?.orderBy === col.code ? order?.orderDirection : false}
            align="left"
            // className={classes.tableHeadCell}
          >
            {col.label}
            {col.code && (
              <TableSortLabel
                active={orderBy.orderBy === col.code}
                direction={orderBy.orderBy === col.code ? orderBy?.orderDirection : Direction.ASC}
                onClick={() => onSort({ orderBy: col.code, orderDirection: Direction.ASC })}
              />
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHeadMui>
  )
}

export default TableHead
