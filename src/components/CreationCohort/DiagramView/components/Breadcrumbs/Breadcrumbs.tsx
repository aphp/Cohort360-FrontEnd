import React, { useState, useEffect } from 'react'

import { Breadcrumbs, Grid, Typography, useTheme, Tooltip } from '@mui/material'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchProjects as fetchProjectsList } from 'state/project'
import { fetchRequests as fetchRequestsList } from 'state/request'
import { getVersionName } from 'mappers/versions'

const CohortCreationBreadcrumbs: React.FC = () => {
  const theme = useTheme()
  const dispatch = useAppDispatch()

  const { requestId, currentSnapshot } = useAppSelector((state) => state.cohortCreation.request || {})
  const projects = useAppSelector((state) => state.project.projectsList || [])
  const requests = useAppSelector((state) => state.request.requestsList || [])

  const [projectName, setProjectName] = useState('Projet de recherche')
  const [requestName, setRequestName] = useState('Requête')

  useEffect(() => {
    if (!projects || (projects && projects.length === 0)) {
      dispatch(fetchProjectsList())
    } else if (!requests || (requests && requests.length === 0)) {
      dispatch(fetchRequestsList())
    } else {
      const foundItem = requests.find(({ uuid }) => uuid === requestId)
      if (foundItem) {
        setRequestName(foundItem.name)
        const foundProject = projects.find(({ uuid }) => uuid === foundItem.parent_folder?.uuid)
        if (foundProject) {
          setProjectName(foundProject.name)
        }
      }
    }
  }, [projects, requests, requestId, dispatch])

  const versionName = getVersionName(currentSnapshot)

  return (
    <Grid container marginBottom={theme.spacing(2)} sx={{ minWidth: 0 }}>
      <Breadcrumbs separator=">" aria-label="breadcrumb" sx={{ minWidth: 0, flex: 1 }}>
        <Typography>{projectName}</Typography>
        <Typography>{requestName}</Typography>
        {currentSnapshot && (
          <Tooltip title={versionName}>
            <Typography
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '300px'
              }}
            >
              {versionName}
            </Typography>
          </Tooltip>
        )}
      </Breadcrumbs>
    </Grid>
  )
}

export default CohortCreationBreadcrumbs
