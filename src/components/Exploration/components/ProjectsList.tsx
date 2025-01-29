import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppSelector } from 'state'

import { Box, CircularProgress, Grid, Typography } from '@mui/material'
import Button from 'components/ui/Button'
import ProjectCard from 'components/ui/ProjectCard'
import Select from 'components/ui/Searchbar/Select'
import AddIcon from '@mui/icons-material/Add'

import useCreateProject from '../hooks/useCreateProject'
import useDeleteProject from '../hooks/useDeleteProject'
import useEditProject from '../hooks/useEditProject'
import useProjects from '../hooks/useProjects'

import { ProjectType } from 'types'
import { Direction, Order, OrderBy } from 'types/searchCriterias'

const ProjectsList = () => {
  const navigate = useNavigate()
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInput = searchParams.get('searchInput') ?? ''
  const startDate = searchParams.get('startDate') ?? null
  const endDate = searchParams.get('endDate') ?? null
  const orderBy = (searchParams.get('orderBy') as Order) ?? Order.CREATED_AT
  const orderDirection = (searchParams.get('direction') as Direction) ?? Direction.DESC
  const [order, setOrder] = useState<OrderBy>({ orderBy, orderDirection })

  const createProjectMutation = useCreateProject()
  const editProjectMutation = useEditProject()
  const deleteProjectMutation = useDeleteProject()

  const { projectsList, total, loading } = useProjects({ startDate, endDate }, searchInput, { orderBy, orderDirection })

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

  const orderByProjects = [
    {
      id: `${Direction.DESC}${Order.CREATED_AT}`,
      orderBy: Order.CREATED_AT,
      direction: Direction.DESC,
      label: 'Date de création la plus récente'
    },
    {
      id: `${Direction.ASC}${Order.CREATED_AT}`,
      orderBy: Order.CREATED_AT,
      direction: Direction.ASC,
      label: 'Date de création la plus ancienne'
    },
    {
      id: `${Direction.ASC}${Order.NAME}`,
      orderBy: Order.NAME,
      direction: Direction.ASC,
      label: 'Ordre alphabétique croissant'
    },
    {
      id: `${Direction.DESC}${Order.NAME}`,
      orderBy: Order.NAME,
      direction: Direction.DESC,
      label: 'Ordre alphabétique décroissant'
    }
  ]

  const changeOrderBy = (newOrder: string) => {
    const findOrder = orderByProjects.find((order) => order.id === newOrder) ?? {
      orderBy: Order.CREATED_AT,
      direction: Direction.DESC
    }
    setOrder({
      orderBy: findOrder.orderBy ?? Order.CREATED_AT,
      orderDirection: findOrder.direction ?? Direction.DESC
    })
    searchParams.set('orderBy', findOrder.orderBy)
    searchParams.set('direction', findOrder.direction)
    setSearchParams(searchParams)
  }

  return (
    <Grid container style={{ padding: '20px 0' }} gap="20px">
      <Grid container justifyContent={'space-between'} alignItems={'center'}>
        <Select
          value={`${order.orderDirection}${order.orderBy}`}
          label="Tri par"
          width={'250px'}
          items={orderByProjects}
          onchange={(newValue) => changeOrderBy(newValue)}
        />
        <Typography fontWeight={'bold'} fontSize={14}>
          {total} projet{total > 1 ? 's' : ''}
        </Typography>
        <Button width="fit-content" onClick={handleAddProject} endIcon={<AddIcon />}>
          Ajouter un projet
        </Button>
      </Grid>
      <Grid container gap="50px">
        {loading ? (
          <Box display="flex" width={'100%'} justifyContent={'center'}>
            <CircularProgress size={50} />
            {/* /* TODO: regarder pour ajouter un Suspense? */}
          </Box>
        ) : (
          projectsList.map((project: ProjectType) => (
            <ProjectCard
              key={project.uuid}
              title={project.name}
              creationDate={project.created_at}
              requestNumber={project.requests_count ?? 0}
              onclick={() => navigate(`/researches/projects/${project.uuid}${location.search}`)}
              onedit={() => handleEditProject(project)}
              ondelete={() => handleDeleteProject(project)}
              disabled={maintenanceIsActive}
            />
          ))
        )}
      </Grid>
    </Grid>
  )
}

export default ProjectsList
