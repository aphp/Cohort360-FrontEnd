import React from 'react'
import { CircularProgress, Grid, Typography } from '@mui/material'
import DataTable from 'components/ui/Table'
import { Table } from 'types/table'
import { OrderBy } from 'types/searchCriterias'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import { Pagination } from 'components/ui/Pagination'
import { ExplorationCount } from '../useData'

type DataSectionProps = {
  data: Table
  count: ExplorationCount | null
  orderBy: OrderBy
  isLoading: boolean
  pagination: { currentPage: number; total: number }
  onChangePage: (page: number) => void
  onSort: (orderBy: OrderBy) => void
}

const DataSection = ({ data, count, orderBy, isLoading, pagination, onChangePage, onSort }: DataSectionProps) => {
  return (
    <Grid container justifyContent="center" item xs={12}>
      {isLoading && <CircularProgress />}
      {data.rows && !isLoading && (
        <>
          {data.rows.length < 1 && <Typography variant="button">Aucune donnée à afficher</Typography>}
          {data.rows.length > 0 && (
            <Grid container gap={2} alignItems="center">
              {count?.ressource && (
                <DisplayDigits nb={count.ressource.results} total={count.ressource.total} label={'élément(s)'} />
              )}
              {count?.ressource && count.patients && <Typography fontSize={15}>concernant</Typography>}
              {count?.patients && (
                <DisplayDigits nb={count.patients.results} total={count.patients.total} label={'patient(s)'} />
              )}

              <DataTable value={data} orderBy={orderBy} onSort={onSort} />
              {
                <Grid
                  container
                  justifyContent="center"
                  style={{
                    position: 'fixed',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    width: '100%'
                  }}
                >
                  <Pagination
                    color="#303030"
                    count={pagination.total}
                    currentPage={pagination.currentPage}
                    onPageChange={onChangePage}
                  />
                </Grid>
              }
            </Grid>
          )}
        </>
      )}
    </Grid>
  )
}

export default DataSection
