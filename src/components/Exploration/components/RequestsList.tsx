/* eslint-disable max-statements */
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'state'
import { setMessage } from 'state/message'
import { setSelectedRequestShare } from 'state/request'
import { resetCohortCreation } from 'state/cohortCreation'

import { Grid } from '@mui/material'
import ActionBar from './ActionBar'
import AddOrEditItem from './Modals/AddOrEditItem'
import ConfirmDeletion from './Modals/ConfirmDeletion'
import IconButtonWithTooltip from './IconButtonWithTooltip'
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
import usePageValidation from '../hooks/usePageValidation'
import useProject from '../hooks/useProject'
import useRequests from '../hooks/useRequests'
import useSelectionState from '../hooks/useMultipleSelection'

import { ProjectType, RequestType, SimpleStatus } from 'types'
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
  const requestState = useAppSelector((state) => state.request)

  const { selectedRequestShare } = requestState
  const [paramsReady, setParamsReady] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [order, setOrder] = useState<OrderBy>({ orderBy, orderDirection })
  const [requestToEdit, setRequestToEdit] = useState<RequestType | null>(null)
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

  useEffect(() => {
    const { changed, newSearchParams } = checkSearchParamsErrors(searchParams)
    if (changed) {
      setSearchParams(newSearchParams)
    }
    setParamsReady(true)
  }, [])

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

  usePageValidation(total, page, rowsPerPage, handlePageChange)

  const onShareRequest = (request: RequestType) => {
    dispatch(setSelectedRequestShare(request))
  }

  const onClickEdit = (request: RequestType) => {
    setRequestToEdit(request)
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
    navigate('/cohort/new')
  }

  const handleShareStatus = (status: SimpleStatus) => {
    if (status) {
      dispatch(
        setMessage({
          type: status,
          content:
            status === 'error'
              ? 'Une erreur est survenue lors du partage de la requête'
              : 'La requête a bien été partagée'
        })
      )
    }
  }

  if (projectIsError) {
    return (
      <Grid container justifyContent={'center'}>
        Les détails de ce projet ne sont pas disponibles pour le moment ou n'existent pas.
      </Grid>
    )
  }

  return (
    <Grid container gap="20px">
      {!simplified && (
        <>
          <LevelHeader
            loading={projectLoading}
            name={projectId ? parentProject?.name ?? '' : 'Toutes mes requêtes'}
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
        selectedItem={requestToEdit}
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
      {selectedRequestShare !== null && (
        <ModalShareRequest
          parentStateSetter={(status) => handleShareStatus(status)}
          onClose={() => dispatch(setSelectedRequestShare(null))}
        />
      )}
    </Grid>
  )
}

export default RequestsList
