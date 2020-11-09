import React from 'react'
import { useAppSelector } from 'state'

import { CssBaseline, Grid, Typography } from '@material-ui/core'

import Research from '../../components/SavedResearch/ResearchCard'

import useStyles from './styles'
import clsx from 'clsx'

const SavedResearches = () => {
  const classes = useStyles()
  const open = useAppSelector((state) => state.drawer)

  return (
    <Grid
      container
      direction="column"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <Grid container justify="center" alignItems="center">
        <CssBaseline />
        <Grid container item xs={12} sm={9}>
          <Typography variant="h1" color="primary" className={classes.title}>
            Cohortes sauvegardées
          </Typography>
          <Research />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SavedResearches
