import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuItem,
  Skeleton,
  Tooltip,
  Typography
} from '@mui/material'

import GroupIcon from '@mui/icons-material/Group'
import BusinessIcon from '@mui/icons-material/Business'
import ViewListIcon from '@mui/icons-material/ViewList'
import FaceIcon from '@mui/icons-material/Face'
import CloseIcon from '@mui/icons-material/Close'
import MoreButton from '@mui/icons-material/MoreVert'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

import AddOrEditItem from 'components/Researches/Modals/AddOrEditItem'
import ConfirmDeletion from 'components/Researches/Modals/ConfirmDeletion'
import { AvatarWrapper } from 'components/ui/Avatar/styles'
import FavStar from 'components/ui/FavStar'

import useEditCohort from 'hooks/researches/useEditCohort'
import useDeleteCohort from 'hooks/researches/useDeleteCohort'

import { useAppSelector, useAppDispatch } from 'state'

import services from 'services/aphp'
import { updateCohort } from 'state/exploredCohort'

import { format } from 'utils/numbers'
import { getCohortsConfirmDeletionMessage, getCohortsConfirmDeletionTitle } from 'utils/explorationUtils'

import useStyles from './styles'
import { AppConfig } from 'config'
import { URLS } from 'types/exploration'
import { Cohort } from 'types'

type TopBarProps = {
  context: URLS
  patientsNb?: number
  access?: string
}

const TopBar: React.FC<TopBarProps> = ({ context, patientsNb, access }) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const appConfig = useContext(AppConfig)
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)
  const dashboard = useAppSelector((state) => state.exploredCohort)

  const [isExtended, setIsExtended] = useState(false)
  const [openModal, setOpenModal] = useState<'' | 'edit' | 'delete'>('')
  const [patientsNumber, setPatientsNumber] = useState<number>(patientsNb ?? 0)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const deleteCohortMutation = useDeleteCohort()
  const editCohortMutation = useEditCohort()

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
      <Grid xs={12} container>
        <Grid xs={12} item className={classes.root}>
          <Grid container item style={{ paddingInline: 8 }} justifyContent="space-between">
            <Grid
              id="context-bar"
              container
              item
              direction="row"
              style={{
                paddingLeft: 12,
                width: cohort.showActionButton && !dashboard.loading ? 'calc(100% - 120px)' : 'calc(100% - 20px)'
              }}
            >
              <Grid item xs={9} direction="row" container style={{ flexWrap: 'nowrap' }}>
                <Grid container style={{ width: 40 }} alignItems="center">
                  <AvatarWrapper size={40}>{cohort.icon}</AvatarWrapper>
                </Grid>

                <Grid
                  container
                  style={{ width: 'calc(100% - 40px)', marginLeft: 8 }}
                  direction="column"
                  justifyContent="center"
                >
                  {dashboard.loading ? (
                    <>
                      <Skeleton width={100} />
                      <Skeleton width={100} />
                    </>
                  ) : (
                    <>
                      {cohort.name && (
                        <Typography id="cohort-name" variant="h5">
                          {cohort.name}{' '}
                        </Typography>
                      )}
                      {cohort.description && (
                        <Tooltip title={cohort.description}>
                          <Typography id="cohort-description" noWrap style={{ width: '100%' }} variant="subtitle2">
                            {cohort.description}
                          </Typography>
                        </Tooltip>
                      )}
                    </>
                  )}

                  {context === 'perimeters' && (
                    <List className={classes.perimetersChipsDiv}>
                      {isExtended ? (
                        <>
                          {cohort.perimeters &&
                            cohort.perimeters.map((perimeter) => (
                              <ListItem key={perimeter} className={classes.item}>
                                <Chip className={classes.perimetersChip} label={perimeter} />
                              </ListItem>
                            ))}
                          <IconButton size="small" onClick={() => setIsExtended(false)}>
                            <CloseIcon />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          {cohort.perimeters &&
                            cohort.perimeters.slice(0, 4).map((perimeter) => (
                              <ListItem key={perimeter} className={classes.item}>
                                <Chip className={classes.perimetersChip} label={perimeter} />
                              </ListItem>
                            ))}
                          {cohort.perimeters && cohort.perimeters.length > 4 && (
                            <IconButton size="small" onClick={() => setIsExtended(true)}>
                              <MoreHorizIcon />
                            </IconButton>
                          )}
                        </>
                      )}
                    </List>
                  )}
                </Grid>
              </Grid>

              <Grid item xs={3} direction="column" container justifyContent="center" alignItems="flex-end">
                {dashboard.loading ? (
                  <>
                    <Skeleton width={100} />
                    <Skeleton width={100} />
                  </>
                ) : (
                  <>
                    <Typography id="cohort-patient-number" align="right" noWrap>
                      Nb de patients : {format(patientsNumber)}
                    </Typography>
                    <Typography id="cohort-access-type" align="right" noWrap>
                      Accès : {access}
                    </Typography>
                    {cohort.cohortId && (
                      <Typography align="right" noWrap>
                        Identifiant de la cohorte: {cohort.cohortId}
                      </Typography>
                    )}
                  </>
                )}
              </Grid>
            </Grid>

            {cohort.showActionButton && !dashboard.loading && (
              <Grid container item justifyContent="flex-end" style={{ width: 120 }}>
                <IconButton onClick={handleFavorite} color="secondary" disabled={maintenanceIsActive}>
                  <FavStar favorite={dashboard.favorite} height={18} />
                </IconButton>

                <IconButton
                  aria-controls="cohort-more-menu"
                  aria-haspopup="true"
                  onClick={handleClick}
                  disabled={maintenanceIsActive}
                >
                  <MoreButton />
                </IconButton>
                <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null)
                      setOpenModal('edit')
                    }}
                  >
                    Modifier
                  </MenuItem>
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
              </Grid>
            )}
          </Grid>
        </Grid>
        {context !== URLS.PATIENT && (
          <Divider orientation="horizontal" variant="middle" style={{ width: 'calc(100% - 32px)' }} />
        )}
      </Grid>

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
