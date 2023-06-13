import React, { useEffect, useState } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import { useNavigate } from 'react-router-dom'

import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material'

import axios from 'axios'

import { close as closeAction, open as openAction } from 'state/autoLogout'
import { useAppDispatch, useAppSelector } from 'state'
import { logout as logoutAction } from 'state/me'

import { ACCESS_TOKEN, BACK_API_URL, REFRESH_TOKEN, REFRESH_TOKEN_INTERVAL, SESSION_TIMEOUT } from '../../constants'

import useStyles from './styles'

const AutoLogoutContainer = () => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { me } = useAppSelector((state) => ({ me: state.me }))
  const { isOpen } = useAppSelector((state) => ({
    isOpen: state.autoLogout.isOpen
  }))

  const [refreshInterval, setRefreshInterval] = useState()

  const handleOnIdle = () => {
    logout()
  }

  const handleOnPrompt = () => {
    dispatch(openAction())
  }

  const handleOnActive = () => {
    dispatch(closeAction())
    reset()
  }

  const handleOnAction = () => {
    reset()
  }

  const { reset, pause, start } = useIdleTimer({
    crossTab: true,
    syncTimers: 0,
    timeout: SESSION_TIMEOUT,
    promptBeforeIdle: 1 * 60 * 1000,
    throttle: 1 * 60 * 1000,
    onPrompt: handleOnPrompt,
    onIdle: handleOnIdle,
    onActive: handleOnActive,
    onAction: handleOnAction
  })

  const logout = () => {
    dispatch(closeAction())
    navigate('/')
    localStorage.clear()
    dispatch(logoutAction())
    pause()
  }

  const stayActive = async () => {
    try {
      reset()
      dispatch(closeAction())
    } catch (error) {
      console.error(error)
      logout()
    }
  }

  const refreshToken = async () => {
    try {
      const res = await axios.post(`${BACK_API_URL}/accounts/refresh/`)

      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access)
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh)
      } else {
        logout()
      }
    } catch (error) {
      console.error(error)
      logout()
    }
  }

  useEffect(() => {
    if (me !== null) {
      start()
      refreshToken()
      setRefreshInterval(
        setInterval(() => {
          refreshToken()
        }, REFRESH_TOKEN_INTERVAL)
      )
    } else if (me == null) {
      clearInterval(refreshInterval)
      pause()
    }
  }, [me])

  if (!me) return <></>

  return (
    <div>
      <Dialog open={isOpen}>
        <DialogContent>
          <DialogContentText variant="button" className={classes.title}>
            Vous allez être déconnecté car vous avez été inactif pendant 14 minutes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={stayActive} className={classes.validateButton}>
            Restez connecté
          </Button>
          <Button onClick={logout}>Déconnexion</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
export default AutoLogoutContainer
