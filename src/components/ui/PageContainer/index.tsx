import React, { PropsWithChildren } from 'react'
import { Grid, GridProps } from '@mui/material'
import { useAppSelector } from 'state'
import sideBarTransition from 'styles/sideBarTransition'

type PageContainerProps = PropsWithChildren<GridProps> & {
  bgColor?: string
}

const PageContainer = ({ bgColor = '#FFF', children, sx, className, ...props }: PageContainerProps) => {
  const open = useAppSelector((state) => state.drawer)
  const { classes, cx } = sideBarTransition()

  return (
    <Grid
      container
      direction="column"
      className={cx(classes.appBar, { [classes.appBarShift]: open }, className)}
      sx={{ backgroundColor: bgColor, ...sx }}
      {...props}
    >
      {children}
    </Grid>
  )
}

export default PageContainer
