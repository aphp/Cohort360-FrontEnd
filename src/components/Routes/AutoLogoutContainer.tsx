import React, { useContext, useEffect } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import { useNavigate } from 'react-router-dom'

import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material'

import { close as closeAction, open as openAction } from 'state/autoLogout'
import { useAppDispatch, useAppSelector } from 'state'
import { logout as logoutAction } from 'state/me'

import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../constants'
import apiBackend from 'services/apiBackend'

import useStyles from './styles'
import { AppConfig } from 'config'

const AutoLogoutContainer = () => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const appConfig = useContext(AppConfig)
  const me = useAppSelector((state) => state.me)
  const isOpen = useAppSelector((state) => state.autoLogout.isOpen)

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
    timeout: appConfig.system.sessionTimeout,
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
      const res = await apiBackend.post(`/auth/refresh/`, { refresh_token: localStorage.getItem(REFRESH_TOKEN) })

      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access_token)
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh_token)
      } else {
        logout()
      }
    } catch (error) {
      console.error(error)
      logout()
    }
  }

  useEffect(() => {
    start()
    const interval = setInterval(() => {
      refreshToken()
    }, appConfig.system.refreshTokenInterval)
    return () => {
      clearInterval(interval)
      pause()
    }
  }, [me?.id, appConfig.system.refreshTokenInterval])

  if (!me) return <></>

  return (
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
  )
}
export default AutoLogoutContainer
