import React, { ReactElement } from 'react'
import { ChipWrapper } from './styles'

export enum ChipStatus {
  VALID = 'valid',
  CANCELLED = 'cancelled',
  ERROR = 'error',
  IN_PROGRESS = 'in-progress',
  FINISHED = 'finished'
}

export const ChipStatusColors: Record<ChipStatus, string> = {
  [ChipStatus.VALID]: '#5BC5F2',
  [ChipStatus.CANCELLED]: '#D0D7D8',
  [ChipStatus.FINISHED]: '#DCF4E9',
  [ChipStatus.IN_PROGRESS]: '#FFF4D1',
  [ChipStatus.ERROR]: '#F2B1B7'
}

export const ChipStatusContentColors: Record<ChipStatus, string> = {
  [ChipStatus.VALID]: '#FFF',
  [ChipStatus.CANCELLED]: '#FFF',
  [ChipStatus.FINISHED]: '#4EAC6A',
  [ChipStatus.IN_PROGRESS]: '#EEBD2B',
  [ChipStatus.ERROR]: '#DC3545'
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
