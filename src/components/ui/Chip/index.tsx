import React from 'react'
import CancelIcon from '@mui/icons-material/Cancel'
import { ChipWrapper } from './styles'

type ChipProps<T> = {
  label: T
  style?: object
  onDelete: (event?: any) => void
}
const Chip = <T,>({ label, style, onDelete }: ChipProps<T>) => {
  return (
    <ChipWrapper
      label={label as string}
      style={style}
      onDelete={onDelete}
      deleteIcon={<CancelIcon data-testid="CancelIcon" />}
    />
  )
}

export default Chip
