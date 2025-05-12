import React, { useContext, useEffect, useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'

import { ACCESS_TOKEN } from '../../constants'

import { useAppSelector, useAppDispatch } from '../../state'
import { AppConfig } from 'config'
import { throttle } from 'lodash'
import { updateConfigFromFhirMetadata } from 'services/aphp/serviceFhirConfig'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: any

const PrivateRoute: React.FC = () => {
  const me = useAppSelector((state) => state.me)
  const dispatch = useAppDispatch()
  const appConfig = useContext(AppConfig)
  const location = useLocation()
  const authToken = localStorage.getItem(ACCESS_TOKEN)
  const [fetchedFhirMetadata, setFetchedFhirMetadata] = useState(false)

  const [allowRedirect, setRedirection] = useState(false)

  useEffect(() => {
    if (window.clarity && me?.id) {
      window.clarity('identify', me?.id, undefined, undefined, me?.id)
      if (appConfig.system.userTrackingBlacklist.includes(me?.id)) {
        window.clarity('set', 'exclude', 'true')
      }
    }
  }, [me, appConfig.system.userTrackingBlacklist, dispatch])

  useEffect(() => {
    const callFetchFhirMetadata = throttle(async () => {
      try {
        updateConfigFromFhirMetadata()
        setFetchedFhirMetadata(true)
      } catch (error) {
        console.error(error)
      }
    }, 1000)
    if (me && authToken) {
      if (!fetchedFhirMetadata) {
        callFetchFhirMetadata()
      }
    }
  }, [me, authToken, fetchedFhirMetadata])

  if (!me || (!me && !authToken)) {
    if (allowRedirect === true) return <Navigate to="/" replace />

    return (
      <Dialog open aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{''}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Il semblerait que vous n'êtes plus connecté. Vous allez être redirigé vers la page de connexion
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              localStorage.setItem('old-path', location.pathname + location.search)
              setRedirection(true)
            }}
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    )
  } else {
    return <Outlet />
  }
}

export default PrivateRoute
