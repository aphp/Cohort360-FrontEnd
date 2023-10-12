import React from 'react'

import { CircularProgress, Grid, Typography, TableRow } from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import DataTable from 'components/DataTable/DataTable'

import { Column, PMSIEntry } from 'types'

import useStyles from './styles'
import { Claim, Condition, Procedure } from 'fhir/r4'
import { Order, OrderBy } from 'types/searchCriterias'
import { PMSI } from 'types/patient'

type DataTablePmsiProps = {
  loading: boolean
  deidentified: boolean
  selectedTab: PMSI
  pmsiList: PMSIEntry<Procedure | Condition | Claim>[]
  orderBy: OrderBy
  setOrderBy?: (order: OrderBy) => void
  page?: number
  setPage?: (page: number) => void
  total?: number
}
const DataTablePmsi: React.FC<DataTablePmsiProps> = ({
  loading,
  deidentified,
  selectedTab,
  pmsiList,
  orderBy,
  setOrderBy,
  page,
  setPage,
  total
}) => {
  const { classes } = useStyles()

  const columns = [
    { label: `NDA${deidentified ? ' chiffré' : ''}`, align: 'left' },
    { label: 'Codage le', code: Order.DATE },
    { label: 'Code', code: Order.CODE },
    { label: 'Libellé' },
    selectedTab === PMSI.DIAGNOSTIC ? { label: 'Type' } : null,
    { label: 'Unité exécutrice' }
  ].filter((elem) => elem !== null) as Column[]

  return (
    <DataTable columns={columns} order={orderBy} setOrder={setOrderBy} page={page} setPage={setPage} total={total}>
      {!loading && pmsiList?.length > 0 && (
        <>
          {pmsiList.map((pmsi) => {
            return <DataTablePmsiLine key={pmsi.id} pmsi={pmsi} selectedTab={selectedTab} />
          })}
        </>
      )}
      {!loading && pmsiList?.length < 1 && (
        <TableRow className={classes.emptyTableRow}>
          <TableCellWrapper colSpan={6} align="left">
            <Grid container justifyContent="center">
              <Typography variant="button">{`Aucun ${
                selectedTab !== PMSI.DIAGNOSTIC ? (selectedTab !== PMSI.CCAM ? PMSI.GMH : 'acte') : PMSI.DIAGNOSTIC
              } à afficher`}</Typography>
            </Grid>
          </TableCellWrapper>
        </TableRow>
      )}
      {loading && (
        <TableRow className={classes.emptyTableRow}>
          <TableCellWrapper colSpan={6} align="left">
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          </TableCellWrapper>
        </TableRow>
      )}
    </DataTable>
  )
}

const DataTablePmsiLine: React.FC<{
  pmsi: PMSIEntry<Procedure | Condition | Claim>
  selectedTab: PMSI
}> = ({ pmsi, selectedTab }) => {
  const { classes } = useStyles()

  const nda = pmsi.NDA
  const date =
    pmsi.resourceType === 'Condition' && pmsi.recordedDate
      ? new Date(pmsi.recordedDate).toLocaleDateString('fr-FR') ?? 'Date inconnue'
      : pmsi.resourceType === 'Claim' && pmsi.created
      ? new Date(pmsi.created).toLocaleDateString('fr-FR') ?? 'Date inconnue'
      : pmsi.resourceType === 'Procedure' && pmsi.performedDateTime
      ? new Date(pmsi.performedDateTime).toLocaleDateString('fr-FR') ?? 'Date inconnue'
      : 'Date inconnue'

  const code =
    pmsi.resourceType === 'Claim'
      ? pmsi.diagnosis?.[0].packageCode?.coding?.[0].code
      : // @ts-ignore TODO: There is no class member in Conditon or Procedure FHIR types
        pmsi.class?.code || pmsi.code?.coding?.[0].code
  const libelle =
    pmsi.resourceType === 'Claim'
      ? pmsi.diagnosis?.[0].packageCode?.coding?.[0].display
      : // @ts-ignore TODO: There is no class member in Conditon or Procedure FHIR types
        pmsi.class?.code || pmsi.code?.coding?.[0].display
  const type = pmsi.extension ? pmsi.extension[0].valueCodeableConcept?.coding?.[0].code?.toUpperCase() : '-'
  const serviceProvider = pmsi.serviceProvider ?? 'Non renseigné'

  return (
    <TableRow className={classes.tableBodyRows} key={pmsi.id}>
      <TableCellWrapper align="left">{nda ?? 'Inconnu'}</TableCellWrapper>
      <TableCellWrapper>{date}</TableCellWrapper>
      <TableCellWrapper>
        <Typography className={classes.libelle}>{code}</Typography>
      </TableCellWrapper>
      <TableCellWrapper>
        <Typography className={classes.libelle}>{libelle}</Typography>
      </TableCellWrapper>
      {selectedTab === PMSI.DIAGNOSTIC && <TableCellWrapper>{type}</TableCellWrapper>}
      <TableCellWrapper>{serviceProvider ?? '-'}</TableCellWrapper>
    </TableRow>
  )
}

export default DataTablePmsi
