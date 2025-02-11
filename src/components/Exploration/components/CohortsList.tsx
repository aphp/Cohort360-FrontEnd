/* eslint-disable max-statements */
import React, { useContext, useState } from 'react'
import { AppConfig } from 'config'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'state'
import { setSelectedRequestShare } from 'state/request'

import { Grid, IconButton, Tooltip } from '@mui/material'
import ActionBar from './ActionBar'
import AddOrEditItem from './Modals/AddOrEditItem'
import CohortsTableContent from './CohortsTableContent'
import ConfirmDeletion from './Modals/ConfirmDeletion'
import ExportModal from 'components/Dashboard/ExportModal/ExportModal'
import LevelHeader from './LevelHeader'
import ModalShareRequest from 'components/Requests/Modals/ModalShareRequest/ModalShareRequest'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'

import useCohorts from '../hooks/useCohorts'
import useCohortsWebSocket from '../hooks/useCohortsWebSocket'
import useDeleteCohort from '../hooks/useDeleteCohort'
import useDeleteRequests from '../hooks/useDeleteRequests'
import useEditCohort from '../hooks/useEditCohort'
import useEditRequest from '../hooks/useEditRequest'
import useRequest from '../hooks/useRequest'

import { Cohort, RequestType } from 'types'
import { CohortsFilters, Direction, Order, OrderBy } from 'types/searchCriterias'
import { getFavoriteFilters, getRequestName, getStatusFilter } from 'utils/explorationUtils'
import { addElementInArray, removeElementInArray } from 'utils/filters'

