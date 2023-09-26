import React from 'react'
import { PatientVitalStatus } from 'types/patient'
import { ChipWrapper } from './styles'

type StatusChipProps = {
  vitalStatus: PatientVitalStatus
}

const StatusChip = ({ vitalStatus }: StatusChipProps) => {
  return <ChipWrapper label={vitalStatus} alive={vitalStatus === PatientVitalStatus.ALIVE} />
}

export default StatusChip
