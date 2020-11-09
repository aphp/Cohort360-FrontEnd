import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useDispatch } from 'react-redux'
import TableauPatients from '../../components/TableauPatients/TableauPatients'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import { withRouter, useParams } from 'react-router'

import PatientSearchBar from '../../components/PatientSearchBar/PatientSearchBar'
import { searchPatient } from '../../services/searchPatient'

import useStyles from './styles'
import { setExploredCohort } from '../../state/exploredCohort'
import { useAppSelector } from 'state'
import { SearchByTypes } from 'types'
import { IPatient } from '@ahryman40k/ts-fhir-types/lib/R4'

const RechercherPatient: React.FC<{}> = () => {
  const classes = useStyles()
  const { search } = useParams()
  const dispatch = useDispatch()

  const [showTable, setShowTable] = useState(false)
  const [patientResults, setPatientResults] = useState<IPatient[]>([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('given') // eslint-disable-line
  // const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)

  const performQueries = (input: string, searchBy = SearchByTypes.text) => {
    setLoading(true)
    searchPatient(input, searchBy).then((results) => {
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

  useEffect(() => {
    dispatch(setExploredCohort())
  }, []) // eslint-disable-line

  useEffect(() => {
    if (search) {
      performQueries(search)
    }
  }, [search])

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
          <PatientSearchBar performQueries={performQueries} showSelect={true} />
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
            />
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default withRouter(RechercherPatient)
