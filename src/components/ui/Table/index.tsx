import React from 'react'
import { Table as TableType } from 'types/table'
import {
  Table as TableMui,
  Grid,
  Paper,
  TableBody,
  TableContainer,
  TableHead,
  TableSortLabel,
  Typography
} from '@mui/material'
import TableRow from './TableRow'

type TableProps = {
  value: TableType
}

const Table = ({ value }: TableProps) => {
  return (
    <TableContainer component={Paper}>
      <TableMui>
        <TableHead></TableHead>
        <TableBody>
          {value.rows.map((row, index) => (
            <TableRow row={row} sx={index % 2 === 0 ? {} : { backgroundColor: '#f3f5f9' }} />
          ))}
        </TableBody>
      </TableMui>
    </TableContainer>
  )
}

export default Table
