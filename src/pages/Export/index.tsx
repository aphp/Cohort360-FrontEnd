import React, { useState, useEffect, useCallback } from 'react'

import { Grid, CssBaseline, Typography, Button, TableCell, TableRow } from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import HeaderPage from 'components/ui/HeaderPage'
import DataTable from 'components/DataTable/DataTable'

import { useAppSelector } from 'state'

import sideBarTransition from 'styles/sideBarTransition'

import apiBackend from 'services/apiBackend'

const exportColumnsTable = [
  { label: 'N° de cohorte', key: 'cohort_id' },
  { label: 'Nom de la cohorte', key: 'cohort_name' },
  { label: "Nom de l'export", key: 'target_name' },
  { label: 'Nombre de patient', key: 'patients_count' },
  { label: 'Format', key: 'output_format' },
  { label: 'Date de l’export', key: 'created_at' },
  { label: 'Statut', key: 'request_job_status' }
]

type DataTableLineProps = {
  exportList: any
  exportColumnsTable: any
}

const DataTableLine = ({ exportList, exportColumnsTable }: DataTableLineProps) => {
  console.log('manelle exportList', exportList)
  console.log('manelle exportColumnsTable', exportColumnsTable)

  const test = [
    {
      cohort_id: '20018562',
      cohort_name: 'ParvoDrep',
      created_at: '2024-07-02T15:51:16.950031Z',
      output_format: 'csv',
      owner: 'Berengere KOEHL (3141902)',
      patients_count: 309,
      request_job_status: 'finished',
      target_datalab: null,
      target_name: '3141902_20240702_155116947606'
    },
    {
      cohort_id: '20019254',
      cohort_name: 'pyeloobs n10',
      created_at: '2024-09-20T16:20:05.000190Z',
      output_format: 'csv',
      owner: 'Aurore RODRIGUES (4010112)',
      patients_count: 137,
      request_job_status: 'finished',
      target_datalab: null,
      target_name: '4010112_20240920_162004997167'
    }
  ]

  console.log('manelle test', test)

  return (
    <>
      {test.map((exportLine: any, index: number) => (
        <TableRow key={index}>
          {exportColumnsTable.map((column: any, index: number) => (
            <TableCellWrapper key={index}>{exportLine[column.key]}</TableCellWrapper>
          ))}
        </TableRow>
      ))}
    </>
  )
}

const Export: React.FC = () => {
  const { classes, cx } = sideBarTransition()
  const openDrawer = useAppSelector((state) => state.drawer)
  const [count, setCount] = useState<number>(0)
  const [exportList, setExportList] = useState<any>(null)

  const fetchExportList = useCallback(async () => {
    const response = await apiBackend.get('/exports/?limit=100')
    setExportList(response)
  }, [])

  useEffect(() => {
    fetchExportList()
  }, [fetchExportList])

  return (
    <Grid
      container
      direction="column"
      className={cx(classes.appBar, {
        [classes.appBarShift]: openDrawer
      })}
    >
      <Grid container justifyContent="center" alignItems="center">
        <CssBaseline />
        <Grid container item xs={11}>
          <HeaderPage id="export-page-title" title="Mes exports" />
          <DataTable columns={exportColumnsTable}>
            <DataTableLine exportList={exportList} exportColumnsTable={exportColumnsTable} />
          </DataTable>
          <Typography>{count}</Typography>
          <Button onClick={() => setCount(count + 2)}>augmente le count</Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Export
