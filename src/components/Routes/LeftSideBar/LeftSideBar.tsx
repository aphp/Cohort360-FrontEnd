import React, { useState, useEffect, ReactElement, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

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
  Zoom,
  Box
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import HelpIcon from '@mui/icons-material/Help'
import MenuBookIcon from '@mui/icons-material/MenuBook'

import cohortLogo from 'assets/images/logo_v3.1_ld.png'
import HomeIcon from 'assets/icones/home-lg.svg?react'
import LogoutIcon from 'assets/icones/power-off.svg?react'
import MenuIcon from 'assets/icones/bars.svg?react'
import PatientIcon from 'assets/icones/user.svg?react'
import ResearchIcon from 'assets/icones/chart-bar.svg?react'

import { useAppSelector, useAppDispatch } from 'state'
import { logout as logoutAction } from 'state/me'
import { open as openAction, close as closeAction } from 'state/drawer'
import { resetCohortCreation } from 'state/cohortCreation'

import useStyles from './styles'
import versionInfo from 'data/version.json'
import Impersonation from 'components/Impersonation'
import { Egg1, Egg2 } from 'components/Impersonation/Eggs'
import JToolEggWrapper from 'components/Impersonation/JTool'
import ShimmerBadge from 'components/ui/ShimmerBadge'
import { AppConfig } from 'config'

const smallDrawerWidth = 52
const largeDrawerWidth = 260
export { smallDrawerWidth, largeDrawerWidth }

const LeftSideBar: React.FC<{ open?: boolean }> = (props) => {
  const { classes, cx } = useStyles()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const appConfig = useContext(AppConfig)
  const practitioner = useAppSelector((state) => state.me)
  const open = useAppSelector((state) => state.drawer)
  const cohortCreation = useAppSelector((state) => state.cohortCreation)
  const maintenanceIsActive = practitioner?.maintenance?.active
  // v-- just for zoom transition..
  const [allreadyOpen, setAllreadyOpen] = useState(false)

  const [displayPatientList, setDisplayPatientList] = useState(true)
  const [displaySearchList, setDisplaySearchList] = useState(true)

  useEffect(() => {
    if (props.open) {
      dispatch(openAction())
    } else {
      setAllreadyOpen(true)
      dispatch(closeAction())
    }
  }, [props.open]) // eslint-disable-line

  const handleDrawerOpenOrClose = (value: boolean) => {
    setAllreadyOpen(true)
    if (value) {
      dispatch(openAction())
    } else {
      dispatch(closeAction())
    }
  }

  const handleDisplayPatientList = () => {
    dispatch(openAction())
    if (open) {
      setDisplayPatientList(!displayPatientList)
    }
  }

  const handleDisplaySearchList = () => {
    dispatch(openAction())
    if (open) {
      setDisplaySearchList(!displaySearchList)
    }
  }

  const handleNewRequest = () => {
    dispatch(resetCohortCreation())
    navigate('/cohort/new')
  }

  const zoomed = (component: ReactElement) => {
    if (allreadyOpen) {
      return (
        <Zoom in={open} timeout={{ appear: 1000, enter: 500, exit: 0 }}>
          {component}
        </Zoom>
      )
    }
    return component
  }

  return (
    <div className={classes.root}>
      <Drawer
        variant="permanent"
        classes={{
          paper: cx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open
          })
        }}
      >
        <div className={classes.toolbar}>
          <Link onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
            <img src={cohortLogo} alt="Cohort360 logo" className={open ? undefined : classes.hide} />
          </Link>

          <IconButton
            disableRipple
            disableFocusRipple
            onClick={() => handleDrawerOpenOrClose(!open)}
            className={cx({
              [classes.closeDrawerButton]: open,
              [classes.menuButton]: !open
            })}
          >
            {open ? <ChevronLeftIcon color="action" width="20px" /> : <MenuIcon width="20px" fill="#FFF" />}
          </IconButton>
        </div>

        <Divider />

        <List className={classes.list}>
          <ListItem>
            <Grid container justifyContent="space-between" alignItems="center" wrap="nowrap">
              <Grid container wrap="nowrap" xs={10} alignItems="center" item>
                <Impersonation
                  UserInfo={({ practitioner }) => (
                    <>
                      <ListItemIcon className={classes.listIcon}>
                        <div className={classes.avatar}>
                          {practitioner && `${practitioner.firstname?.[0]}${practitioner.lastname?.[0]}`}
                        </div>
                      </ListItemIcon>
                      <Typography variant="h3" noWrap className={classes.userName}>
                        {practitioner && `${practitioner.display_name}`}
                      </Typography>
                    </>
                  )}
                />
              </Grid>
              <Grid container xs={2} item>
                <ListItemIcon
                  className={cx(classes.logoutButton, {
                    [classes.hide]: !open
                  })}
                >
                  <IconButton
                    onClick={() => {
                      dispatch(logoutAction())
                      navigate('/')
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
                <ListItemIcon className={classes.logoutButton} style={{ marginLeft: -6 }}>
                  <Tooltip title="Se déconnecter">
                    <IconButton
                      onClick={() => {
                        dispatch(logoutAction())
                        navigate('/')
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

          <ListItem>
            {!open && (
              <Tooltip title="Nouvelle requête">
                <JToolEggWrapper Egg={Egg2}>
                  <IconButton
                    onClick={handleNewRequest}
                    className={cx(classes.button, classes.miniButton)}
                    disabled={maintenanceIsActive}
                  >
                    <AddIcon />
                  </IconButton>
                </JToolEggWrapper>
              </Tooltip>
            )}
            {zoomed(
              <div className={classes.divNewRequest}>
                <JToolEggWrapper Egg={Egg2}>
                  <Button
                    onClick={handleNewRequest}
                    className={cx(classes.newCohortButton, classes.linkHover, {
                      [classes.hide]: !open
                    })}
                    disabled={maintenanceIsActive}
                  >
                    <Typography variant={maintenanceIsActive ? 'h6' : 'h5'}>
                      {maintenanceIsActive ? 'Nouvelle requête désactivée' : 'Nouvelle requête'}
                    </Typography>
                  </Button>
                </JToolEggWrapper>
              </div>
            )}
          </ListItem>
          {!!cohortCreation?.request?.requestId && (
            <ListItem style={{ padding: !open ? '0 16px' : undefined }}>
              {!open && (
                <Tooltip title="Modifier la requête en cours">
                  <IconButton
                    onClick={() => navigate('/cohort/new')}
                    className={cx(classes.button, classes.miniButton)}
                    disabled={maintenanceIsActive}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
              {zoomed(
                <Button
                  onClick={() => navigate('/cohort/new')}
                  className={cx(classes.searchButton, classes.editCohortButton, classes.linkHover)}
                  disabled={maintenanceIsActive}
                >
                  <>
                    <Typography variant="h5">Requête en cours</Typography>
                    <Typography noWrap style={{ width: 200 }}>
                      {cohortCreation.request.requestName}
                    </Typography>
                  </>
                </Button>
              )}
            </ListItem>
          )}

          <ListItem id="accueil" className={classes.listItem} button onClick={() => navigate('/home')}>
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
            className={cx(classes.nestedList, { [classes.hide]: !open })}
            in={displayPatientList}
            timeout="auto"
            unmountOnExit
          >
            <List id="patients-collapse">
              {!practitioner?.deidentified && (
                <ListItem>
                  <Link
                    id="patientResearch-link"
                    onClick={() => navigate('/patient-search')}
                    underline="hover"
                    className={classes.nestedTitle}
                  >
                    Rechercher un patient
                  </Link>
                </ListItem>
              )}
              <ListItem>
                <JToolEggWrapper Egg={Egg1}>
                  <Link
                    id="myPatient-link"
                    onClick={() => navigate('/my-patients')}
                    underline="hover"
                    className={classes.nestedTitle}
                  >
                    Tous mes patients
                  </Link>
                </JToolEggWrapper>
              </ListItem>
              <ListItem>
                <Link
                  id="scoopeTree-link"
                  onClick={() => navigate('/perimeter')}
                  underline="hover"
                  className={classes.nestedTitle}
                >
                  Explorer un périmètre
                </Link>
              </ListItem>
            </List>
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
            className={cx(classes.nestedList, { [classes.hide]: !open })}
          >
            <List id="research-collapse">
              {!practitioner?.deidentified && (
                <ListItem>
                  <Link
                    id="exports-link"
                    onClick={() => navigate('/exports')}
                    underline="hover"
                    className={classes.nestedTitle}
                  >
                    Mes exports
                  </Link>
                </ListItem>
              )}
              {/* <ListItem>
                  <Link
                    id="feasibility-reports-link"
                    onClick={() => navigate('/feasibility-reports')}
                    underline="hover"
                    className={classes.nestedTitle}
                  >
                    Mes rapports de faisabilité
                  </Link>
                </ListItem>
                {/* TODO: refacto ce menu burger parce que là c'est la crise */}
              <ListItem>
                <Link
                  id="myProjects-link"
                  onClick={() => navigate('/researches/projects')}
                  underline="hover"
                  className={classes.nestedTitle}
                >
                  Mes projets
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  id="myRequests-link"
                  onClick={() => navigate('/researches/requests')}
                  underline="hover"
                  className={classes.nestedTitle}
                >
                  Mes requêtes
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  id="myCohorts-link"
                  onClick={() => navigate('/researches/cohorts')}
                  underline="hover"
                  className={classes.nestedTitle}
                >
                  Mes cohortes
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  id="mySamples-link"
                  onClick={() => navigate('/researches/samples')}
                  underline="hover"
                  className={classes.nestedTitle}
                >
                  Mes échantillons
                </Link>
              </ListItem>
            </List>
          </Collapse>

          {appConfig.system.urlDoc && (
            <ListItem
              id="documentation"
              className={classes.listItem}
              href={appConfig.system.urlDoc}
              target="_blank"
              rel="noopener noreferrer"
              component="a"
            >
              <Tooltip title={!open ? 'Documentation' : ''}>
                <ListItemIcon className={classes.listIcon}>
                  <MenuBookIcon width="20px" htmlColor="#FFF" />
                </ListItemIcon>
              </Tooltip>

              <>
                <ListItemText className={classes.title} primary="Documentation" style={{ flex: 'unset' }} />
                <ShimmerBadge>Nouveau</ShimmerBadge>
              </>
            </ListItem>
          )}
        </List>

        <Box className={classes.footer}>
          {open && versionInfo.version && (
            <Box className={classes.footerElement}>
              <Typography variant="caption">{`${versionInfo.version} (${versionInfo.commit})`}</Typography>
            </Box>
          )}

          {appConfig.features.contact.enabled &&
            (open ? (
              <Button
                onClick={() => navigate('/contact')}
                variant="contained"
                size="small"
                startIcon={<HelpIcon />}
                style={{ position: 'fixed', bottom: 0, width: 'inherit' }}
              >
                Contactez-nous
              </Button>
            ) : (
              <IconButton
                onClick={() => {
                  navigate('/contact')
                }}
                style={{ position: 'fixed', bottom: 0 }}
              >
                <HelpIcon style={{ color: '#FFF' }} />
              </IconButton>
            ))}
        </Box>
      </Drawer>
    </div>
  )
}

export default LeftSideBar
