import React from 'react'

import { CircularProgress, Grid, Typography, TableRow } from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import DataTable from 'components/DataTable/DataTable'

import { Column, PMSIEntry } from 'types'

import useStyles from './styles'
import { Claim, Condition, Procedure } from 'fhir/r4'
import { Order, OrderBy } from 'types/searchCriterias'
import { ResourceType } from 'types/requestCriterias'
import { getExtension } from 'utils/fhir'
import { ORBIS_STATUS_EXTENSION_NAME } from 'constants.js'

type DataTablePmsiProps = {
  loading: boolean
  deidentified: boolean
  selectedTab: ResourceType.CONDITION | ResourceType.PROCEDURE | ResourceType.CLAIM
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
    { label: 'source' },
    { label: 'Code', code: Order.CODE },
    { label: 'Libellé' },
    selectedTab === ResourceType.CONDITION ? { label: 'Type' } : null,
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
          <TableCellWrapper colSpan={selectedTab === ResourceType.CONDITION ? 7 : 6} align="left">
            <Grid container justifyContent="center">
              <Typography variant="button">{`Aucun ${
                selectedTab !== ResourceType.CONDITION
                  ? selectedTab !== ResourceType.PROCEDURE
                    ? 'GHM'
                    : 'acte'
                  : 'diagnostic'
              } à afficher`}</Typography>
            </Grid>
          </TableCellWrapper>
        </TableRow>
      )}
      {loading && (
        <TableRow className={classes.emptyTableRow}>
          <TableCellWrapper colSpan={selectedTab === ResourceType.CONDITION ? 7 : 6} align="left">
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
  selectedTab: ResourceType.CONDITION | ResourceType.PROCEDURE | ResourceType.CLAIM
}> = ({ pmsi, selectedTab }) => {
  const { classes } = useStyles()

  const nda = pmsi.NDA
  const date =
    pmsi.resourceType === ResourceType.CONDITION && pmsi.recordedDate
      ? new Date(pmsi.recordedDate).toLocaleDateString('fr-FR') ?? 'Date inconnue'
      : pmsi.resourceType === ResourceType.CLAIM && pmsi.created
      ? new Date(pmsi.created).toLocaleDateString('fr-FR') ?? 'Date inconnue'
      : pmsi.resourceType === ResourceType.PROCEDURE && pmsi.performedDateTime
      ? new Date(pmsi.performedDateTime).toLocaleDateString('fr-FR') ?? 'Date inconnue'
      : 'Date inconnue'

  const filterCode = pmsi.resourceType === ResourceType.CLAIM ? pmsi.diagnosis?.[0]?.packageCode : pmsi.code

  const codeToDisplay = filterCode?.coding?.find((code) => code.userSelected === true)

  const source = pmsi.meta?.source ?? 'Non renseigné'

  const type =
    getExtension(pmsi, ORBIS_STATUS_EXTENSION_NAME)?.valueCodeableConcept?.coding?.[0].code?.toUpperCase() || '-'
  const serviceProvider = pmsi.serviceProvider ?? 'Non renseigné'

  return (
    <TableRow className={classes.tableBodyRows} key={pmsi.id}>
      <TableCellWrapper align="left">{nda ?? 'Inconnu'}</TableCellWrapper>
      <TableCellWrapper>{date}</TableCellWrapper>
      <TableCellWrapper>
        <Typography className={classes.libelle}>{source}</Typography>
      </TableCellWrapper>
      <TableCellWrapper>
        <Typography className={classes.libelle}>{codeToDisplay?.code ?? 'Non renseigné'}</Typography>
      </TableCellWrapper>
      <TableCellWrapper>
        <Typography className={classes.libelle}>{codeToDisplay?.display ?? 'Non renseigné'}</Typography>
      </TableCellWrapper>
      {selectedTab === ResourceType.CONDITION && <TableCellWrapper>{type}</TableCellWrapper>}
      <TableCellWrapper>{serviceProvider ?? '-'}</TableCellWrapper>
    </TableRow>
  )
}

export default DataTablePmsi
