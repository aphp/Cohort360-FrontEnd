import React, { useState, useEffect } from 'react'
import clsx from 'clsx'

import { Grid, Typography, CircularProgress } from '@material-ui/core'

import { fetchProjectsList, fetchRequestList, fetchCohortList } from 'services/myProjects'

import { useAppSelector } from 'state'

import useStyles from './styles'

const MyProjects = () => {
  const classes = useStyles()
  const open = useAppSelector((state) => state.drawer)

  const [loading, setLoading] = useState(true)
  const [projectList, setProjectList] = useState<any[]>([])
  const [requestList, setRequestList] = useState<any[]>([])
  const [cohortList, setCohortList] = useState<any[]>([])

  const _fetchProjectsList = async () => {
    const _projectList: any[] = await fetchProjectsList()
    setProjectList(_projectList)
  }

  const _fetchRequestList = async () => {
    const _requestResponse = await fetchRequestList()
    const _requestList: any[] = _requestResponse.results
    setRequestList(_requestList)
  }

  const _fetchCohortList = async () => {
    const _cohortResponse = await fetchCohortList()
    const _cohortList: any[] = _cohortResponse.results
    setCohortList(_cohortList)
  }

  useEffect(() => {
    const _fetch = async () => {
      setLoading(true)
      await _fetchProjectsList()
      await _fetchRequestList()
      await _fetchCohortList()
      setLoading(false)
    }

    _fetch()
    return () => {
      setLoading(true)
      setProjectList([])
      setRequestList([])
      setCohortList([])
    }
  }, [])

  if (loading) {
    return (
      <Grid
        container
        direction="column"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
      >
        <Grid container className={classes.loaderGrid} justify="center" alignItems="center">
          <CircularProgress />
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid
      container
      direction="column"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <Grid container justify="center" alignItems="center">
        <Grid container item xs={12} sm={9}>
          <Typography variant="h1" color="primary" className={classes.title}>
            Mes projets de recherche
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default MyProjects
