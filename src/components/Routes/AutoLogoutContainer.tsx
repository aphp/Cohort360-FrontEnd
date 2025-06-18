/**
 * @fileoverview Auto Logout Container Component
 *
 * This component provides automatic logout functionality for the Cohort360 application.
 * It monitors user activity and handles session management including:
 * - Idle time detection with configurable timeout
 * - Token refresh for maintaining active sessions
 * - Warning dialog before automatic logout
 * - Manual logout functionality
 * - Cross-tab synchronization of idle state
 *
 * The component integrates with the Redux store for state management and uses
 * react-idle-timer for activity monitoring. It automatically refreshes authentication
 * tokens at regular intervals and prompts users before logging them out due to inactivity.
 *
 * @module AutoLogoutContainer
 * @since 1.0.0
 */

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

/**
 * AutoLogoutContainer Component
 *
 * A React component that manages automatic logout functionality based on user inactivity.
 * This component runs in the background and monitors user activity, showing a warning
 * dialog before automatically logging out inactive users.
 *
 * Features:
 * - Configurable session timeout (default: 15 minutes)
 * - Warning prompt 1 minute before logout
 * - Automatic token refresh every configured interval
 * - Cross-tab synchronization of idle state
 * - Manual logout and stay-active options
 *
 * The component integrates with:
 * - Redux store for auto-logout state management
 * - Authentication system for token management
 * - React Router for navigation on logout
 * - Application configuration for timeout settings
 *
 * @returns JSX.Element The auto-logout dialog component
 *
 * @example
 * ```tsx
 * // Used in the main application layout
 * <Routes>
 *   <Route path="/" element={<HomePage />} />
 *   <AutoLogoutContainer />
 * </Routes>
 * ```
 */
const AutoLogoutContainer = () => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const appConfig = useContext(AppConfig)
  const me = useAppSelector((state) => state.me)
  const isOpen = useAppSelector((state) => state.autoLogout.isOpen)

  /**
   * Handles the idle timeout event.
   * Automatically logs out the user when the idle timeout is reached.
   */
  const handleOnIdle = () => {
    logout()
  }

  /**
   * Handles the prompt event before idle timeout.
   * Opens the warning dialog to notify the user of impending logout.
   */
  const handleOnPrompt = () => {
    dispatch(openAction())
  }

  /**
   * Handles the user becoming active again.
   * Closes the warning dialog and resets the idle timer.
   */
  const handleOnActive = () => {
    dispatch(closeAction())
    reset()
  }

  /**
   * Handles any user action/activity.
   * Resets the idle timer to restart the countdown.
   */
  const handleOnAction = () => {
    reset()
  }

  /**
   * Idle timer configuration and handlers.
   *
   * Configuration:
   * - crossTab: Synchronizes idle state across browser tabs
   * - syncTimers: Immediate synchronization (0ms delay)
   * - timeout: Session timeout from app configuration
   * - promptBeforeIdle: Shows warning 1 minute before logout
   * - throttle: Throttles activity detection to 1 minute intervals
   */
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

  /**
   * Performs complete logout process.
   *
   * Steps performed:
   * 1. Closes the warning dialog
   * 2. Navigates to the home page
   * 3. Clears all localStorage data
   * 4. Dispatches logout action to Redux store
   * 5. Pauses the idle timer
   */
  const logout = () => {
    dispatch(closeAction())
    navigate('/')
    localStorage.clear()
    dispatch(logoutAction())
    pause()
  }

  /**
   * Handles the user's choice to stay active.
   *
   * Resets the idle timer and closes the warning dialog.
   * If any error occurs during the process, automatically logs out the user.
   *
   * @async
   */
  const stayActive = async () => {
    try {
      reset()
      dispatch(closeAction())
    } catch (error) {
      console.error(error)
      logout()
    }
  }

  /**
   * Refreshes the authentication tokens to maintain session.
   *
   * This function:
   * 1. Sends a refresh token request to the backend
   * 2. Updates localStorage with new tokens if successful
   * 3. Logs out the user if refresh fails or returns non-200 status
   *
   * Called automatically at regular intervals to prevent session expiration
   * during active use.
   *
   * @async
   */
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

  /**
   * Effect hook for initializing auto-logout functionality.
   *
   * Sets up:
   * - Idle timer startup
   * - Token refresh interval based on app configuration
   * - Cleanup on component unmount or dependency changes
   *
   * Dependencies:
   * - me: User authentication state
   * - appConfig.system.refreshTokenInterval: Token refresh frequency
   */
  useEffect(() => {
    start()
    const interval = setInterval(() => {
      refreshToken()
    }, appConfig.system.refreshTokenInterval)
    return () => {
      clearInterval(interval)
      pause()
    }
  }, [me, appConfig.system.refreshTokenInterval])

  // Don't render the component if user is not authenticated
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
