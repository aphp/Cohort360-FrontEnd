import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useAppSelector } from 'state'
import { useDispatch } from 'react-redux'
import { withRouter, useParams } from 'react-router'

import { CircularProgress, Grid, Typography } from '@material-ui/core'

import PatientSearchBar from 'components/PatientSearchBar/PatientSearchBar'
import TableauPatients from 'components/TableauPatients/TableauPatients'

import services from 'services'
import { setExploredCohort } from 'state/exploredCohort'

import { IPatient } from '@ahryman40k/ts-fhir-types/lib/R4'
import { SearchByTypes } from 'types'

import useStyles from './styles'

const RechercherPatient: React.FC<{}> = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const practitioner = useAppSelector((state) => state.me)
  const { search } = useParams<{ search: string }>()

  const [showTable, setShowTable] = useState(false)
  const [patientResults, setPatientResults] = useState<IPatient[]>([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('given')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [searchBy, setSearchBy] = useState<SearchByTypes>(SearchByTypes.text)
  const [searchInput, setSearchInput] = useState(search ?? '')
  const [total, setTotal] = useState(0)

  const performQueries = async (
    page: number,
    sortBy: string,
    sortDirection: string,
    input: string,
    searchBy = SearchByTypes.text
  ) => {
    const nominativeGroupsIds = practitioner ? practitioner.nominativeGroupsIds : []
    setLoading(true)
    if (typeof services?.patients?.searchPatient === 'function') {
      const results = await services.patients.searchPatient(
        nominativeGroupsIds,
        page,
        sortBy,
        sortDirection,
        input,
        searchBy
      )
      if (results) {
        setPatientResults(results.patientList ?? [])
        setTotal(results.totalPatients ?? 0)
        setShowTable(true)
      }
    }
    setLoading(false)
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPage(page)
    if (total > patientResults.length) {
      performQueries(page, sortBy, sortDirection, searchInput, searchBy)
    }
  }

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: any) => {
    const isAsc: boolean = sortBy === property && sortDirection === 'asc'
    const _sortDirection = isAsc ? 'desc' : 'asc'

    setSortDirection(_sortDirection)
    setSortBy(property)
    performQueries(page, property, _sortDirection, searchInput, searchBy)
  }

  useEffect(() => {
    dispatch<any>(setExploredCohort())
  }, []) // eslint-disable-line

  useEffect(() => {
    if (search) {
      performQueries(page, sortBy, sortDirection, search, searchBy)
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
        <Grid container item xs={11}>
          <Typography variant="h1" color="primary" className={classes.title}>
            Rechercher un patient
          </Typography>
          <PatientSearchBar
            performQueries={performQueries}
            showSelect={true}
            searchInput={searchInput}
            onChangeInput={setSearchInput}
            searchBy={searchBy}
            onChangeSearchBy={setSearchBy}
          />
          {loading && (
            <Grid container item justify="center">
              <CircularProgress />
            </Grid>
          )}
          {!loading && showTable && (
            <TableauPatients
              search={searchInput}
              groupId={practitioner?.nominativeGroupsIds}
              patients={patientResults}
              onChangePage={handlePageChange}
              page={page}
              totalPatientCount={total}
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
