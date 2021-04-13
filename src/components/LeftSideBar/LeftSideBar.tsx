import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, Link } from 'react-router-dom'
import clsx from 'clsx'

import {
  Button,
  Collapse,
  Divider,
  Drawer,
  Grid,
  Icon,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  Typography
} from '@material-ui/core'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

import cohortLogo from '../../assets/images/logo_v3.1_ld.png'
import arkhnLogo from '../../assets/images/logo-arkhn_white.png'
import arkhnLogoSmall from '../../assets/images/logo-arkhn_white_small.png'
import { ReactComponent as HomeIcon } from '../../assets/icones/home-lg.svg'
import { ReactComponent as LogoutIcon } from '../../assets/icones/power-off.svg'
import { ReactComponent as MenuIcon } from '../../assets/icones/bars.svg'
import { ReactComponent as PatientIcon } from '../../assets/icones/user.svg'
import { ReactComponent as ResearchIcon } from '../../assets/icones/chart-bar.svg'

import { useAppSelector } from 'state'
import { logout as logoutAction } from '../../state/me'
import { open as openAction, close as closeAction } from '../../state/drawer'

import useStyles from './styles'

const smallDrawerWidth = 52
const largeDrawerWidth = 260
const ICON_WIDTH = 20
const ARKHN_LOGO_WIDTH = 80

export { smallDrawerWidth, largeDrawerWidth }

type LeftSideBarProps = {
  open?: boolean
}

const LeftSideBar: React.FC<LeftSideBarProps> = (props) => {
  const classes = useStyles()
  const [list, setList] = useState(false)
  const [list2, setList2] = useState(false)
  const history = useHistory()
  const { practitioner, open } = useAppSelector((state) => ({
    practitioner: state.me,
    open: state.drawer
  }))
  const dispatch = useDispatch()

  useEffect(() => {
    if (!practitioner) {
      history.push('/')
    }
  }, [practitioner]) // eslint-disable-line

  useEffect(() => {
    if (props.open) {
      dispatch(openAction())
    } else {
      dispatch(closeAction())
    }
  }, [props.open]) // eslint-disable-line

  const handleDrawerOpen = () => {
    dispatch(openAction())
  }

  const handleDrawerClose = () => {
    dispatch(closeAction())
  }

  const handleNestedList = () => {
    dispatch(openAction())
    setList(!list)
  }

  const handleNestedList2 = () => {
    dispatch(openAction())
    setList2(!list2)
  }

  return (
    <>
      {/* FIXME: Auto logout disabled
        <AutoLogoutContainer />
      */}
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
            <img src={cohortLogo} alt="Cohort360 logo" className={open ? undefined : classes.hide} />
            <IconButton
              onClick={handleDrawerClose}
              className={clsx(classes.closeDrawerButton, {
                [classes.hide]: !open
              })}
            >
              <ChevronLeftIcon color="action" width={ICON_WIDTH} />
            </IconButton>
            <IconButton
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              className={clsx(classes.menuButton, {
                [classes.hide]: open
              })}
            >
              <MenuIcon width={ICON_WIDTH} fill="#FFF" />
            </IconButton>
          </div>
          <Divider />
          <List>
            <ListItem>
              <Grid container justify="space-between" alignItems="center" wrap="nowrap">
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
                        dispatch(logoutAction())
                        history.push('/')
                      }}
                    >
                      <LogoutIcon className={classes.logoutIcon} />
                    </IconButton>
                  </ListItemIcon>
                </Grid>
              </Grid>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem>
              <ListItemIcon
                className={clsx(classes.button, {
                  [classes.hide]: open
                })}
              >
                <Link to="/cohort/new" className={clsx(classes.linkHover, classes.plusButton)}>
                  <Icon>add_circle</Icon>
                </Link>
              </ListItemIcon>
              <Button
                onClick={() => history.push('/cohort/new')}
                className={clsx(classes.linkHover, classes.newCohortButton, classes.searchButton, {
                  [classes.hide]: !open
                })}
              >
                <Typography variant="h5">Nouvelle Cohorte</Typography>
              </Button>
            </ListItem>
            <Link to="/accueil">
              <ListItem button>
                <ListItemIcon className={classes.listIcon}>
                  <HomeIcon width={ICON_WIDTH} fill="#FFF" />
                </ListItemIcon>
                <Typography className={classes.title}>Accueil</Typography>
              </ListItem>
            </Link>
            <ListItem button onClick={handleNestedList}>
              <ListItemIcon className={classes.listIcon}>
                <PatientIcon width={ICON_WIDTH} fill="#FFF" />
              </ListItemIcon>
              <Grid container justify="space-between" alignItems="center" wrap="nowrap">
                <Typography className={classes.title}>Mes patients</Typography>
                {list ? <ExpandLess color="action" /> : <ExpandMore color="action" />}
              </Grid>
            </ListItem>
            <Collapse
              className={clsx(classes.drawer, classes.nestedList, {
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
                [classes.hide]: !open
              })}
              in={list}
              timeout="auto"
              unmountOnExit
            >
              <List>
                {!practitioner?.deidentified && (
                  <ListItem>
                    <Link to="/rechercher_patient" className={classes.nestedTitle}>
                      Rechercher un patient
                    </Link>
                  </ListItem>
                )}
                <ListItem>
                  <Link to="/mes_patients" className={classes.nestedTitle}>
                    Tous mes patients
                  </Link>
                </ListItem>
                <ListItem>
                  <Link to="/perimetre" className={classes.nestedTitle}>
                    Explorer un périmètre
                  </Link>
                </ListItem>
              </List>
            </Collapse>
            <ListItem button onClick={handleNestedList2}>
              <ListItemIcon className={classes.listIcon}>
                <ResearchIcon width={ICON_WIDTH} fill="#FFF" />
              </ListItemIcon>
              <Grid container justify="space-between" alignItems="center" wrap="nowrap">
                <Typography className={classes.title}>Mes recherches</Typography>
                {list2 ? <ExpandLess color="action" /> : <ExpandMore color="action" />}
              </Grid>
            </ListItem>
            <Collapse
              in={list2}
              timeout="auto"
              unmountOnExit
              className={clsx(classes.nestedList, { [classes.hide]: !open })}
            >
              <List>
                <ListItem>
                  <Link to="/recherche_sauvegarde" className={classes.nestedTitle}>
                    Recherches sauvegardées
                  </Link>
                </ListItem>
              </List>
            </Collapse>
          </List>
          <div className={classes.drawerFooter}>
            {open ? (
              <img alt="arkhn_logo" width={ARKHN_LOGO_WIDTH} src={arkhnLogo} />
            ) : (
              <img alt="arkn_logo" width={ICON_WIDTH} src={arkhnLogoSmall} />
            )}
          </div>
        </Drawer>
      </div>
    </>
  )
}

export default LeftSideBar
