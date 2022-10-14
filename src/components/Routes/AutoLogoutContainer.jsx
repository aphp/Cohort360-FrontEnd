import { DialogContentText } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import { useHistory } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'state'
import { close as closeAction, open as openAction } from 'state/autoLogout'
import { logout as logoutAction } from 'state/me'
import { ACCES_TOKEN, BACK_API_URL, REFRESH_TOKEN, REFRESH_TOKEN_INTERVAL, SESSION_TIMEOUT } from '../../constants'
import useStyles from './styles'

const AutoLogoutContainer = () => {
  const classes = useStyles()
  const [refreshInterval, setRefreshInterval] = useState()
  const dispatch = useAppDispatch()
  const history = useHistory()
  const { me } = useAppSelector((state) => ({ me: state.me }))
  const { isOpen } = useAppSelector((state) => ({
    isOpen: state.autoLogout.isOpen
  }))

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
    promptTimeout: 1 * 60 * 1000,
    throttle: 1 * 60 * 1000,
    onPrompt: handleOnPrompt,
    onIdle: handleOnIdle,
    onActive: handleOnActive,
    onAction: handleOnAction
  })

  const logout = () => {
    dispatch(closeAction())
    history.push('/')
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
        localStorage.setItem(ACCES_TOKEN, res.data.access)
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
