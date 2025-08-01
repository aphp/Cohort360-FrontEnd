/* eslint-disable max-statements */
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'state'
import { resetCohortCreation } from 'state/cohortCreation'
import { setSelectedProject } from 'state/project'

import { Grid } from '@mui/material'
import ActionBar from './ActionBar'
import AddOrEditItem from './Modals/AddOrEditItem'
import ConfirmDeletion from './Modals/ConfirmDeletion'
import IconButtonWithTooltip from '../ui/IconButtonWithTooltip'
import LevelHeader from './LevelHeader'
import ModalShareRequest from './Modals/ModalShareRequest'
import MoveRequest from './Modals/MoveRequest'
import RequestsTableContent from './RequestsTableContent'

import DeleteIcon from 'assets/icones/delete.svg?react'
import EditIcon from '@mui/icons-material/Edit'

import useDeleteProject from 'hooks/researches/useDeleteProject'
import useDeleteRequests from 'hooks/researches/useDeleteRequests'
import useEditProject from 'hooks/researches/useEditProject'
import useEditRequest from 'hooks/researches/useEditRequest'
import usePageValidation from 'hooks/researches/usePageValidation'
import useProject from 'hooks/researches/useProject'
import useRequests from 'hooks/researches/useRequests'
import useSelectionState from 'hooks/researches/useMultipleSelection'

import { ProjectType, RequestType } from 'types'
import { ExplorationsSearchParams } from 'types/cohorts'
import { OrderBy } from 'types/searchCriterias'
import {
  checkSearchParamsErrors,
  getFoldersConfirmDeletionMessage,
  getFoldersConfirmDeletionTitle,
  getRequestsConfirmDeletionMessage,
  getRequestsConfirmDeletionTitle,
  getRequestsSearchParams
} from 'utils/explorationUtils'

type RequestsListProps = {
  simplified?: boolean
  rowsPerPage?: number
}

