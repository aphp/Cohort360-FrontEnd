import React, { PropsWithChildren, ReactNode } from 'react'
import { Grid, Typography } from '@mui/material'
import { LinkWrapper } from './styles'

type PreviewCardProps = {
  children: ReactNode
  title: string
  linkLabel: string
  onClickLink: () => void
}

const PreviewCard = ({ children, title, linkLabel, onClickLink }: PropsWithChildren<PreviewCardProps>) => {
  return (
    <>
      <Grid container>
        <Grid id="research-card-title" size={{ xs: 9 }}>
          <Typography component="h2" variant="h2" color="primary" gutterBottom>
            {title}
          </Typography>
        </Grid>
        <Grid container size={{ xs: 3 }} sx={{ justifyContent: 'flex-end' }}>
          <LinkWrapper onClick={onClickLink}>{linkLabel}</LinkWrapper>
        </Grid>
      </Grid>
      <Grid sx={{ margin: '16px 0px 0px' }}>{children}</Grid>
    </>
  )
}

export default PreviewCard
