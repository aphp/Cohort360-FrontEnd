import React from 'react'

import { CircularProgress, Grid, ListItemIcon, ListItemText, Pagination, Typography } from '@mui/material'

import { CohortPatient } from 'types'

import { getAge } from 'utils/age'
import { capitalizeFirstLetter } from 'utils/capitalize'

import useStyles from './styles'
import { GenderStatus } from 'types/searchCriterias'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ListItemWrapper } from 'components/ui/ListItem'
import { ListWrapper } from 'components/ui/ListWrapper'
import GenderIcon from 'components/ui/GenderIcon'
import StatusChip, { ChipStyles } from 'components/ui/StatusChip'
import { VitalStatusLabel } from 'types/requestCriterias'

type ListPatientProps = {
  loading: boolean
  deidentified: boolean
  patientsList: CohortPatient[]
  rowsPerPage?: number
  page?: number
  setPage?: (page: number) => void
  total?: number
  onCloseDrawer: () => void
}
const ListPatient: React.FC<ListPatientProps> = ({
  loading,
  deidentified,
  patientsList,
  rowsPerPage,
  page,
  setPage,
  total,
  onCloseDrawer
}) => {
  const { classes } = useStyles()

  return (
    <Grid container direction="column" alignItems="center">
      {loading ? (
        <CircularProgress />
      ) : (
        <ListWrapper>
          {!loading && patientsList && patientsList.length > 0 ? (
            <>
              {patientsList.map((patient) => {
                return (
                  <ListPatientLine
                    key={patient.id}
                    patient={patient}
                    deidentified={deidentified}
                    onCloseDrawer={onCloseDrawer}
                  />
                )
              })}
            </>
          ) : (
            <Grid container justifyContent="center">
              <Typography variant="h6">Aucun patient à afficher</Typography>
            </Grid>
          )}
        </ListWrapper>
      )}
      <Pagination
        className={classes.pagination}
        count={Math.ceil((total ?? 0) / (rowsPerPage ?? 20))}
        shape="circular"
        onChange={(event, page: number) => setPage && setPage(page)}
        page={page}
      />
    </Grid>
  )
}

const ListPatientLine: React.FC<{
  deidentified: boolean
  patient: CohortPatient
  onCloseDrawer: () => void
}> = ({ deidentified, patient, onCloseDrawer }) => {
  const { classes } = useStyles()
  const { patientId, tabName } = useParams<{
    patientId: string
    tabName: string
  }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { search } = location

  const firstName = deidentified ? 'Prénom' : patient.name?.[0].given?.[0] ?? ''
  const lastName = deidentified ? 'Nom' : patient.name?.map((e) => e.family).join(' ') ?? ''
  const age = getAge(patient)
  const ipp = deidentified
    ? `IPP chiffré: ${patient.id}`
    : `IPP: ${
        patient.identifier?.find((identifier) => identifier.type?.coding?.[0].code === 'IPP')?.value ?? 'inconnu'
      }`

  return (
    <ListItemWrapper
      key={patient.id}
      divider
      selected={patientId === patient.id}
      onClick={() => {
        navigate(`/patients/${patient.id}${tabName ? `/${tabName}` : ''}${search}`)
        onCloseDrawer()
      }}
    >
      <ListItemIcon style={{ minWidth: '32px' }}>
        <GenderIcon gender={patient.gender?.toLocaleUpperCase() as GenderStatus} className={classes.genderIcon} />
      </ListItemIcon>
      <ListItemText primary={`${capitalizeFirstLetter(firstName)} ${lastName}`} secondary={`${age} - ${ipp}`} />
      <StatusChip
        status={patient.deceasedDateTime ? ChipStyles.CANCELLED : ChipStyles.VALID}
        label={patient.deceasedDateTime ? VitalStatusLabel.DECEASED : VitalStatusLabel.ALIVE}
      />
    </ListItemWrapper>
  )
}

export default ListPatient
