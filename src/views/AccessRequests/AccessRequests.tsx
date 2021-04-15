import React, { useEffect, useState } from 'react'
import clsx from 'clsx'

import { Container, Divider, Grid, Paper, Typography, Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

import RequestItem from 'features/access/RequestItem'
import useStyles from './styles'
import { useAppSelector, useAppDispatch } from 'state'
import { fetchAccessRequests } from 'features/access/AccessRequestSlice'
import { accessRequestsSelector } from 'features/access/RequestSelector'

const AccessRequests = () => {
  const classes = useStyles()
  const [snackbarState, setSnackbarState] = useState<{ message?: string; error?: boolean }>({})
  const dispatch = useAppDispatch()
  const { open, requests } = useAppSelector((state) => ({
    open: state.drawer,
    requests: accessRequestsSelector(state)
  }))

  const handleCloseSnackbar = () => {
    setSnackbarState({})
  }
  const handleRequestSuccess = () => {
    setSnackbarState({ error: false, message: `Votre réponse a bien été prise en compte` })
  }
  const handleRequestError = () => {
    setSnackbarState({
      error: true,
      message: `Une erreur est survenue. Votre réponse n'a pas pu être prise en compte.`
    })
  }

  useEffect(() => {
    dispatch(fetchAccessRequests())
  }, [dispatch])

  return (
    <Container
      className={clsx(classes.root, {
        [classes.appBarShift]: open
      })}
    >
      <Snackbar
        open={!!snackbarState.message}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarState.error ? 'error' : 'success'}>
          {snackbarState.message}
        </Alert>
      </Snackbar>
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
                    <RequestItem
                      onSubmitSuccess={handleRequestSuccess}
                      onSubmitError={handleRequestError}
                      request={request}
                    />
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
