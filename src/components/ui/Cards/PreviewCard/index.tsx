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
      <Grid container spacing={3}>
        <Grid id="research-card-title" item xs={9}>
          <Typography component="h2" variant="h2" color="primary" gutterBottom>
            {title}
          </Typography>
        </Grid>
        <Grid item container xs={3} justifyContent="flex-end">
          <LinkWrapper onClick={onClickLink}>{linkLabel}</LinkWrapper>
        </Grid>
      </Grid>
      <Grid item margin="16px 0px 0px">
        {children}
      </Grid>
    </>
  )
}

export default PreviewCard
