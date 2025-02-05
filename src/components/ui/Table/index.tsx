import React from 'react'
import { Table as TableType } from 'types/table'
import { Table as TableMui, Paper, TableBody, TableContainer } from '@mui/material'
import TableRow from './TableRow'
import TableHead from './TableHead'
import { OrderBy } from 'types/searchCriterias'

type TableProps = {
  value: TableType
  orderBy: OrderBy
  onSort: (orderBy: OrderBy) => void
}

const Table = ({ value, orderBy, onSort }: TableProps) => {
  return (
    <TableContainer component={Paper}>
      <TableMui>
        <TableHead
          columns={value.columns}
          sx={{
            height: 42,
            backgroundColor: '#E6F1FD',
            textTransform: 'uppercase',
            borderBottom: '2px solid',
          }}
          orderBy={orderBy}
          onSort={onSort}
        />
        <TableBody>
          {value.rows.map((row, index) => (
            <TableRow
              row={row}
              sx={
                index % 2 === 0
                  ? { borderBottom: '1px solid grey' }
                  : { backgroundColor: '#f8f8f8', borderBottom: '1px solid #f8f8f8' }
              }
            />
          ))}
        </TableBody>
      </TableMui>
    </TableContainer>
  )
}

export default Table
