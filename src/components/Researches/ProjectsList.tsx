import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppSelector } from 'state'

import { Grid, Typography } from '@mui/material'
import AddOrEditItem from './Modals/AddOrEditItem'
import Button from 'components/ui/Button'
import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'
import ConfirmDeletion from './Modals/ConfirmDeletion'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import ProjectCard from 'components/ui/ProjectCard'
import Select from 'components/ui/Searchbar/Select'
import AddIcon from '@mui/icons-material/Add'

import useCreateProject from 'hooks/researches/useCreateProject'
import useDeleteProject from 'hooks/researches/useDeleteProject'
import useEditProject from 'hooks/researches/useEditProject'
import useProjects from 'hooks/researches/useProjects'

import { ProjectType } from 'types'
import { Direction, Order, OrderBy } from 'types/searchCriterias'
import {
  checkSearchParamsErrors,
  getFoldersConfirmDeletionMessage,
  getFoldersConfirmDeletionTitle,
  getFoldersSearchParams
} from 'utils/explorationUtils'
import { ExplorationsSearchParams } from 'types/cohorts'
import { plural } from 'utils/string'

const ProjectsList = () => {
  const navigate = useNavigate()
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)
  const [searchParams, setSearchParams] = useSearchParams()
  const { searchInput, startDate, endDate, orderBy, orderDirection } = getFoldersSearchParams(searchParams)
  const [order, setOrder] = useState<OrderBy>({ orderBy, orderDirection })

  const [paramsReady, setParamsReady] = useState(false)
  const [openEditionModal, setOpenEditionModal] = useState(false)
  const [openDeletionModal, setOpenDeletionModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null)

  const { projectsList, total, loading } = useProjects({
    filters: { startDate, endDate },
    searchInput,
    orderBy: { orderBy, orderDirection },
    paramsReady
  })
  const createProjectMutation = useCreateProject()
  const deleteProjectMutation = useDeleteProject()
  const editProjectMutation = useEditProject()

  useEffect(() => {
    const { changed, newSearchParams } = checkSearchParamsErrors(searchParams)
    if (changed) {
      setSearchParams(newSearchParams)
    }
    setParamsReady(true)
  }, [])

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
    searchParams.set(ExplorationsSearchParams.ORDER_BY, findOrder.orderBy)
    searchParams.set(ExplorationsSearchParams.DIRECTION, findOrder.direction)
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
    <Grid container size={12} style={{ padding: '20px 0' }} sx={{ gap: '20px' }}>
      <Grid container size={12} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Grid>
          <Select
            value={`${order.orderDirection}${order.orderBy}`}
            label="Tri par"
            options={orderByProjects}
            onChange={(newValue) => changeOrderBy(newValue)}
          />
        </Grid>
        <Grid>
          <Button
            width="fit-content"
            onClick={() => setOpenEditionModal(true)}
            endIcon={<AddIcon />}
            disabled={maintenanceIsActive}
            small
          >
            Nouveau projet
          </Button>
        </Grid>
        <Grid>
          <DisplayDigits label={`projet${plural(total)}`} nb={total} />
        </Grid>
      </Grid>
      <Grid container size={12} sx={{ gap: '50px' }} id="projects-list-div">
        {loading ? (
          <CenteredCircularProgress />
        ) : projectsList.length === 0 ? (
          <Grid container sx={{ justifyContent: 'center' }} marginTop={'12px'}>
            <Typography>Aucun projet à afficher</Typography>
          </Grid>
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
