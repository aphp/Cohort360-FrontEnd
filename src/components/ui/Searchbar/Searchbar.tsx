import React, { ReactNode } from 'react'

import { Grid } from '@mui/material'
import useStyles from './styles'

type SearchbarProps = {
  children: ReactNode[]
}

const Searchbar = ({ children }: SearchbarProps) => {
  const { classes } = useStyles()

  return (
    <Grid container justifyContent="space-between" alignItems="flex-end" className={classes.searchbarWrapper}>
      {children.map((child) => child)}
    </Grid>
  )
}

export default Searchbar
