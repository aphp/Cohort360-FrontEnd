import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { CssBaseline, Grid } from '@mui/material'
import ExportForm from './components/ExportForm'
import HeaderLayout from 'components/ui/Header'
import PageContainer from 'components/ui/PageContainer'

import { useAppSelector } from 'state'

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
