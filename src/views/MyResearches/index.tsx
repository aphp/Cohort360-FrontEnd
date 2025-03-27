/* eslint-disable max-statements */
import React, { useEffect, useState, useRef } from 'react'
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppSelector } from 'state'

import { Box, Grid, Slide, Typography } from '@mui/material'
import Badge from 'components/ui/Badge'
import Breadcrumb from 'components/Researches/Breadcrumbs'
import MenuButtonFilter from 'components/Researches/MenuButtonFilter'
import Searchbar from 'components/ui/Searchbar'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Tabs from 'components/ui/Tabs'

import useCounts from 'hooks/researches/useCounts'

import { ExplorationTabs, TabType } from 'types'
import { ExplorationsSearchParams } from 'types/cohorts'
import { cleanSearchParams, getPathDepth } from 'utils/explorationUtils'
import useStyles from './styles'
import moment from 'moment'

const MyResearches = () => {
  const { classes, cx } = useStyles()
  const openDrawer = useAppSelector((state) => state.drawer)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [slideIsActive, setSlideIsActive] = useState(false)

  const searchInput = searchParams.get(ExplorationsSearchParams.SEARCH_INPUT) ?? ''
  const startDateParam = searchParams.get(ExplorationsSearchParams.START_DATE) ?? null
  const endDateParam = searchParams.get(ExplorationsSearchParams.END_DATE) ?? null

  const [localSearchInput, setLocalSearchInput] = useState(searchInput)

  const { projectsCount, requestsCount, cohortsCount /*, samplesCount*/ } = useCounts(
    searchInput,
    startDateParam,
    endDateParam
  )

  const headerRef = useRef<HTMLDivElement>(null)
  const hasMounted = useRef(false)
  const hasSyncedInitialValue = useRef(false)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.clientHeight)
    }
  }, [])

  useEffect(() => {
    if (!hasSyncedInitialValue.current) {
      setLocalSearchInput(searchInput)
      hasSyncedInitialValue.current = true
    }
  }, [searchInput])

  // Partie pour handle la direction du slider
  const prevDepthRef = useRef<number | null>(null)
  const currentDepth = getPathDepth(location.pathname)
  let direction: 'left' | 'right' = 'left'
  if (prevDepthRef.current !== null) {
    const goingForward = currentDepth > prevDepthRef.current
    direction = goingForward ? 'left' : 'right'
  }
  prevDepthRef.current = currentDepth
  //////////////////////////

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

  const handleSearchTermChange = (newSearchInput: string) => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    if (!newSearchInput) {
      searchParams.delete(ExplorationsSearchParams.SEARCH_INPUT)
    } else {
      searchParams.set(ExplorationsSearchParams.SEARCH_INPUT, newSearchInput)
    }
    setSearchParams(searchParams)
    navigate({
      pathname: `/researches/${selectedTab?.id}`,
      search: `?${searchParams.toString()}`
    })
  }

  const handleDateChange = (date: string | null, key: ExplorationsSearchParams) => {
    if (!date) {
      searchParams.delete(key)
    } else {
      searchParams.set(key, moment(date).isValid() ? moment(date).format('YYYY-MM-DD') : '')
    }
    setSearchParams(searchParams)
    navigate({
      pathname: `/researches/${selectedTab?.id}`,
      search: `?${searchParams.toString()}`
    })
  }

  const handleTabChange = (newTab: ExplorationTabs) => {
    setSlideIsActive(false)
    const cleanedSearchParams = cleanSearchParams(searchParams)
    setSearchParams(cleanedSearchParams)
    navigate({
      pathname: `/researches/${newTab.id}`,
      search: `?${cleanedSearchParams}`
    })
    setTimeout(() => setSlideIsActive(true), 5)
  }

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
      <Grid
        container
        justifyContent={'space-between'}
        xs={11}
        style={{ padding: '36px 0 12px' }}
        gap="40px"
        ref={headerRef}
      >
        <Typography variant="h1">Mes recherches</Typography>
        <Box display="flex" alignItems="center" gap="4px">
          <MenuButtonFilter
            startDate={startDateParam}
            endDate={endDateParam}
            onChangeStartDate={(newDate: string | null) =>
              handleDateChange(newDate, ExplorationsSearchParams.START_DATE)
            }
            onChangeEndDate={(newDate: string | null) => handleDateChange(newDate, ExplorationsSearchParams.END_DATE)}
          />
          <Searchbar>
            <SearchInput
              placeholder="Rechercher dans tous les niveaux"
              value={localSearchInput}
              onchange={(newInput) => {
                setLocalSearchInput(newInput)
                handleSearchTermChange(newInput)
              }}
              width="296px"
            />
          </Searchbar>
        </Box>
        <Tabs
          variant="pill"
          values={explorationTabs}
          active={selectedTab as TabType<string, React.ReactNode>}
          onchange={handleTabChange}
        />
      </Grid>
      <Grid container bgcolor={'#FFF'} sx={{ minHeight: `calc(100vh - ${headerHeight}px)` }} justifyContent={'center'}>
        <Grid key={location.pathname} container xs={11} style={{ padding: '20px 0' }} gap={'20px'} direction={'column'}>
          <Breadcrumb />
          <Slide direction={direction} in={true} mountOnEnter unmountOnExit appear={slideIsActive} timeout={300}>
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
