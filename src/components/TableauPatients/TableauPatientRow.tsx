import React, { useState } from 'react'
import moment from 'moment'

import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import { TableRow, TableCell, Chip, Tooltip, IconButton, CircularProgress } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/DeleteOutlined'
import { useHistory } from 'react-router'

import { ReactComponent as FemaleIcon } from '../../assets/icones/venus.svg'
import { ReactComponent as MaleIcon } from '../../assets/icones/mars.svg'
import { ReactComponent as UnknownIcon } from '../../assets/icones/autre-inconnu.svg'

import useStyles from './styles'
import { capitalizeFirstLetter } from 'utils/capitalize'
import { excludePatientFromCohort } from 'state/exploredCohort'
import { unwrapResult } from '@reduxjs/toolkit'
import { useAppDispatch } from 'state'
import { getAge } from 'utils/age'
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

type TableauPatientRowProps = {
  patient: CohortPatient
  deidentified?: boolean | null
  showActionColumn?: boolean
  groupId?: string
}

const TableauPatientRow = ({ patient, deidentified, showActionColumn, groupId }: TableauPatientRowProps) => {
  const history = useHistory()
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const [isExcludeLoading, setExcludeLoading] = useState(false)

  const handleExcludePatient = (patientId?: string) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation()
    setExcludeLoading(true)
    dispatch(excludePatientFromCohort(patientId))
      .then(unwrapResult)
      .finally(() => {
        setExcludeLoading(false)
      })
  }

  return (
    <TableRow
      key={patient.id}
      className={classes.tableBodyRows}
      hover
      onClick={() => {
        const href = history.createHref({
          pathname: `/patients/${patient.id}${groupId ? `?groupId=${groupId}` : ''}`
        })
        window.open(href, '_blank')
      }}
    >
      <TableCell align="center">
        {patient.gender && <PatientGender gender={patient.gender} className={classes.genderIcon} />}
      </TableCell>
      <TableCell>{deidentified ? 'Prénom' : capitalizeFirstLetter(patient.name?.[0].given?.[0])}</TableCell>
      <TableCell>{deidentified ? 'Nom' : patient.name?.map((e) => e.family).join(' ')}</TableCell>
      <TableCell align="center">
        {deidentified ? getAge(patient) : `${moment(patient.birthDate).format('DD/MM/YYYY')} (${getAge(patient)})`}
      </TableCell>
      <TableCell>{patient.lastEncounterName}</TableCell>
      <TableCell>
        <StatusShip type={patient.deceasedDateTime ? 'Décédé' : 'Vivant'} />
      </TableCell>

      <TableCell align="center">
        {deidentified
          ? patient.id
          : patient.identifier?.find((identifier) => identifier.type?.coding?.[0].code === 'IPP')?.value ??
            patient.identifier?.[0].value ??
            'IPP inconnnu'}
      </TableCell>
      {showActionColumn && (
        <TableCell align="center">
          <Tooltip title="Exclure ce patient de la cohorte">
            <IconButton onClick={handleExcludePatient(patient.id)} disabled={isExcludeLoading}>
              {isExcludeLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
            </IconButton>
          </Tooltip>
        </TableCell>
      )}
    </TableRow>
  )
}

export default TableauPatientRow
