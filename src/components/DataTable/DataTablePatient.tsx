import React, { useContext } from 'react'
import moment from 'moment'

import { CircularProgress, Grid, TableRow, Typography } from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import DataTable from 'components/DataTable/DataTable'

import { CohortPatient, Column } from 'types'

import { getAge } from 'utils/age'
import { capitalizeFirstLetter } from 'utils/capitalize'

import useStyles from './styles'
import { GenderStatus, Order, OrderBy } from 'types/searchCriterias'
import { PatientTableLabels } from 'types/patient'
import GenderIcon from 'components/ui/GenderIcon'
import StatusChip, { ChipStyles } from 'components/ui/StatusChip'
import { VitalStatusLabel } from 'types/requestCriterias'
import { getExtension } from 'utils/fhir'
import { AppConfig } from 'config'

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
    { label: PatientTableLabels.GENDER, code: `${Order.GENDER},${Order.ID}` },
    { label: PatientTableLabels.FIRSTNAME, code: !deidentified ? Order.NAME : undefined },
    { label: PatientTableLabels.LASTNAME, code: !deidentified ? Order.FAMILY : undefined, align: 'left' },
    {
      label: !deidentified ? PatientTableLabels.BIRTHDATE : PatientTableLabels.AGE,
      code: `${!deidentified ? Order.BIRTHDATE : Order.AGE_MONTH},${Order.ID}`
    },
    { label: PatientTableLabels.LAST_ENCOUNTER, align: 'left' },
    { label: PatientTableLabels.VITAL_STATUS },
    {
      label: `${PatientTableLabels.IPP}${!deidentified ? '' : ' chiffré'}`,
      code: !deidentified ? Order.IPP : undefined
    }
  ]

  return (
    <DataTable columns={columns} order={orderBy} setOrder={setOrderBy} page={page} setPage={setPage} total={total}>
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
          <TableCellWrapper colSpan={7} align="left">
            <Grid container justifyContent="center">
              {loading ? <CircularProgress /> : <Typography variant="button">Aucun patient à afficher</Typography>}
            </Grid>
          </TableCellWrapper>
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
  const appConfig = useContext(AppConfig)
  const _groupId = groupId ? `?groupId=${groupId}` : ''
  const _search = search ? `&search=${search}` : ''
  const _patientName = patient.name?.[0].given?.[0]
    ? capitalizeFirstLetter(patient.name?.[0].given?.[0])
    : 'Non renseigné'
  return (
    <TableRow
      key={patient.id}
      className={classes.tableBodyRows}
      hover
      onClick={() => window.open(`/patients/${patient.id}${_groupId}${_search}`, '_blank')}
    >
      <TableCellWrapper>
        {patient.gender && (
          <GenderIcon gender={patient.gender.toLocaleUpperCase() as GenderStatus} className={classes.genderIcon} />
        )}
      </TableCellWrapper>
      <TableCellWrapper align="left">{deidentified ? 'Prénom' : _patientName}</TableCellWrapper>
      <TableCellWrapper align="left">
        {deidentified
          ? 'Nom'
          : patient.name
              ?.map((e) => {
                if (e.use === 'official') {
                  return e.family ?? 'Non renseigné'
                }
                if (e.use === 'maiden') {
                  return `(${patient.gender === 'female' ? 'née' : 'né'} : ${e.family})`
                }
              })
              .join(' ') ?? 'Non renseigné'}
      </TableCellWrapper>
      <TableCellWrapper>
        {deidentified ? (
          <Typography>{getAge(patient)}</Typography>
        ) : (
          <>
            <Typography>
              {patient.birthDate ? moment(patient.birthDate).format('DD/MM/YYYY') : 'Non renseigné'}
            </Typography>
            <Typography>{`(${getAge(patient)})`}</Typography>
          </>
        )}
      </TableCellWrapper>
      <TableCellWrapper align="left">
        {getExtension(patient, appConfig.core.extensions.patientLastEnconterUrl)?.valueReference?.display ||
          'Non renseigné'}
      </TableCellWrapper>
      <TableCellWrapper>
        <StatusChip
          status={patient.deceasedDateTime || patient.deceasedBoolean ? ChipStyles.CANCELLED : ChipStyles.VALID}
          label={
            patient.deceasedDateTime || patient.deceasedBoolean ? VitalStatusLabel.DECEASED : VitalStatusLabel.ALIVE
          }
        />
      </TableCellWrapper>

      <TableCellWrapper>
        <Typography onClick={(event) => event.stopPropagation()}>
          {deidentified
            ? patient.id
            : patient.identifier?.find((identifier) => identifier.type?.coding?.[0].code === 'IPP')?.value ??
              patient.identifier?.[0].value ??
              'IPP inconnnu'}
        </Typography>
      </TableCellWrapper>
    </TableRow>
  )
}

export default DataTablePatient
