import React from 'react'

import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'

import useStyles from './styles'

export type MasterChipsProps = {
  chips: {
    label: string
    onDelete?: () => void
  }[]
}
const MasterChips: React.FC<MasterChipsProps> = ({ chips }) => {
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

export default MasterChips
