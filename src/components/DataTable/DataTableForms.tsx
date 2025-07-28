import React, { useState } from 'react'

import { CircularProgress, Grid, Typography, TableRow, IconButton, Collapse } from '@mui/material'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import SearchIcon from 'assets/icones/search.svg?react'

import { TableCellWrapper } from 'components/ui/TableCell/styles'

import DataTable from 'components/DataTable/DataTable'

import { Column, CohortQuestionnaireResponse } from 'types'

import useStyles from './styles'
import { FormNames, Order, OrderBy } from 'types/searchCriterias'
import FormDetails from 'components/ui/FormDetails'
import { Questionnaire } from 'fhir/r4'
import { getFormDetails, getFormLabel, getFormName } from 'utils/formUtils'

type DataTableFormsProps = {
  loading: boolean
  formsList: CohortQuestionnaireResponse[]
  orderBy: OrderBy
  setOrderBy?: (order: OrderBy) => void
  page?: number
  setPage?: (page: number) => void
  total?: number
  groupId?: string
  questionnaires: Questionnaire[]
}
const DataTableForms: React.FC<DataTableFormsProps> = ({
  loading,
  formsList,
  orderBy,
  setOrderBy,
  page,
  setPage,
  total,
  groupId,
  questionnaires
}) => {
  const { classes } = useStyles()

  const columns: Column[] = [
    { label: 'Type de dossiers de spécialité', align: 'left' },
    { label: "Date d'écriture", code: Order.AUTHORED },
    { label: `IPP` },
    { label: 'Unité exécutrice' },
    { label: 'Aperçu' }
  ].filter((elem) => elem !== null) as Column[]

  return (
    <DataTable columns={columns} order={orderBy} setOrder={setOrderBy} page={page} setPage={setPage} total={total}>
      {!loading && formsList?.length > 0 && (
        <>
          {formsList.map((form) => (
            <DataTableFormsLine key={form.id} form={form} groupId={groupId} questionnaires={questionnaires} />
          ))}
        </>
      )}
      {!loading && formsList?.length < 1 && (
        <TableRow className={classes.emptyTableRow}>
          <TableCellWrapper colSpan={columns.length} align="left">
            <Grid container justifyContent="center">
              <Typography variant="button">Aucun dossiers de spécialité à afficher</Typography>
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

const DataTableFormsLine: React.FC<{
  form: CohortQuestionnaireResponse
  groupId?: string
  questionnaires: Questionnaire[]
}> = ({ form, groupId, questionnaires }) => {
  const { classes } = useStyles()
  const [open, setOpen] = useState(false)

  const formName = getFormName(form, questionnaires) as FormNames

  const date = form.authored ? new Date(form.authored).toLocaleDateString('fr-FR') : 'Date inconnue'
  const ipp = form.IPP
  const formLabel = getFormLabel(formName)
  const serviceProvider = form.serviceProvider
  const groupIdSearch = groupId ? `?groupId=${groupId}` : ''
  const formDetails = getFormDetails(form, formName)

  return (
    <>
      <TableRow className={classes.tableBodyRows} key={form.id}>
        <TableCellWrapper align="left">{formLabel}</TableCellWrapper>
        <TableCellWrapper>{date}</TableCellWrapper>
        <TableCellWrapper style={{ minWidth: 150 }}>
          {ipp}
          <IconButton
            onClick={() => window.open(`/patients/${form.idPatient}${groupIdSearch}`, '_blank')}
            className={classes.searchIcon}
          >
            <SearchIcon height="15px" fill="#ED6D91" className={classes.iconMargin} />
          </IconButton>
        </TableCellWrapper>
        <TableCellWrapper>{serviceProvider ?? '-'}</TableCellWrapper>
        <TableCellWrapper>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCellWrapper>
      </TableRow>
      <TableRow>
        <TableCellWrapper
          colSpan={5}
          style={{
            padding: open && formDetails.length === 0 ? 16 : 0,
            borderBottom: open ? undefined : 0,
            borderTop: open ? '2px solid #FFF' : undefined,
            backgroundColor: formDetails.length === 0 ? '#F6FAFE' : undefined
          }}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            {formDetails.length === 0 ? 'Aucune donnée à afficher' : <FormDetails content={formDetails} />}
          </Collapse>
        </TableCellWrapper>
      </TableRow>
    </>
  )
}

export default DataTableForms
