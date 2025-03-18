import React, { ReactElement } from 'react'
import { ChipWrapper } from './styles'

export enum Status {
  VALID = 'valid',
  CANCELLED = 'cancelled',
  FINISHED = 'finished',
  NEW = 'new',
  STARTED = 'started',
  PENDING = 'pending',
  FAILED = 'failed',
  ERROR = 'error',
  IN_PROGRESS = 'in-progress'
}

export const StatusColors: Record<Status, string> = {
  [Status.VALID]: '#5BC5F2',
  [Status.CANCELLED]: '#D0D7D8',
  [Status.FINISHED]: '#8BC34A',
  [Status.NEW]: '#FFD700',
  [Status.STARTED]: '#FF9800',
  [Status.PENDING]: '#FFEB3B',
  [Status.IN_PROGRESS]: '#FFEB3B',
  [Status.FAILED]: '#F44336',
  [Status.ERROR]: '#F44336'
}

type StatusChipProps = {
  label: string
  status?: Status
  icon?: ReactElement
}

const StatusChip = ({ label, status = Status.VALID, icon = <></> }: StatusChipProps) => {
  return <ChipWrapper label={label} status={status} icon={icon} size="small" />
}

export default StatusChip
