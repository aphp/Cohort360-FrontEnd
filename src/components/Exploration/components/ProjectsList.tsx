import React from 'react'

import { CircularProgress, Grid, Typography } from '@mui/material'
import ProjectCard from 'components/ui/ProjectCard'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useProjects from '../hooks/useProjects'
import { ProjectType } from 'types'
import Button from 'components/ui/Button'
import useCreateProject from '../hooks/useCreateProject'
import useEditProject from '../hooks/useEditProject'
import useDeleteProject from '../hooks/useDeleteProject'

const ProjectsList = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchInput = searchParams.get('searchInput') ?? ''
  const startDate = searchParams.get('startDate') ?? undefined
  const endDate = searchParams.get('endDate') ?? undefined

  const createProjectMutation = useCreateProject()
  const editProjectMutation = useEditProject()
  const deleteProjectMutation = useDeleteProject()

  const { projectsList, total, loading } = useProjects(searchInput, startDate, endDate)

  const handleAddProject = async () => {
    const newProjectData: Omit<ProjectType, 'uuid'> = {
      name: 'projet ajouté avec react-query :)',
      description: "J'apprends, j'apprends!!"
    }
    createProjectMutation.mutate(newProjectData)
  }

  const handleEditProject = async (project: ProjectType) => {
    const newProjectData = { uuid: project.uuid, name: project.name, description: 'Description ajoutée!' }
    editProjectMutation.mutate(newProjectData)
  }

  const handleDeleteProject = async (project: ProjectType) => {
    deleteProjectMutation.mutate(project)
  }
  return (
    <Grid container xs={11} gap="50px">
      <Button onClick={handleAddProject}>Ajouter un projet</Button>
      <Typography>{total} projets</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        projectsList.map((project: ProjectType) => (
          <ProjectCard
            key={project.uuid}
            title={project.name}
            creationDate={project.created_at}
            requestNumber={project.requests?.length ?? 0}
            onclick={() => navigate(`/researches/projects/${project.uuid}${location.search}`)}
            onedit={() => handleEditProject(project)}
            ondelete={() => handleDeleteProject(project)}
          />
        ))
      )}
    </Grid>
  )
}

export default ProjectsList
