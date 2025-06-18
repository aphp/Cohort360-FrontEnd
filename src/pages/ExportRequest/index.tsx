/**
 * @fileoverview Export request page component for creating new data export requests.
 * This component provides a form interface for users to configure and submit export requests.
 */

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { CssBaseline, Grid } from '@mui/material'
import sideBarTransition from 'styles/sideBarTransition'
import HeaderPage from 'components/ui/HeaderPage'

import { useAppSelector } from 'state'
import ExportForm from './components/ExportForm'

/**
 * Export request page component that renders the export configuration form.
 *
 * Features:
 * - Displays export form for creating new export requests
 * - Redirects deidentified users to home page
 * - Responsive layout with sidebar support
 *
 * @returns {JSX.Element} The ExportRequest page component
 */
const ExportRequest = () => {
  const { classes, cx } = sideBarTransition()
  const openDrawer = useAppSelector((state) => state.drawer)
  const navigate = useNavigate()
  const deidentified = useAppSelector((state) => state.me?.deidentified)

  useEffect(() => {
    if (deidentified) {
      navigate('/home')
    }
  }, [deidentified, navigate])

  return (
    <Grid
      container
      flexDirection={'column'}
      className={cx(classes.appBar, {
        [classes.appBarShift]: openDrawer
      })}
    >
      <Grid container justifyContent="center" alignItems="center">
        <CssBaseline />
        <Grid container item xs={11}>
          <HeaderPage id="export-form-title" title="Demande d'export" />
          <ExportForm />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ExportRequest
