/* eslint-disable max-statements */
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'state'
import { setMessage } from 'state/message'
import { setSelectedRequestShare } from 'state/request'

import { Grid } from '@mui/material'
import ActionBar from './ActionBar'
import AddOrEditItem from './Modals/AddOrEditItem'
import CohortStatusFilter from 'components/Filters/CohortStatusFilter'
import CohortsTableContent from './CohortsTableContent'
import CohortsTypesFilter from 'components/Filters/CohortsTypeFilter'
import ConfirmDeletion from './Modals/ConfirmDeletion'
import IconButtonWithTooltip from './IconButtonWithTooltip'
import LevelHeader from './LevelHeader'
import Modal from 'components/ui/Modal'
import ModalShareRequest from 'components/Requests/Modals/ModalShareRequest/ModalShareRequest'
import PatientsNbFilter from 'components/Filters/PatientsNbFilter'

import DeleteIcon from 'assets/icones/delete.svg?react'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'

import useCohorts from '../hooks/useCohorts'
import useCohortsWebSocket from '../hooks/useCohortsWebSocket'
import useDeleteCohort from '../hooks/useDeleteCohort'
import useDeleteRequests from '../hooks/useDeleteRequests'
import useEditCohort from '../hooks/useEditCohort'
import useEditRequest from '../hooks/useEditRequest'
import usePageValidation from '../hooks/usePageValidation'
import useRequest from '../hooks/useRequest'
import useSelectionState from '../hooks/useMultipleSelection'

import { Cohort, RequestType, SimpleStatus, ValueSet } from 'types'
import { CohortsFilters, FilterKeys, OrderBy } from 'types/searchCriterias'
import {
  checkSearchParamsErrors,
  getCohortsConfirmDeletionMessage,
  getCohortsConfirmDeletionTitle,
  getCohortsSearchParams,
  getRequestName,
  getRequestsConfirmDeletionMessage,
  getRequestsConfirmDeletionTitle,
  removeFromSearchParams,
  statusOptions
} from 'utils/explorationUtils'
import { removeFilter, selectFiltersAsArray } from 'utils/filters'
import { CohortsType, ExplorationsSearchParams } from 'types/cohorts'

type CohortsListProps = {
  rowsPerPage?: number
  favorites?: boolean
  simplified?: boolean
}

