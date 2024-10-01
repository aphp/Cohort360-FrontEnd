import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

import StarIcon from 'assets/icones/star.svg?react'
import StarFullIcon from 'assets/icones/star full.svg?react'
import MoreButton from '@mui/icons-material/MoreVert'

import { AvatarWrapper } from 'components/ui/Avatar/styles'
import ExportModal from 'components/Dashboard/ExportModal/ExportModal'
import ModalEditCohort from 'components/Requests/Modals/ModalEditCohort/ModalEditCohort'

import { useAppSelector, useAppDispatch } from 'state'
import { favoriteExploredCohort } from 'state/exploredCohort'
import { deleteCohort, setSelectedCohort } from 'state/cohort'

import services from 'services/aphp'

import { format } from 'utils/numbers'

import useStyles from './styles'
import { AppConfig } from 'config'
import { URLS } from 'types/exploration'

type TopBarProps = {
  context: URLS
  patientsNb?: number
  access?: string
  afterEdit?: () => void
}

const TopBar: React.FC<TopBarProps> = ({ context, patientsNb, access, afterEdit }) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const appConfig = useContext(AppConfig)
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)
  const dashboard = useAppSelector((state) => state.exploredCohort)

  const [isExtended, onExtend] = useState(false)
  const [openModal, setOpenModal] = useState<'' | 'edit' | 'export' | 'delete'>('')
  const [patientsNumber, setPatientsNumber] = useState<number>(patientsNb ?? 0)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setOpenModal('')
  }

  React.useEffect(() => {
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

  const handleFavorite = () => {
    dispatch(favoriteExploredCohort({ exploredCohort: dashboard }))
  }

  const handleConfirmDeletion = () => {
    dispatch(deleteCohort({ deletedCohort: dashboard }))
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
                          <IconButton size="small" onClick={() => onExtend(false)}>
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
                            <IconButton size="small" onClick={() => onExtend(true)}>
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
                  {dashboard.favorite ? (
                    <StarFullIcon height={18} fill="currentColor" />
                  ) : (
                    <StarIcon height={18} fill="currentColor" />
                  )}
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
                      dispatch(setSelectedCohort(dashboard ?? null))
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

      {!!appConfig.features.export.enabled && openModal === 'edit' && (
        <ModalEditCohort
          open
          onClose={() => {
            handleClose()
            if (afterEdit && typeof afterEdit === 'function') {
              afterEdit()
            }
          }}
        />
      )}

      {openModal === 'export' && (
        <ExportModal
          cohortId={dashboard?.uuid ? dashboard?.uuid : '0'}
          open
          handleClose={() => handleClose()}
          fhirGroupId={cohort.cohortId ?? ''}
        />
      )}

      {openModal === 'delete' && (
        <Dialog fullWidth maxWidth="xs" open onClose={handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle>Supprimer une cohorte</DialogTitle>

          <DialogContent>
            <Typography>Êtes-vous sûr(e) de vouloir supprimer cette cohorte ?</Typography>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>

            <Button onClick={handleConfirmDeletion} style={{ color: '#dc3545' }}>
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default TopBar
