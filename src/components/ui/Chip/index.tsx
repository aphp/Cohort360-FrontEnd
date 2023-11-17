import React from 'react'
import { ChipWrapper } from './styles'

type ChipProps<T> = {
  label: T
  onDelete: () => void
}
const Chip = <T,>({ label, onDelete }: ChipProps<T>) => {
  return <ChipWrapper label={label as string} onDelete={() => onDelete()} />
}

export default Chip
