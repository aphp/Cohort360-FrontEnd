import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useAppSelector } from 'state'
import { useDispatch } from 'react-redux'
import { withRouter, useParams } from 'react-router'

import { CircularProgress, Grid, Typography } from '@material-ui/core'

import PatientSearchBar from '../../components/PatientSearchBar/PatientSearchBar'
import TableauPatients from '../../components/TableauPatients/TableauPatients'

import { searchPatient } from '../../services/searchPatient'
import { setExploredCohort } from '../../state/exploredCohort'

import { IPatient } from '@ahryman40k/ts-fhir-types/lib/R4'
import { SearchByTypes } from 'types'

import useStyles from './styles'

const RechercherPatient: React.FC<{}> = () => {
  const classes = useStyles()
  const { search } = useParams()
  const dispatch = useDispatch()

  const [showTable, setShowTable] = useState(false)
  const [patientResults, setPatientResults] = useState<IPatient[]>([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('given')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState(search ?? '')

  const performQueries = (sortBy: string, sortDirection: string, input: string, searchBy = SearchByTypes.text) => {
    setLoading(true)
    searchPatient(sortBy, sortDirection, input, searchBy).then((results) => {
      if (Array.isArray(results)) {
        setPatientResults(results)
        setShowTable(true)
      }
      setLoading(false)
    })
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPage(page)
  }

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: any) => {
    const isAsc: boolean = sortBy === property && sortDirection === 'asc'
    const _sortDirection = isAsc ? 'desc' : 'asc'

    setSortDirection(_sortDirection)
    setSortBy(property)
    performQueries(property, _sortDirection, searchInput)
  }

  useEffect(() => {
    dispatch(setExploredCohort())
  }, []) // eslint-disable-line

  useEffect(() => {
    if (search) {
      performQueries(sortBy, sortDirection, search)
    }
  }, [search]) // eslint-disable-line

  const open = useAppSelector((state) => state.drawer)

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
            Rechercher un patient
          </Typography>
          <PatientSearchBar
            performQueries={performQueries}
            showSelect={true}
            searchInput={searchInput}
            onChangeInput={setSearchInput}
          />
          {loading && (
            <Grid container item justify="center">
              <CircularProgress />
            </Grid>
          )}
          {!loading && showTable && (
            <TableauPatients
              patients={patientResults}
              onChangePage={handlePageChange}
              page={page}
              totalPatientCount={patientResults.length}
              sortBy={sortBy}
              sortDirection={'asc'}
              onRequestSort={handleRequestSort}
            />
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default withRouter(RechercherPatient)
