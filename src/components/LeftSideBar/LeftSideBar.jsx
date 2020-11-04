import React, { useState } from 'react'
import useStyles from './styles'
import Collapse from '@material-ui/core/Collapse'
import clsx from 'clsx'
import Drawer from '@material-ui/core/Drawer'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Link from '@material-ui/core/Link'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import cohortLogo from '../../assets/images/logo_v3.1_ld.png'
import { ReactComponent as MenuIcon } from '../../assets/icones/bars.svg'
import { ReactComponent as LogoutIcon } from '../../assets/icones/power-off.svg'
import { ReactComponent as HomeIcon } from '../../assets/icones/home-lg.svg'
import { ReactComponent as PatientIcon } from '../../assets/icones/user.svg'
import { ReactComponent as ResearchIcon } from '../../assets/icones/chart-bar.svg'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { logout as logoutAction } from '../../state/store'
import { open as openAction, close as closeAction } from '../../state/drawer'

const smallDrawerWidth = 52
const largeDrawerWidth = 260
export { smallDrawerWidth, largeDrawerWidth }

const BurgerMenu = (props) => {
  const classes = useStyles()
  const { initialState } = props
  const [open, setOpen] = useState(initialState)
  const [list, setList] = useState(false)
  const [list2, setList2] = useState(false)
  const history = useHistory()
  const practitioner = useSelector((state) => state.me)
  const dispatch = useDispatch()

  open ? dispatch(openAction()) : dispatch(closeAction())

  const handleDrawerOpen = () => {
    setOpen(true)
    dispatch(openAction())
  }

  const handleDrawerClose = () => {
    setOpen(false)
    dispatch(closeAction())
  }

  const handleNestedList = () => {
    setOpen(true)
    setList(!list)
  }

  const handleNestedList2 = () => {
    setOpen(true)
    setList2(!list2)
  }

  return (
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
          <img
            src={cohortLogo}
            alt="Cohort360 logo"
            className={open ? undefined : classes.hide}
          />
          <IconButton
            onClick={handleDrawerClose}
            className={clsx(classes.closeDrawerButton, {
              [classes.hide]: !open
            })}
          >
            <ChevronLeftIcon color="action" width="20px" />
          </IconButton>
          <IconButton
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, {
              [classes.hide]: open
            })}
          >
            <MenuIcon width="20px" fill="#FFF" />
          </IconButton>
        </div>
        <Divider />
        <List>
          <ListItem>
            <Grid
              container
              justify="space-between"
              alignItems="center"
              wrap="nowrap"
            >
              <Grid container wrap="nowrap" xs={10} alignItems="center">
                <ListItemIcon className={classes.listIcon}>
                  <div className={classes.avatar}>
                    {practitioner
                      ? `${practitioner.firstname[0]}${practitioner.lastname[0]}`
                      : history.push('/')}
                  </div>
                </ListItemIcon>
                <Typography variant="h3" noWrap className={classes.userName}>
                  {practitioner ? `${practitioner.name}` : history.push('/')}
                </Typography>
              </Grid>
              <Grid container xs={2}>
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
          <Link href="/accueil" underline="none">
            <ListItem button>
              <ListItemIcon className={classes.listIcon}>
                <HomeIcon width="20px" fill="#FFF" />
              </ListItemIcon>
              <Typography className={classes.title}>Accueil</Typography>
            </ListItem>
          </Link>
          <ListItem button onClick={handleNestedList}>
            <ListItemIcon className={classes.listIcon}>
              <PatientIcon width="20px" fill="#FFF" />
            </ListItemIcon>
            <Grid
              container
              justify="space-between"
              alignItems="center"
              wrap="nowrap"
            >
              <Typography className={classes.title}>Mes patients</Typography>
              {list ? (
                <ExpandLess color="action" />
              ) : (
                <ExpandMore color="action" />
              )}
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
              <ListItem>
                <Link
                  href="/rechercher_patient"
                  className={classes.nestedTitle}
                >
                  Rechercher un patient
                </Link>
              </ListItem>
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
          <ListItem button onClick={handleNestedList2}>
            <ListItemIcon className={classes.listIcon}>
              <ResearchIcon width="20px" fill="#FFF" />
            </ListItemIcon>
            <Grid
              container
              justify="space-between"
              alignItems="center"
              wrap="nowrap"
            >
              <Typography className={classes.title}>Mes recherches</Typography>
              {list2 ? (
                <ExpandLess color="action" />
              ) : (
                <ExpandMore color="action" />
              )}
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
                <Link
                  href="/recherche_sauvegarde"
                  className={classes.nestedTitle}
                >
                  Recherches sauvegardées
                </Link>
              </ListItem>
            </List>
          </Collapse>
        </List>
      </Drawer>
    </div>
  )
}

export default BurgerMenu
