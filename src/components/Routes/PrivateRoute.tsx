/**
 * @fileoverview Private Route Component
 *
 * This component provides protected route functionality for the Cohort360 application.
 * It ensures that only authenticated users can access protected areas of the application
 * and handles authentication state management including:
 *
 * - Authentication verification using Redux state and localStorage tokens
 * - User tracking integration with Microsoft Clarity analytics
 * - Graceful handling of unauthenticated access with user-friendly dialogs
 * - Path preservation for post-login redirection
 * - Blacklist functionality for excluding specific users from tracking
 *
 * The component acts as a wrapper around React Router's Outlet, conditionally
 * rendering protected content or redirecting to the login page based on authentication status.
 *
 * @module PrivateRoute
 * @since 1.0.0
 */

import React, { useContext, useEffect, useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'

import { ACCESS_TOKEN } from '../../constants'

import { useAppSelector, useAppDispatch } from '../../state'
import { AppConfig } from 'config'
import { throttle } from 'lodash'
import { updateConfigFromFhirMetadata } from 'services/aphp/serviceFhirConfig'

/**
 * Global window object type declaration to access Microsoft Clarity tracking.
 * Used for user analytics and tracking functionality.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: any

/**
 * PrivateRoute Component
 *
 * A React component that protects routes from unauthorized access. This component
 * verifies user authentication status and either renders the protected content
 * or shows an authentication dialog before redirecting to the login page.
 *
 * Key features:
 * - Authentication verification using both Redux state and localStorage tokens
 * - Microsoft Clarity user tracking integration with privacy controls
 * - User-friendly dialog for handling session expiration
 * - Automatic path preservation for post-login redirection
 * - Support for user tracking blacklist from configuration
 *
 * Authentication logic:
 * 1. Checks if user is authenticated via Redux state (`me`)
 * 2. Verifies presence of authentication token in localStorage
 * 3. If authenticated: renders protected content via `<Outlet />`
 * 4. If not authenticated: shows confirmation dialog then redirects to login
 *
 * @returns JSX.Element Either the protected route content, redirect, or authentication dialog
 *
 * @example
 * ```tsx
 * // Used in React Router configuration
 * <Routes>
 *   <Route path="/" element={<PublicHomePage />} />
 *   <Route element={<PrivateRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *     <Route path="/patients" element={<PatientList />} />
 *   </Route>
 * </Routes>
 * ```
 */
const PrivateRoute: React.FC = () => {
  const me = useAppSelector((state) => state.me)
  const dispatch = useAppDispatch()
  const appConfig = useContext(AppConfig)
  const location = useLocation()
  const authToken = localStorage.getItem(ACCESS_TOKEN)
  const [fetchedFhirMetadata, setFetchedFhirMetadata] = useState(false)

  /** State to control when redirection to login page is allowed */
  const [allowRedirect, setAllowRedirect] = useState(false)

  /**
   * Effect hook for managing user tracking with Microsoft Clarity.
   *
   * This effect:
   * 1. Identifies the authenticated user to Clarity analytics
   * 2. Applies tracking exclusion for blacklisted users based on configuration
   * 3. Only runs when user is authenticated and Clarity is available
   *
   * Privacy considerations:
   * - Users can be excluded from tracking via the userTrackingBlacklist configuration
   * - User identification helps with support and debugging while respecting privacy
   *
   * Dependencies:
   * - me: Current user authentication state
   * - appConfig.system.userTrackingBlacklist: List of user IDs to exclude from tracking
   * - dispatch: Redux dispatch function (for consistency in dependency array)
   */
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

  // Authentication check: user must be authenticated and have a valid token
  if (!me || (!me && !authToken)) {
    // If user has confirmed the dialog, redirect to login page
    if (allowRedirect === true) return <Navigate to="/" replace />

    // Show authentication expired dialog before redirect
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
              // Preserve current path for post-login redirection
              localStorage.setItem('old-path', location.pathname + location.search)
              setAllowRedirect(true)
            }}
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    )
  } else {
    // User is authenticated, render the protected route content
    return <Outlet />
  }
}

export default PrivateRoute
