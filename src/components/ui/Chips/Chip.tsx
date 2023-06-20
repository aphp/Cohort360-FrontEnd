import React from 'react'

<<<<<<< HEAD
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
=======
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
>>>>>>> e3aca6ee (refactor: search criterias)
