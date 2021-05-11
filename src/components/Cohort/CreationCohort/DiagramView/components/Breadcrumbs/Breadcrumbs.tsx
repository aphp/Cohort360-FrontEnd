import React from 'react'

import { Breadcrumbs, Grid, Link } from '@material-ui/core'

import { useAppSelector } from 'state'

import useStyles from './styles'

const CohortCreationBreadcrumbs: React.FC = () => {
  const {
    projectName = 'Mon projet principal',
    requestName = 'Nouvelle requête',
    currentSnapshot
  } = useAppSelector((state) => state.cohortCreation.request || {})

  const classes = useStyles()

  function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    event.preventDefault()
  }

  return (
    <Grid container className={classes.root}>
      <Breadcrumbs separator=">" aria-label="breadcrumb">
        <Link color="inherit" href="/" onClick={handleClick}>
          {projectName}
        </Link>
        <Link color="inherit" href="/getting-started/installation/" onClick={handleClick}>
          {requestName}
        </Link>
        {currentSnapshot && currentSnapshot.length > 0 && (
          <Link color="inherit" href="/getting-started/installation/" onClick={handleClick}>
            {currentSnapshot.split('-')[0]}
          </Link>
        )}
      </Breadcrumbs>
    </Grid>
  )
}

export default CohortCreationBreadcrumbs
