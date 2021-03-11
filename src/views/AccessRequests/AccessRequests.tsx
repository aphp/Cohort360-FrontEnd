import React from 'react'
import clsx from 'clsx'

import { Container, Grid, Paper, Typography } from '@material-ui/core'

import RequestItem from 'features/access/RequestItem'
import useStyles from './styles'
import { useAppSelector } from 'state'

const AccessRequests = () => {
  const classes = useStyles()
  const { open } = useAppSelector((state) => ({
    open: state.drawer
  }))

  //TODO: Wire with access requests routes
  const requestCount = 1

  return (
    <Container
      className={clsx(classes.root, {
        [classes.appBarShift]: open
      })}
    >
      <Grid container direction="column" spacing={6}>
        <Grid item>
          <Typography variant="h1">Demandes d'accès</Typography>
        </Grid>
        <Grid item>
          <Paper elevation={0} className={classes.requestsContainer}>
            <Typography variant="h2">Nouvelles demandes</Typography>
            <Grid container direction="column" spacing={2} className={classes.requestList}>
              {requestCount <= 0 ? (
                <Grid item>
                  <Typography className={classes.noRequest}>Aucune nouvelle demande</Typography>
                </Grid>
              ) : (
                <Grid item>
                  <RequestItem />
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default AccessRequests
