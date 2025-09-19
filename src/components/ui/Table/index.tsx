import React from 'react'
import { Table as TableType } from 'types/table'
import {
  Table as TableMui,
  TableBody,
  TableContainer,
  TableRow as TableRowMui,
  SxProps,
  Theme,
  Typography
} from '@mui/material'
import TableRow from './TableRow'
import TableHead from './TableHead'
import { OrderBy } from 'types/searchCriterias'
import { TableCellWrapper } from './styles'

type TableProps = {
  value: TableType
  orderBy?: OrderBy
  onSort?: (orderBy: OrderBy) => void
  sxColumn?: SxProps<Theme>
  noMarginBottom?: boolean
}

const Table = ({ value, orderBy, onSort, sxColumn, noMarginBottom }: TableProps) => {
  return (
    <TableContainer sx={{ borderRadius: 1, marginBottom: noMarginBottom ? 0 : 5 }}>
      <TableMui>
        <TableHead
          columns={value.columns}
          sx={{
            height: 42,
            fontSize: 11,
            fontWeight: 700,
            backgroundColor: '#E6F1FD',
            textTransform: 'uppercase',
            ...sxColumn
          }}
          orderBy={orderBy}
          onSort={onSort}
        />
        <TableBody>
          {value.rows.length === 0 && (
            <TableRowMui>
              <TableCellWrapper colSpan={value.columns.length}>
                <Typography align="center" p={2}>
                  Aucune donnée à afficher
                </Typography>
              </TableCellWrapper>
            </TableRowMui>
          )}
          {value.rows.map((row, index) => (
            <TableRow
              key={index}
              row={row}
              sx={{
                height: 42,
                '&:hover': { backgroundColor: '#f8f9fa' },
                cursor: row._onClick ? 'pointer' : 'inherit',
                ...row.sx
              }}
            />
          ))}
        </TableBody>
      </TableMui>
    </TableContainer>
  )
}

export default Table
