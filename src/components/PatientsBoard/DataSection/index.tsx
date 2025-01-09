import React from 'react'
import { CircularProgress, Grid, Typography } from '@mui/material'
import DataTable from 'components/ui/Table'
import { LoadingStatus } from 'types'
import { Table } from 'types/table'

type DataSectionProps = {
  data: Table
  deidentified: boolean
  loadingStatus: LoadingStatus
}

const DataSection = ({ data, deidentified, loadingStatus }: DataSectionProps) => {
  return (
    <Grid item xs={12}>
      {loadingStatus === LoadingStatus.FETCHING && <CircularProgress />}
      {loadingStatus === LoadingStatus.SUCCESS && !data.rows.length && (
        <Typography variant="button">Aucun patient à afficher</Typography>
      )}
      {loadingStatus === LoadingStatus.SUCCESS && data.rows.length && <DataTable value={data} />}
      {/*
        <DataTablePatient
          loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
          // groupId={groupId}
          deidentified={deidentified ?? false}
          patientsList={data}
          orderBy={orderBy}
          setOrderBy={(orderBy) => changeOrderBy(orderBy)}
          page={page}
          setPage={(newPage) => setPage(newPage)}
          total={patientsResult.nb}
        />
  */}
    </Grid>
  )
}

export default DataSection
