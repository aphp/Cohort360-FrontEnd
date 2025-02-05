import React, { useRef } from 'react'
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppSelector } from 'state'

import { Box, Grid, Slide, Typography } from '@mui/material'
import Badge from 'components/ui/Badge'
import Breadcrumb from 'components/Exploration/components/Breadcrumb'
import MenuButtonFilter from 'components/Exploration/components/MenuButtonFilter'
import Searchbar from 'components/ui/Searchbar'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Tabs from 'components/ui/Tabs'

import useCounts from 'components/Exploration/hooks/useCounts'

import { ExplorationTabs } from 'types'
import { getPathDepth } from 'utils/explorationUtils'
import useStyles from './styles'
import moment from 'moment'

const MyResearches = () => {
  const { classes, cx } = useStyles()
  const openDrawer = useAppSelector((state) => state.drawer)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const searchInput = searchParams.get('searchInput') ?? ''
  const startDateParam = searchParams.get('startDate') ?? null
  const endDateParam = searchParams.get('endDate') ?? null

  const { projectsCount, requestsCount, cohortsCount, samplesCount } = useCounts(
    searchInput,
    startDateParam,
    endDateParam
  )

  // Partie pour handle la direction du slider
  const prevDepthRef = useRef<number | null>(null)
  const currentDepth = getPathDepth(location.pathname)
  let direction: 'left' | 'right' = 'left'
  if (prevDepthRef.current !== null) {
    const goingForward = currentDepth > prevDepthRef.current
    direction = goingForward ? 'left' : 'right'
  }
  prevDepthRef.current = currentDepth

  const handleSearchTermChange = (newSearchInput: string) => {
    if (!newSearchInput) {
      searchParams.delete('searchInput')
    } else {
      searchParams.set('searchInput', newSearchInput)
    }
    setSearchParams(searchParams)
    navigate({
      pathname: `/researches/${selectedTab?.id}`,
      search: `?${searchParams.toString()}`
    })
  }

  const handleStartDateChange = (newDate: string | null) => {
    if (!newDate) {
      searchParams.delete('startDate')
    } else {
      searchParams.set('startDate', moment(newDate).isValid() ? moment(newDate).format('YYYY-MM-DD') : '')
    }
    setSearchParams(searchParams)
    navigate({
      pathname: `/researches/${selectedTab?.id}`,
      search: `?${searchParams.toString()}`
    })
  }

  const handleEndDateChange = (newDate: string | null) => {
    if (!newDate) {
      searchParams.delete('endDate')
    } else {
      searchParams.set('endDate', moment(newDate).isValid() ? moment(newDate).format('YYYY-MM-DD') : '')
    }
    setSearchParams(searchParams)
    navigate({
      pathname: `/researches/${selectedTab?.id}`,
      search: `?${searchParams.toString()}`
    })
  }

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
    }
    // {
    //   id: 'samples',
    //   label: (
    //     <Box display="flex" alignItems="flex-start" gap={1}>
    //       Échantillons
    //       {(searchInput || startDateParam || endDateParam) && <Badge total={samplesCount} />}
    //     </Box>
    //   )
    // }
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
        {/* TODO: calculer la height de toute cette grid et la soustraire à celle d'en dessous de 1000vh*/}
        <Typography variant="h1">Mes recherches</Typography>
        <Box display="flex" alignItems="center">
          <MenuButtonFilter
            startDate={startDateParam}
            endDate={endDateParam}
            onChangeStartDate={handleStartDateChange}
            onChangeEndDate={handleEndDateChange}
          />
          <Searchbar>
            <SearchInput
              placeholder="Rechercher dans tous les niveaux"
              value={searchInput}
              onchange={(newInput) => handleSearchTermChange(newInput)}
              searchOnClick
              width="296px"
            />
          </Searchbar>
        </Box>
        <Tabs variant="pill" values={explorationTabs} active={selectedTab} onchange={handleTabChange} />
      </Grid>
      {/* TODO: ui qui bug lorsque tab trop long, à checker */}
      <Grid container bgcolor={'#FFF'} height="100vh" justifyContent={'center'}>
        <Grid key={location.pathname} container xs={11} style={{ padding: '20px 0' }} gap={'20px'} direction={'column'}>
          <Breadcrumb />
          <Slide direction={direction} in={true} mountOnEnter unmountOnExit appear timeout={300}>
            <Grid container key={location.pathname}>
              <Outlet />
            </Grid>
          </Slide>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default MyResearches
