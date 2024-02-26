import React from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'

import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress
} from '@mui/material'

import { useAppSelector } from 'state'
import { RequestType } from 'types'

import useStyles from '../../CohortsTable/styles'
import RequestActions from '../RequestActions'

type RequestsTableProps = {
  data: RequestType[]
  loading: boolean
  onUpdate: () => void
}
const RequestsTable = ({ data, loading, onUpdate }: RequestsTableProps) => {
  const { classes } = useStyles()
  const navigate = useNavigate()

  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)

  const _onClickRow = (row: any) => {
    if (!row.uuid) return
    navigate(`/cohort/new/${row.uuid}`)
  }

  return (
    <>
      {loading && (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      )}
      {!loading && data.length < 1 && (
        <Grid container justifyContent="center">
          <Typography variant="button"> Aucune requête à afficher </Typography>
        </Grid>
      )}
      {!loading && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell className={classes.tableHeadCell}>Titre</TableCell>
                <TableCell className={classes.tableHeadCell} align="center">
                  Date de modification
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((row: RequestType) => (
                <TableRow className={classes.pointerHover} hover key={row.uuid}>
                  <TableCell onClick={() => _onClickRow(row)}>
                    {row.shared_by?.display_name ? (
                      <>
                        {row.name} - Envoyée par : {row.shared_by.firstname} {row.shared_by.lastname?.toUpperCase()}
                      </>
                    ) : (
                      <>{row.name}</>
                    )}
                  </TableCell>
                  <TableCell onClick={() => _onClickRow(row)} align="center">
                    {moment(row.modified_at).format('DD/MM/YYYY [à] HH:mm')}
                  </TableCell>
                  <TableCell align="center">
                    <RequestActions disabled={maintenanceIsActive} request={row} onUpdate={onUpdate} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}

export default RequestsTable
