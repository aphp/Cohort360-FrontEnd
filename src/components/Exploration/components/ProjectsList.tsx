import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppSelector } from 'state'

import { Box, CircularProgress, Grid, Typography } from '@mui/material'
import AddOrEditItem from './Modals/AddOrEditItem'
import Button from 'components/ui/Button'
import ConfirmDeletion from './Modals/ConfirmDeletion'
import ProjectCard from 'components/ui/ProjectCard'
import Select from 'components/ui/Searchbar/Select'
import AddIcon from '@mui/icons-material/Add'

import useCreateProject from '../hooks/useCreateProject'
import useDeleteProject from '../hooks/useDeleteProject'
import useEditProject from '../hooks/useEditProject'
import useProjects from '../hooks/useProjects'

import { ProjectType } from 'types'
import { Direction, Order, OrderBy } from 'types/searchCriterias'
import {
  getFoldersConfirmDeletionMessage,
  getFoldersConfirmDeletionTitle,
  getFoldersSearchParams
} from 'utils/explorationUtils'

const ProjectsList = () => {
  const navigate = useNavigate()
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)
  const [searchParams, setSearchParams] = useSearchParams()
  const { searchInput, startDate, endDate, orderBy, orderDirection } = getFoldersSearchParams(searchParams)
  const [order, setOrder] = useState<OrderBy>({ orderBy, orderDirection })

  const [openEditionModal, setOpenEditionModal] = useState(false)
  const [openDeletionModal, setOpenDeletionModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null)

  const { projectsList, total, loading } = useProjects({
    filters: { startDate, endDate },
    searchInput,
    orderBy: { orderBy, orderDirection }
  })
  const createProjectMutation = useCreateProject()
  const deleteProjectMutation = useDeleteProject()
  const editProjectMutation = useEditProject()

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

  const onCloseDeletionModal = () => {
    setSelectedProject(null)
    setOpenDeletionModal(false)
  }

  const onCloseEditionModal = () => {
    setSelectedProject(null)
    setOpenEditionModal(false)
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
        <Button width="fit-content" onClick={() => setOpenEditionModal(true)} endIcon={<AddIcon />} small>
          Ajouter un projet
        </Button>
      </Grid>
      <Grid container gap="50px">
        {loading ? (
          <Box display="flex" width={'100%'} justifyContent={'center'}>
            <CircularProgress size={50} />
          </Box>
        ) : projectsList.length === 0 ? (
          <Grid container justifyContent={'center'} marginTop={'12px'}>
            <Typography>Aucun projet à afficher</Typography>
          </Grid>
        ) : (
          projectsList.map((project: ProjectType) => (
            <ProjectCard
              key={project.uuid}
              title={project.name}
              creationDate={project.created_at}
              requestNumber={project.requests_count ?? 0}
              onclick={() => navigate(`/researches/projects/${project.uuid}`)}
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

      <AddOrEditItem
        open={openEditionModal}
        onClose={onCloseEditionModal}
        selectedItem={selectedProject}
        onCreate={(projectData) =>
          createProjectMutation.mutate(projectData as Omit<ProjectType, 'uuid'>, { onSuccess: onCloseEditionModal })
        }
        onUpdate={(projectData) => {
          editProjectMutation.mutate(projectData as ProjectType)
        }}
        titleEdit="Éditer un projet de recherche"
        titleCreate="Créer un projet de recherche"
      />
      <ConfirmDeletion
        open={openDeletionModal}
        onClose={onCloseDeletionModal}
        onSubmit={() => {
          deleteProjectMutation.mutate(selectedProject as ProjectType)
          onCloseDeletionModal()
        }}
        title={getFoldersConfirmDeletionTitle()}
        message={getFoldersConfirmDeletionMessage()}
      />
    </Grid>
  )
}

export default ProjectsList
