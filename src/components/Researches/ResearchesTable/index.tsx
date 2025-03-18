import React, { ReactNode } from 'react'

import { Grid, Table, TableBody, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from '@mui/material'
import { Pagination } from 'components/ui/Pagination'
import { TableCellWrapper } from './styles'

import { Column } from 'types'
import { Direction, OrderBy, Order } from 'types/searchCriterias'

type ResearchesTableProps = {
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

// TODO: temp, à merge avec l'autre datatable ou si qqn à fait un générique

const ResearchesTable: React.FC<ResearchesTableProps> = ({
  columns,
  order,
  setOrder,
  page,
  setPage,
  rowsPerPage,
  total,
  noPagination,
  children
}) => {
  const createSortHandler = (property: Order) => () => {
    if (setOrder) {
      setOrder({
        orderBy: property,
        orderDirection: order?.orderDirection === Direction.ASC ? Direction.DESC : Direction.ASC
      })
    }
  }
  return (
    <Grid container justifyContent="center" marginBottom={noPagination ? 0 : 8}>
      {total === 0 ? (
        <Typography>Aucun résultat à afficher</Typography>
      ) : (
        <>
          <TableContainer>
            <Table style={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ borderRadius: '4px', overflow: 'clip' }}>
                  {columns.map((column, index) => (
                    <TableCellWrapper
                      key={index}
                      sortDirection={order?.orderBy === column.code ? order?.orderDirection : false}
                      align={column.align}
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
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>{children}</TableBody>
            </Table>
          </TableContainer>

          {noPagination !== true && (
            <Grid
              container
              justifyContent="center"
              style={{ position: 'fixed', bottom: 0, right: 0, backgroundColor: '#FFF' }}
            >
              <Pagination
                count={Math.ceil((total ?? 0) / (rowsPerPage ?? 20))}
                currentPage={page ?? 0}
                onPageChange={(page: number) => setPage && setPage(page)}
              />
            </Grid>
          )}
        </>
      )}
    </Grid>
  )
}

export default ResearchesTable
