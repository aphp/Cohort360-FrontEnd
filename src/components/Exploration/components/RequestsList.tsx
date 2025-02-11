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
import RequestsTableContent from './RequestsTableContent'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'

import useDeleteProject from '../hooks/useDeleteProject'
import useDeleteRequests from '../hooks/useDeleteRequests'
import useEditProject from '../hooks/useEditProject'
import useEditRequest from '../hooks/useEditRequest'
import useProject from '../hooks/useProject'
import useRequests from '../hooks/useRequests'

import { ProjectType, RequestType } from 'types'
import { Direction, Order, OrderBy } from 'types/searchCriterias'
import useSelectionState from '../hooks/useMultipleSelection'

const RequestsList = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInput = searchParams.get('searchInput') ?? ''
  const startDate = searchParams.get('startDate') ?? undefined
  const endDate = searchParams.get('endDate') ?? undefined
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const orderBy = (searchParams.get('orderBy') as Order) ?? Order.UPDATED
  const orderDirection = (searchParams.get('direction') as Direction) ?? Direction.DESC
  const maintenanceIsActive = useAppSelector((state) => state?.me?.maintenance?.active ?? false)
  const requestState = useAppSelector((state) => state.request)

  const { selectedRequestShare } = requestState
  const [deleteMode, setDeleteMode] = useState(false)
  const [order, setOrder] = useState<OrderBy>({ orderBy, orderDirection })
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null)
  const [openEditionModal, setOpenEditionModal] = useState(false)
  const [openDeletionModal, setOpenDeletionModal] = useState(false)

  const { project: parentProject, projectLoading, projectIsError } = useProject(projectId)
  const { requestsList, total, loading } = useRequests(
    order,
    projectId,
    searchInput,
    startDate,
    endDate,
    undefined,
    page
  )
  const editRequestMutation = useEditRequest()
  const editProjectMutation = useEditProject()
  const deleteRequestsMutation = useDeleteRequests()
  const deleteProjectMutation = useDeleteProject()
  const {
    selected: selectedRequests,
    setSelected: setSelectedRequests,
    toggle,
    clear
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
  // TODO: ajouter action pour déplacer la requête de projet

  const onClickEdit = (request: RequestType) => {
    setSelectedRequests([request])
    setOpenEditionModal(true)
  }

  const onClickDelete = (request: RequestType) => {
    setDeleteMode(true)
    setSelectedRequests([request])
  }

  const onSelectAll = () => {
    if (selectedRequests.length === requestsList.length) {
      clear()
    } else if (selectedRequests.length <= requestsList.length) {
      setSelectedRequests(requestsList)
    }
  }

  const onCloseDeletionModal = () => {
    setOpenDeletionModal(false)
    setDeleteMode(false)
    clear()
  }

  const onCloseEditionModal = () => {
    setOpenEditionModal(false)
    clear()
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
                  setOpenDeletionModal(true)
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </>
          }
        />
      )}

      <ActionBar
        deleteMode={deleteMode}
        loading={loading}
        total={total}
        label="requête"
        totalSelected={selectedRequests.length}
        onConfirmDeletion={() => setOpenDeletionModal(true)}
        onCancelDeletion={() => {
          setDeleteMode(false)
          clear()
        }}
      />

      <RequestsTableContent
        requestsList={requestsList}
        deleteMode={deleteMode}
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
        title={
          deleteMode
            ? `Supprimer ${selectedRequests.length <= 1 ? 'une requête' : 'des requêtes'}`
            : 'Supprimer le projet'
        }
        message={
          deleteMode
            ? `Êtes-vous sûr(e) de vouloir supprimer ${
                selectedRequests.length <= 1 ? 'cette requête' : 'ces requêtes'
              } ? Sa suppression entraînera également celle des cohortes sous-jacentes.`
            : 'Êtes-vous sûr(e) de vouloir supprimer ce projet ? Sa suppression entraînera également celle des requêtes et cohortes sous-jacentes.'
        }
        // TODO: plus tard, ajouter au message de confirmation le warning pour les échantillons
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
