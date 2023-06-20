import React from 'react'

import Chip from '@mui/material/Chip'

import useStyles from './styles'

export type ChipProps<T> = {
  label: T
  onDelete: () => void
}
const Chips = <T,>({ label, onDelete }: ChipProps<T>) => {
  const { classes } = useStyles()

  return (
    <Chip
      className={classes.chips}
      label={label as string}
      onDelete={() => onDelete()}
      color="primary"
      variant="outlined"
    />
  )
}

export default Chips
