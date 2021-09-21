import React, { memo } from 'react'
import moment from 'moment'

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
  Paper,
  Chip
} from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'

import { ReactComponent as FemaleIcon } from 'assets/icones/venus.svg'
import { ReactComponent as MaleIcon } from 'assets/icones/mars.svg'
import { ReactComponent as UnknownIcon } from 'assets/icones/autre-inconnu.svg'

import { getAge } from 'utils/age'
import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortPatient } from 'types'
import { capitalizeFirstLetter } from 'utils/capitalize'

import useStyles from './styles'

type PatientGenderProps = {
  gender: PatientGenderKind
  className?: string
}

const PatientGender: React.FC<PatientGenderProps> = ({ gender, className }) => {
  switch (gender) {
    case PatientGenderKind._male:
      return <MaleIcon className={className} />

    case PatientGenderKind._female:
      return <FemaleIcon className={className} />

    default:
      return <UnknownIcon className={className} />
  }
}

type StatusShipProps = {
  type: 'Vivant' | 'Décédé'
}

const StatusShip: React.FC<StatusShipProps> = ({ type }) => {
  const classes = useStyles()
  if (type === 'Vivant') {
    return <Chip className={classes.aliveChip} label={type} />
  } else {
    return <Chip className={classes.deceasedChip} label={type} />
  }
}

type TableauPatientsProps = {
  search?: string
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
    search,
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
                      <TableRow
                        key={patient.id}
                        className={classes.tableBodyRows}
                        hover
                        onClick={() =>
                          window.open(
                            `/patients/${patient.id}${groupId ? `?groupId=${groupId}` : ''}${
                              search ? `&search=${search}` : ''
                            }`,
                            '_blank'
                          )
                        }
                      >
                        <TableCell align="center">
                          {patient.gender && <PatientGender gender={patient.gender} className={classes.genderIcon} />}
                        </TableCell>
                        <TableCell>
                          {deidentified ? 'Prénom' : capitalizeFirstLetter(patient.name?.[0].given?.[0])}
                        </TableCell>
                        <TableCell>{deidentified ? 'Nom' : patient.name?.map((e) => e.family).join(' ')}</TableCell>
                        <TableCell align="center">
                          {deidentified
                            ? getAge(patient)
                            : `${moment(patient.birthDate).format('DD/MM/YYYY')} (${getAge(patient)})`}
                        </TableCell>
                        <TableCell>
                          {patient.extension &&
                          patient.extension.find((extension) => extension.url === 'last-visit-service-provider')
                            ? patient.extension.find((extension) => extension.url === 'last-visit-service-provider')
                                ?.valueString
                            : 'Non renseigné'}
                        </TableCell>
                        <TableCell>
                          <StatusShip type={patient.deceasedDateTime ? 'Décédé' : 'Vivant'} />
                        </TableCell>

                        <TableCell align="center">
                          {deidentified
                            ? patient.id
                            : patient.identifier?.find((identifier) => identifier.type?.coding?.[0].code === 'IPP')
                                ?.value ??
                              patient.identifier?.[0].value ??
                              'IPP inconnnu'}
                        </TableCell>
                      </TableRow>
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
