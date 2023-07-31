import React from 'react'

import { CircularProgress, Grid, Typography, TableRow, TableCell } from '@mui/material'

import DataTable from 'components/DataTable/DataTable'

import { Column, Order, CohortObservation } from 'types'

import useStyles from './styles'

type DataTableObservationProps = {
  loading: boolean
  deidentified: boolean
  observationsList: CohortObservation[]
  order: Order
  setOrder?: (order: Order) => void
  page?: number
  setPage?: (page: number) => void
  total?: number
}
const DataTableObservation: React.FC<DataTableObservationProps> = ({
  loading,
  deidentified,
  observationsList,
  order,
  setOrder,
  page,
  setPage,
  total
}) => {
  const { classes } = useStyles()

  const columns: Column[] = [
    { label: `NDA${deidentified ? ' chiffré' : ''}`, code: '', align: 'left', sortableColumn: false },
    { label: 'Date de prélèvement', code: 'effectiveDatetime', align: 'center', sortableColumn: true },
    { label: 'ANABIO', code: 'codeSimple-anabio', align: 'center', sortableColumn: true },
    { label: 'LOINC', code: 'codeSimple-loinc', align: 'center', sortableColumn: true },
    { label: 'Résultat', code: '', align: 'center', sortableColumn: false },
    { label: 'Valeurs de référence', code: '', align: 'center', sortableColumn: false },
    { label: 'Unité exécutrice', code: '', align: 'center', sortableColumn: false }
  ]

  return (
    <DataTable
      columns={columns}
      order={order}
      setOrder={setOrder}
      rowsPerPage={20}
      page={page}
      setPage={setPage}
      total={total}
    >
      {!loading && observationsList?.length > 0 && (
        <>
          {observationsList.map((observation) => (
            <DataTableObservationLine key={observation.id} observation={observation} />
          ))}
        </>
      )}
      {!loading && observationsList?.length < 1 && (
        <TableRow className={classes.emptyTableRow}>
          <TableCell colSpan={7} align="left">
            <Grid container justifyContent="center">
              <Typography variant="button">Aucun résultat de biologie à afficher</Typography>
            </Grid>
          </TableCell>
        </TableRow>
      )}
      {loading && (
        <TableRow className={classes.emptyTableRow}>
          <TableCell colSpan={7} align="left">
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          </TableCell>
        </TableRow>
      )}
    </DataTable>
  )
}

const DataTableObservationLine: React.FC<{
  observation: CohortObservation
}> = ({ observation }) => {
  const { classes } = useStyles()

  const nda = observation.NDA
  const date = observation.effectiveDateTime
  const libelleANABIO = observation.code?.coding?.find((code) => code.id === 'CODE ANABIO')?.display
  const codeLOINC = observation.code?.coding?.find((code) => code.id === 'CODE LOINC')?.code
  const libelleLOINC = observation.code?.coding?.find((code) => code.id === 'CODE LOINC')?.display
  const result = observation.valueQuantity
    ? observation.valueQuantity.code
      ? observation.valueQuantity.code
      : observation.valueQuantity.value
      ? `${observation.valueQuantity.value} ${observation.valueQuantity.unit}`
      : '-'
    : '-'
  const valueUnit = observation.valueQuantity?.unit ?? ''
  const serviceProvider = observation.serviceProvider
  const referenceRangeArray = observation.referenceRange?.[0]
  const referenceRange = `${referenceRangeArray?.low?.value ?? '-'}${valueUnit} - ${
    referenceRangeArray?.high?.value ?? '-'
  }${valueUnit}`

  return (
    <TableRow className={classes.tableBodyRows} key={observation.id}>
      <TableCell align="left">{nda ?? 'Inconnu'}</TableCell>
      <TableCell align="center">{date ? new Date(date).toLocaleDateString('fr-FR') : 'Date inconnue'}</TableCell>
      <TableCell align="center">
        <Typography className={classes.libelle}>
          {libelleANABIO === 'No matching concept' ? '-' : libelleANABIO ?? '-'}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography className={classes.libelle}>
          {codeLOINC === 'No matching concept' || codeLOINC === 'Non Renseigné' ? '' : codeLOINC ?? ''} -{' '}
          {libelleLOINC === 'No matching concept' ? '-' : libelleLOINC ?? '-'}
        </Typography>
      </TableCell>
      <TableCell align="center">{result}</TableCell>
      <TableCell align="center">{referenceRange}</TableCell>
      <TableCell align="center">{serviceProvider ?? '-'}</TableCell>
    </TableRow>
  )
}

export default DataTableObservation
