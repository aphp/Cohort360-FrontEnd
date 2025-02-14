import React, { useContext } from 'react'

import { CircularProgress, Grid, Typography, TableRow, IconButton } from '@mui/material'
import SearchIcon from 'assets/icones/search.svg?react'

import { TableCellWrapper } from 'components/ui/TableCell/styles'

import DataTable from 'components/DataTable/DataTable'

import {  CohortObservation } from 'types'

import useStyles from './styles'
import { Order, OrderBy } from 'types/searchCriterias'
import { AppConfig } from 'config'
import { Column } from 'types/table'

type DataTableObservationProps = {
  loading: boolean
  deidentified: boolean
  observationsList: CohortObservation[]
  orderBy: OrderBy
  setOrderBy?: (order: OrderBy) => void
  page?: number
  setPage?: (page: number) => void
  total?: number
  showIpp?: boolean
  groupId?: string
}
const DataTableObservation: React.FC<DataTableObservationProps> = ({
  loading,
  deidentified,
  observationsList,
  orderBy,
  setOrderBy,
  page,
  setPage,
  total,
  showIpp,
  groupId
}) => {
  const { classes } = useStyles()

  const columns: Column[] = [
    ...(showIpp ? [{ label: `IPP${deidentified ? ' chiffré' : ''}`, align: 'left' }] : []),
    { label: `NDA${deidentified ? ' chiffré' : ''}`, align: showIpp ? 'center' : 'left' },
    { label: 'Date de prélèvement', code: Order.DATE },
    { label: 'ANABIO', code: Order.ANABIO },
    { label: 'LOINC', code: Order.LOINC },
    { label: 'Résultat' },
    { label: 'Valeurs de référence' },
    { label: 'Unité exécutrice' }
  ].filter((elem) => elem !== null) as Column[]

  return (
    <DataTable columns={columns} order={orderBy} setOrder={setOrderBy} page={page} setPage={setPage} total={total}>
      {!loading && observationsList?.length > 0 && (
        <>
          {observationsList.map((observation) => (
            <DataTableObservationLine
              key={observation.id}
              observation={observation}
              showIpp={showIpp}
              groupId={groupId}
            />
          ))}
        </>
      )}
      {!loading && observationsList?.length < 1 && (
        <TableRow className={classes.emptyTableRow}>
          <TableCellWrapper colSpan={columns.length} align="left">
            <Grid container justifyContent="center">
              <Typography variant="button">Aucun résultat de biologie à afficher</Typography>
            </Grid>
          </TableCellWrapper>
        </TableRow>
      )}
      {loading && (
        <TableRow className={classes.emptyTableRow}>
          <TableCellWrapper colSpan={columns.length} align="left">
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
    return `${value} ${valueUnit ?? ''}`
  }
  return '_'
}

const DataTableObservationLine: React.FC<{
  observation: CohortObservation
  showIpp?: boolean
  groupId?: string
}> = ({ observation, showIpp, groupId }) => {
  const { classes } = useStyles()
  const appConfig = useContext(AppConfig)

  const ipp = observation.IPP
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
    observation.valueQuantity && observation.valueQuantity?.value !== null
      ? `${observation.valueQuantity?.value} ${observation.valueQuantity?.unit ?? ''}`
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
  const groupIdSearch = groupId ? `?groupId=${groupId}` : ''

  return (
    <TableRow className={classes.tableBodyRows} key={observation.id}>
      {showIpp && (
        <TableCellWrapper style={{ minWidth: 150 }}>
          {ipp}
          <IconButton
            onClick={() => window.open(`/patients/${observation.idPatient}${groupIdSearch}`, '_blank')}
            className={classes.searchIcon}
          >
            <SearchIcon height="15px" fill="#ED6D91" className={classes.iconMargin} />
          </IconButton>
        </TableCellWrapper>
      )}
      <TableCellWrapper align={showIpp ? 'center' : 'left'}>{nda ?? 'Inconnu'}</TableCellWrapper>
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
