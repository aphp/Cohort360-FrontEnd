import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AddOrEditItem from './Modals/AddOrEditItem'
import ConfirmDeletion from './Modals/ConfirmDeletion'
import CreateSample from './Modals/CreateSample'
import GenericCohortListView from './GenericListView'
import IconButtonWithTooltip from 'components/ui/IconButtonWithTooltip'
import LevelHeader from './LevelHeader'
import SamplesTableContent from './SamplesTableContent'

import DeleteIcon from 'assets/icones/delete.svg?react'
import Download from 'assets/icones/download.svg?react'
import EditIcon from '@mui/icons-material/Edit'
import FluentNavigation from 'assets/icones/fluent_navigation.svg?react'

import useCohort from 'hooks/researches/useCohort'
import useCohorts from 'hooks/researches/useCohorts'
import useCohortItemActions from '../../hooks/researches/useCohortItemActions'
import useCohortListController from '../../hooks/researches/useCohortListController'
import useCohortsWebSocket from 'hooks/researches/useCohortsWebSocket'
import useCreateSample from 'hooks/researches/useCreateSample'
import useDeleteCohort from 'hooks/researches/useDeleteCohort'
import useEditCohort from 'hooks/researches/useEditCohort'
import useSelectionState from 'hooks/researches/useMultipleSelection'

import { Cohort } from 'types'
import {
  getCohortsConfirmDeletionMessage,
  getCohortsConfirmDeletionTitle,
  getExportTooltip,
  getSamplesConfirmDeletionMessage,
  getSamplesConfirmDeletionTitle,
  getVisibleFilters,
  isCohortExportable,
  isExportDisabled,
  redirectOnParentCohortDeletion
} from 'utils/explorationUtils'

