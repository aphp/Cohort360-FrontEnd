import React from 'react'
import { ChipWrapper } from './styles'

type ChipProps<T> = {
  label: T
  onDelete: () => void
}
const Chip = <T,>({ label, onDelete }: ChipProps<T>) => {
  return (
    <ChipWrapper label={label as string} size="small" onDelete={() => onDelete()} color="primary" variant="outlined" />
  )
}

export default Chip
