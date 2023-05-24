import React from 'react'
import { useAppSelector } from 'state'

import { CssBaseline, Grid, Typography } from '@mui/material'

import Research from 'components/SavedResearch/ResearchCard'

import useStyles from './styles'
import clsx from 'clsx'

const SavedResearches = () => {
  const { classes } = useStyles()
  const open = useAppSelector((state) => state.drawer)

  return (
    <Grid
      container
      direction="column"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <Grid container justifyContent="center" alignItems="center">
        <CssBaseline />
        <Grid container item xs={11}>
          <Typography id="cohortSaved-title" variant="h1" color="primary" className={classes.title}>
            Mes cohortes
          </Typography>

          <Research />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SavedResearches
