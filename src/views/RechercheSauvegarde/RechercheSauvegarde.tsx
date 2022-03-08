import React from 'react'
import { useAppSelector } from 'state'

import { CssBaseline, Grid, Typography } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

import Research from 'components/SavedResearch/ResearchCard'

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
      <Grid container justifyContent="center" alignItems="center">
        <CssBaseline />
        <Grid container item xs={11}>
          <Typography id="cohortSaved-title" variant="h1" color="primary" className={classes.title}>
            Mes cohortes sauvegardées
          </Typography>

          <Alert severity="warning" style={{ marginTop: 16, width: '100%' }}>
            Une anomalie a été détectée sur l'export de données. Cette fonctionnalité a été désactivée. L'équipe
            Cohort360 met tout en œuvre pour résoudre ce problème.
          </Alert>

          <Research />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SavedResearches
