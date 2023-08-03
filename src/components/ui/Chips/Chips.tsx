import React from 'react'

import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'

import useStyles from './styles'

export type ChipsProps = {
  chips: {
    label: string
    onDelete?: () => void
  }[]
}
const Chips = ({ chips }: ChipsProps) => {
  const { classes } = useStyles()

  return (
    <Grid container>
      {chips?.length > 0 &&
        chips.map(({ label, onDelete }, index) => (
          <Chip
            key={index}
            className={classes.chips}
            label={label}
            onDelete={onDelete}
            color="primary"
            variant="outlined"
          />
        ))}
    </Grid>
  )
}

export default Chips
