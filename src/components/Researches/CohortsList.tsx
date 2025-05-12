/* eslint-disable max-statements */
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppSelector } from 'state'

import { Grid } from '@mui/material'
import ActionBar from './ActionBar'
import AddOrEditItem from './Modals/AddOrEditItem'
import CohortsTableContent from './CohortsTableContent'
import ConfirmDeletion from './Modals/ConfirmDeletion'
import IconButtonWithTooltip from '../ui/IconButtonWithTooltip'
import LevelHeader from './LevelHeader'
import Modal from 'components/ui/Modal'
import ModalShareRequest from './Modals/ModalShareRequest'
import NumberRange from 'components/ui/Inputs/NumberRange'

import DeleteIcon from 'assets/icones/delete.svg?react'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'

import useCohorts from 'hooks/researches/useCohorts'
import useCohortsWebSocket from 'hooks/researches/useCohortsWebSocket'
import useDeleteCohort from 'hooks/researches/useDeleteCohort'
import useDeleteRequests from 'hooks/researches/useDeleteRequests'
import useEditCohort from 'hooks/researches/useEditCohort'
import useEditRequest from 'hooks/researches/useEditRequest'
import usePageValidation from 'hooks/researches/usePageValidation'
import useRequest from 'hooks/researches/useRequest'
import useSelectionState from 'hooks/researches/useMultipleSelection'

import { Cohort, RequestType } from 'types'
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
import { selectFiltersAsArray } from 'utils/filters'
import { CohortsType, CohortsTypeLabel, ExplorationsSearchParams } from 'types/cohorts'
import CheckboxGroup from 'components/ui/Inputs/CheckboxGroup'
import MultiSelect from 'components/ui/Inputs/MultiSelect'

type CohortsListProps = {
  rowsPerPage?: number
  simplified?: boolean
  favorites?: boolean
}

const CohortsList = ({ rowsPerPage = 20, favorites, simplified = false }: CohortsListProps) => {
  const navigate = useNavigate()
  const { projectId, requestId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { searchInput, page, orderBy, orderDirection, filters } = useMemo(() => {
    const { searchInput, page, orderBy, filters } = getCohortsSearchParams(searchParams)
    return {
      searchInput,
      page,
      orderBy: orderBy.orderBy,
      orderDirection: orderBy.orderDirection,
      filters: { ...filters, favorite: favorites ? [CohortsType.FAVORITE] : filters.favorite }
    }
  }, [searchParams, favorites])

  const maintenanceIsActive = useAppSelector((state) => state?.me?.maintenance?.active ?? false)

  const [paramsReady, setParamsReady] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [order, setOrder] = useState<OrderBy>({ orderBy, orderDirection })
  const [form, setForm] = useState<CohortsFilters | null>(null)
  const [cohortToEdit, setCohortToEdit] = useState<Cohort | null>(null)
  const [openCohortEditionModal, setOpenCohortEditionModal] = useState(false)
  const [openParentEditionModal, setOpenParentEditionModal] = useState(false)
  const [openShareParentModal, setOpenShareParentModal] = useState(false)
  const [openDeletionModal, setOpenDeletionModal] = useState(false)
  const [openFiltersModal, setOpenFiltersModal] = useState(false)
  const [modalError, setModalError] = useState(false)

  useEffect(() => {
    if (!simplified) {
      const { changed, newSearchParams } = checkSearchParamsErrors(searchParams)
      if (changed) {
        setSearchParams(newSearchParams)
      }
    }
    setParamsReady(true)
  }, [])

  useEffect(() => {
    setForm(filters)
  }, [filters])

  const { request: parentRequest, requestLoading, requestIsError } = useRequest(requestId)
  const { cohortsList, total, loading } = useCohorts({
    orderBy: order,
    searchInput,
    filters: {
      ...filters,
      parentId: requestId
    },
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
  const filtersAsArray = useMemo(() => {
    const arr = selectFiltersAsArray(filters, undefined)
    return requestId
      ? arr.filter((item) => item.category !== FilterKeys.START_DATE && item.category !== FilterKeys.END_DATE)
      : arr
  }, [filters, requestId])

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
    deleteCohortMutation.mutate(selectedCohorts, { onSuccess: clearSelection })
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

  const onSelectAll = () => {
    if (selectedCohorts.length === cohortsList.length) {
      clearSelection()
    } else if (selectedCohorts.length <= cohortsList.length) {
      setSelectedCohorts(cohortsList)
    }
  }

  const handleSubmitModal = (form: CohortsFilters) => {
    form.status.length > 0
      ? searchParams.set(ExplorationsSearchParams.STATUS, form.status.map((status) => status.id).join())
      : searchParams.delete(ExplorationsSearchParams.STATUS)
    form.favorite.length > 0
      ? searchParams.set(ExplorationsSearchParams.FAVORITE, form.favorite.join())
      : searchParams.delete(ExplorationsSearchParams.FAVORITE)
    !!form.minPatients
      ? searchParams.set(ExplorationsSearchParams.MIN_PATIENTS, form.minPatients)
      : searchParams.delete(ExplorationsSearchParams.MIN_PATIENTS)
    !!form.maxPatients
      ? searchParams.set(ExplorationsSearchParams.MAX_PATIENTS, form.maxPatients)
      : searchParams.delete(ExplorationsSearchParams.MAX_PATIENTS)
    setSearchParams(searchParams)
    setOpenFiltersModal(false)
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
                    onClick={() => setOpenShareParentModal(true)}
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
              setSearchParams(removeFromSearchParams(searchParams, key as string, value))
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
      <ModalShareRequest
        open={openShareParentModal}
        requestToShare={
          {
            ...parentRequest,
            shared_query_snapshot: parentRequest?.query_snapshots?.[0].uuid
          } as RequestType
        }
        onClose={() => setOpenShareParentModal(false)}
      />

      {form && (
        <Modal
          title="Filtrer par :"
          width={'600px'}
          open={openFiltersModal}
          onClose={() => setOpenFiltersModal(false)}
          isError={modalError}
          onSubmit={() => handleSubmitModal(form)}
        >
          <MultiSelect
            value={form.status ?? []}
            label="Statut :"
            options={statusOptions}
            onChange={(value) => setForm({ ...form, status: value })}
          />
          <CheckboxGroup
            value={form.favorite}
            onChange={(values) => {
              setForm({ ...form, favorite: values })
            }}
            label="Favoris :"
            options={[
              { id: CohortsType.FAVORITE, label: CohortsTypeLabel.FAVORITE },
              { id: CohortsType.NOT_FAVORITE, label: CohortsTypeLabel.NOT_FAVORITE }
            ]}
          />
          <NumberRange
            type="patient(s)"
            values={[form.minPatients, form.maxPatients]}
            label="Nombre de patients"
            onChange={(values) => {
              setForm({ ...form, minPatients: values[0], maxPatients: values[1] })
            }}
            onError={setModalError}
          />
        </Modal>
      )}
    </Grid>
  )
}

export default CohortsList
