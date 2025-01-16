import React, { useState } from 'react'
import { useAppSelector } from 'state'

import { Box, Grid, Typography } from '@mui/material'
import Searchbar from 'components/ui/Searchbar'
import Tabs from 'components/ui/Tabs'

import { ExplorationTabs } from 'types'
import useStyles from './styles'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import MenuButtonFilter from 'components/Exploration/components/MenuButtonFilter'

import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import useCounts from 'components/Exploration/hooks/useCounts'
import Badge from 'components/ui/Badge'
import Breadcrumb from 'components/Exploration/components/Breadcrumb'

//  TODO: PENSER AUSSI A FAIRE FONCTIONNER LES TABLEAUX QUAND UNE MAINTENANCE EST EN COURS

const MyResearches = () => {
  const { classes, cx } = useStyles()
  const openDrawer = useAppSelector((state) => state.drawer)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const searchInput = searchParams.get('searchInput') ?? ''
  const startDateParam = searchParams.get('startDate')
  const endDateParam = searchParams.get('endDate')
  // const initialStartDate = moment(startDateParam) ?? null
  // const initialEndDate = moment(endDateParam) ?? null

  const { projectsCount, requestsCount, cohortsCount, samplesCount } = useCounts(
    searchInput,
    startDateParam ?? '',
    endDateParam ?? ''
  )

  // TODO: tout ça à externaliser
  const handleSearchTermChange = (newSearchInput: string) => {
    if (!newSearchInput) {
      searchParams.delete('searchInput')
    } else {
      searchParams.set('searchInput', newSearchInput)
    }
    setSearchParams(searchParams)
  }

  // const handleDateChange = () => {
  //   // TODO
  // }

  searchParams.set('page', '1')
  // TODO: gérer en cas d'erreur d'url (quoi que, p-e redirection auto vers 404 déjà en place)
  const handleTabChange = (newTab: ExplorationTabs) => {
    navigate({
      pathname: `/researches/${newTab.id}`,
      search: location.search
    })
  }

  // TODO: à externaliser aussi malgré le tsx? (+ refactor)
  const explorationTabs = [
    {
      id: 'projects',
      label: (
        <Box display="flex" alignItems="flex-start" gap={1}>
          Projets
          {(searchInput || startDateParam || endDateParam) && <Badge total={projectsCount} />}
        </Box>
      )
    },
    {
      id: 'requests',
      label: (
        <Box display="flex" alignItems="flex-start" gap={1}>
          Requêtes
          {(searchInput || startDateParam || endDateParam) && <Badge total={requestsCount} />}
        </Box>
      )
    },
    {
      id: 'cohorts',
      label: (
        <Box display="flex" alignItems="flex-start" gap={1}>
          Cohortes
          {(searchInput || startDateParam || endDateParam) && <Badge total={cohortsCount} />}
        </Box>
      )
    },
    {
      id: 'samples',
      label: (
        <Box display="flex" alignItems="flex-start" gap={1}>
          Échantillons
          {(searchInput || startDateParam || endDateParam) && <Badge total={samplesCount} />}
        </Box>
      )
    }
  ]

  const pathSections = location.pathname.split('/')
  const tab = pathSections[2]
  const selectedTab =
    explorationTabs.find((explorationTab) => explorationTab.id === tab) ??
    explorationTabs.find((explorationTab) => explorationTab.id === 'projects')

  return (
    <Grid
      container
      direction="column"
      className={cx(classes.appBar, {
        [classes.appBarShift]: openDrawer
      })}
      bgcolor={'#e6f1fd'}
      alignItems={'center'}
    >
      <Grid container justifyContent={'space-between'} xs={11} style={{ padding: '20px 0 12px' }} gap="30px">
        <Typography variant="h1">Mes recherches</Typography>
        <Box display="flex" alignItems="center">
          <MenuButtonFilter buttonLabel={'Toutes les dates'} />
          <Searchbar>
            <SearchInput
              placeholder="Recherche par texte"
              value={searchInput}
              onchange={(newInput) => handleSearchTermChange(newInput)}
              searchOnClick
            />
          </Searchbar>
        </Box>
        <Tabs variant="pill" values={explorationTabs} active={selectedTab} onchange={handleTabChange} />
      </Grid>
      <Grid container bgcolor={'#FFF'} height={'100%'} justifyContent={'center'}>
        <Grid container xs={11} style={{ padding: '20px 0' }}>
          <Breadcrumb />
          <Outlet />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default MyResearches
