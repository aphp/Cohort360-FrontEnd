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
import DocumentViewer from 'components/DocumentViewer/DocumentViewer'
import { TableCellWrapper } from 'components/ui/TableCell/styles'
import { KeyboardArrowDown, KeyboardArrowUp, Visibility } from '@mui/icons-material'

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
    { label: `NDA${deidentified ? ' chiffré' : ''}`, align: 'left' },
    { label: 'Date' },
    { label: 'Modalité' },
    { label: 'Description' },
    { label: 'Procédure' },
    { label: 'Nombre de séries' },
    ...(!deidentified ? [{ label: 'Access number' }] : []),
    { label: 'Unité exécutrice' },
    { label: 'Comptes rendus' }
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
        <TableRow>
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
  const [openDoc, setOpenDoc] = useState(false)

  const nda = imagingItem.NDA ?? '-'
  const date = imagingItem.started ? new Date(imagingItem.started).toLocaleDateString('fr-FR') : 'Date inconnue'
  const modality = imagingItem.modality?.map((modality) => modality.code).join(' / ') ?? '-'
  const description = imagingItem.description ?? '-'
  const procedure = imagingItem.procedureCode?.[0]?.coding?.[0]?.code ?? '-'
  const nbSeries = imagingItem.numberOfSeries ?? '-'
  const accessNumber =
    imagingItem.identifier?.find((identifier) => identifier.system?.includes('accessNumber'))?.value ?? '-'
  const documentId = imagingItem.extension?.find((extension) => extension.url.includes('docId'))?.valueString
  const serviceProvider = imagingItem.serviceProvider

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
        {!deidentified && <TableCellWrapper>{accessNumber}</TableCellWrapper>}
        <TableCellWrapper>{serviceProvider}</TableCellWrapper>
        <TableCellWrapper>
          <IconButton onClick={() => setOpenDoc(!!documentId)} disabled={!documentId}>
            <Visibility height="30px" />
          </IconButton>

          <DocumentViewer
            deidentified={deidentified ?? false}
            open={openDoc}
            handleClose={() => setOpenDoc(false)}
            documentId={documentId ?? ''}
          />
        </TableCellWrapper>
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
    { label: "Nombre d'instances" },
    { label: 'Partie du corps' }
  ]

  const series = imagingItem.series?.slice()
  const sortedSeries = series?.sort((a, b) => (a.number ?? 0) - (b.number ?? 0))

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
      <TableBody style={{ backgroundColor: '#FFF' }}>
        {sortedSeries?.map((serie) => (
          <TableRow key={serie.uid}>
            <TableCellWrapper>{serie.number ?? '-'}</TableCellWrapper>
            <TableCellWrapper>
              {serie.started ? new Date(serie.started).toLocaleDateString('fr-FR') : 'Date inconnue'}
            </TableCellWrapper>
            <TableCellWrapper>{serie.modality?.code ?? '-'}</TableCellWrapper>
            <TableCellWrapper>{serie.description ?? '-'}</TableCellWrapper>
            <TableCellWrapper>{serie.extension?.[0].valueString ?? '-'}</TableCellWrapper>
            <TableCellWrapper>{serie.numberOfInstances ?? '-'}</TableCellWrapper>
            <TableCellWrapper>{serie.bodySite?.display ?? '-'}</TableCellWrapper>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default DataTableImaging
