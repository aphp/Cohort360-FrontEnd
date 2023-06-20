import React, { ReactElement } from 'react'
import { ChipWrapper } from './styles'

export enum ChipStyles {
  VALID = 'valid',
  CANCELLED = 'cancelled'
}

type StatusChipProps = {
  label: string
  status?: ChipStyles
  icon?: ReactElement
}

const StatusChip = ({ label, status = ChipStyles.VALID, icon = <></> }: StatusChipProps) => {
  return <ChipWrapper label={label} status={status} icon={icon} />
}

export default StatusChip
