import React from 'react'
import { useAppSelector } from 'state'

import { CssBaseline, Grid, Typography } from '@mui/material'

import useStyles from './styles'
import CohortsList from 'components/CohortsList'

type MyCohortsProps = {
  favoriteUrl?: boolean
}

const MyCohorts = ({ favoriteUrl = false }: MyCohortsProps) => {
  const { classes, cx } = useStyles()
  const open = useAppSelector((state) => state.drawer)

  return (
    <Grid
      container
      direction="column"
      className={cx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <Grid container justifyContent="center" alignItems="center">
        <CssBaseline />
        <Grid container item xs={11}>
          <Grid item xs={12} margin="60px 0">
            <Typography
              id="cohortSaved-title"
              variant="h1"
              color="primary"
              padding="20px 0"
              borderBottom="1px solid #D0D7D8"
            >
              Mes cohortes
            </Typography>
          </Grid>

          <CohortsList favoriteUrl={favoriteUrl} />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default MyCohorts
