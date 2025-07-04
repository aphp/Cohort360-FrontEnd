import React from 'react'

import { Grid, CssBaseline } from '@mui/material'

import HeaderPage from 'components/ui/HeaderPage'
import PageContainer from 'components/ui/PageContainer'

const FeasibilityReports: React.FC = () => {
  return (
    <PageContainer>
      <Grid container justifyContent="center" alignItems="center">
        <CssBaseline />
        <Grid container item xs={11}>
          <HeaderPage id="feasibility-reports-page-title" title="Mes rapports de faisabilite" />
        </Grid>
      </Grid>
    </PageContainer>
  )
}

export default FeasibilityReports
