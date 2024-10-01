import React from 'react'

import { Grid, CssBaseline } from '@mui/material'

import HeaderPage from 'components/ui/HeaderPage'

import { useAppSelector } from 'state'

import sideBarTransition from 'styles/sideBarTransition'

const Export: React.FC = () => {
  const { classes, cx } = sideBarTransition()
  const openDrawer = useAppSelector((state) => state.drawer)

  return (
    <Grid
      container
      direction="column"
      className={cx(classes.appBar, {
        [classes.appBarShift]: openDrawer
      })}
    >
      <Grid container justifyContent="center" alignItems="center">
        <CssBaseline />
        <Grid container item xs={11}>
          <HeaderPage id="export-page-title" title="Mes exports" />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Export
