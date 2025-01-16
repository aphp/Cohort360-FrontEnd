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
import AddIcon from '@mui/icons-material/Add'

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
    <Grid container style={{ padding: '20px 0' }} gap="20px">
      <Grid container justifyContent={'space-between'} alignItems={'center'}>
        <Typography>Tri par :</Typography>
        <Typography fontWeight={'bold'} fontSize={14}>
          {total} projets
        </Typography>
        <Button width="fit-content" onClick={handleAddProject} endIcon={<AddIcon />}>
          Ajouter un projet
        </Button>
      </Grid>
      <Grid container gap="50px">
        {loading ? (
          <CircularProgress /> /* TODO: regarder pour ajouter un Suspense? */
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
    </Grid>
  )
}

export default ProjectsList
