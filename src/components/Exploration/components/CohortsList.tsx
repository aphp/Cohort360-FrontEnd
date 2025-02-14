/* eslint-disable max-statements */
import React, { useContext, useMemo, useState } from 'react'
import { AppConfig } from 'config'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'state'
import { setSelectedRequestShare } from 'state/request'

import { Grid, IconButton, Tooltip } from '@mui/material'
import ActionBar from './ActionBar'
import AddOrEditItem from './Modals/AddOrEditItem'
import CohortStatusFilter from 'components/Filters/CohortStatusFilter'
import CohortsTableContent from './CohortsTableContent'
import CohortsTypesFilter from 'components/Filters/CohortsTypeFilter'
import ConfirmDeletion from './Modals/ConfirmDeletion'
import ExportModal from 'components/Dashboard/ExportModal/ExportModal'
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
import useRequest from '../hooks/useRequest'
import useSelectionState from '../hooks/useMultipleSelection'

import { Cohort, RequestType, ValueSet } from 'types'
import { CohortsFilters, FilterKeys, OrderBy } from 'types/searchCriterias'
import {
  getCohortsConfirmDeletionMessage,
  getCohortsConfirmDeletionTitle,
  getCohortsSearchParams,
  getRequestName,
  getRequestsConfirmDeletionMessage,
  removeFromSearchParams,
  statusOptions
} from 'utils/explorationUtils'
import { removeFilter, selectFiltersAsArray } from 'utils/filters'
import { CohortsType } from 'types/cohorts'

type CohortsListProps = {
  showHeader?: boolean
  rowsPerPage?: number
  favorites?: boolean
}

const CohortsList = ({ showHeader = true, rowsPerPage = 20, favorites = false }: CohortsListProps) => {
  const appConfig = useContext(AppConfig)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { projectId, requestId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { searchInput, startDate, endDate, page, orderBy, orderDirection, status, favorite, minPatients, maxPatients } =
    getCohortsSearchParams(searchParams)

  const maintenanceIsActive = useAppSelector((state) => state?.me?.maintenance?.active ?? false)
  const requestState = useAppSelector((state) => state.request)

  const { selectedRequestShare } = requestState
  const [deleteMode, setDeleteMode] = useState(false)
  const [order, setOrder] = useState<OrderBy>({ orderBy, orderDirection })
  const [filters, setFilters] = useState<CohortsFilters>({
    status,
    favorite: favorites ? [CohortsType.FAVORITE] : favorite,
    minPatients,
    maxPatients,
    startDate,
    endDate,
    parentId: requestId
  })
  const [openEditionModal, setOpenEditionModal] = useState(false)
  const [openDeletionModal, setOpenDeletionModal] = useState(false)
  const [openExportModal, setOpenExportModal] = useState(false)
  const [openFiltersModal, setOpenFiltersModal] = useState(false)

  const { request: parentRequest, requestLoading, requestIsError } = useRequest(requestId)
  const { cohortsList, total, loading } = useCohorts({ orderBy: order, searchInput, filters, rowsPerPage })
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
    clearSelection()
  }

  const onCloseEditionModal = () => {
    setOpenEditionModal(false)
    clearSelection()
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
        Les détails de cette requête ne sont pas disponibles pour le moment.
      </Grid>
    )
  }

  return (
    <Grid container gap="20px">
      {showHeader && (
        <>
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
                    <DeleteIcon />
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
            onCancelMultiselectMode={() => {
              setDeleteMode(false)
              clearSelection()
            }}
            onFilter={() => setOpenFiltersModal(true)}
            filters={filtersAsArray}
            onRemoveFilters={(key, value) => {
              removeFromSearchParams(searchParams, setSearchParams, key, value)
              setFilters(removeFilter(key, value, filters))
            }}
          />
        </>
      )}
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
          onSelectCohort: toggle
        }}
        noPagination={!showHeader}
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
          deleteMode ? getCohortsConfirmDeletionTitle(selectedCohorts.length) : getRequestsConfirmDeletionMessage()
        }
        message={
          deleteMode ? getCohortsConfirmDeletionMessage(selectedCohorts.length) : getRequestsConfirmDeletionMessage()
        }
      />
      {selectedRequestShare !== null && (
        <ModalShareRequest
          // parentStateSetter={wrapperSetShareSuccessOrFailMessage}
          onClose={() => dispatch(setSelectedRequestShare(null))}
        />
      )}

      <Modal
        title="Filtrer par :"
        width={'600px'}
        open={openFiltersModal}
        onClose={() => setOpenFiltersModal(false)}
        onSubmit={(newFilters) => {
          setFilters({ ...filters, ...newFilters })
          newFilters.status.length > 0 &&
            searchParams.set('status', newFilters.status.map((status: ValueSet) => status.code).join())
          newFilters.favorite.length > 0 && searchParams.set('favorite', newFilters.favorite)
          newFilters.minPatients && searchParams.set('minPatients', newFilters.minPatients)
          newFilters.maxPatients && searchParams.set('maxPatients', newFilters.maxPatients)
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
