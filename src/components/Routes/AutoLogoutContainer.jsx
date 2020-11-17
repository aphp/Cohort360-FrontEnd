import React, { useRef, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import IdleTimer from 'react-idle-timer'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import { DialogContentText } from '@material-ui/core'
import axios from 'axios'

import { ACCES_TOKEN, REFRESH_TOKEN, CONTEXT } from '../../constants'
import { logout as logoutAction } from '../../state/me'
import useStyles from './styles'

const AutoLogoutContainer = () => {
  const classes = useStyles()

  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  const inactifTimerRef = useRef(null)
  const sessionInactifTimerRef = useRef(null)

  const logout = () => {
    setDialogIsOpen(false)
    history.push('/')
    // console.log('User a été déconnecté')
    localStorage.clear()
    dispatch(logoutAction())
    clearTimeout(sessionInactifTimerRef.current)
  }

  const onIdle = () => {
    setDialogIsOpen(true)
    // console.log('User inactif depuis 10 secondes')
    sessionInactifTimerRef.current = setTimeout(logout, 60 * 1000)
  }

  const stayActive = () => {
    axios
      .post('/api/jwt/refresh/', {
        refresh: localStorage.getItem(REFRESH_TOKEN)
      })
      .then((res) => {
        if (res.status === 200) {
          localStorage.setItem(ACCES_TOKEN, res.data.access)
          localStorage.setItem(REFRESH_TOKEN, res.data.refresh)
        }
      })
    setDialogIsOpen(false)
    // console.log('User est resté connecté')
    clearTimeout(sessionInactifTimerRef.current)
  }

  const refreshToken = async () => {
    // console.log('refresh still actif')
    if (CONTEXT === ('aphp' || 'arkhn')) {
      await axios
        .post('/api/jwt/refresh/', {
          refresh: localStorage.getItem(REFRESH_TOKEN)
        })
        .then((res) => {
          if (res.status === 200) {
            localStorage.setItem(ACCES_TOKEN, res.data.access)
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh)
          }
        })
    }
  }

  useEffect(() => {
    refreshToken()

    setInterval(() => {
      refreshToken()
    }, 13 * 60 * 1000)
  }, [])

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
      <IdleTimer
        ref={inactifTimerRef}
        timeout={14 * 60 * 1000}
        // timeout={10 * 1000}
        onIdle={onIdle}
      ></IdleTimer>
    </div>
  )
}

export default AutoLogoutContainer
