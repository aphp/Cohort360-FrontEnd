import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import Skeleton from '@mui/lab/Skeleton'

import GroupIcon from '@mui/icons-material/Group'
import BusinessIcon from '@mui/icons-material/Business'
import ViewListIcon from '@mui/icons-material/ViewList'
import FaceIcon from '@mui/icons-material/Face'
import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

import { ReactComponent as StarIcon } from 'assets/icones/star.svg'
import { ReactComponent as StarFullIcon } from 'assets/icones/star full.svg'
import MoreButton from '@mui/icons-material/MoreVert'

import ExportModal from 'components/Dashboard/ExportModal/ExportModal'
import ModalEditCohort from 'components/MyProjects/Modals/ModalEditCohort/ModalEditCohort'

import { useAppSelector, useAppDispatch } from 'state'
import { favoriteExploredCohort } from 'state/exploredCohort'
import { deleteCohort, fetchCohorts as fetchCohortsList, setSelectedCohort } from 'state/cohort'
import { MeState } from 'state/me'

import services from 'services/aphp'

import displayDigit from 'utils/displayDigit'

import { ODD_EXPORT } from '../../constants'

import useStyles from './styles'

type TopBarProps = {
  context: 'patients' | 'cohort' | 'perimeters' | 'patient_info'
  patientsNb?: number
  access?: string
  afterEdit?: () => void
}

const TopBar: React.FC<TopBarProps> = ({ context, patientsNb, access, afterEdit }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const maintenanceIsActive = meState?.maintenance?.active

  const { dashboard, cohortList } = useAppSelector((state) => ({
    dashboard: state.exploredCohort,
    cohortList: state.cohort.cohortsList
  }))
  const [isExtended, onExtend] = useState(false)
  const [openModal, setOpenModal] = useState<'' | 'edit' | 'export' | 'delete'>('')
  const [patientsNumber, setPatientsNumber] = useState<number>(patientsNb ?? 0)
  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setOpenModal('')
  }

  React.useEffect(() => {
    const _fetchPatientNumber = async () => {
      const _patientNumber = await services.patients.fetchPatientsCount()

      setPatientsNumber(_patientNumber)
    }

    if (dashboard.totalPatients === undefined) {
      _fetchPatientNumber()
    } else {
      setPatientsNumber(dashboard.totalPatients)
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
    case 'patients':
      cohort = {
        name: 'Tous mes patients',
        description: '',
        cohortId: '',
        perimeters: [],
        icon: <GroupIcon />,
        showActionButton: false
      }
      break
    case 'patient_info':
      cohort = {
        name: 'Information patient',
        description: '',
        cohortId: '',
        perimeters: [],
        icon: <FaceIcon />,
        showActionButton: false
      }
      break
    case 'cohort':
      cohort = {
        name: dashboard.name ?? '-',
        description: dashboard.description ?? '',
        cohortId: dashboard.cohortId ?? '',
        perimeters: [],
        icon: <ViewListIcon />,
        showActionButton: true
      }
      break
    case 'perimeters':
      cohort = {
        name: 'Exploration de périmètres',
        description: '',
        perimeters:
          dashboard.cohort && Array.isArray(dashboard.cohort)
            ? dashboard.cohort.map((p: any) => (p.name ? p.name.replace('Patients passés par: ', '') : '-'))
            : [],
        icon: <BusinessIcon />,
        showActionButton: false
      }
      break
    default:
      break
  }

  const handleFavorite = () => {
    dispatch<any>(favoriteExploredCohort({ exploredCohort: dashboard }))
  }

  const handleConfirmDeletion = () => {
    dispatch<any>(deleteCohort({ deletedCohort: dashboard }))
    navigate('/home')
  }

  return (
    <>
      <Grid xs={12} container item direction="row">
        <Grid xs={12} item>
          <Paper className={classes.root} square>
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
                    <Avatar style={{ backgroundColor: '#5bc5f1' }}>{cohort.icon}</Avatar>
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
                              cohort.perimeters.map((perimeter: any) => (
                                <ListItem key={perimeter} className={classes.item}>
                                  <Chip className={classes.perimetersChip} label={perimeter} />
                                </ListItem>
                              ))}
                            <IconButton
                              size="small"
                              classes={
                                {
                                  /*label: classes.populationLabel*/
                                }
                              }
                              onClick={() => onExtend(false)}
                            >
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
                              <IconButton
                                size="small"
                                classes={
                                  {
                                    /*label: classes.populationLabel*/
                                  }
                                }
                                onClick={() => onExtend(true)}
                              >
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
                        Nb de patients : {displayDigit(patientsNumber ?? 0)}
                      </Typography>
                      <Typography id="cohort-access-type" align="right" noWrap>
                        Accès : {access}
                      </Typography>
                      {cohort.cohortId && (
                        <Typography align="right" variant="subtitle2">
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
                      onClick={async () => {
                        setAnchorEl(null)
                        if (!cohortList || (cohortList && cohortList.length === 0)) {
                          await dispatch<any>(fetchCohortsList({}))
                        }
                        await dispatch<any>(setSelectedCohort(dashboard ?? null))
                        setOpenModal('edit')
                      }}
                    >
                      Modifier
                    </MenuItem>
                    {!!ODD_EXPORT && dashboard.canMakeExport && (
                      <MenuItem
                        onClick={() => {
                          setAnchorEl(null)
                          setOpenModal('export')
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
          </Paper>
        </Grid>
        {context !== 'patient_info' && (
          <Divider orientation="horizontal" variant="middle" style={{ width: 'calc(100% - 32px)' }} />
        )}
      </Grid>

      {!!ODD_EXPORT && openModal === 'edit' && (
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
          cohortId={Array.isArray(dashboard?.cohort) ? 0 : parseInt(dashboard?.cohort?.id || '0')}
          open
          handleClose={() => handleClose()}
        />
      )}

      {openModal === 'delete' && (
        <Dialog fullWidth maxWidth="xs" open onClose={handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle className={classes.deleteModalTitle}>Supprimer une cohorte</DialogTitle>

          <DialogContent>
            <Typography>Êtes-vous sur de vouloir supprimer cette cohorte ?</Typography>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Annuler
            </Button>

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
