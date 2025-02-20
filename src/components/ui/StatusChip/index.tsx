import React, { ReactElement } from 'react'
import { ChipWrapper } from './styles'

export enum Status {
  VALID = 'valid',
  CANCELLED = 'cancelled'
}

type StatusChipProps = {
  label: string
  status?: Status
  icon?: ReactElement
}

const StatusChip = ({ label, status = Status.VALID, icon = <></> }: StatusChipProps) => {
  return <ChipWrapper label={label} status={status} icon={icon} size='small' />
}

export default StatusChip
