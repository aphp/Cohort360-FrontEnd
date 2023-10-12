import React, { useState } from 'react'

import {
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'

import DataTable from './DataTable'

import { CohortImaging, Column } from 'types'

import useStyles from './styles'

type DataTableImagingProps = {
  loading: boolean
  deidentified: boolean
  imagingList?: CohortImaging[]
  page?: number
  setPage?: (page: number) => void
  total?: number
}

const DataTableImaging: React.FC<DataTableImagingProps> = ({
  loading,
  deidentified,
  imagingList,
  page,
  setPage,
  total
}) => {
  const columns: Column[] = [
    { label: '', align: 'left' },
    { label: `NDA${deidentified ? 'chiffré' : ''}`, align: 'left' },
    { label: 'Date' },
    { label: 'Modalité' },
    { label: 'Description' },
    { label: 'Procédure' },
    { label: 'Nombre de séries' },
    { label: "Nombre d'instances" },
    { label: 'Access number' },
    { label: 'Document' }
  ]

  return (
    <DataTable columns={columns} page={page} setPage={setPage} total={total}>
      {!loading && imagingList && imagingList.length > 0 ? (
        <>
          {imagingList.map((imagingItem) => {
            return <DataTableImagingLine key={imagingItem.id} imagingItem={imagingItem} deidentified={deidentified} />
          })}
        </>
      ) : (
        <TableRow
        // className={classes.emptyTableRow}
        >
          <TableCellWrapper colSpan={10} align="left">
            <Grid container justifyContent="center">
              {loading ? <CircularProgress /> : <Typography variant="button">Aucun résultat à afficher</Typography>}
            </Grid>
          </TableCellWrapper>
        </TableRow>
      )}
    </DataTable>
  )
}

const DataTableImagingLine: React.FC<{
  deidentified: boolean
  imagingItem: CohortImaging
}> = ({ deidentified, imagingItem }) => {
  const { classes } = useStyles()
  const [open, setOpen] = useState(false)

  const nda = imagingItem.NDA
  const date = imagingItem.started ? new Date(imagingItem.started).toLocaleDateString('fr-FR') : 'Date inconnue'
  const modality = imagingItem.modality?.map((modality) => modality.code).join(' / ')
  const description = imagingItem.description
  const procedure = imagingItem.procedureCode?.[0].coding?.[0].code
  const nbSeries = imagingItem.numberOfSeries
  const nbInstances = imagingItem.numberOfInstances
  const accessNumber = imagingItem.identifier?.find((identifier) => identifier.system?.includes('accessNumber'))?.value
  const doc = ''

  return (
    <>
      <TableRow key={imagingItem.id} className={classes.tableBodyRows}>
        <TableCellWrapper>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCellWrapper>
        <TableCellWrapper align="left">{nda}</TableCellWrapper>
        <TableCellWrapper>{date}</TableCellWrapper>
        <TableCellWrapper>{modality}</TableCellWrapper>
        <TableCellWrapper className={classes.libelle}>{description}</TableCellWrapper>
        <TableCellWrapper className={classes.libelle}>{procedure}</TableCellWrapper>
        <TableCellWrapper>{nbSeries}</TableCellWrapper>
        <TableCellWrapper>{nbInstances}</TableCellWrapper>
        {!deidentified && <TableCellWrapper>{accessNumber}</TableCellWrapper>}
        <TableCellWrapper>{doc}</TableCellWrapper>
      </TableRow>
      <TableRow>
        <TableCellWrapper colSpan={10} style={{ padding: 0, borderBottom: 0, backgroundColor: '#e6f1fd66' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <InnerDataTableImaging imagingItem={imagingItem} />
          </Collapse>
        </TableCellWrapper>
      </TableRow>
    </>
  )
}

const InnerDataTableImaging: React.FC<{
  imagingItem: CohortImaging
}> = ({ imagingItem }) => {
  const subColumns: Column[] = [
    { label: 'N°' },
    { label: 'Date' },
    { label: 'Modalité' },
    { label: 'Description' },
    { label: 'Protocole' },
    { label: 'Partie du corps' }
  ]

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          {subColumns.map(
            (column, index) =>
              column.multiple === undefined && (
                <TableCellWrapper style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: 10 }} key={index}>
                  {column.label}
                </TableCellWrapper>
              )
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {imagingItem.series?.map((serie, index) => (
          <TableRow key={serie.uid}>
            <TableCellWrapper>{index + 1}</TableCellWrapper>
            <TableCellWrapper>
              {serie.started ? new Date(serie.started).toLocaleDateString('fr-FR') : 'Date inconnue'}
            </TableCellWrapper>
            <TableCellWrapper>{serie.modality.code}</TableCellWrapper>
            <TableCellWrapper>{serie.description}</TableCellWrapper>
            <TableCellWrapper>{'-'}</TableCellWrapper>
            <TableCellWrapper>{serie.bodySite?.display}</TableCellWrapper>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default DataTableImaging
