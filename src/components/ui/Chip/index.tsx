import React from 'react'
import { ChipWrapper } from './styles'

type ChipProps<T> = {
  label: T
  style?: object
  onDelete: () => void
}
const Chip = <T,>({ label, style, onDelete }: ChipProps<T>) => {
  return <ChipWrapper label={label as string} style={style} onDelete={onDelete} />
}

export default Chip
