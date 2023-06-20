import React from 'react'

import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'

import useStyles from './styles'

export type ChipsProps<T, TL> = {
  value: {
    id: T
    label: TL
    onDelete: (value: T) => void
  }[]
}
const Chips = <T, TL>({ value }: ChipsProps<T, TL>) => {
  const { classes } = useStyles()

  return (
    <Grid container>
      {value?.length > 0 &&
        value.map(({ label, id, onDelete }) => (
          <Chip
            key={id as string}
            className={classes.chips}
            label={label as string}
            onDelete={onDelete}
            color="primary"
            variant="outlined"
          />
        ))}
    </Grid>
  )
}

export default Chips
