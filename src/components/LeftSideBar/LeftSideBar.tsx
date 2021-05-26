import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import clsx from 'clsx'

import {
  Button,
  Collapse,
  Divider,
  Drawer,
  Grid,
  Icon,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography
} from '@material-ui/core'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

import cohortLogo from '../../assets/images/logo_v3.1_ld.png'
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
export { smallDrawerWidth, largeDrawerWidth }

const LeftSideBar: React.FC = () => {
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useDispatch()

  const { practitioner, open } = useAppSelector((state) => ({
    practitioner: state.me,
    open: state.drawer
  }))

  const [displayPatientList, setDisplayPatientList] = useState(false)
  const [displaySearchList, setDisplaySearchList] = useState(false)

  const handleDrawerOpenOrClose = (value: boolean) => {
    if (value) {
      dispatch<any>(openAction())
    } else {
      dispatch<any>(closeAction())
    }
  }

  const onDisplayPatientList = () => {
    dispatch<any>(openAction())
    setDisplayPatientList(!displayPatientList)
  }

  const onDisplaySearchList = () => {
    dispatch<any>(openAction())
    setDisplaySearchList(!displaySearchList)
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
            <img src={cohortLogo} alt="Cohort360 logo" className={open ? undefined : classes.hide} />

            <IconButton
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

            <Divider />

            <ListItem>
              <ListItemIcon
                className={clsx(classes.button, {
                  [classes.hide]: open
                })}
              >
                <Link
                  onClick={() => history.push('/cohort/new')}
                  className={clsx(classes.linkHover, classes.plusButton)}
                >
                  <Icon>add_circle</Icon>
                </Link>
              </ListItemIcon>

              <Button
                onClick={() => history.push('/cohort/new')}
                className={clsx(classes.linkHover, classes.newCohortButton, classes.searchButton, {
                  [classes.hide]: !open
                })}
              >
                <Typography variant="h5">Nouvelle requête</Typography>
              </Button>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemIcon className={classes.listIcon}>
                <HomeIcon width="20px" fill="#FFF" />
              </ListItemIcon>
              <ListItemText className={classes.title} primary={'Accueil'} />
            </ListItem>

            <Divider />

            <ListItem button onClick={onDisplayPatientList}>
              <ListItemIcon className={classes.listIcon}>
                <PatientIcon width="20px" fill="#FFF" />
              </ListItemIcon>
              <ListItemText className={classes.title} primary={'Mes patients'} />
              {displayPatientList ? <ExpandLess color="action" /> : <ExpandMore color="action" />}
            </ListItem>

            <Collapse
              className={clsx(classes.nestedList, { [classes.hide]: !open })}
              in={displayPatientList}
              timeout="auto"
              unmountOnExit
            >
              <List>
                {!practitioner?.deidentified && (
                  <ListItem>
                    <Link href="/rechercher_patient" className={classes.nestedTitle}>
                      Rechercher un patient
                    </Link>
                  </ListItem>
                )}
                <ListItem>
                  <Link href="/mes_patients" className={classes.nestedTitle}>
                    Tous mes patients
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="/perimetre" className={classes.nestedTitle}>
                    Explorer un périmètre
                  </Link>
                </ListItem>
              </List>
            </Collapse>

            <Divider />

            <ListItem button onClick={onDisplaySearchList}>
              <ListItemIcon className={classes.listIcon}>
                <ResearchIcon width="20px" fill="#FFF" />
              </ListItemIcon>
              <ListItemText className={classes.title} primary={'Mes recherches'} />
              {displayPatientList ? <ExpandLess color="action" /> : <ExpandMore color="action" />}
            </ListItem>

            <Collapse
              in={displaySearchList}
              timeout="auto"
              unmountOnExit
              className={clsx(classes.nestedList, { [classes.hide]: !open })}
            >
              <List>
                <ListItem>
                  <Link href="/recherche_sauvegarde" className={classes.nestedTitle}>
                    Recherches sauvegardées
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="/mes_projets" className={classes.nestedTitle}>
                    Mes projets de recherche
                  </Link>
                </ListItem>
              </List>
            </Collapse>
          </List>
        </Drawer>
      </div>
    </>
  )
}

export default LeftSideBar
