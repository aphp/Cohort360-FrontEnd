import React from 'react'
import { CircularProgress, Grid, Typography } from '@mui/material'
import DataTable from 'components/ui/Table'
import { LoadingStatus } from 'types'
import { Table } from 'types/table'
import { OrderBy } from 'types/searchCriterias'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import { Pagination } from 'components/ui/Pagination'
import LoadingText from 'components/ui/LoadingText'
import { Data } from '../useData'

type DataSectionProps = {
  data: Table
  infos: Data | null
  orderBy: OrderBy
  isLoading: boolean
  pagination: {currentPage: number, total: number}
  onChangePage: (page: number) => void
  onSort: (orderBy: OrderBy) => void
}

const DataSection = ({ data, infos, orderBy, isLoading, pagination, onChangePage, onSort }: DataSectionProps) => {
  return (
    <Grid container justifyContent="center" item xs={12}>
      {isLoading && <CircularProgress />}
      {data.rows && !isLoading && (
        <>
          {data.rows.length < 1 && <Typography variant="button">Aucun patient à afficher</Typography>}
          {data.rows.length > 0 && (
            <Grid container gap={2}>
              {infos && <DisplayDigits nb={infos.totalPatients} total={infos.totalAllPatients} label={'élément(s)'} />}

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