const SamplesList = () => {
  useCohortsWebSocket()
  const navigate = useNavigate()
  const { projectId, requestId, cohortId } = useParams()
  const controller = useCohortListController({
    useData: (params) => useCohorts({ ...params, isSample: true, parentCohort: cohortId })
  })
  const { appConfig, filtersAsArray, list, maintenanceIsActive } = controller
  const { cohort: parentCohort, cohortLoading } = useCohort(cohortId)
  const {
    selected: selectedSamples,
    setSelected: setSelectedSamples,
    toggle,
    clearSelection
  } = useSelectionState<Cohort>()
  const itemActions = useCohortItemActions({ navigate, toggleSelection: toggle, parentCohortId: cohortId })
  const editCohortMutation = useEditCohort()
  const deleteCohortMutation = useDeleteCohort()
  const createSampleMutation = useCreateSample()

  const [deleteMode, setDeleteMode] = useState(false)
  const [sampleToEdit, setSampleToEdit] = useState<Cohort | null>(null)
  const [openSampleEditionModal, setOpenSampleEditionModal] = useState(false)
  const [openParentEditionModal, setOpenParentEditionModal] = useState(false)
  const [openDeletionModal, setOpenDeletionModal] = useState(false)
  const [openCreateSampleModal, setOpenCreateSampleModal] = useState(false)

  const onClickCreateSample = (cohort?: Cohort) => {
    setSampleToEdit(cohort ?? (parentCohort as Cohort))
    setOpenCreateSampleModal(true)
  }

  const onClickDelete = () => {
    setOpenDeletionModal(true)
    setDeleteMode(true)
  }

  const onClickEdit = (cohort: Cohort) => {
    setSampleToEdit(cohort)
    setOpenSampleEditionModal(true)
  }

  const onCloseEditionModal = () => {
    setOpenSampleEditionModal(false)
    setSampleToEdit(null)
  }

  const onSelectAll = () => {
    if (selectedSamples.length === list.length) {
      clearSelection()
    } else if (selectedSamples.length <= list.length) {
      setSelectedSamples(list)
    }
  }

  const onSubmitDeletion = () => {
    deleteCohortMutation.mutate(selectedSamples, { onSuccess: clearSelection })
    setOpenDeletionModal(false)
    setDeleteMode(false)
  }

  const onSubmitParentCohortDeletion = () => {
    deleteCohortMutation.mutate([parentCohort as Cohort], {
      onSuccess: () => {
        setOpenDeletionModal(false)
        navigate(redirectOnParentCohortDeletion(requestId, projectId))
      }
    })
  }
  return (
    <>
      <GenericCohortListView
        itemLabel="échantillon"
        controller={controller}
        actionBarProps={{
          totalSelected: selectedSamples.length,
          onDelete: () => onClickDelete(),
          onAddSample: parentCohort ? onClickCreateSample : undefined,
          filters: getVisibleFilters(filtersAsArray)
        }}
        header={
          <LevelHeader
            loading={cohortLoading}
            name={cohortId ? (parentCohort?.name ?? 'N/A') : 'Tous mes échantillons'}
            description={parentCohort?.description ?? ''}
            actions={
              cohortId && (
                <>
                  <IconButtonWithTooltip
                    disabled={isExportDisabled(
                      parentCohort as Cohort,
                      maintenanceIsActive,
                      isCohortExportable(parentCohort as Cohort, appConfig)
                    )}
                    title={
                      getExportTooltip(
                        !!(appConfig.features.export.enabled ? parentCohort?.rights?.export_csv_xlsx_nomi : false),
                        parentCohort as Cohort
                      ) ?? ''
                    }
                    icon={<Download />}
                    onClick={() => itemActions.onClickExport(parentCohort as Cohort)}
                    color={'#5bc5f2'}
                  />
                  <IconButtonWithTooltip
                    disabled={maintenanceIsActive}
                    title="Accéder à la version de la requête ayant créé la cohorte"
                    icon={<FluentNavigation />}
                    onClick={() =>
                      navigate(`/cohort/new/${parentCohort?.request?.uuid}/${parentCohort?.request_query_snapshot}`)
                    }
                    color={'#5bc5f2'}
                  />
                  <IconButtonWithTooltip
                    disabled={maintenanceIsActive}
                    title="Éditer la cohorte parent"
                    icon={<EditIcon />}
                    onClick={() => setOpenParentEditionModal(true)}
                    color={'#5bc5f2'}
                  />
                  <IconButtonWithTooltip
                    disabled={maintenanceIsActive}
                    title="Supprimer la cohorte"
                    icon={<DeleteIcon />}
                    onClick={() => setOpenDeletionModal(true)}
                    color={'#ed6d91'}
                  />
                </>
              )
            }
          />
        }
        TableComponent={SamplesTableContent}
        tableProps={{
          selectedCohorts: selectedSamples,
          onSelectAll,
          cohortsCallbacks: { ...itemActions, onClickCreateSample, onClickEdit }
        }}
      />

      <CreateSample
        open={openCreateSampleModal}
        onClose={() => setOpenCreateSampleModal(false)}
        parentCohort={parentCohort as Cohort}
        onCreate={(sampleData) => createSampleMutation.mutate(sampleData)}
      />
      <AddOrEditItem
        open={openSampleEditionModal}
        selectedItem={sampleToEdit}
        onClose={onCloseEditionModal}
        onUpdate={(cohort: Cohort) => {
          editCohortMutation.mutate(cohort)
        }}
        titleEdit="Modifier l'échantillon"
      />
      <AddOrEditItem
        open={openParentEditionModal}
        selectedItem={parentCohort as Cohort}
        onClose={() => setOpenParentEditionModal(false)}
        onUpdate={(cohort: Cohort) => editCohortMutation.mutate(cohort)}
        titleEdit="Modifier la cohorte"
      />
      <ConfirmDeletion
        open={openDeletionModal}
        onClose={() => {
          setDeleteMode(false)
          setOpenDeletionModal(false)
        }}
        onSubmit={deleteMode ? onSubmitDeletion : onSubmitParentCohortDeletion}
        title={deleteMode ? getSamplesConfirmDeletionTitle(selectedSamples.length) : getCohortsConfirmDeletionTitle()}
        message={
          deleteMode ? getSamplesConfirmDeletionMessage(selectedSamples.length) : getCohortsConfirmDeletionMessage()
        }
      />
    </>
  )
}

export default SamplesList
