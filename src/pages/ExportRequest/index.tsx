/**
 * @fileoverview Export request page component for creating new export requests.
 * This component provides a form interface for users to configure and submit export requests.
 */

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { CssBaseline, Grid } from '@mui/material'
import ExportForm from './components/ExportForm'
import HeaderLayout from 'components/ui/Header'
import PageContainer from 'components/ui/PageContainer'

import { useAppSelector } from 'state'

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
  const navigate = useNavigate()
  const deidentified = useAppSelector((state) => state.me?.deidentified)

  useEffect(() => {
    if (deidentified) {
      navigate('/home')
    }
  }, [deidentified, navigate])

  return (
    <PageContainer>
      <Grid container justifyContent="center" alignItems="center">
        <CssBaseline />
        <HeaderLayout id="export-form-title" title="Demande d'export" titleOnly />
        <Grid container item xs={11} mt={2}>
          <ExportForm />
        </Grid>
      </Grid>
    </PageContainer>
  )
}

export default ExportRequest
