import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useDispatch, useSelector } from 'react-redux'
import TableauPatients from '../../components/TableauPatients/TableauPatients'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import { withRouter } from 'react-router'

import PatientSearchBar from '../../components/PatientSearchBar/PatientSearchBar'
import { searchPatient } from '../../services/searchPatient'

import useStyles from './style'
import {
  setCohort,
  setTotalPatients,
  setOriginalPatients,
  setTotalDocs,
  setDocumentsList,
  setPatientsFacets,
  setEncountersFacets,
  // setWordcloudData
} from '../../state/exploredCohort'

const RechercherPatient = (props) => {
  const classes = useStyles()

  const dispatch = useDispatch()

  const [showTable, setShowTable] = useState(false)
  const [patientResults, setPatientResults] = useState([])
  const [loading, setLoading] = useState(false)

  const performQueries = async (input, searchBy = '_text') => {
    setLoading(true)
    searchPatient(input, searchBy).then((results) => {
      setPatientResults(results)
      setShowTable(true)
      setLoading(false)
    })
  }

  useEffect(() => {
    dispatch(setCohort({}))
    dispatch(setTotalPatients(1))
    dispatch(setTotalDocs(0))
    dispatch(setOriginalPatients([]))
    dispatch(setPatientsFacets([]))
    dispatch(setEncountersFacets([]))
    dispatch(setDocumentsList([]))
    // dispatch(setWordcloudData([]))
  })

  useEffect(() => {
    if (props.location.search) {
      performQueries(props.location.search.substr(1))
    }
  }, [props.location.search])

  const open = useSelector((state) => state.drawer)

  return (
    <Grid
      container
      direction="column"
      position="fixed"
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
            <TableauPatients patients={patientResults} />
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default withRouter(RechercherPatient)
