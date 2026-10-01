import React, { useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { Collapse, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material'

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import MenuBookIcon from '@mui/icons-material/MenuBook'

import { useAppSelector, useAppDispatch } from 'state'
import { open as openAction } from 'state/drawer'

import useStyles from './styles'
import ShimmerBadge from 'components/ui/ShimmerBadge'
import { AppConfig } from 'config'
import useOnboardingEnabled from 'hooks/onboarding/useOnboardingEnabled'
import { ONBOARDING_ROUTE, type OnboardingRouteState, type OnboardingSection } from 'views/Onboarding/route'

/**
 * Closes the side menu: with the onboarding, its screens and the documentation gathered under
 * « À propos de Cohort360 »; without it, the documentation keeps its own entry.
 */
const AboutSection = () => {
  const { classes, cx } = useStyles()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()

  const { urlDoc } = useContext(AppConfig).system
  const open = useAppSelector((state) => state.drawer)
  const onboardingEnabled = useOnboardingEnabled()

  const [displayAboutList, setDisplayAboutList] = useState(true)

  const handleDisplayAboutList = () => {
    dispatch(openAction())
    if (open) {
      setDisplayAboutList(!displayAboutList)
    }
  }

  const openOnboardingSection = (section: OnboardingSection) => {
    navigate(ONBOARDING_ROUTE, {
      state: { from: location.pathname + location.search, section } satisfies OnboardingRouteState
    })
  }

  if (!onboardingEnabled) {
    if (!urlDoc) {
      return null
    }
    return (
      <ListItem
        id="documentation"
        className={classes.listItem}
        href={urlDoc}
        target="_blank"
        rel="noopener noreferrer"
        component="a"
      >
        <Tooltip title={open ? '' : 'Documentation'}>
          <ListItemIcon className={classes.listIcon}>
            <MenuBookIcon width="20px" htmlColor="#FFF" />
          </ListItemIcon>
        </Tooltip>

        <ListItemText className={classes.title} primary={<ShimmerBadge>Documentation</ShimmerBadge>} />
      </ListItem>
    )
  }

  return (
    <>
      <ListItemButton id="about" className={classes.listItem} onClick={handleDisplayAboutList}>
        <Tooltip title={open ? '' : 'À propos de Cohort360'}>
          <ListItemIcon className={classes.listIcon}>
            <MenuBookIcon width="20px" htmlColor="#FFF" />
          </ListItemIcon>
        </Tooltip>

        <ListItemText className={classes.title} primary="À propos de Cohort360" />
        {displayAboutList ? <ExpandLess color="action" /> : <ExpandMore color="action" />}
      </ListItemButton>

      <Collapse
        in={displayAboutList}
        timeout="auto"
        unmountOnExit
        className={cx(classes.nestedList, { [classes.hide]: !open })}
      >
        <List id="about-collapse">
          <ListItem>
            <Link
              id="myRights-link"
              onClick={() => openOnboardingSection('habilitations')}
              underline="hover"
              className={classes.nestedTitle}
            >
              Mes habilitations
            </Link>
          </ListItem>
          <ListItem>
            <Link
              id="myCommitments-link"
              onClick={() => openOnboardingSection('engagements')}
              underline="hover"
              className={classes.nestedTitle}
            >
              Mes engagements
            </Link>
          </ListItem>
          <ListItem>
            <Link
              id="myTutorials-link"
              onClick={() => openOnboardingSection('tutoriels')}
              underline="hover"
              className={classes.nestedTitle}
            >
              Mes tutoriels
            </Link>
          </ListItem>
          {urlDoc && (
            <ListItem>
              <Link
                id="documentation"
                href={urlDoc}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                className={classes.nestedTitle}
              >
                Documentation
              </Link>
            </ListItem>
          )}
        </List>
      </Collapse>
    </>
  )
}

export default AboutSection