const CohortsList = () => {
  const appConfig = useContext(AppConfig)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { projectId, requestId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInput = searchParams.get('searchInput') ?? ''
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const orderBy = (searchParams.get('orderBy') as Order) ?? Order.CREATED_AT
  const orderDirection = (searchParams.get('direction') as Direction) ?? Direction.DESC
  // TODO: add les params pour les filtres exclusifs aux cohortes + bien penser à les suppr en changeant d'onglet
  const status = searchParams.get('status')
  const favorite = searchParams.get('favorite')
  const minPatients = searchParams.get('minPatients')
  const maxPatients = searchParams.get('maxPatients')

  const maintenanceIsActive = useAppSelector((state) => state?.me?.maintenance?.active ?? false)
  const requestState = useAppSelector((state) => state.request)

  const { selectedRequestShare } = requestState
  const [deleteMode, setDeleteMode] = useState(false)
  const [order, setOrder] = useState<OrderBy>({ orderBy, orderDirection })
  const [filters, setFilters] = useState<CohortsFilters>({
    status: getStatusFilter(status),
    favorite: getFavoriteFilters(favorite),
    minPatients,
    maxPatients,
    startDate,
    endDate,
    parentId: requestId
  })
  const [openEditionModal, setOpenEditionModal] = useState(false)
  const [openDeletionModal, setOpenDeletionModal] = useState(false)
  const [openExportModal, setOpenExportModal] = useState(false)
  const [selectedCohorts, setSelectedCohorts] = useState<Cohort[]>([])

  const { request: parentRequest, requestLoading, requestIsError } = useRequest(requestId)
  const { cohortsList, total, loading } = useCohorts(order, searchInput, filters)
  useCohortsWebSocket()
  const editRequestMutation = useEditRequest()
  const deleteRequestMutation = useDeleteRequests()
  const editCohortMutation = useEditCohort()
  const deleteCohortMutation = useDeleteCohort()

  const handlePageChange = (newPage: number) => {
    searchParams.set('page', String(newPage))
    setSearchParams(searchParams)
  }

  const onClickRow = (cohort: Cohort) => {
    const searchParams = new URLSearchParams()
    if (cohort.group_id) {
      searchParams.set('groupId', cohort.group_id)
    }
    navigate(`/cohort?${searchParams.toString()}`)
  }

  const changeOrderBy = (newOrder: OrderBy) => {
    setOrder(newOrder)
    searchParams.set('orderBy', newOrder.orderBy)
    searchParams.set('direction', newOrder.orderDirection)
    setSearchParams(searchParams)
  }

  const onCloseDeletionModal = () => {
    setOpenDeletionModal(false)
    setDeleteMode(false)
    setSelectedCohorts([])
  }

  const onCloseEditionModal = () => {
    setOpenEditionModal(false)
    setSelectedCohorts([])
  }

  const onSubmitDeletion = () => {
    deleteCohortMutation.mutate(selectedCohorts, { onSuccess: onCloseDeletionModal })
  }

  const onSubmitParentRequestDeletion = () => {
    deleteRequestMutation.mutate([parentRequest as RequestType], {
      onSuccess: () => {
        onCloseDeletionModal()
        navigate(`/researches/projects/${projectId}/`)
      }
    })
  }

  const onShareRequest = () => {
    dispatch(setSelectedRequestShare({ uuid: requestId ?? '', name: '' }))
  }

  const onClickFav = (cohort: Cohort) => {
    editCohortMutation.mutate(
      { ...cohort, favorite: !cohort.favorite },
      { onError: () => console.log('erreur lors de ledition') }
    )
    // TODO: gérer en cas d'erreur (state message réinstauré?)
  }

  const onClickExport = (cohort: Cohort) => {
    setSelectedCohorts([cohort])
    setOpenExportModal(true)
  }

  const onClickEdit = (cohort: Cohort) => {
    setSelectedCohorts([cohort])
    setOpenEditionModal(true)
  }

  const onClickDelete = (cohort: Cohort) => {
    setDeleteMode(true)
    setSelectedCohorts([cohort])
  }

  const toggleCohort = (cohort: Cohort) => {
    if (!selectedCohorts.find((selectedCohort) => selectedCohort === cohort)) {
      setSelectedCohorts(addElementInArray(selectedCohorts, cohort))
    } else {
      setSelectedCohorts(removeElementInArray(selectedCohorts, cohort))
    }
  }

  const onSelectAll = () => {
    if (selectedCohorts.length === cohortsList.length) {
      setSelectedCohorts([])
    } else if (selectedCohorts.length <= cohortsList.length) {
      setSelectedCohorts(cohortsList)
    }
  }

  if (requestIsError) {
    return (
      <Grid container justifyContent={'center'}>
        Les détails de cette requête ne sont pas disponibles pour le moment.
      </Grid>
    )
  }

  return (
    <Grid container gap="20px">
      {requestId && (
        <LevelHeader
          loading={requestLoading}
          name={getRequestName(parentRequest)}
          hideActions={!deleteMode}
          description={parentRequest?.description ?? ''}
          actions={
            <>
              <Tooltip title="Partager la requête">
                <IconButton onClick={() => onShareRequest()}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={() => setOpenEditionModal(true)}>
                <EditIcon />
              </IconButton>
              <IconButton color="secondary" onClick={() => setOpenDeletionModal(true)}>
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
        label="cohorte"
        totalSelected={selectedCohorts.length}
        onConfirmDeletion={() => setOpenDeletionModal(true)}
        onCancelDeletion={() => {
          setDeleteMode(false)
          setSelectedCohorts([])
        }}
        filters
      />
      <CohortsTableContent
        cohortsList={cohortsList}
        deleteMode={deleteMode}
        page={page}
        setPage={handlePageChange}
        total={total}
        order={order}
        onChangeOrderBy={changeOrderBy}
        loading={loading}
        disabled={maintenanceIsActive}
        selectedCohorts={selectedCohorts}
        onSelectAll={onSelectAll}
        cohortsCallbacks={{
          onClickRow,
          onClickFav,
          onClickExport,
          onClickDelete,
          onClickEdit,
          onSelectCohort: toggleCohort
        }}
      />

      {!!appConfig.features.export.enabled && (
        <ExportModal
          cohortId={selectedCohorts?.[0]?.uuid ?? ''}
          open={openExportModal}
          handleClose={() => setOpenExportModal(false)}
          fhirGroupId={selectedCohorts?.[0]?.group_id ?? ''}
        />
      )}
      <AddOrEditItem
        open={openEditionModal}
        selectedItem={selectedCohorts?.[0]}
        onClose={onCloseEditionModal}
        onUpdate={(cohort) => editCohortMutation.mutate(cohort, { onSuccess: onCloseEditionModal })}
        titleEdit="Modifier la cohorte"
      />
      <AddOrEditItem
        open={openEditionModal}
        selectedItem={parentRequest ?? {}}
        onClose={onCloseEditionModal}
        onUpdate={(request) => editRequestMutation.mutate(request as RequestType, { onSuccess: onCloseEditionModal })}
        titleEdit="Modifier la requête"
      />
      <ConfirmDeletion
        open={openDeletionModal}
        onClose={() => setOpenDeletionModal(false)}
        onSubmit={deleteMode ? onSubmitDeletion : onSubmitParentRequestDeletion}
        title={
          deleteMode
            ? `Supprimer ${selectedCohorts.length <= 1 ? 'une cohorte' : 'des cohortes'}`
            : 'Supprimer la requête'
        }
        message={
          deleteMode
            ? `Êtes-vous sûr(e) de vouloir supprimer ${
                selectedCohorts.length <= 1 ? 'cette cohorte' : 'ces cohortes'
              } ?`
            : 'Êtes-vous sûr(e) de vouloir supprimer cette requête ? Sa suppression entraînera également celle des cohortes sous-jacentes.'
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

export default CohortsList
