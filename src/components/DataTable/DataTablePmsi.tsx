import React, { useContext } from 'react'
import { Claim, Condition, Procedure } from 'fhir/r4'
import { AppConfig } from 'config'

import { CircularProgress, Grid, Typography, TableRow, IconButton } from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'
import DataTable from 'components/DataTable/DataTable'
import SearchIcon from 'assets/icones/search.svg?react'

import { CohortPMSI, Column, PMSIEntry } from 'types'
import { Order, OrderBy } from 'types/searchCriterias'
import { PMSIResourceTypes, ResourceType } from 'types/requestCriterias'

import useStyles from './styles'
import { mapToDate, mapToLabelSingular } from 'mappers/pmsi'

type DataTablePmsiProps = {
  loading: boolean
  deidentified: boolean
  selectedTab: PMSIResourceTypes
  pmsiList: PMSIEntry<Procedure | Condition | Claim>[]
  orderBy: OrderBy
  setOrderBy?: (order: OrderBy) => void
  page?: number
  setPage?: (page: number) => void
  total?: number
  showIpp?: boolean
  groupId?: string
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
  total,
  showIpp,
  groupId
}) => {
  const { classes } = useStyles()

  const columns = [
    ...(showIpp ? [{ label: `IPP${deidentified ? ' chiffré' : ''}`, align: 'left' }] : []),
    { label: `NDA${deidentified ? ' chiffré' : ''}`, align: showIpp ? 'center' : 'left' },
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
            return (
              <DataTablePmsiLine
                key={pmsi.id}
                pmsi={pmsi}
                selectedTab={selectedTab}
                showIpp={showIpp}
                groupId={groupId}
              />
            )
          })}
        </>
      )}
      {!loading && pmsiList?.length < 1 && (
        <TableRow className={classes.emptyTableRow}>
          <TableCellWrapper colSpan={columns.length} align="left">
            <Grid container justifyContent="center">
              <Typography variant="button">{`Aucun ${mapToLabelSingular(selectedTab)}  à afficher`}</Typography>
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

const DataTablePmsiLine: React.FC<{
  pmsi: CohortPMSI
  selectedTab: PMSIResourceTypes
  showIpp?: boolean
  groupId?: string
}> = ({ pmsi, selectedTab, showIpp, groupId }) => {
  const { classes } = useStyles()
  const appConfig = useContext(AppConfig)

  const ipp = pmsi.IPP
  const nda = pmsi.NDA
  const date = mapToDate(selectedTab, pmsi)

  const filterCode = pmsi.resourceType === ResourceType.CLAIM ? pmsi.diagnosis?.[0]?.packageCode : pmsi.code

  const codeToDisplay = filterCode?.coding?.find((code) => code.userSelected === true)

  const source = pmsi.meta?.source ?? 'Non renseigné'

  const type =
    pmsi.resourceType === ResourceType.CONDITION
      ? pmsi?.category
          ?.find((e) => e?.coding?.find((a) => a.system === appConfig.features.condition.valueSets.conditionStatus.url))
          ?.coding?.[0].code?.toUpperCase() ?? 'N/A'
      : 'N/A'
  const serviceProvider = pmsi.serviceProvider ?? 'Non renseigné'

  const groupIdSearch = groupId ? `?groupId=${groupId}` : ''

  return (
    <TableRow className={classes.tableBodyRows} key={pmsi.id}>
      {showIpp && (
        <TableCellWrapper style={{ minWidth: 150 }}>
          {ipp}
          <IconButton
            onClick={() => window.open(`/patients/${pmsi.idPatient}${groupIdSearch}`, '_blank')}
            className={classes.searchIcon}
          >
            <SearchIcon height="15px" fill="#ED6D91" className={classes.iconMargin} />
          </IconButton>
        </TableCellWrapper>
      )}
      <TableCellWrapper align={showIpp ? 'center' : 'left'}>{nda ?? 'Inconnu'}</TableCellWrapper>
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
