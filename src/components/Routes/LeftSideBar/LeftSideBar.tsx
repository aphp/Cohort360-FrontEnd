import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import clsx from 'clsx'

import {
  Button,
  Collapse,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Tooltip,
  Zoom
} from '@material-ui/core'

import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import HelpIcon from '@material-ui/icons/Help'

import cohortLogo from 'assets/images/logo_v3.1_ld.png'
import { ReactComponent as HomeIcon } from 'assets/icones/home-lg.svg'
import { ReactComponent as LogoutIcon } from 'assets/icones/power-off.svg'
import { ReactComponent as MenuIcon } from 'assets/icones/bars.svg'
import { ReactComponent as PatientIcon } from 'assets/icones/user.svg'
import { ReactComponent as ResearchIcon } from 'assets/icones/chart-bar.svg'

import { useAppSelector, useAppDispatch } from 'state'
import { logout as logoutAction } from 'state/me'
import { open as openAction, close as closeAction } from 'state/drawer'
import { resetCohortCreation } from 'state/cohortCreation'

import { ODD_CONTACT } from '../../../constants'
import useStyles from './styles'

const smallDrawerWidth = 52
const largeDrawerWidth = 260
export { smallDrawerWidth, largeDrawerWidth }

const LeftSideBar: React.FC<{ open?: boolean }> = (props) => {
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useAppDispatch()

  const { practitioner, open, cohortCreation } = useAppSelector((state) => ({
    practitioner: state.me,
    open: state.drawer,
    cohortCreation: state.cohortCreation
  }))
  const maintenanceIsActive = practitioner?.maintenance?.active

  // v-- just for zoom transition..
  const [allreadyOpen, setAllreadyOpen] = useState(false)

  const [displayPatientList, setDisplayPatientList] = useState(true)
  const [displaySearchList, setDisplaySearchList] = useState(true)

  useEffect(() => {
    if (props.open) {
      dispatch<any>(openAction())
    } else {
      setAllreadyOpen(true)
      dispatch<any>(closeAction())
    }
  }, [props.open]) // eslint-disable-line

  const handleDrawerOpenOrClose = (value: boolean) => {
    setAllreadyOpen(true)
    if (value) {
      dispatch<any>(openAction())
    } else {
      dispatch<any>(closeAction())
    }
  }

  const handleDisplayPatientList = () => {
    dispatch<any>(openAction())
    if (open) {
      setDisplayPatientList(!displayPatientList)
    }
  }

  const handleDisplaySearchList = () => {
    dispatch<any>(openAction())
    if (open) {
      setDisplaySearchList(!displaySearchList)
    }
  }

  const handleNewRequest = () => {
    dispatch<any>(resetCohortCreation())
    history.push('/cohort/new')
  }

  return (
    <>
      <div className={classes.root}>
        <Drawer
          variant="permanent"
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open
            })
          }}
        >
          <div className={classes.toolbar}>
            <Link href="/accueil">
              <img src={cohortLogo} alt="Cohort360 logo" className={open ? undefined : classes.hide} />
            </Link>

            <IconButton
              disableRipple
              disableFocusRipple
              onClick={() => handleDrawerOpenOrClose(!open)}
              className={clsx({
                [classes.closeDrawerButton]: open,
                [classes.menuButton]: !open
              })}
            >
              {open ? <ChevronLeftIcon color="action" width="20px" /> : <MenuIcon width="20px" fill="#FFF" />}
            </IconButton>
          </div>

          <Divider />

          <List>
            <ListItem>
              <Grid container justifyContent="space-between" alignItems="center" wrap="nowrap">
                <Grid container wrap="nowrap" xs={10} alignItems="center" item>
                  <ListItemIcon className={classes.listIcon}>
                    <div className={classes.avatar}>
                      {practitioner && `${practitioner.firstName[0]}${practitioner.lastName[0]}`}
                    </div>
                  </ListItemIcon>
                  <Typography variant="h3" noWrap className={classes.userName}>
                    {practitioner && `${practitioner.displayName}`}
                  </Typography>
                </Grid>
                <Grid container xs={2} item>
                  <ListItemIcon
                    className={clsx(classes.logoutButton, {
                      [classes.hide]: !open
                    })}
                  >
                    <IconButton
                      onClick={() => {
                        localStorage.clear()
                        dispatch<any>(logoutAction())
                        history.push('/')
                      }}
                    >
                      <LogoutIcon className={classes.logoutIcon} />
                    </IconButton>
                  </ListItemIcon>
                </Grid>
              </Grid>
            </ListItem>

            {!open && (
              <ListItem>
                <Grid container item>
                  <ListItemIcon className={classes.logoutButton} style={{ marginLeft: -10 }}>
                    <Tooltip title="Se déconnecter">
                      <IconButton
                        onClick={() => {
                          localStorage.clear()
                          dispatch<any>(logoutAction())
                          history.push('/')
                        }}
                      >
                        <LogoutIcon className={classes.logoutIcon} />
                      </IconButton>
                    </Tooltip>
                  </ListItemIcon>
                </Grid>
              </ListItem>
            )}

            <Divider />

            {!cohortCreation?.request?.requestId ? (
              <ListItem>
                {!open && (
                  <Tooltip title="Nouvelle requête">
                    <Button
                      variant="contained"
                      onClick={handleNewRequest}
                      className={
                        maintenanceIsActive
                          ? clsx(classes.miniButton, classes.button)
                          : clsx(classes.miniButton, classes.button)
                      }
                      disabled={maintenanceIsActive}
                    >
                      <AddIcon />
                    </Button>
                  </Tooltip>
                )}
                {allreadyOpen ? (
                  <Zoom in={open} timeout={{ appear: 1000, enter: 500, exit: 0 }}>
                    <Button
                      onClick={handleNewRequest}
                      className={
                        maintenanceIsActive
                          ? clsx(classes.linkHover, classes.newCohortButton, classes.searchButton, {
                              [classes.hide]: !open
                            })
                          : clsx(classes.linkHover, classes.newCohortButton, classes.searchButton, {
                              [classes.hide]: !open
                            })
                      }
                      disabled={maintenanceIsActive}
                    >
                      {maintenanceIsActive ? (
                        <Typography variant="h6">Nouvelle requête désactivée</Typography>
                      ) : (
                        <Typography variant="h5">Nouvelle requête</Typography>
                      )}
                    </Button>
                  </Zoom>
                ) : (
                  <Button
                    onClick={handleNewRequest}
                    className={
                      maintenanceIsActive
                        ? clsx(classes.linkHover, classes.newCohortButton, classes.searchButton, {
                            [classes.hide]: !open
                          })
                        : clsx(classes.linkHover, classes.newCohortButton, classes.searchButton, {
                            [classes.hide]: !open
                          })
                    }
                    disabled={maintenanceIsActive}
                  >
                    {maintenanceIsActive ? (
                      <Typography variant="h6">Nouvelle requête désactivée</Typography>
                    ) : (
                      <Typography variant="h5">Nouvelle requête</Typography>
                    )}
                  </Button>
                )}
              </ListItem>
            ) : (
              <>
                <ListItem>
                  {!open && (
                    <Tooltip title="Nouvelle requête">
                      <Button
                        variant="contained"
                        onClick={handleNewRequest}
                        className={
                          maintenanceIsActive
                            ? clsx(classes.miniButton, classes.button)
                            : clsx(classes.miniButton, classes.button)
                        }
                        disabled={maintenanceIsActive}
                      >
                        <AddIcon />
                      </Button>
                    </Tooltip>
                  )}
                  {allreadyOpen ? (
                    <Zoom in={open} timeout={{ appear: 1000, enter: 500, exit: 0 }}>
                      <Button
                        onClick={handleNewRequest}
                        className={
                          maintenanceIsActive
                            ? clsx(classes.linkHover, classes.newCohortButton, classes.searchButton, {
                                [classes.hide]: !open
                              })
                            : clsx(classes.linkHover, classes.newCohortButton, classes.searchButton, {
                                [classes.hide]: !open
                              })
                        }
                        disabled={maintenanceIsActive}
                      >
                        {maintenanceIsActive ? (
                          <Typography variant="h6">Nouvelle requête désactivée</Typography>
                        ) : (
                          <Typography variant="h5">Nouvelle requête</Typography>
                        )}
                      </Button>
                    </Zoom>
                  ) : (
                    <Button
                      onClick={handleNewRequest}
                      className={
                        maintenanceIsActive
                          ? clsx(classes.linkHover, classes.newCohortButton, classes.searchButton, {
                              [classes.hide]: !open
                            })
                          : clsx(classes.linkHover, classes.newCohortButton, classes.searchButton, {
                              [classes.hide]: !open
                            })
                      }
                      disabled={maintenanceIsActive}
                    >
                      {maintenanceIsActive ? (
                        <Typography variant="h6">Nouvelle requête désactivée</Typography>
                      ) : (
                        <Typography variant="h5">Nouvelle requête</Typography>
                      )}
                    </Button>
                  )}
                </ListItem>
                <ListItem style={{ padding: !open ? '0 16px' : undefined }}>
                  {!open && (
                    <Tooltip title="Modifier la requête en cours">
                      <Button
                        variant="contained"
                        onClick={() => history.push('/cohort/new')}
                        className={
                          maintenanceIsActive
                            ? clsx(classes.miniButton, classes.button)
                            : clsx(classes.miniButton, classes.button)
                        }
                        disabled={maintenanceIsActive}
                      >
                        <EditIcon />
                      </Button>
                    </Tooltip>
                  )}
                  {allreadyOpen ? (
                    <Zoom in={open} timeout={{ appear: 1000, enter: 500, exit: 0 }}>
                      <Button
                        onClick={() => history.push('/cohort/new')}
                        className={
                          maintenanceIsActive
                            ? clsx(classes.editCohortButton, classes.linkHover, classes.searchButton)
                            : clsx(classes.editCohortButton, classes.linkHover, classes.searchButton)
                        }
                        disabled={maintenanceIsActive}
                      >
                        {maintenanceIsActive ? (
                          <>
                            <Typography variant="h5">Requête en cours</Typography>
                            <Typography noWrap style={{ width: 200 }}>
                              {cohortCreation.request.requestName}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant="h5">Requête en cours</Typography>
                            <Typography noWrap style={{ width: 200 }}>
                              {cohortCreation.request.requestName}
                            </Typography>
                          </>
                        )}
                      </Button>
                    </Zoom>
                  ) : (
                    <Button
                      onClick={() => history.push('/cohort/new')}
                      className={
                        maintenanceIsActive
                          ? clsx(classes.editCohortButton, classes.linkHover, classes.searchButton)
                          : clsx(classes.editCohortButton, classes.linkHover, classes.searchButton)
                      }
                      disabled={maintenanceIsActive}
                    >
                      {maintenanceIsActive ? (
                        <>
                          <Typography variant="h5">Requête en cours</Typography>
                          <Typography noWrap style={{ width: 200 }}>
                            {cohortCreation.request.requestName}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography variant="h5">Requête en cours</Typography>
                          <Typography noWrap style={{ width: 200 }}>
                            {cohortCreation.request.requestName}
                          </Typography>
                        </>
                      )}
                    </Button>
                  )}
                </ListItem>
              </>
            )}

            <ListItem id="accueil" className={classes.listItem} button onClick={() => history.push('/accueil')}>
              <Tooltip title={!open ? 'Accueil' : ''}>
                <ListItemIcon className={classes.listIcon}>
                  <HomeIcon width="20px" fill="#FFF" />
                </ListItemIcon>
              </Tooltip>

              <ListItemText className={classes.title} primary="Accueil" />
            </ListItem>

            <ListItem id="patients" className={classes.listItem} button onClick={handleDisplayPatientList}>
              <Tooltip title={!open ? 'Mes patients' : ''}>
                <ListItemIcon className={classes.listIcon}>
                  <PatientIcon width="20px" fill="#FFF" />
                </ListItemIcon>
              </Tooltip>

              <ListItemText className={classes.title} primary="Mes patients" />
              {displayPatientList ? <ExpandLess color="action" /> : <ExpandMore color="action" />}
            </ListItem>

            <Collapse
              className={clsx(classes.nestedList, { [classes.hide]: !open })}
              in={displayPatientList}
              timeout="auto"
              unmountOnExit
            >
              <List id="patients-collapse">
                {!practitioner?.deidentified && (
                  <ListItem>
                    <Link id="patientResearch-link" href="/rechercher_patient" className={classes.nestedTitle}>
                      Rechercher un patient
                    </Link>
                  </ListItem>
                )}
                <ListItem>
                  <Link id="myPatient-link" href="/mes_patients" className={classes.nestedTitle}>
                    Tous mes patients
                  </Link>
                </ListItem>
                <ListItem>
                  <Link id="scoopeTree-link" href="/perimetre" className={classes.nestedTitle}>
                    Explorer un périmètre
                  </Link>
                </ListItem>
              </List>
              `
            </Collapse>

            <ListItem id="research" className={classes.listItem} button onClick={handleDisplaySearchList}>
              <Tooltip title={!open ? 'Mes recherches' : ''}>
                <ListItemIcon className={classes.listIcon}>
                  <ResearchIcon width="20px" fill="#FFF" />
                </ListItemIcon>
              </Tooltip>

              <ListItemText className={classes.title} primary="Mes recherches" />
              {displaySearchList ? <ExpandLess color="action" /> : <ExpandMore color="action" />}
            </ListItem>

            <Collapse
              in={displaySearchList}
              timeout="auto"
              unmountOnExit
              className={clsx(classes.nestedList, { [classes.hide]: !open })}
            >
              <List id="research-collapse">
                <ListItem>
                  <Link id="savedResearch-link" href="/recherche_sauvegarde" className={classes.nestedTitle}>
                    Mes cohortes sauvegardées
                  </Link>
                </ListItem>
                <ListItem>
                  <Link id="myProject-link" href="/mes_projets" className={classes.nestedTitle}>
                    Mes projets de recherche
                  </Link>
                </ListItem>
              </List>
            </Collapse>
          </List>

          {ODD_CONTACT == 'true' &&
            (open ? (
              <Button
                onClick={() => history.push('/contact')}
                variant="contained"
                color="primary"
                size="small"
                startIcon={<HelpIcon />}
                style={{ position: 'fixed', bottom: 0, width: 'inherit' }}
              >
                Contactez-nous
              </Button>
            ) : (
              <IconButton
                onClick={() => {
                  history.push('/contact')
                }}
                style={{ position: 'fixed', bottom: 0 }}
              >
                <HelpIcon style={{ color: '#FFF' }} />
              </IconButton>
            ))}
        </Drawer>
      </div>
    </>
  )
}

export default LeftSideBar
