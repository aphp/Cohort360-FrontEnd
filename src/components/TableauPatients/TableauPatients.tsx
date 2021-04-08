import React, { memo } from 'react'

import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Paper
} from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'

import { CohortPatient } from 'types'
import { useAppSelector } from 'state'

import useStyles from './styles'
import TableauPatientRow from './TableauPatientRow'

type TableauPatientsProps = {
  groupId?: any
  deidentified?: boolean | null
  patients: CohortPatient[]
  loading?: boolean
  onChangePage: (event: React.ChangeEvent<unknown>, page: number) => void
  page: number
  rowsPerPage?: number
  totalPatientCount: number
  sortBy: string
  sortDirection: 'asc' | 'desc'
  onRequestSort: any
}
const TableauPatients: React.FC<TableauPatientsProps> = memo(
  ({
    groupId,
    deidentified,
    patients,
    loading,
    onChangePage,
    page,
    totalPatientCount,
    rowsPerPage = 20,
    sortBy,
    sortDirection,
    onRequestSort
  }) => {
    const classes = useStyles()
    const { cohortType } = useAppSelector((state) => state.exploredCohort)
    const showActionColumn = cohortType === 'cohort'

    const patientsToShow =
      patients.length > rowsPerPage
        ? patients.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage)
        : patients

    const createSortHandler = (property: any) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

    return (
      <>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="customized table">
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell
                  sortDirection={sortBy === 'gender' ? sortDirection : false}
                  align="center"
                  className={classes.tableHeadCell}
                >
                  Sexe
                </TableCell>
                <TableCell sortDirection={sortBy === 'given' ? sortDirection : false} className={classes.tableHeadCell}>
                  {deidentified ? (
                    'Prénom'
                  ) : (
                    <TableSortLabel
                      active={sortBy === 'given'}
                      direction={sortBy === 'given' ? sortDirection : 'asc'}
                      onClick={createSortHandler('given')}
                    >
                      Prénom
                    </TableSortLabel>
                  )}
                </TableCell>
                <TableCell
                  sortDirection={sortBy === 'family' ? sortDirection : false}
                  className={classes.tableHeadCell}
                >
                  {deidentified ? (
                    'Nom'
                  ) : (
                    <TableSortLabel
                      active={sortBy === 'family'}
                      direction={sortBy === 'family' ? sortDirection : 'asc'}
                      onClick={createSortHandler('family')}
                    >
                      Nom
                    </TableSortLabel>
                  )}
                </TableCell>
                <TableCell
                  sortDirection={sortBy === 'birthdate' ? sortDirection : false}
                  align="center"
                  className={classes.tableHeadCell}
                >
                  {deidentified ? (
                    'Âge'
                  ) : (
                    <TableSortLabel
                      active={sortBy === 'birthdate'}
                      direction={sortBy === 'birthdate' ? sortDirection : 'asc'}
                      onClick={createSortHandler('birthdate')}
                    >
                      Date de naissance
                    </TableSortLabel>
                  )}
                </TableCell>
                <TableCell className={classes.tableHeadCell}>Dernier lieu de prise en charge</TableCell>
                <TableCell className={classes.tableHeadCell}>Statut vital</TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  {deidentified ? 'IPP chiffré' : 'N° IPP'}
                </TableCell>
                {showActionColumn && (
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className={classes.loadingSpinnerContainer}>
                      <CircularProgress size={50} />
                    </div>
                  </TableCell>
                </TableRow>
              ) : patients && patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography className={classes.loadingSpinnerContainer}>Aucun résultat à afficher</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                patientsToShow.map((patient) => {
                  return (
                    patient && (
                      <TableauPatientRow
                        patient={patient}
                        deidentified={deidentified}
                        key={patient.id}
                        groupId={groupId}
                        showActionColumn={showActionColumn}
                      />
                    )
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          className={classes.pagination}
          count={Math.ceil(totalPatientCount / rowsPerPage)}
          shape="rounded"
          onChange={onChangePage}
          page={page}
        />
      </>
    )
  }
)

export default TableauPatients
