import React from 'react'

import { Grid, Typography } from '@mui/material'

type HeaderPageProps = {
  id: string
  title: string
}

const HeaderPage: React.FC<HeaderPageProps> = (props) => {
  const { id, title } = props
  return (
    <Grid item xs={12} margin="60px 0">
      <Typography id={id} variant="h1" color="primary" padding="20px 0" borderBottom="1px solid #D0D7D8">
        {title}
      </Typography>
    </Grid>
  )
}

export default HeaderPage
