import React, { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'state'
import { setSelectedRequestShare } from 'state/request'

import { Box, Checkbox, CircularProgress, Grid, IconButton, TableRow, Tooltip, Typography } from '@mui/material'
import ActionMenu from './ActionMenu'
import AddOrEditProject from './Modals/AddOrEditProject'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import Button from 'components/ui/Button'
import ConfirmDeletion from './Modals/ConfirmDeletion'
import LevelHeader from './LevelHeader'
import ResearchesTable from './Table'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'

import useProject from '../hooks/useProject'
import useRequests from '../hooks/useRequests'

import { Column, ProjectType, RequestType } from 'types'
import { getCohortTotal, getRequestName } from 'utils/explorationUtils'
import { formatDate } from 'utils/formatDate'

// TODO: J'AVAIS OUBLIÉ MAIS PRÉVOIR LE SUPER FLOW DE DÉLÉTION MULTIPLE

const RequestsList = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInput = searchParams.get('searchInput') ?? ''
  const startDate = searchParams.get('startDate') ?? undefined
  const endDate = searchParams.get('endDate') ?? undefined
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const maintenanceIsActive = useAppSelector((state) => state?.me?.maintenance?.active ?? false)

  const [deleteMode, setDeleteMode] = useState(false)
  const [openEditProjectModal, setOpenEditProjectModal] = useState(false)
  const [openProjectDeletionModal, setOpenProjectDeletionModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null)
  const [openEditionModal, setOpenEditionModal] = useState(false)
  const [openDeletionModal, setOpenDeletionModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(null)

  const { project: parentProject, projectLoading, projectIsError } = useProject(projectId)
  const { requestsList, total, loading } = useRequests(projectId, searchInput, startDate, endDate, undefined, page)

  const handlePageChange = (newPage: number) => {
    searchParams.set('page', String(newPage))
    setSearchParams(searchParams)
  }

  const handleDelete = () => {
    setDeleteMode(!deleteMode)
  }
  const handleConfirmDelete = () => {
    alert('êtes vous sûr de vouloir supprimer les requêtes ')
  }

  const columns: Column[] = [
    ...(deleteMode ? [{ label: <Checkbox /> }] : []),
    { label: 'nom de la requête', align: 'left' },
    { label: '', align: 'left' },
    ...(!projectId ? [{ label: 'projet' }] : []), // TODO: réfléchir si cliquable ou pas?
    { label: 'date de modification' },
    { label: 'nb de cohortes' }
  ]

  const actions = [
    {
      icon: <EditIcon />,
      label: 'Éditer',
      onclick: () => {
        setSelectedRequest(request)
      },
      tooltip: '',
      disabled: maintenanceIsActive
    },
    {
      icon: <DeleteOutlineIcon />,
      label: 'Supprimer',
      onclick: handleDelete,
      tooltip: '',
      disabled: maintenanceIsActive
    }
  ]

  const onShareRequest = (requestId: string) => {
    // TODO: pas sûre de garder l'ancien comportement (pq utiliser le store?)
    dispatch(setSelectedRequestShare({ uuid: requestId, name: '' }))
  }
  // TODO: ajouter action pour déplacer la requête de projet

  return (
    <Grid container gap="20px">
      {projectId && (
        <LevelHeader
          loading={projectLoading}
          name={parentProject?.name ?? ''}
          hideActions={!deleteMode}
          description={parentProject?.description ?? ''}
          actions={
            <>
              <IconButton
                style={{ padding: 4 }}
                onClick={() => {
                  setSelectedProject(parentProject ?? null)
                  setOpenEditionModal(true)
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                style={{ padding: 4 }}
                color="secondary"
                onClick={() => {
                  setSelectedProject(parentProject ?? null)
                  setOpenProjectDeletionModal(true)
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </>
          }
        />
      )}

      <Grid container justifyContent={'space-between'} alignItems={'center'}>
        {loading ? (
          <CircularProgress />
        ) : (
          <Typography fontWeight={'bold'} fontSize={14}>
            {total} requête{total > 1 ? 's' : ''}
          </Typography>
        )}
        {!deleteMode && (
          <Button width="fit-content" onClick={() => console.log('euh a faire')} endIcon={<AddIcon />}>
            Ajouter une requête
          </Button>
        )}
        {deleteMode && (
          <Box display={'flex'} justifyContent={'flex-end'}>
            {/* TODO: a custom */}
            <Button onClick={handleConfirmDelete} clearVariant endIcon={<DeleteOutlineIcon />}>
              Supprimer la ou les requêtes
            </Button>
            <Button onClick={() => setDeleteMode(false)} clearVariant>
              Annuler la suppression
            </Button>
          </Box>
        )}
      </Grid>

      {loading ? (
        <CircularProgress />
      ) : (
        <ResearchesTable columns={columns} page={page} setPage={handlePageChange} total={total}>
          {requestsList.map((request) => {
            const cohortTotal = getCohortTotal(request.query_snapshots)

            return (
              <TableRow
                key={request.uuid}
                onClick={() => navigate(`/cohort/new/${request.uuid}`)}
                style={{ cursor: 'pointer' }}
              >
                {deleteMode && (
                  <TableCellWrapper sx={{ width: deleteMode ? 50 : 0, overflow: 'hidden', transition: 'width 0.3s' }}>
                    <Checkbox />
                  </TableCellWrapper>
                )}
                <TableCellWrapper align="left" headCell>
                  {getRequestName(request)}
                </TableCellWrapper>
                <TableCellWrapper>
                  {!deleteMode && (
                    <Box display={'flex'} flexWrap={'nowrap'}>
                      <Tooltip title="Partager la requête">
                        <IconButton
                          style={{ color: '#000' }}
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation()
                            onShareRequest(request.uuid)
                          }}
                          disabled={maintenanceIsActive}
                        >
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                      <ActionMenu actions={actions} />
                    </Box>
                  )}
                </TableCellWrapper>
                {!projectId && <TableCellWrapper>{request.parent_folder?.name}</TableCellWrapper>}
                <TableCellWrapper>{formatDate(request.updated_at, true)}</TableCellWrapper>
                <TableCellWrapper>
                  <Button
                    clearVariant
                    disabled={cohortTotal < 1}
                    endIcon={<ArrowRightAltIcon />}
                    onClick={(event) => {
                      event.stopPropagation()
                      navigate(
                        projectId
                          ? `/researches/projects/${projectId}/${request.uuid}${location.search}`
                          : `/researches/requests/${request.uuid}${location.search}`
                      )
                    }}
                  >
                    <Typography variant="button" noWrap fontSize={'12px'}>
                      {cohortTotal} cohorte{cohortTotal > 1 && 's'}
                    </Typography>
                  </Button>
                </TableCellWrapper>
              </TableRow>
            )
          })}
        </ResearchesTable>
      )}

      <AddOrEditProject
        open={openEditionModal}
        selectedProject={selectedProject}
        onClose={() => {
          setSelectedProject(null)
          setOpenEditionModal(false)
        }}
      />
      <ConfirmDeletion
        open={openProjectDeletionModal}
        selectedProject={selectedProject}
        onClose={() => {
          setOpenProjectDeletionModal(false)
          setSelectedProject(null)
        }}
      />
    </Grid>
  )
}

export default RequestsList
