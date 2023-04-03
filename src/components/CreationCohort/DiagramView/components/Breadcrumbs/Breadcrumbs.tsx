import React, { useState, useEffect } from 'react'

import { Breadcrumbs, Grid, Typography } from '@mui/material'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchProjects as fetchProjectsList } from 'state/project'
import { fetchRequests as fetchRequestsList } from 'state/request'

import useStyles from './styles'

const CohortCreationBreadcrumbs: React.FC = () => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const {
    request: { requestId, currentSnapshot },
    projects = [],
    requests = []
  } = useAppSelector(
    (state) =>
      ({
        request: state.cohortCreation.request,
        projects: state.project.projectsList,
        requests: state.request.requestsList
      } || {
        request: { requestId: null, currentSnapshot: [] },
        projects: [],
        requests: []
      })
  )
  const [projectName, setProjectName] = useState('Projet de recherche')
  const [requestName, setRequestName] = useState('Requête')

  useEffect(() => {
    if (!projects || (projects && projects.length === 0)) {
      dispatch<any>(fetchProjectsList())
    } else if (!requests || (requests && requests.length === 0)) {
      dispatch<any>(fetchRequestsList())
    } else {
      const foundItem = requests.find(({ uuid }) => uuid === requestId)
      if (foundItem) {
        setRequestName(foundItem.name)
        const foundProject = projects.find(({ uuid }) => uuid === foundItem.parent_folder)
        if (foundProject) {
          setProjectName(foundProject.name)
        }
      }
    }
  }, [projects, requests])

  return (
    <Grid container className={classes.root}>
      <Breadcrumbs separator=">" aria-label="breadcrumb">
        <Typography>{projectName}</Typography>
        <Typography>{requestName}</Typography>
        {currentSnapshot && currentSnapshot.length > 0 && <Typography>{currentSnapshot.split('-')[0]}</Typography>}
      </Breadcrumbs>
    </Grid>
  )
}

export default CohortCreationBreadcrumbs
