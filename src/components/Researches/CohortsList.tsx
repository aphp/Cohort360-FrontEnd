import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AddOrEditItem from './Modals/AddOrEditItem'
import CohortsTableContent from './CohortsTableContent'
import ConfirmDeletion from './Modals/ConfirmDeletion'
import CreateSample from './Modals/CreateSample'
import GenericCohortListView from './GenericListView'
import IconButtonWithTooltip from 'components/ui/IconButtonWithTooltip'
import LevelHeader from './LevelHeader'

import DeleteIcon from 'assets/icones/delete.svg?react'
import EditIcon from '@mui/icons-material/Edit'
import ModalShareRequest from './Modals/ModalShareRequest'
import ShareIcon from '@mui/icons-material/Share'

import useCohorts from 'hooks/researches/useCohorts'
import useCohortItemActions from '../../hooks/researches/useCohortItemActions'
import useCohortListController from '../../hooks/researches/useCohortListController'
import useCohortsWebSocket from 'hooks/researches/useCohortsWebSocket'
import useCreateSample from 'hooks/researches/useCreateSample'
import useDeleteCohort from 'hooks/researches/useDeleteCohort'
import useDeleteRequests from 'hooks/researches/useDeleteRequests'
import useEditCohort from 'hooks/researches/useEditCohort'
import useEditRequest from 'hooks/researches/useEditRequest'
import useRequest from 'hooks/researches/useRequest'
import useSelectionState from 'hooks/researches/useMultipleSelection'

import { Cohort, RequestType } from 'types'
import {
  getCohortsConfirmDeletionMessage,
  getCohortsConfirmDeletionTitle,
  getRequestName,
  getRequestsConfirmDeletionMessage,
  getRequestsConfirmDeletionTitle,
  getVisibleFilters,
  redirectOnParentRequestDeletion,
  redirectToSamples
} from 'utils/explorationUtils'

type CohortsListProps = {
  rowsPerPage?: number
  favorites?: boolean
  simplified?: boolean
}

const CohortsList: React.FC<CohortsListProps> = ({ rowsPerPage = 20, favorites = false, simplified = false }) => {
  useCohortsWebSocket()
  const navigate = useNavigate()
  const { projectId, requestId } = useParams()

  const controller = useCohortListController({
    useData: (p) => useCohorts({ ...p, parentRequest: requestId }),
    rowsPerPage,
    favorites,
    simplified
  })
  const { filtersAsArray, list, maintenanceIsActive } = controller
  const { request: parentRequest, requestLoading } = useRequest(requestId)

  const [cohortToEdit, setCohortToEdit] = useState<Cohort | null>(null)
  const [deleteMode, setDeleteMode] = useState(false)
  const [openCohortEditionModal, setOpenCohortEditionModal] = useState(false)
  const [openParentEditionModal, setOpenParentEditionModal] = useState(false)
  const [openShareParentModal, setOpenShareParentModal] = useState(false)
  const [openDeletionModal, setOpenDeletionModal] = useState(false)
  const [openCreateSampleModal, setOpenCreateSampleModal] = useState(false)

  const {
    selected: selectedCohorts,
    setSelected: setSelectedCohorts,
    toggle,
    clearSelection
  } = useSelectionState<Cohort>()
  const itemActions = useCohortItemActions({
    navigate,
    toggleSelection: toggle
  })
  const editCohortMutation = useEditCohort()
  const editRequestMutation = useEditRequest()
  const deleteCohortMutation = useDeleteCohort()
  const deleteRequestMutation = useDeleteRequests()
  const createSampleMutation = useCreateSample()

  const onClickCreateSample = (cohort: Cohort) => {
    setCohortToEdit(cohort)
    setOpenCreateSampleModal(true)
  }

  const onClickDelete = () => {
    setOpenDeletionModal(true)
    setDeleteMode(true)
  }

  const onClickEdit = (cohort: Cohort) => {
    setCohortToEdit(cohort)
    setOpenCohortEditionModal(true)
  }

  const onCloseEditionModal = () => {
    setOpenCohortEditionModal(false)
    setCohortToEdit(null)
  }

  const onSelectAll = () => {
    if (selectedCohorts.length === list.length) {
      clearSelection()
    } else if (selectedCohorts.length <= list.length) {
      setSelectedCohorts(list)
    }
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
        navigate(redirectOnParentRequestDeletion(projectId))
      }
    })
  }

  const headerActions = parentRequest && (
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

  return (
    <>
      <GenericCohortListView
        itemLabel="cohorte"
        controller={controller}
        actionBarProps={{
          totalSelected: selectedCohorts.length,
          onDelete: () => onClickDelete(),
          filters: getVisibleFilters(filtersAsArray)
        }}
        header={
          <LevelHeader
            loading={requestLoading}
            name={requestId ? getRequestName(parentRequest) : 'Toutes mes cohortes'}
            description={parentRequest?.description ?? ''}
            actions={headerActions}
          />
        }
        TableComponent={CohortsTableContent}
        tableProps={{
          cohortsList: list,
          selectedCohorts,
          onSelectAll,
          cohortsCallbacks: { ...itemActions, onClickCreateSample, onClickEdit }
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
        onUpdate={(request) => editRequestMutation.mutate(request as RequestType)}
        titleEdit="Modifier la requête"
      />
      <CreateSample
        open={openCreateSampleModal}
        onClose={() => setOpenCreateSampleModal(false)}
        parentCohort={cohortToEdit as Cohort}
        onCreate={(sampleData) =>
          createSampleMutation.mutate(sampleData, {
            onSuccess: () => {
              setCohortToEdit(null)
              navigate(redirectToSamples(sampleData.parentCohort))
            }
          })
        }
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
    </>
  )
}

export default CohortsList