const CohortsList = ({ rowsPerPage = 20, favorites = false, simplified = false }: CohortsListProps) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { projectId, requestId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { searchInput, startDate, endDate, page, orderBy, orderDirection, status, favorite, minPatients, maxPatients } =
    getCohortsSearchParams(searchParams)

  const maintenanceIsActive = useAppSelector((state) => state?.me?.maintenance?.active ?? false)
  const requestState = useAppSelector((state) => state.request)

  const { selectedRequestShare } = requestState
  const [paramsReady, setParamsReady] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [order, setOrder] = useState<OrderBy>({ orderBy, orderDirection })
  let filters: CohortsFilters = {
    status,
    favorite: favorites ? [CohortsType.FAVORITE] : favorite,
    minPatients,
    maxPatients,
    startDate,
    endDate,
    parentId: requestId
  }
  const [cohortToEdit, setCohortToEdit] = useState<Cohort | null>(null)
  const [openCohortEditionModal, setOpenCohortEditionModal] = useState(false)
  const [openParentEditionModal, setOpenParentEditionModal] = useState(false)
  const [openDeletionModal, setOpenDeletionModal] = useState(false)
  const [openFiltersModal, setOpenFiltersModal] = useState(false)

  useEffect(() => {
    const { changed, newSearchParams } = checkSearchParamsErrors(searchParams)
    if (changed) {
      setSearchParams(newSearchParams)
    }
    setParamsReady(true)
  }, [])

  const { request: parentRequest, requestLoading, requestIsError } = useRequest(requestId)
  const { cohortsList, total, loading } = useCohorts({
    orderBy: order,
    searchInput,
    filters,
    page,
    rowsPerPage,
    paramsReady
  })
  useCohortsWebSocket()
  const editRequestMutation = useEditRequest()
  const deleteRequestMutation = useDeleteRequests()
  const editCohortMutation = useEditCohort()
  const deleteCohortMutation = useDeleteCohort()
  const {
    selected: selectedCohorts,
    setSelected: setSelectedCohorts,
    toggle,
    clearSelection
  } = useSelectionState<Cohort>()
  const filtersAsArray = useMemo(
    () =>
      selectFiltersAsArray({
        status,
        favorite,
        minPatients,
        maxPatients,
        startDate,
        endDate
      }),
    [status, favorite, minPatients, maxPatients, startDate, endDate]
  )

  const handlePageChange = (newPage: number) => {
    searchParams.set(ExplorationsSearchParams.PAGE, String(newPage))
    setSearchParams(searchParams)
  }

  usePageValidation(total, page, rowsPerPage, handlePageChange)

  const onClickRow = (cohort: Cohort) => {
    const searchParams = new URLSearchParams()
    if (cohort.group_id) {
      searchParams.set('groupId', cohort.group_id)
    }
    navigate(`/cohort?${searchParams.toString()}`)
  }

  const changeOrderBy = (newOrder: OrderBy) => {
    setOrder(newOrder)
    searchParams.set(ExplorationsSearchParams.ORDER_BY, newOrder.orderBy)
    searchParams.set(ExplorationsSearchParams.DIRECTION, newOrder.orderDirection)
    setSearchParams(searchParams)
  }

  const onCloseEditionModal = () => {
    setOpenCohortEditionModal(false)
    setCohortToEdit(null)
  }

  const onSubmitDeletion = () => {
    deleteCohortMutation.mutate(selectedCohorts)
    setOpenDeletionModal(false)
    setDeleteMode(false)
  }

  const onSubmitParentRequestDeletion = () => {
    deleteRequestMutation.mutate([parentRequest as RequestType], {
      onSuccess: () => {
        setOpenDeletionModal(false)
        navigate(`/researches/projects/${projectId}/`)
      }
    })
  }

  const onShareRequest = () => {
    dispatch(setSelectedRequestShare({ uuid: requestId ?? '', name: '' }))
  }

  const onClickFav = (cohort: Cohort) => {
    editCohortMutation.mutate({ ...cohort, favorite: !cohort.favorite })
  }

  const onClickExport = (cohort: Cohort) => {
    const searchParams = new URLSearchParams()
    if (cohort.group_id) {
      searchParams.set('groupId', cohort.group_id)
    }
    navigate(`/exports/new?${searchParams.toString()}`)
  }

  const onClickEdit = (cohort: Cohort) => {
    setCohortToEdit(cohort)
    setOpenCohortEditionModal(true)
  }

  const onClickDelete = () => {
    setOpenDeletionModal(true)
    setDeleteMode(true)
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

  const onSelectAll = () => {
    if (selectedCohorts.length === cohortsList.length) {
      clearSelection()
    } else if (selectedCohorts.length <= cohortsList.length) {
      setSelectedCohorts(cohortsList)
    }
  }

  if (requestIsError) {
    return (
      <Grid container justifyContent={'center'}>
        Les détails de cette requête ne sont pas disponibles pour le moment ou n'existent pas.
      </Grid>
    )
  }

  return (
    <Grid container gap="20px">
      {!simplified && (
        <>
          <LevelHeader
            loading={requestLoading}
            name={requestId ? getRequestName(parentRequest) : 'Toutes mes cohortes'}
            description={parentRequest?.description ?? ''}
            actions={
              requestId && (
                <>
                  <IconButtonWithTooltip
                    disabled={maintenanceIsActive}
                    title="Partager la requête"
                    icon={<ShareIcon />}
                    onClick={() => onShareRequest()}
                    color={'#5bc5f2'}
                  />
                  <IconButtonWithTooltip
                    disabled={maintenanceIsActive}
                    title="Éditer la requête"
                    icon={<EditIcon />}
                    onClick={() => setOpenParentEditionModal(true)}
                    color={'#5bc5f2'}
                  />
                  <IconButtonWithTooltip
                    disabled={maintenanceIsActive}
                    title="Supprimer la requête"
                    icon={<DeleteIcon />}
                    onClick={() => setOpenDeletionModal(true)}
                    color={'#ed6d91'}
                  />
                </>
              )
            }
          />

          <ActionBar
            loading={loading}
            total={total}
            label="cohorte"
            totalSelected={selectedCohorts.length}
            onDelete={() => onClickDelete()}
            onFilter={() => setOpenFiltersModal(true)}
            filters={filtersAsArray}
            onRemoveFilters={(key, value) => {
              removeFromSearchParams(searchParams, setSearchParams, key, value)
              filters = removeFilter(key, value, filters)
            }}
            disabled={maintenanceIsActive}
          />
        </>
      )}
      <CohortsTableContent
        cohortsList={cohortsList}
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
          onClickEdit,
          onSelectCohort: toggle
        }}
        simplified={simplified}
      />
      <AddOrEditItem
        open={openCohortEditionModal}
        selectedItem={cohortToEdit}
        onClose={onCloseEditionModal}
        onUpdate={(cohort) => editCohortMutation.mutate(cohort)}
        titleEdit="Modifier la cohorte"
      />
      <AddOrEditItem
        open={openParentEditionModal}
        selectedItem={parentRequest ?? {}}
        onClose={() => setOpenParentEditionModal(false)}
        onUpdate={(request) =>
          editRequestMutation.mutate(request as RequestType, { onSuccess: () => setOpenParentEditionModal(false) })
        }
        titleEdit="Modifier la requête"
      />
      <ConfirmDeletion
        open={openDeletionModal}
        onClose={() => {
          setDeleteMode(false)
          setOpenDeletionModal(false)
        }}
        onSubmit={deleteMode ? onSubmitDeletion : onSubmitParentRequestDeletion}
        title={deleteMode ? getCohortsConfirmDeletionTitle(selectedCohorts.length) : getRequestsConfirmDeletionTitle()}
        message={
          deleteMode ? getCohortsConfirmDeletionMessage(selectedCohorts.length) : getRequestsConfirmDeletionMessage()
        }
      />
      {selectedRequestShare !== null && (
        <ModalShareRequest
          parentStateSetter={(status) => handleShareStatus(status)}
          onClose={() => dispatch(setSelectedRequestShare(null))}
        />
      )}

      <Modal
        title="Filtrer par :"
        width={'600px'}
        open={openFiltersModal}
        onClose={() => setOpenFiltersModal(false)}
        onSubmit={(newFilters) => {
          filters = { ...filters, ...newFilters }
          newFilters.status.length > 0 &&
            searchParams.set(
              ExplorationsSearchParams.STATUS,
              newFilters.status.map((status: ValueSet) => status.code).join()
            )
          newFilters.favorite.length > 0 && searchParams.set(ExplorationsSearchParams.FAVORITE, newFilters.favorite)
          newFilters.minPatients && searchParams.set(ExplorationsSearchParams.MIN_PATIENTS, newFilters.minPatients)
          newFilters.maxPatients && searchParams.set(ExplorationsSearchParams.MAX_PATIENTS, newFilters.maxPatients)
          setSearchParams(searchParams)
        }}
      >
        <CohortStatusFilter value={status} name={FilterKeys.STATUS} allStatus={statusOptions} />
        <CohortsTypesFilter value={favorite} name={FilterKeys.FAVORITE} />
        <PatientsNbFilter
          values={[minPatients, maxPatients]}
          names={[FilterKeys.MIN_PATIENTS, FilterKeys.MAX_PATIENTS]}
        />
      </Modal>
    </Grid>
  )
}

export default CohortsList
