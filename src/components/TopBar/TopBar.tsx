import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { IconButton, Menu, MenuItem } from '@mui/material'

import FluentNavigation from 'assets/icones/fluent_navigation.svg?react'
import MoreButton from '@mui/icons-material/MoreVert'

import { AccessLevel } from 'components/ui/AccessBadge'
import AddOrEditItem from 'components/Researches/Modals/AddOrEditItem'
import ConfirmDeletion from 'components/Researches/Modals/ConfirmDeletion'
import CreateSample from 'components/Researches/Modals/CreateSample'
import FavStar from 'components/ui/FavStar'
import HeaderLayout from 'components/ui/Header'
import IconButtonWithTooltip from 'components/ui/IconButtonWithTooltip'

import useCreateSample from 'hooks/researches/useCreateSample'
import useDeleteCohort from 'hooks/researches/useDeleteCohort'
import useEditCohort from 'hooks/researches/useEditCohort'

import { useAppSelector, useAppDispatch } from 'state'

import services from 'services/aphp'
import { updateCohort } from 'state/exploredCohort'

import {
  getCohortsConfirmDeletionMessage,
  getCohortsConfirmDeletionTitle,
  redirectToSamples
} from 'utils/explorationUtils'

import { AppConfig } from 'config'
import { Cohort } from 'types'
import { URLS } from 'types/exploration'
import Button from 'components/ui/Button'

type TopBarProps = {
  context: URLS
  patientsNb?: number
  access: AccessLevel
}

const headerContexts: Record<string, string> = {
  [URLS.PATIENTS]: 'Tous mes patients',
  [URLS.COHORT]: '',
  [URLS.PERIMETERS]: 'Exploration de périmètres'
}

const TopBar: React.FC<TopBarProps> = ({ context, patientsNb, access }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const appConfig = useContext(AppConfig)
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)
  const dashboard = useAppSelector((state) => state.exploredCohort)

  const [openModal, setOpenModal] = useState<'' | 'edit' | 'delete' | 'sample'>('')
  const [patientsNumber, setPatientsNumber] = useState<number>(patientsNb ?? 0)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const deleteCohortMutation = useDeleteCohort()
  const editCohortMutation = useEditCohort()
  const createSampleMutation = useCreateSample()

  const cohortName = context === URLS.COHORT ? dashboard.name ?? '-' : headerContexts[context] ?? '-'
  const cohortDescription = context === URLS.COHORT ? dashboard.description ?? '' : ''
  const cohortId = context === URLS.COHORT ? dashboard.cohortId ?? '' : undefined
  const perimeters =
    context === URLS.PERIMETERS && dashboard.cohort && Array.isArray(dashboard.cohort)
      ? dashboard.cohort.map((p) => p.name ?? '-')
      : []

  const handleClose = () => {
    setAnchorEl(null)
    setOpenModal('')
  }

  useEffect(() => {
    const abortController = new AbortController()
    const _fetchPatientNumber = async () => {
      const _patientNumber = await services.patients.fetchPatientsCount(abortController.signal)
      if (_patientNumber !== null) {
        setPatientsNumber(_patientNumber)
      }
    }

    if (dashboard.totalPatients === undefined) {
      _fetchPatientNumber()
    } else {
      setPatientsNumber(dashboard.totalPatients)
    }
    return () => {
      abortController.abort()
    }
  }, [dashboard.totalPatients])

  const handleEdition = (cohort: Cohort) => {
    editCohortMutation.mutate(cohort, {
      onSuccess: () => dispatch(updateCohort({ ...dashboard, name: cohort.name, description: cohort.description }))
    })
  }

  const handleFavorite = () => {
    editCohortMutation.mutate(
      { ...dashboard, favorite: !dashboard.favorite },
      { onSuccess: () => dispatch(updateCohort({ ...dashboard, favorite: !dashboard.favorite })) }
    )
  }
  const handleConfirmDeletion = () => {
    deleteCohortMutation.mutate([dashboard])
    navigate('/home')
  }

  const goToExportPage = (cohortID: string) => {
    const searchParams = new URLSearchParams()
    if (cohortID) {
      searchParams.set('groupId', cohortID)
    }
    navigate(`/exports/new?${searchParams}`)
  }

  const actionsMenu = context === URLS.COHORT && !dashboard.loading && (
    <>
      <IconButtonWithTooltip
        aria-controls="cohort-more-menu"
        aria-haspopup="true"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        title="Actions"
        icon={<MoreButton />}
        color="#153D8A"
        disabled={maintenanceIsActive}
      />
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            setOpenModal('edit')
          }}
        >
          Modifier
        </MenuItem>
        {!dashboard.isSample && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              setOpenModal('sample')
            }}
          >
            Échantillonner
          </MenuItem>
        )}
        {!!appConfig.features.export.enabled && dashboard.canMakeExport && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              goToExportPage(dashboard.cohortId ?? '')
            }}
          >
            Exporter
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            setOpenModal('delete')
          }}
        >
          Supprimer
        </MenuItem>
      </Menu>
    </>
  )

  return (
    <>
      <HeaderLayout
        id="cohort-name"
        title={cohortName}
        description={cohortDescription}
        cohortId={cohortId}
        patientsCount={patientsNumber}
        perimeters={perimeters}
        accessLevel={access}
        loading={dashboard.loading}
        actionsMenu={actionsMenu}
        editRequest={
          context === URLS.COHORT && (
            <Button
              customVariant="secondary"
              startIcon={<FluentNavigation />}
              onClick={() => navigate(`/${URLS.COHORT}/new/${dashboard.requestId}/${dashboard.snapshotId}`)}
            >
              Modifier la requête
            </Button>
          )
        }
        favStar={
          context === URLS.COHORT && (
            <IconButton onClick={handleFavorite} color="secondary">
              <FavStar favorite={dashboard.favorite} height={20} />
            </IconButton>
          )
        }
      />

      {openModal === 'sample' && (
        <CreateSample
          open
          parentCohort={dashboard}
          onCreate={(sampleData) =>
            createSampleMutation.mutate(sampleData, {
              onSuccess: () => navigate(redirectToSamples(sampleData.parentCohort))
            })
          }
          onClose={handleClose}
        />
      )}

      {openModal === 'edit' && (
        <AddOrEditItem
          open
          selectedItem={dashboard}
          onUpdate={(cohort) => handleEdition(cohort)}
          titleEdit="Modifier la cohorte"
          onClose={handleClose}
        />
      )}

      {openModal === 'delete' && (
        <ConfirmDeletion
          open
          onClose={handleClose}
          onSubmit={handleConfirmDeletion}
          title={getCohortsConfirmDeletionTitle()}
          message={getCohortsConfirmDeletionMessage()}
        />
      )}
    </>
  )
}

export default TopBar
