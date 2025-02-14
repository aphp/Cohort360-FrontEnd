/* eslint-disable max-statements */
import React, { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'state'
import { setSelectedRequestShare } from 'state/request'

import { Grid, IconButton } from '@mui/material'
import ActionBar from './ActionBar'
import AddOrEditItem from './Modals/AddOrEditItem'
import ConfirmDeletion from './Modals/ConfirmDeletion'
import LevelHeader from './LevelHeader'
import ModalShareRequest from 'components/Requests/Modals/ModalShareRequest/ModalShareRequest'
import MoveRequest from './Modals/MoveRequest'
import RequestsTableContent from './RequestsTableContent'

import DeleteIcon from 'assets/icones/delete.svg?react'
import EditIcon from '@mui/icons-material/Edit'

import useDeleteProject from '../hooks/useDeleteProject'
import useDeleteRequests from '../hooks/useDeleteRequests'
import useEditProject from '../hooks/useEditProject'
import useEditRequest from '../hooks/useEditRequest'
import useProject from '../hooks/useProject'
import useRequests from '../hooks/useRequests'
import useSelectionState from '../hooks/useMultipleSelection'

import { ProjectType, RequestType } from 'types'
import { OrderBy } from 'types/searchCriterias'
import {
  getFoldersConfirmDeletionMessage,
  getFoldersConfirmDeletionTitle,
  getRequestsConfirmDeletionMessage,
  getRequestsConfirmDeletionTitle,
  getRequestsSearchParams
} from 'utils/explorationUtils'

type RequestsListProps = {
  showHeader?: boolean
  rowsPerPage?: number
}

const RequestsList = ({ showHeader = true, rowsPerPage = 20 }: RequestsListProps) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { searchInput, startDate, endDate, page, orderBy, orderDirection } = getRequestsSearchParams(searchParams)
  const maintenanceIsActive = useAppSelector((state) => state?.me?.maintenance?.active ?? false)
  const requestState = useAppSelector((state) => state.request)

  const { selectedRequestShare } = requestState
  const [deleteMode, setDeleteMode] = useState(false)
  const [moveMode, setMoveMode] = useState(false)
  const [order, setOrder] = useState<OrderBy>({ orderBy, orderDirection })
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null)
  const [openEditionModal, setOpenEditionModal] = useState(false)
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
    rowsPerPage
  })
  const editRequestMutation = useEditRequest()
  const editProjectMutation = useEditProject()
  const deleteRequestsMutation = useDeleteRequests()
  const deleteProjectMutation = useDeleteProject()
  const {
    selected: selectedRequests,
    setSelected: setSelectedRequests,
    toggle,
    clearSelection
  } = useSelectionState<RequestType>()

  const changeOrderBy = (newOrder: OrderBy) => {
    setOrder(newOrder)
    searchParams.set('orderBy', newOrder.orderBy)
    searchParams.set('direction', newOrder.orderDirection)
    setSearchParams(searchParams)
  }

  const handlePageChange = (newPage: number) => {
    searchParams.set('page', String(newPage))
    setSearchParams(searchParams)
  }

  const onShareRequest = (request: RequestType) => {
    console.log('jsuis la ou meme pas')
    // TODO: pas sûre de garder l'ancien comportement (pq utiliser le store?)
    dispatch(setSelectedRequestShare(request))
  }

  const onClickEdit = (request: RequestType) => {
    setSelectedRequests([request])
    setOpenEditionModal(true)
  }

  const onClickDelete = (request: RequestType) => {
    setDeleteMode(true)
    setSelectedRequests([request])
  }

  const onClickMove = (request: RequestType) => {
    setMoveMode(true)
    setSelectedRequests([request])
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
    setSelectedProject(null)
  }

  const onSubmitDeletion = () => {
    deleteRequestsMutation.mutate(selectedRequests, { onSuccess: onCloseDeletionModal })
  }

  const onSubmitParentProjectDeletion = () => {
    deleteProjectMutation.mutate(parentProject as ProjectType, {
      onSuccess: () => {
        onCloseDeletionModal()
        navigate(`/researches/projects/`)
      }
    })
  }

  if (projectIsError) {
    return (
      <Grid container justifyContent={'center'}>
        Les détails de ce projet ne sont pas disponibles pour le moment.
      </Grid>
    )
  }

  return (
    <Grid container gap="20px">
      {showHeader && (
        <>
          {projectId && (
            <LevelHeader
              loading={projectLoading}
              name={parentProject?.name ?? ''}
              hideActions={!deleteMode || !moveMode}
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
                      setOpenDeletionModal(true)
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            />
          )}

          <ActionBar
            deleteMode={deleteMode}
            label="requête"
            loading={loading}
            moveMode={moveMode}
            onCancelMultiselectMode={() => {
              setMoveMode(false)
              setDeleteMode(false)
              clearSelection()
            }}
            onConfirmDeletion={() => setOpenDeletionModal(true)}
            onMove={() => setOpenMoveModal(true)}
            total={total}
            totalSelected={selectedRequests.length}
          />
        </>
      )}

      <RequestsTableContent
        requestsList={requestsList}
        multiSelectMode={deleteMode || moveMode}
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
        onClickDelete={onClickDelete}
        onSelectAll={onSelectAll}
        disabled={maintenanceIsActive}
        noPagination={!showHeader}
        onClickMove={onClickMove}
      />

      <AddOrEditItem
        open={openEditionModal}
        selectedItem={selectedProject ?? selectedRequests[0]}
        onUpdate={
          selectedProject
            ? (project) => editProjectMutation.mutate(project as ProjectType, { onSuccess: onCloseEditionModal })
            : (request) => editRequestMutation.mutate(request as RequestType, { onSuccess: onCloseEditionModal })
        }
        titleEdit={`Édition ${selectedProject ? 'du projet' : 'de la requête'}`}
        onClose={onCloseEditionModal}
      />
      <ConfirmDeletion
        open={openDeletionModal}
        onClose={() => setOpenDeletionModal(false)}
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
          setMoveMode(false)
          clearSelection()
        }}
        selectedRequests={selectedRequests}
      />
      {selectedRequestShare !== null && (
        <ModalShareRequest
          // parentStateSetter={wrapperSetShareSuccessOrFailMessage}
          onClose={() => dispatch(setSelectedRequestShare(null))}
        />
      )}
    </Grid>
  )
}

export default RequestsList
