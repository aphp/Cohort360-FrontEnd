import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppSelector } from 'state'

import { Box, CircularProgress, Grid, Typography } from '@mui/material'
import AddOrEditProject from './Modals/AddOrEditProject'
import Button from 'components/ui/Button'
import ConfirmDeletion from './Modals/ConfirmDeletion'
import ProjectCard from 'components/ui/ProjectCard'
import Select from 'components/ui/Searchbar/Select'
import AddIcon from '@mui/icons-material/Add'

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

  const [openEditionModal, setOpenEditionModal] = useState(false)
  const [openDeletionModal, setOpenDeletionModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null)

  const { projectsList, total, loading } = useProjects({ startDate, endDate }, searchInput, { orderBy, orderDirection })

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
        <Button width="fit-content" onClick={() => setOpenEditionModal(true)} endIcon={<AddIcon />}>
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
              onedit={() => {
                setSelectedProject(project)
                setOpenEditionModal(true)
              }}
              ondelete={() => {
                setSelectedProject(project)
                setOpenDeletionModal(true)
              }}
              disabled={maintenanceIsActive}
            />
          ))
        )}
      </Grid>

      <AddOrEditProject
        open={openEditionModal}
        selectedProject={selectedProject}
        onClose={() => {
          setSelectedProject(null)
          setOpenEditionModal(false)
        }}
      />
      <ConfirmDeletion
        open={openDeletionModal}
        selectedProject={selectedProject}
        onClose={() => {
          setOpenDeletionModal(false)
          setSelectedProject(null)
        }}
      />
    </Grid>
  )
}

export default ProjectsList
