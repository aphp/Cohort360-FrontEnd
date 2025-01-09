import React from 'react'
import { CircularProgress, Grid, Typography } from '@mui/material'
import DataTable from 'components/ui/Table'
import { LoadingStatus } from 'types'
import { Table } from 'types/table'
import { OrderBy } from 'types/searchCriterias'

type DataSectionProps = {
  data: Table
  orderBy: OrderBy
  loadingStatus: LoadingStatus
  onSort: (orderBy: OrderBy) => void
}

const DataSection = ({ data, orderBy, loadingStatus, onSort }: DataSectionProps) => {
  return (
    <Grid container justifyContent="center" item xs={12}>
      {loadingStatus === LoadingStatus.FETCHING && <CircularProgress />}
      {data.rows && loadingStatus === LoadingStatus.SUCCESS && (
        <>
          {data.rows.length < 1 && <Typography variant="button">Aucun patient à afficher</Typography>}
          {data.rows.length > 0 && <DataTable value={data} orderBy={orderBy} onSort={onSort} />}
        </>
      )}
    </Grid>
  )
}

export default DataSection
