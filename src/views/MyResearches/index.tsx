import React, { useMemo } from 'react'
import { Link, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { useAppSelector } from 'state'

import { Box, Grid, Slide, Tab, Typography } from '@mui/material'
import Badge from 'components/ui/Badge'
import Breadcrumb from 'components/Researches/Breadcrumbs'
import MenuButtonFilter from 'components/Researches/MenuButtonFilter'
import SearchInput from 'components/ui/Searchbar/SearchInput'

import useCounts from 'hooks/researches/useCounts'
import { ExplorationsSearchParams } from 'types/cohorts'
import { cleanSearchParams, isDeeperPath, isSamePathStart } from 'utils/explorationUtils'
import useStyles from './styles'
import moment from 'moment'
import { MainTabsWrapper } from 'components/ui/Tabs/style'
import { useURLTransition } from 'hooks/researches/useURLTransition'

const MyResearches = () => {
  const { classes, cx } = useStyles()
  const openDrawer = useAppSelector((state) => state.drawer)
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInput = searchParams.get(ExplorationsSearchParams.SEARCH_INPUT) ?? ''
  const startDateParam = searchParams.get(ExplorationsSearchParams.START_DATE) ?? null
  const endDateParam = searchParams.get(ExplorationsSearchParams.END_DATE) ?? null
  const { projectsCount, requestsCount, cohortsCount } = useCounts(searchInput, startDateParam, endDateParam)

  const explorationTabs = useMemo(
    () => [
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
    ],
    [searchInput, startDateParam, endDateParam, requestsCount, projectsCount, cohortsCount]
  )
  const selectedTab = useMemo(() => {
    const pathSections = location.pathname.split('/')
    const tab = pathSections[2]
    return (
      explorationTabs.find((explorationTab) => explorationTab.id === tab) ??
      explorationTabs.find((explorationTab) => explorationTab.id === 'projects')
    )
  }, [explorationTabs, location.pathname])
  const { isActive: slideIsActive, direction } = useURLTransition(location.pathname, isSamePathStart, isDeeperPath)

  const handleSearch = (key: ExplorationsSearchParams, value: string) => {
    if (!value) searchParams.delete(key)
    else searchParams.set(key, value)
    setSearchParams(searchParams)
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
      sx={{
        minHeight: '100vh'
      }}
    >
      <Grid container justifyContent={'space-between'} xs={11} style={{ padding: '36px 0 12px' }} gap="40px">
        <Typography variant="h1">Mes recherches</Typography>
        <Box display="flex" alignItems="center" gap="4px">
          <MenuButtonFilter
            startDate={startDateParam}
            endDate={endDateParam}
            onChangeStartDate={(newDate: string | null) =>
              handleSearch(
                ExplorationsSearchParams.START_DATE,
                moment(newDate).isValid() ? moment(newDate).format('YYYY-MM-DD') : ''
              )
            }
            onChangeEndDate={(newDate: string | null) =>
              handleSearch(
                ExplorationsSearchParams.END_DATE,
                moment(newDate).isValid() ? moment(newDate).format('YYYY-MM-DD') : ''
              )
            }
          />
          <SearchInput
            placeholder="Rechercher dans tous les niveaux"
            value={searchInput}
            onChange={(newInput) => {
              handleSearch(ExplorationsSearchParams.SEARCH_INPUT, newInput)
            }}
          />
        </Box>
        <Grid container>
          <MainTabsWrapper value={selectedTab?.id} variant="fullWidth">
            {explorationTabs.map((tab) => (
              <Tab
                key={tab.id}
                label={tab.label}
                value={tab.id}
                sx={{ fontSize: 16, textTransform: 'uppercase' }}
                to={`/researches/${tab?.id}?${cleanSearchParams(searchParams)}`}
                component={Link}
              />
            ))}
          </MainTabsWrapper>
        </Grid>
      </Grid>
      <Grid container bgcolor="#FFF" flexGrow={1} justifyContent="center">
        <Grid
          key={location.pathname}
          container
          xs={11}
          style={{ padding: '20px 0', minHeight: '100%' }}
          gap="20px"
          direction="column"
        >
          <Breadcrumb />
          <Slide direction={direction} in mountOnEnter unmountOnExit appear={slideIsActive} timeout={300}>
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
