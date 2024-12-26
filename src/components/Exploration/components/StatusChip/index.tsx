import React, { ReactElement } from 'react'
import { ChipWrapper } from './styles'

export type StatusVariant = 'error' | 'in-progress' | 'finished'

type StatusChipProps = {
  label: string
  status: StatusVariant
  icon?: ReactElement
}

// TODO: à merge avec l'autre status chip? faire attention, il y a aussi un troisieme style qui traine

const StatusChip = ({ label, status, icon }: StatusChipProps) => {
  return <ChipWrapper label={label} status={status} icon={icon} />
}

export default StatusChip
