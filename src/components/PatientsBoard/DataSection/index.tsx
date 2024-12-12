import { Grid } from '@mui/material'
import DataTablePatient from 'components/DataTable/DataTablePatient'
import React from 'react'
import { LoadingStatus } from 'types'

type DataSectionProps = {
  data: any[]
  deidentified: boolean
  loadingStatus: LoadingStatus
}

const DataSection = ({ data, deidentified, loadingStatus }: DataSectionProps) => {
  return (
    <Grid item xs={12}>
      {/*<DataTablePatient
        loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
       // groupId={groupId}
        deidentified={deidentified ?? false}
        patientsList={data}
        orderBy={orderBy}
        setOrderBy={(orderBy) => changeOrderBy(orderBy)}
        page={page}
        setPage={(newPage) => setPage(newPage)}
        total={patientsResult.nb}
  />*/}
    </Grid>
  )
}

export default DataSection
