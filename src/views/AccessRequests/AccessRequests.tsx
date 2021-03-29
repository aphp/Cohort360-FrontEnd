import React, { useEffect } from 'react'
import clsx from 'clsx'

import { Container, Divider, Grid, Paper, Typography } from '@material-ui/core'

import RequestItem from 'features/access/RequestItem'
import useStyles from './styles'
import { useAppSelector, useAppDispatch } from 'state'
import { fetchAccessRequests } from 'features/access/AccessRequestSlice'
import { accessRequestsSelector } from 'features/access/RequestSelector'

const AccessRequests = () => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const { open, requests } = useAppSelector((state) => ({
    open: state.drawer,
    requests: accessRequestsSelector(state)
  }))

  useEffect(() => {
    dispatch(fetchAccessRequests())
  }, [dispatch])

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
              {requests.length <= 0 ? (
                <Grid item>
                  <Typography className={classes.noRequest} align="center">
                    Aucune nouvelle demande
                  </Typography>
                </Grid>
              ) : (
                requests.map((request) => (
                  <Grid item key={request.id}>
                    <Divider />
                    <RequestItem request={request} />
                  </Grid>
                ))
              )}
              <Grid item>
                <Divider />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default AccessRequests
