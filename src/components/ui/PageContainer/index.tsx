import React from 'react'
import { Grid, GridProps } from '@mui/material'
import { useAppSelector } from 'state'
import sideBarTransition from 'styles/sideBarTransition'

const PageContainer = ({ children, sx, className, ...props }: GridProps) => {
  const open = useAppSelector((state) => state.drawer)
  const { classes, cx } = sideBarTransition()

  return (
    <Grid
      container
      direction="column"
      className={cx(classes.appBar, { [classes.appBarShift]: open }, className)}
      sx={{ ...sx }}
      {...props}
    >
      {children}
    </Grid>
  )
}

export default PageContainer
