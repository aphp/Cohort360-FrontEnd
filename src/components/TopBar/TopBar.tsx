import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Box, Grid, IconButton, List, Menu, MenuItem, Skeleton, Tooltip, Typography } from '@mui/material'

import GroupIcon from '@mui/icons-material/Group'
import BusinessIcon from '@mui/icons-material/Business'
import ViewListIcon from '@mui/icons-material/ViewList'
import FaceIcon from '@mui/icons-material/Face'
import CloseIcon from '@mui/icons-material/Close'
import MoreButton from '@mui/icons-material/MoreVert'

import AddOrEditItem from 'components/Researches/Modals/AddOrEditItem'
import ConfirmDeletion from 'components/Researches/Modals/ConfirmDeletion'
import CreateSample from 'components/Researches/Modals/CreateSample'
import FavStar from 'components/ui/FavStar'

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
import { format } from 'utils/numbers'

import useStyles from './styles'
import { AppConfig } from 'config'
import { URLS } from 'types/exploration'
import { Cohort } from 'types'
import AccessBadge, { AccessLevel } from 'components/ui/AccessBadge'
import IconButtonWithTooltip from 'components/ui/IconButtonWithTooltip'
import { ChipWrapper } from 'components/ui/Chip/styles'
import CohortInfo from 'components/ui/CohortInfo'

type TopBarProps = {
  context: URLS
  patientsNb?: number
  access: AccessLevel
}

const TopBar: React.FC<TopBarProps> = ({ context, patientsNb, access }) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const appConfig = useContext(AppConfig)
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)
  const dashboard = useAppSelector((state) => state.exploredCohort)

  const [isExtended, setIsExtended] = useState(false)
  const [openModal, setOpenModal] = useState<'' | 'edit' | 'delete' | 'sample'>('')
  const [patientsNumber, setPatientsNumber] = useState<number>(patientsNb ?? 0)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const deleteCohortMutation = useDeleteCohort()
  const editCohortMutation = useEditCohort()
  const createSampleMutation = useCreateSample()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

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

  let cohort: {
    name: string
    description?: string
    perimeters?: string[]
    cohortId?: string
    icon?: React.ReactElement
    showActionButton?: boolean
  } = { name: '-', perimeters: [] }
  switch (context) {
    case URLS.PATIENTS:
      cohort = {
        name: 'Tous mes patients',
        description: '',
        cohortId: '',
        perimeters: [],
        icon: <GroupIcon />,
        showActionButton: false
      }
      break
    case URLS.PATIENT:
      cohort = {
        name: 'Information patient',
        description: '',
        cohortId: '',
        perimeters: [],
        icon: <FaceIcon />,
        showActionButton: false
      }
      break
    case URLS.COHORT:
      cohort = {
        name: dashboard.name ?? '-',
        description: dashboard.description ?? '',
        cohortId: dashboard.cohortId ?? '',
        perimeters: [],
        icon: <ViewListIcon />,
        showActionButton: true
      }
      break
    case URLS.PERIMETERS:
      cohort = {
        name: 'Exploration de périmètres',
        description: '',
        perimeters:
          dashboard.cohort && Array.isArray(dashboard.cohort)
            ? dashboard.cohort.map((p) => (p.name ? p.name.replace('Patients passés par: ', '') : '-'))
            : [],
        icon: <BusinessIcon />,
        showActionButton: false
      }
      break
    default:
      break
  }

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

  return (
    <>
      <Grid
        container
        direction="column"
        alignItems={'center'}
        justifyContent={'center'}
        sx={{ backgroundColor: '#E6F1FD', padding: '20px 0' }}
      >
        <Grid container xs={11} direction="column" justifyContent={'center'} gap={1}>
          {dashboard.loading ? (
            <>
              <Skeleton width={200} />
              <Skeleton width={100} />
            </>
          ) : (
            <>
              {cohort.name && (
                <Grid container justifyContent="space-between" alignItems="center">
                  <Box display={'flex'} alignItems="center" gap={1}>
                    <Typography id="cohort-name" variant="h1">
                      {cohort.name}
                    </Typography>
                    {context === URLS.COHORT && (
                      <IconButton onClick={handleFavorite} color="secondary" disabled={maintenanceIsActive}>
                        <FavStar favorite={dashboard.favorite} height={20} />
                      </IconButton>
                    )}
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessBadge accessLevel={access} loading={dashboard.loading} />
                    {cohort.showActionButton && !dashboard.loading && (
                      <>
                        <IconButtonWithTooltip
                          aria-controls="cohort-more-menu"
                          aria-haspopup="true"
                          onClick={handleClick}
                          title="Actions"
                          icon={<MoreButton />}
                          color="#153D8A"
                          disabled={maintenanceIsActive}
                        />
                        <Menu
                          id="simple-menu"
                          anchorEl={anchorEl}
                          keepMounted
                          open={Boolean(anchorEl)}
                          onClose={handleClose}
                        >
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
                    )}
                  </Box>
                </Grid>
              )}
              {cohort.description && (
                <Tooltip title={cohort.description}>
                  <Typography id="cohort-description" noWrap style={{ width: '100%' }} variant="subtitle2">
                    {cohort.description}
                  </Typography>
                </Tooltip>
              )}
              {context === 'perimeters' && (
                <List className={classes.perimetersChipsDiv}>
                  {isExtended ? (
                    <>
                      {cohort.perimeters &&
                        cohort.perimeters.map((perimeter) => (
                          <ChipWrapper
                            key={perimeter}
                            label={perimeter}
                            colorString="#153d8a"
                            backgroundColor="#FFF"
                            style={{ margin: 5, maxWidth: 'calc(100% - 5px)' }}
                          />
                          // <ListItem key={perimeter} className={classes.item}>
                          //   <Chip className={classes.perimetersChip} label={perimeter} />
                          // </ListItem>
                        ))}
                      <IconButton size="small" onClick={() => setIsExtended(false)}>
                        <CloseIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      {cohort.perimeters &&
                        cohort.perimeters.slice(0, 4).map((perimeter) => (
                          <ChipWrapper
                            key={perimeter}
                            label={perimeter}
                            colorString="#153d8a"
                            backgroundColor="#FFF"
                            style={{ margin: 5, maxWidth: 'calc(100% - 5px)' }}
                          />

                          // <ListItem key={perimeter} className={classes.item}>
                          //   <Chip className={classes.perimetersChip} label={perimeter} />
                          // </ListItem>
                        ))}
                      <ChipWrapper
                        label={'...'}
                        colorString="#153d8a"
                        backgroundColor="#FFF"
                        style={{ margin: 5, maxWidth: 'calc(100% - 5px)' }}
                        onClick={() => setIsExtended(true)}
                      />
                      {/* {cohort.perimeters && cohort.perimeters.length > 4 && (
                        <IconButton size="small" onClick={() => setIsExtended(true)}>
                          <MoreHorizIcon />
                        </IconButton>
                      )} */}
                    </>
                  )}
                </List>
              )}
            </>
          )}
          <Grid container alignItems={'center'} gap={3}>
            <CohortInfo
              id="cohort-patient-number"
              label={'Nb de patients'}
              total={format(patientsNumber)}
              loading={dashboard.loading}
            />
            {cohort.cohortId && <CohortInfo label="ID cohorte" total={cohort.cohortId} loading={dashboard.loading} />}
          </Grid>
        </Grid>
      </Grid>

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
