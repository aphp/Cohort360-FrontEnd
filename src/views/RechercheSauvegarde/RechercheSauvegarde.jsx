import React from 'react'
import clsx from 'clsx'
import { useSelector } from 'react-redux'
import CssBaseline from '@material-ui/core/CssBaseline'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Research from '../../components/SavedResearch/ResearchCard'

import useStyles from './style'

const SavedResearches = (props) => {
  const classes = useStyles()
  const open = useSelector((state) => state.drawer)

  return (
    <Grid
      container
      direction="column"
      position="fixed"
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
