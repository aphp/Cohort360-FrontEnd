import React from 'react'
import { Table as TableType } from 'types/table'
import { Table as TableMui, TableBody, TableContainer, SxProps, Theme } from '@mui/material'
import TableRow from './TableRow'
import TableHead from './TableHead'
import { OrderBy } from 'types/searchCriterias'

type TableProps = {
  value: TableType
  orderBy?: OrderBy
  onSort?: (orderBy: OrderBy) => void
  sxColumn?: SxProps<Theme>
  sxRow?: SxProps<Theme>
}

const Table = ({ value, orderBy, onSort, sxColumn, sxRow }: TableProps) => {
  return (
    <TableContainer>
      <TableMui>
        <TableHead
          columns={value.columns}
          sx={{
            height: 42,
            backgroundColor: '#E6F1FD',
            textTransform: 'uppercase',
            borderBottom: '2px solid',
            ...sxColumn
          }}
          orderBy={orderBy}
          onSort={onSort}
        />
        <TableBody>
          {value.rows.map((row, index) => (
            <TableRow
              key={index}
              row={row}
              sx={
                index % 2 === 0
                  ? { borderBottom: '1px solid grey', height: 42, ...sxRow }
                  : { backgroundColor: '#f8f8f8', borderBottom: '1px solid grey', height: 42, ...sxRow }
              }
            />
          ))}
        </TableBody>
      </TableMui>
    </TableContainer>
  )
}

export default Table
