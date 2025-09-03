import React from 'react'

import { Grid, CssBaseline } from '@mui/material'

import PageContainer from 'components/ui/PageContainer'
import HeaderLayout from 'components/ui/Header'

const FeasibilityReports: React.FC = () => {
  return (
    <PageContainer>
      <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <CssBaseline />
        <HeaderLayout id="feasibility-reports-page-title" title="Mes rapports de faisabilité" titleOnly />
        <Grid container size={{ xs: 11 }}></Grid>
      </Grid>
    </PageContainer>
  )
}

export default FeasibilityReports
