import React, { memo } from 'react'
import { useHistory } from 'react-router-dom'

import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip
} from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'

import { ReactComponent as FemaleIcon } from '../../assets/icones/venus.svg'
import { ReactComponent as MaleIcon } from '../../assets/icones/mars.svg'
import { ReactComponent as UnknownIcon } from '../../assets/icones/autre-inconnu.svg'

import { getAge } from 'utils/age'
import useStyles from './styles'
import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortPatient } from 'types'

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
  deidentified?: boolean
  patients: CohortPatient[]
  loading?: boolean
  onChangePage: (event: React.ChangeEvent<unknown>, page: number) => void
  page: number
  rowsPerPage?: number
  totalPatientCount: number
  sortBy: string
  sortDirection: 'asc' | 'desc'
}
const TableauPatients: React.FC<TableauPatientsProps> = memo(
  ({
    deidentified,
    patients,
    loading,
    onChangePage,
    page,
    totalPatientCount,
    rowsPerPage = 20,
    sortBy,
    sortDirection
  }) => {
    const history = useHistory()
    const classes = useStyles()

    const patientsToShow =
      patients.length > rowsPerPage
        ? patients.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage)
        : patients

    return loading ? (
      <CircularProgress className={classes.loadingSpinner} size={50} />
    ) : (
      <>
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table className={classes.table} aria-label="customized table">
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell align="center" className={classes.tableHeadCell}>
                  <TableSortLabel
                    // direction={orderBy === headCell.id ? order : 'asc'}
                    // onClick={createSortHandler(headCell.id)}
                    active={sortBy === 'gender'}
                    direction={sortDirection}
                  >
                    Sexe
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeadCell}>
                  <TableSortLabel
                    active={sortBy === 'given'}
                    direction={sortDirection}
                    onClick={(e) => console.log(e.target)}
                  >
                    Prénom
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeadCell}>
                  <TableSortLabel active={sortBy === 'family'} direction={sortDirection}>
                    Nom
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  {deidentified ? 'Âge' : 'Date de naissance'}
                  <TableSortLabel active={sortBy === 'birthdate'} direction={sortDirection}>
                    Date de naissance
                  </TableSortLabel>
                </TableCell>
                <TableCell className={classes.tableHeadCell}>Dernier lieu de prise en charge</TableCell>
                <TableCell className={classes.tableHeadCell}>Statut vital</TableCell>
                <TableCell align="center" className={classes.tableHeadCell}>
                  {deidentified ? 'ID Technique Patient' : 'N° IPP'}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients && patients.length > 0 ? (
                patientsToShow.map((patient) => {
                  return (
                    patient && (
                      <TableRow
                        key={patient.id}
                        className={classes.tableBodyRows}
                        hover
                        onClick={() => history.push(`/patients/${patient.id}`)}
                      >
                        <TableCell align="center">
                          {patient.gender && <PatientGender gender={patient.gender} className={classes.genderIcon} />}
                        </TableCell>
                        <TableCell>{deidentified ? 'Prénom' : patient.name?.[0].given?.[0]}</TableCell>
                        <TableCell>{deidentified ? 'Nom' : patient.name?.map((e) => e.family).join(' ')}</TableCell>
                        <TableCell align="center">
                          {deidentified ? getAge(patient) : `${patient.birthDate} (${getAge(patient)})`}
                        </TableCell>
                        <TableCell>{patient.lastEncounterName}</TableCell>
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
              ) : (
                <TableRow> Aucun résultat à afficher </TableRow>
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