const RequestsList = ({ simplified = false, rowsPerPage = 20 }: RequestsListProps) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { searchInput, startDate, endDate, page, orderBy, orderDirection } = getRequestsSearchParams(searchParams)
  const maintenanceIsActive = useAppSelector((state) => state?.me?.maintenance?.active ?? false)

  const [paramsReady, setParamsReady] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [order, setOrder] = useState<OrderBy>({ orderBy, orderDirection })
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(null)
  const [openShareModal, setOpenShareModal] = useState(false)
  const [openEditionModal, setOpenEditionModal] = useState(false)
  const [openParentEditionModal, setOpenParentEditionModal] = useState(false)
  const [openDeletionModal, setOpenDeletionModal] = useState(false)
  const [openMoveModal, setOpenMoveModal] = useState(false)

  const { project: parentProject, projectLoading, projectIsError } = useProject(projectId)
  const { requestsList, total, loading } = useRequests({
    orderBy: order,
    parentId: projectId,
    searchInput,
    startDate,
    endDate,
    page,
    rowsPerPage,
    paramsReady
  })
  const {
    selected: selectedRequests,
    setSelected: setSelectedRequests,
    toggle,
    clearSelection
  } = useSelectionState<RequestType>()
  const editRequestMutation = useEditRequest()
  const editProjectMutation = useEditProject()
  const deleteRequestsMutation = useDeleteRequests()
  const deleteProjectMutation = useDeleteProject()

  useEffect(() => {
    const { changed, newSearchParams } = checkSearchParamsErrors(searchParams)
    if (changed) {
      setSearchParams(newSearchParams)
    }
    setParamsReady(true)
  }, [])

  const changeOrderBy = (newOrder: OrderBy) => {
    setOrder(newOrder)
    searchParams.set(ExplorationsSearchParams.ORDER_BY, newOrder.orderBy)
    searchParams.set(ExplorationsSearchParams.DIRECTION, newOrder.orderDirection)
    setSearchParams(searchParams)
  }

  const handlePageChange = (newPage: number) => {
    searchParams.set(ExplorationsSearchParams.PAGE, String(newPage))
    setSearchParams(searchParams)
  }

  usePageValidation(total, page, rowsPerPage, handlePageChange)

  const onShareRequest = (request: RequestType) => {
    setSelectedRequest({
      ...request,
      shared_query_snapshot: request.query_snapshots?.[0].uuid
    })
    setOpenShareModal(true)
  }

  const onClickEdit = (request: RequestType) => {
    setSelectedRequest(request)
    setOpenEditionModal(true)
  }

  const onClickDelete = () => {
    setOpenDeletionModal(true)
    setDeleteMode(true)
  }

  const onSelectAll = () => {
    if (selectedRequests.length === requestsList.length) {
      clearSelection()
    } else if (selectedRequests.length <= requestsList.length) {
      setSelectedRequests(requestsList)
    }
  }

  const onCloseDeletionModal = () => {
    setOpenDeletionModal(false)
    setDeleteMode(false)
    clearSelection()
  }

  const onCloseEditionModal = () => {
    setOpenEditionModal(false)
    clearSelection()
  }

  const onSubmitDeletion = () => {
    deleteRequestsMutation.mutate(selectedRequests, { onSuccess: clearSelection })
    setOpenDeletionModal(false)
    setDeleteMode(false)
  }

  const onSubmitParentProjectDeletion = () => {
    deleteProjectMutation.mutate(parentProject as ProjectType, {
      onSuccess: () => {
        navigate(`/researches/projects/`)
      }
    })
    onCloseDeletionModal()
  }

  const handleNewRequest = () => {
    dispatch(resetCohortCreation())
    if (parentProject) {
      dispatch(setSelectedProject(parentProject))
    }
    navigate('/cohort/new')
  }

  if (projectIsError) {
    return (
      <Grid container justifyContent={'center'}>
        Les détails de ce projet ne sont pas disponibles pour le moment ou n'existent pas.
      </Grid>
    )
  }

  return (
    <Grid container size={12} gap="20px">
      {!simplified && (
        <>
          <LevelHeader
            loading={projectLoading}
            name={projectId ? (parentProject?.name ?? '') : 'Toutes mes requêtes'}
            description={parentProject?.description ?? ''}
            actions={
              projectId && (
                <>
                  <IconButtonWithTooltip
                    disabled={maintenanceIsActive}
                    title="Éditer le projet"
                    icon={<EditIcon />}
                    onClick={() => setOpenParentEditionModal(true)}
                    color="#5bc5f2"
                  />
                  <IconButtonWithTooltip
                    disabled={maintenanceIsActive}
                    title="Supprimer le projet"
                    icon={<DeleteIcon />}
                    onClick={() => setOpenDeletionModal(true)}
                    color="#ed6d91"
                  />
                </>
              )
            }
          />

          <ActionBar
            onMove={() => setOpenMoveModal(true)}
            onDelete={() => onClickDelete()}
            label="requête"
            loading={loading}
            total={total}
            totalSelected={selectedRequests.length}
            onAddRequest={handleNewRequest}
            disabled={maintenanceIsActive}
          />
        </>
      )}

      <RequestsTableContent
        requestsList={requestsList}
        selectedRequests={selectedRequests}
        total={total}
        page={page}
        setPage={handlePageChange}
        loading={loading}
        order={order}
        onChangeOrderBy={changeOrderBy}
        onSelectRequest={toggle}
        onShareRequest={onShareRequest}
        onClickEdit={onClickEdit}
        onSelectAll={onSelectAll}
        disabled={maintenanceIsActive}
        simplified={simplified}
      />

      <AddOrEditItem
        open={openEditionModal}
        selectedItem={selectedRequest}
        onUpdate={(request) => editRequestMutation.mutate(request as RequestType)}
        titleEdit="Édition de la requête"
        onClose={onCloseEditionModal}
      />
      <AddOrEditItem
        open={openParentEditionModal}
        selectedItem={parentProject ?? {}}
        onUpdate={(project) => editProjectMutation.mutate(project as ProjectType)}
        titleEdit="Édition du projet"
        onClose={() => setOpenParentEditionModal(false)}
      />
      <ConfirmDeletion
        open={openDeletionModal}
        onClose={() => {
          setDeleteMode(false)
          setOpenDeletionModal(false)
        }}
        onSubmit={deleteMode ? onSubmitDeletion : onSubmitParentProjectDeletion}
        title={deleteMode ? getRequestsConfirmDeletionTitle(selectedRequests.length) : getFoldersConfirmDeletionTitle()}
        message={
          deleteMode ? getRequestsConfirmDeletionMessage(selectedRequests.length) : getFoldersConfirmDeletionMessage()
        }
      />
      <MoveRequest
        open={openMoveModal}
        onClose={() => {
          setOpenMoveModal(false)
          clearSelection()
        }}
        selectedRequests={selectedRequests}
      />
      <ModalShareRequest
        open={openShareModal}
        requestToShare={selectedRequest as RequestType}
        onClose={() => setOpenShareModal(false)}
      />
    </Grid>
  )
}

export default RequestsList
