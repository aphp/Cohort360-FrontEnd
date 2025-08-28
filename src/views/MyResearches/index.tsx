/* eslint-disable max-statements */
import React, { useEffect, useState, useRef } from 'react'
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Box, Grid, Slide, Tab } from '@mui/material'
import Badge from 'components/ui/Badge'
import Breadcrumb from 'components/Researches/Breadcrumbs'
import HeaderLayout from 'components/ui/Header'
import { TabsWrapper } from 'components/ui/Tabs'
import MenuButtonFilter from 'components/Researches/MenuButtonFilter'
import PageContainer from 'components/ui/PageContainer'
import SearchInput from 'components/ui/Searchbar/SearchInput'

import useCounts from 'hooks/researches/useCounts'

import { TabType } from 'types'
import { ExplorationsSearchParams } from 'types/cohorts'
import { cleanSearchParams, getPathDepth } from 'utils/explorationUtils'
import moment from 'moment'

const MyResearches = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [slideIsActive, setSlideIsActive] = useState(false)

  const searchInput = searchParams.get(ExplorationsSearchParams.SEARCH_INPUT) ?? ''
  const startDateParam = searchParams.get(ExplorationsSearchParams.START_DATE) ?? null
  const endDateParam = searchParams.get(ExplorationsSearchParams.END_DATE) ?? null

  const [localSearchInput, setLocalSearchInput] = useState(searchInput)

  const { projectsCount, requestsCount, cohortsCount, samplesCount } = useCounts(
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

  const handleTabChange = (newTab: TabType) => {
    setSlideIsActive(false)
    const cleanedSearchParams = cleanSearchParams(searchParams)
    setSearchParams(cleanedSearchParams)
    navigate({
      pathname: `/researches/${newTab.id}`,
      search: `?${cleanedSearchParams}`
    })
    setTimeout(() => setSlideIsActive(true), 5)
  }

  const searchArea = (
    <Box display="flex" alignItems="center" gap="4px" margin="8px 0">
      <MenuButtonFilter
        startDate={startDateParam}
        endDate={endDateParam}
        onChangeStartDate={(newDate: string | null) => handleDateChange(newDate, ExplorationsSearchParams.START_DATE)}
        onChangeEndDate={(newDate: string | null) => handleDateChange(newDate, ExplorationsSearchParams.END_DATE)}
      />
      <SearchInput
        placeholder="Rechercher dans tous les niveaux"
        value={localSearchInput}
        onChange={(newInput) => {
          setLocalSearchInput(newInput)
          handleSearchTermChange(newInput)
        }}
      />
    </Box>
  )

  return (
    <PageContainer alignItems={'center'} sx={{ backgroundColor: '#E6F1FD' }}>
      <HeaderLayout title="Mes recherches" searchArea={searchArea} />
      <Grid container size={11}>
        <TabsWrapper value={selectedTab} onChange={(_, tab) => handleTabChange(tab)}>
          {explorationTabs.map((tab) => (
            <Tab key={tab.id} label={tab.label} value={tab} component="div" disableRipple />
          ))}
        </TabsWrapper>
      </Grid>
      <Grid
        container
        size={12}
        bgcolor={'#FFF'}
        sx={{ minHeight: `calc(100vh - ${headerHeight}px)`, justifyContent: 'center' }}
      >
        <Grid
          key={location.pathname}
          container
          size={11}
          style={{ padding: '20px 0' }}
          sx={{ gap: '20px', flexDirection: 'column', flexWrap: 'nowrap' }}
        >
          <Breadcrumb />
          <Slide direction={direction} in={true} mountOnEnter unmountOnExit appear={slideIsActive} timeout={300}>
            <Grid container key={location.pathname}>
              <Outlet />
            </Grid>
          </Slide>
        </Grid>
      </Grid>
    </PageContainer>
  )
}

export default MyResearches
