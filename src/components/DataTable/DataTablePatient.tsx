import React from 'react'
import moment from 'moment'

import { CircularProgress, Grid, TableCell, TableRow, Typography } from '@mui/material'

import DataTable from 'components/DataTable/DataTable'

import { CohortPatient, Column } from 'types'

import { getAge } from 'utils/age'
import { capitalizeFirstLetter } from 'utils/capitalize'

import useStyles from './styles'
import { GenderStatus, Order, OrderBy } from 'types/searchCriterias'
import { PatientTableLabels, PatientVitalStatus } from 'types/patient'
import GenderIcon from 'components/ui/GenderIcon/GenderIcon'
import StatusChip, { ChipStyles } from 'components/ui/StatusChip/StatusChip'

type DataTablePatientProps = {
  loading: boolean
  groupId?: string
  search?: string
  deidentified: boolean
  patientsList: CohortPatient[]
  orderBy: OrderBy
  setOrderBy?: (order: OrderBy) => void
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
  orderBy,
  setOrderBy,
  page,
  setPage,
  total
}) => {
  const { classes } = useStyles()

  const columns: Column[] = [
    { label: PatientTableLabels.GENDER, code: Order.GENDER, align: 'center', sortableColumn: true },
    { label: PatientTableLabels.FIRSTNAME, code: Order.FIRSTNAME, align: 'center', sortableColumn: !deidentified },
    { label: PatientTableLabels.LASTNAME, code: Order.LASTNAME, align: 'left', sortableColumn: !deidentified },
    {
      label: !deidentified ? PatientTableLabels.BIRTHDATE : PatientTableLabels.AGE,
      code: Order.BIRTHDATE,
      align: 'center',
      sortableColumn: !deidentified
    },
    { label: PatientTableLabels.LAST_ENCOUNTER, align: 'left', sortableColumn: false },
    { label: PatientTableLabels.VITAL_STATUS, align: 'left', sortableColumn: false },
    {
      label: `${PatientTableLabels.IPP}${!deidentified ? '' : ' chiffré'}`,
      code: Order.IPP,
      align: 'center',
      sortableColumn: !deidentified
    }
  ]

  return (
    <DataTable
      columns={columns}
      order={orderBy}
      setOrder={setOrderBy}
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
          <TableCell colSpan={7} align="left">
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
  const { classes } = useStyles()

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
        {patient.gender && (
          <GenderIcon gender={patient.gender.toLocaleUpperCase() as GenderStatus} className={classes.genderIcon} />
        )}
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
        {patient.extension && patient.extension.find((extension) => extension.url.includes('last-encounter'))
          ? patient.extension.find((extension) => extension.url.includes('last-encounter'))?.valueReference?.display
          : 'Non renseigné'}
      </TableCell>
      <TableCell align="center">
        <StatusChip
          status={patient.deceasedDateTime ? ChipStyles.CANCELLED : ChipStyles.VALID}
          label={patient.deceasedDateTime ? PatientVitalStatus.DECEASED : PatientVitalStatus.ALIVE}
        />
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
