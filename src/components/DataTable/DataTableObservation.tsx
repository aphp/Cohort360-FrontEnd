import React, { useContext } from 'react'

import { CircularProgress, Grid, Typography, TableRow } from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import DataTable from 'components/DataTable/DataTable'

import { Column, CohortObservation } from 'types'

import useStyles from './styles'
import { Order, OrderBy } from 'types/searchCriterias'
import { AppConfig } from 'config'

type DataTableObservationProps = {
  loading: boolean
  deidentified: boolean
  observationsList: CohortObservation[]
  orderBy: OrderBy
  setOrderBy?: (order: OrderBy) => void
  page?: number
  setPage?: (page: number) => void
  total?: number
}
const DataTableObservation: React.FC<DataTableObservationProps> = ({
  loading,
  deidentified,
  observationsList,
  orderBy,
  setOrderBy,
  page,
  setPage,
  total
}) => {
  const { classes } = useStyles()

  const columns: Column[] = [
    { label: `NDA${deidentified ? ' chiffré' : ''}`, align: 'left' },
    { label: 'Date de prélèvement', code: Order.DATE },
    { label: 'ANABIO', code: Order.ANABIO },
    { label: 'LOINC', code: Order.LOINC },
    { label: 'Résultat' },
    { label: 'Valeurs de référence' },
    { label: 'Unité exécutrice' }
  ]

  return (
    <DataTable columns={columns} order={orderBy} setOrder={setOrderBy} page={page} setPage={setPage} total={total}>
      {!loading && observationsList?.length > 0 && (
        <>
          {observationsList.map((observation) => (
            <DataTableObservationLine key={observation.id} observation={observation} />
          ))}
        </>
      )}
      {!loading && observationsList?.length < 1 && (
        <TableRow className={classes.emptyTableRow}>
          <TableCellWrapper colSpan={7} align="left">
            <Grid container justifyContent="center">
              <Typography variant="button">Aucun résultat de biologie à afficher</Typography>
            </Grid>
          </TableCellWrapper>
        </TableRow>
      )}
      {loading && (
        <TableRow className={classes.emptyTableRow}>
          <TableCellWrapper colSpan={7} align="left">
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          </TableCellWrapper>
        </TableRow>
      )}
    </DataTable>
  )
}

const formatValueRange = (value?: string | number, valueUnit?: string): string => {
  if (value) {
    return `${value} ${valueUnit || ''}`
  }
  return '_'
}

const DataTableObservationLine: React.FC<{
  observation: CohortObservation
}> = ({ observation }) => {
  const { classes } = useStyles()
  const appConfig = useContext(AppConfig)

  const nda = observation.NDA
  const date = observation.effectiveDateTime
  const libelleANABIO = observation.code?.coding?.find(
    (code) => code.system === appConfig.features.observation.valueSets.biologyHierarchyAnabio.url && code.userSelected
  )?.display
  const codeLOINC = observation.code?.coding?.find(
    (code) => code.system === appConfig.features.observation.valueSets.biologyHierarchyLoinc.url && code.userSelected
  )?.code
  const libelleLOINC = observation.code?.coding?.find(
    (code) => code.system === appConfig.features.observation.valueSets.biologyHierarchyLoinc.url && code.userSelected
  )?.display
  const result =
    observation.valueQuantity?.value !== null
      ? `${observation.valueQuantity?.value} ${observation.valueQuantity?.unit || ''}`
      : '-'
  const valueUnit = observation.valueQuantity?.unit ?? ''
  const serviceProvider = observation.serviceProvider
  const referenceRangeArray = observation.referenceRange?.[0]
  const referenceRange = referenceRangeArray
    ? `${formatValueRange(referenceRangeArray?.low?.value, valueUnit)} - ${formatValueRange(
        referenceRangeArray?.high?.value,
        valueUnit
      )}`
    : '-'

  return (
    <TableRow className={classes.tableBodyRows} key={observation.id}>
      <TableCellWrapper align="left">{nda ?? 'Inconnu'}</TableCellWrapper>
      <TableCellWrapper>{date ? new Date(date).toLocaleDateString('fr-FR') : 'Date inconnue'}</TableCellWrapper>
      <TableCellWrapper>
        <Typography className={classes.libelle}>
          {libelleANABIO === 'No matching concept' ? '-' : libelleANABIO ?? '-'}
        </Typography>
      </TableCellWrapper>
      <TableCellWrapper>
        <Typography className={classes.libelle}>
          {codeLOINC === 'No matching concept' || codeLOINC === 'Non Renseigné' ? '' : codeLOINC ?? ''} -{' '}
          {libelleLOINC === 'No matching concept' ? '-' : libelleLOINC ?? '-'}
        </Typography>
      </TableCellWrapper>
      <TableCellWrapper>{result}</TableCellWrapper>
      <TableCellWrapper>{referenceRange}</TableCellWrapper>
      <TableCellWrapper>{serviceProvider ?? '-'}</TableCellWrapper>
    </TableRow>
  )
}

export default DataTableObservation
