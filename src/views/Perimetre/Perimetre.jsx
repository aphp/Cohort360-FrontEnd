import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useSelector, useDispatch } from 'react-redux'
import { Link, Route, Switch, useParams, useLocation } from 'react-router-dom'

import Grid from '@material-ui/core/Grid'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { Alert, AlertTitle } from '@material-ui/lab'
import { CircularProgress } from '@material-ui/core'

import TopBar from '../../components/TopBar/TopBar'
import CohortPreview from '../../components/Cohort/Preview/Preview'
import PatientList from '../../components/Cohort/PatientList/PatientList'
import PerimetersDocuments from '../../components/Cohort/Documents/Documents'

import { fetchPerimetersInfos } from '../../services/perimeters'
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

import useStyles from './style'

const Perimetre = (props) => {
  const { tabName } = useParams()
  const [selectedTab, selectTab] = useState(tabName || 'apercu')
  const classes = useStyles()
  const location = useLocation()
  const perimetreIds = location.search.substr(1)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const [deidentifiedBoolean, setDeidentifiedBoolean] = useState(true)

  const open = useSelector((state) => state.drawer)
  const myPerimetre = useSelector((state) => state.exploredCohort)

  useEffect(() => {
    fetchPerimetersInfos(perimetreIds)
      .then(
        ({
          totalPatients,
          perimetersInfos,
          patientsList,
          patientsFacets,
          encountersFacets,
          totalDocs,
          docsList,
          // wordcloudData
        }) => {
          dispatch(setCohort(perimetersInfos))
          dispatch(setTotalPatients(totalPatients))
          dispatch(setOriginalPatients(patientsList))
          dispatch(setPatientsFacets(patientsFacets))
          dispatch(setEncountersFacets(encountersFacets))
          dispatch(setTotalDocs(totalDocs))
          dispatch(setDocumentsList(docsList))
          // dispatch(setWordcloudData(wordcloudData))
          setDeidentifiedBoolean(
            patientsList[0].extension.filter(
              (data) => (data.url = 'deidentified')
            )[0].valueBoolean
          )
        }
      )
      .then(() => setLoading(false))
  }, [perimetreIds])

  useEffect(() => {
    selectTab(tabName || 'apercu')
  }, [tabName])

  if (!loading && myPerimetre.originalPatients.length === 0) {
    return (
      <Grid
        container
        direction="column"
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
      >
        <TopBar
          title="-"
          status="Exploration de périmètres"
          patientsNb={myPerimetre.totalPatients}
          access="-"
        />
        <Alert severity="warning">
          <AlertTitle>Attention</AlertTitle>
          Aucun patient n{"'"}a été trouvé dans ce périmètre.
        </Alert>
      </Grid>
    )
  }

  return !loading ? (
    <Grid
      container
      direction="column"
      className={clsx(classes.root, classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <TopBar
        title="-"
        status="Exploration de périmètres"
        patientsNb={myPerimetre.totalPatients}
        access={deidentifiedBoolean ? 'Pseudonymisé' : 'Nominatif'}
      />
      <Grid container justify="center" className={classes.tabs}>
        <Grid container item xs={11}>
          <Tabs value={selectedTab} classes={{ indicator: classes.indicator }}>
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Aperçu cohorte"
              value="apercu"
              component={Link}
              to={`/perimetres/apercu${location.search}`}
            />
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Patients"
              value="patients"
              component={Link}
              to={`/perimetres/patients${location.search}`}
            />
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Documents"
              value="documents"
              component={Link}
              to={`/perimetres/documents${location.search}`}
            />
          </Tabs>
        </Grid>
      </Grid>
      <div>
        {myPerimetre.originalPatients && (
          <Switch>
            <Route path={'/perimetres/apercu'}>
              <CohortPreview
                total={myPerimetre.totalPatients}
                group={{
                  name: 'Exploration de périmètres',
                  perimeters: myPerimetre.cohort.map((p) =>
                    p.name.replace('Patients passés par: ', '')
                  )
                }}
                patientsFacets={myPerimetre.patientsFacets}
                encountersFacets={myPerimetre.encountersFacets}
              />
            </Route>
            <Route path={'/perimetres/patients'}>
              <PatientList
                groupId={perimetreIds}
                total={myPerimetre.totalPatients}
                deidentified={deidentifiedBoolean}
                patients={myPerimetre.originalPatients}
                patientsFacets={myPerimetre.patientsFacets}
              />
            </Route>
            <Route path={'/perimetres/documents'}>
              <PerimetersDocuments
                groupId={perimetreIds}
                total={myPerimetre.totalDocs}
                docs={myPerimetre.documentsList}
                // wordcloud={myPerimetre.wordcloudData}
              />
            </Route>
            <Route path={'/perimetres'}>
              <CohortPreview
                total={myPerimetre.totalPatients}
                group={{
                  name: 'Exploration de périmètres',
                  perimeters: myPerimetre.cohort.map((p) =>
                    p.name.replace('Patients passés par: ', '')
                  )
                }}
                patientsFacets={myPerimetre.patientsFacets}
                encountersFacets={myPerimetre.encountersFacets}
              />
            </Route>
          </Switch>
        )}
      </div>
    </Grid>
  ) : (
    <div>
      <CircularProgress className={classes.loading} size={50} />
    </div>
  )
}

export default Perimetre
