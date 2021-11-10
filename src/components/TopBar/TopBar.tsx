import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import Chip from '@material-ui/core/Chip'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'

import Skeleton from '@material-ui/lab/Skeleton'

import GroupIcon from '@material-ui/icons/Group'
import BusinessIcon from '@material-ui/icons/Business'
import ViewListIcon from '@material-ui/icons/ViewList'
import FaceIcon from '@material-ui/icons/Face'
import CloseIcon from '@material-ui/icons/Close'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'

import { ReactComponent as StarIcon } from 'assets/icones/star.svg'
import { ReactComponent as StarFullIcon } from 'assets/icones/star full.svg'
import MoreButton from '@material-ui/icons/MoreVert'

import ExportModal from 'components/Cohort/ExportModal/ExportModal'
import ModalEditCohort from 'components/MyProjects/Modals/ModalEditCohort/ModalEditCohort'

import { useAppSelector } from 'state'
import { favoriteExploredCohort } from 'state/exploredCohort'
import { fetchCohorts as fetchCohortsList, setSelectedCohort, deleteCohort } from 'state/cohort'

import { CohortType } from 'types'

import services from 'services'

import displayDigit from 'utils/displayDigit'

import useStyles from './styles'

type TopBarProps = {
  context: 'patients' | 'cohort' | 'perimeters' | 'patient_info'
  patientsNb?: number
  access?: string
  afterEdit?: () => void
}

const TopBar: React.FC<TopBarProps> = ({ context, patientsNb, access, afterEdit }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const history = useHistory()

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
            ? dashboard.cohort.map((p: any) => p.name.replace('Patients passés par: ', ''))
            : [],
        icon: <BusinessIcon />,
        showActionButton: false
      }
      break
    default:
      break
  }

  const handleFavorite = () => {
    dispatch(favoriteExploredCohort({ id: dashboard.uuid ?? '' }))
  }

  const handleConfirmDeletion = () => {
    dispatch(deleteCohort({ deletedCohort: dashboard as CohortType }))
    history.push('/accueil')
  }

  return (
    <>
      <Grid xs={12} container direction="row">
        <Grid xs={12} item direction="row">
          <Paper className={classes.root} square>
            <Grid container item style={{ paddingInline: 8 }} justify="space-between">
              <Grid
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
                    justify="center"
                  >
                    {dashboard.loading ? (
                      <>
                        <Skeleton width={100} />
                        <Skeleton width={100} />
                      </>
                    ) : (
                      <>
                        {cohort.name && <Typography variant="h5">{cohort.name} </Typography>}
                        {cohort.description && (
                          <Tooltip title={cohort.description}>
                            <Typography noWrap style={{ width: '100%' }} variant="subtitle2">
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
                              classes={{ label: classes.populationLabel }}
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
                                classes={{ label: classes.populationLabel }}
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

                <Grid item xs={3} direction="column" container justify="center" alignItems="flex-end">
                  {dashboard.loading ? (
                    <>
                      <Skeleton width={100} />
                      <Skeleton width={100} />
                    </>
                  ) : (
                    <>
                      <Typography align="right" noWrap>
                        Nb de patients : {displayDigit(patientsNumber ?? 0)}
                      </Typography>
                      <Typography align="right" noWrap>
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
                <Grid container item justify="flex-end" style={{ width: 120 }}>
                  <IconButton onClick={handleFavorite} color="secondary">
                    {dashboard.favorite ? (
                      <StarFullIcon height={18} fill="currentColor" />
                    ) : (
                      <StarIcon height={18} fill="currentColor" />
                    )}
                  </IconButton>

                  <IconButton aria-controls="cohort-more-menu" aria-haspopup="true" onClick={handleClick}>
                    <MoreButton />
                  </IconButton>
                  <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                    <MenuItem
                      onClick={async () => {
                        setAnchorEl(null)
                        if (!cohortList || (cohortList && cohortList.length === 0)) {
                          await dispatch<any>(fetchCohortsList())
                        }
                        await dispatch<any>(setSelectedCohort(dashboard.uuid ?? null))
                        setOpenModal('edit')
                      }}
                    >
                      Modifier
                    </MenuItem>
                    {dashboard.canMakeExport && (
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

      {openModal === 'edit' && (
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
