import React, { ReactNode } from 'react'

import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from '@mui/material'
import { Pagination } from 'components/ui/Pagination'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import { Column } from 'types'
import { Direction, OrderBy, Order } from 'types/searchCriterias'
import useStyles from './styles'

type DataTableProps = {
  columns: Column[]
  order?: OrderBy
  setOrder?: (order: OrderBy) => void
  page?: number
  setPage?: (page: number) => void
  rowsPerPage?: number
  total?: number
  children: ReactNode
  noPagination?: boolean
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  order,
  setOrder,
  page,
  setPage,
  rowsPerPage,
  total,
  ...props
}) => {
  const { classes, cx } = useStyles()

  const createSortHandler = (property: Order) => () => {
    if (setOrder) {
      setOrder({
        orderBy: property,
        orderDirection: order?.orderDirection === Direction.ASC ? Direction.DESC : Direction.ASC
      })
    }
  }
  return (
    <Grid container justifyContent="flex-end" marginBottom={props.noPagination ? 1 : 8}>
      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow className={classes.tableHead}>
              {columns.map((column, index) =>
                column.multiple === undefined ? (
                  <TableCellWrapper
                    key={index}
                    sortDirection={order?.orderBy === column.code ? order?.orderDirection : false}
                    align={column.align}
                    className={classes.tableHeadCell}
                  >
                    {column.code ? (
                      <TableSortLabel
                        active={order?.orderBy === column.code}
                        direction={order?.orderBy === column.code ? order?.orderDirection : Direction.ASC}
                        onClick={createSortHandler(column.code as Order)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCellWrapper>
                ) : (
                  <TableCellWrapper align="left" key={index} className={classes.tableHeadCell}>
                    {column.multiple.map(
                      (subColumn, index) =>
                        subColumn.multiple === undefined && (
                          <React.Fragment key={index}>
                            {subColumn.code ? (
                              <TableSortLabel
                                className={classes.multiple}
                                active={order?.orderBy === subColumn.code}
                                direction={order?.orderBy === subColumn.code ? order?.orderDirection : Direction.ASC}
                                onClick={createSortHandler(subColumn.code as Order)}
                              >
                                {subColumn.label}
                              </TableSortLabel>
                            ) : (
                              <Typography
                                className={cx([classes.multiple, classes.tableHeadCell, classes.tableHeadLabel])}
                              >
                                {subColumn.label}
                              </Typography>
                            )}
                          </React.Fragment>
                        )
                    )}
                  </TableCellWrapper>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>{props.children}</TableBody>
        </Table>
      </TableContainer>

      {props.noPagination !== true && (
        <Grid
          container
          justifyContent="center"
          style={{ position: 'fixed', bottom: 0, right: 0, backgroundColor: '#E6F1FD' }}
        >
          <Pagination
            count={Math.ceil((total ?? 0) / (rowsPerPage ?? 20))}
            currentPage={page ?? 0}
            onPageChange={(page: number) => setPage && setPage(page)}
          />
        </Grid>
      )}
    </Grid>
  )
}

export default DataTable
