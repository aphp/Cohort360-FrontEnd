import React, { ReactElement } from 'react'
import { ChipWrapper } from './styles'

export enum ChipStatus {
  VALID = 'valid',
  CANCELLED = 'cancelled',
  ERROR = 'error',
  IN_PROGRESS = 'in-progress',
  FINISHED = 'finished',
  NEW = 'new',
  STARTED = 'started',
  PENDING = 'pending',
  FAILED = 'failed'
}

export const ChipStatusColors: Record<ChipStatus, string> = {
  [ChipStatus.VALID]: '#5BC5F2',
  [ChipStatus.CANCELLED]: '#D0D7D8',
  [ChipStatus.FINISHED]: '#DCF4E9',
  [ChipStatus.NEW]: '#FFD700',
  [ChipStatus.STARTED]: '#FF9800',
  [ChipStatus.PENDING]: '#FFEB3B',
  [ChipStatus.IN_PROGRESS]: '#FFF4D1',
  [ChipStatus.FAILED]: '#F44336',
  [ChipStatus.ERROR]: '#F2B1B7'
}

type StatusChipProps = {
  label: string
  status?: ChipStatus
  icon?: ReactElement
}

const StatusChip = ({ label, status = ChipStatus.VALID, icon = <></> }: StatusChipProps) => {
  return <ChipWrapper label={label} status={status} icon={icon} size="small" />
}

export default StatusChip
