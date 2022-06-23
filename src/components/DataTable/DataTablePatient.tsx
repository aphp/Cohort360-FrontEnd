import React from 'react'
import moment from 'moment'

import { CircularProgress, Grid, TableCell, TableRow, Typography, Chip } from '@mui/material'

import { ReactComponent as FemaleIcon } from 'assets/icones/venus.svg'
import { ReactComponent as MaleIcon } from 'assets/icones/mars.svg'
import { ReactComponent as UnknownIcon } from 'assets/icones/autre-inconnu.svg'

import DataTable from 'components/DataTable/DataTable'

import { CohortPatient, Column, Order } from 'types'
import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'

import { getAge } from 'utils/age'
import { capitalizeFirstLetter } from 'utils/capitalize'

import useStyles from './styles'

type DataTablePatientProps = {
  loading: boolean
  groupId?: string
  search?: string
  deidentified: boolean
  patientsList: CohortPatient[]
  order: Order
  setOrder?: (order: Order) => void
  page?: number
  setPage?: (page: number) => void
  total?: number
}
const DataTablePatient: React.FC<DataTablePatientProps> = ({
  loading,
  groupId,
  search,
  deidentified,
  patientsList,
  order,
  setOrder,
  page,
  setPage,
  total
}) => {
  const classes = useStyles()

  const columns: Column[] = [
    { label: `Sexe`, code: 'gender', align: 'center', sortableColumn: true },
    { label: 'Prénom', code: 'given', align: 'center', sortableColumn: !deidentified },
    { label: 'Nom', code: 'family', align: 'left', sortableColumn: !deidentified },
    {
      label: !deidentified ? 'Date de naissance' : 'Âge',
      code: 'birthdate',
      align: 'center',
      sortableColumn: !deidentified
    },
    { label: 'Dernier lieu de prise en charge', code: '', align: 'left', sortableColumn: false },
    { label: 'Statut vital', code: '', align: 'left', sortableColumn: false },
    { label: `IPP${!deidentified ? '' : ' chiffré'}`, code: '', align: 'center', sortableColumn: false }
  ]

  return (
    <DataTable
      columns={columns}
      order={order}
      setOrder={setOrder}
      rowsPerPage={20}
      page={page}
      setPage={setPage}
      total={total}
    >
      {!loading && patientsList && patientsList.length > 0 ? (
        <>
          {patientsList.map((patient) => {
            return (
              <DataTablePatientLine
                key={patient.id}
                patient={patient}
                deidentified={deidentified}
                groupId={groupId}
                search={search}
              />
            )
          })}
        </>
      ) : (
        <TableRow className={classes.emptyTableRow}>
          <TableCell colSpan={5} align="left">
            <Grid container justifyContent="center">
              {loading ? <CircularProgress /> : <Typography variant="button">Aucun patient à afficher</Typography>}
            </Grid>
          </TableCell>
        </TableRow>
      )}
    </DataTable>
  )
}

const DataTablePatientLine: React.FC<{
  deidentified: boolean
  patient: CohortPatient
  groupId?: string
  search?: string
}> = ({ deidentified, patient, groupId, search }) => {
  const classes = useStyles()

  return (
    <TableRow
      key={patient.id}
      className={classes.tableBodyRows}
      hover
      onClick={() =>
        window.open(
          `/patients/${patient.id}${groupId ? `?groupId=${groupId}` : ''}${search ? `&search=${search}` : ''}`,
          '_blank'
        )
      }
    >
      <TableCell align="center">
        {patient.gender && <PatientGender gender={patient.gender} className={classes.genderIcon} />}
      </TableCell>
      <TableCell>{deidentified ? 'Prénom' : capitalizeFirstLetter(patient.name?.[0].given?.[0])}</TableCell>
      <TableCell>{deidentified ? 'Nom' : patient.name?.map((e) => e.family).join(' ')}</TableCell>
      <TableCell align="center">
        {deidentified ? (
          <Typography>{getAge(patient)}</Typography>
        ) : (
          <>
            <Typography>{moment(patient.birthDate).format('DD/MM/YYYY')}</Typography>
            <Typography>{`(${getAge(patient)})`}</Typography>
          </>
        )}
      </TableCell>
      <TableCell>
        {patient.extension && patient.extension.find((extension) => extension.url === 'last-visit-service-provider')
          ? patient.extension.find((extension) => extension.url === 'last-visit-service-provider')?.valueString
          : 'Non renseigné'}
      </TableCell>
      <TableCell align="center">
        <StatusShip type={patient.deceasedDateTime ? 'Décédé' : 'Vivant'} />
      </TableCell>

      <TableCell align="center">
        <Typography onClick={(event) => event.stopPropagation()}>
          {deidentified
            ? patient.id
            : patient.identifier?.find((identifier) => identifier.type?.coding?.[0].code === 'IPP')?.value ??
              patient.identifier?.[0].value ??
              'IPP inconnnu'}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

export default DataTablePatient

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
    return <Chip className={classes.validChip} label={type} />
  } else {
    return <Chip className={classes.cancelledChip} label={type} />
  }
}
