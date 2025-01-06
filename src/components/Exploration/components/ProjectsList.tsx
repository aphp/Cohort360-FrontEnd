import React from 'react'

import { Grid } from '@mui/material'
import ProjectCard from 'components/ui/ProjectCard'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useProjects from '../hooks/useProjects'

const ProjectsList = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInput = searchParams.get('searchInput') ?? ''
  const startDate = searchParams.get('startDate') ?? undefined
  const endDate = searchParams.get('endDate') ?? undefined

  const { projectsList, total, loading } = useProjects(searchInput, startDate, endDate)

  return (
    <Grid container xs={11} gap="50px">
      {/* TODO: add circular progress */}

      {projectsList.map((project) => (
        <ProjectCard
          key={project.created_at} // TODO: mettre autre chose comme key
          title={project.name}
          creationDate={project.created_at}
          requestNumber={project.requests.length}
          onclick={() => navigate(`/researches/projects/${project.uuid}${location.search}`)}
        />
      ))}
    </Grid>
  )
}

export default ProjectsList
