import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IdleTimer } from 'react-idle-timer'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import { DialogContentText } from '@mui/material'
import axios from 'axios'

import { ACCES_TOKEN, REFRESH_TOKEN, /* CONTEXT,*/ BACK_API_URL } from '../../constants'

import { useAppSelector, useAppDispatch } from 'state'
import { logout as logoutAction } from 'state/me'
import useStyles from './styles'

const AutoLogoutContainer = () => {
  const classes = useStyles()

  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const inactifTimerRef = useRef(null)
  const sessionInactifTimerRef = useRef(null)

  const { me } = useAppSelector((state) => ({ me: state.me }))

  const logout = () => {
    setDialogIsOpen(false)
    navigate('/')
    localStorage.clear()
    dispatch(logoutAction())
    clearTimeout(sessionInactifTimerRef.current)
    clearTimeout(inactifTimerRef)
  }

  const onIdle = () => {
    setDialogIsOpen(true)
    sessionInactifTimerRef.current = setTimeout(logout, 2 * 30 * 1000)
  }

  const stayActive = async () => {
    try {
      const res = await axios.post(`${BACK_API_URL}/accounts/refresh/`)

      if (res.status === 200) {
        localStorage.setItem(ACCES_TOKEN, res.data.access)
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh)
        setDialogIsOpen(false)
        clearTimeout(sessionInactifTimerRef.current)
        clearTimeout(inactifTimerRef)
      } else {
        logout()
      }
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
      refreshToken()
      setRefreshInterval(
        setInterval(() => {
          refreshToken()
        }, 3 * 60 * 1000)
      )
    } else if (me == null) {
      clearInterval(refreshInterval)
    }
  }, [me])

  if (!me) return <></>

  return (
    <div>
      <Dialog open={dialogIsOpen}>
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
      <IdleTimer ref={inactifTimerRef} timeout={13 * 60 * 1000} onIdle={onIdle}></IdleTimer>
    </div>
  )
}

export default AutoLogoutContainer
