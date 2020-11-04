import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useSelector } from 'react-redux'
import MenuOpenIcon from '@material-ui/icons/MenuOpen'
import IconButton from '@material-ui/core/IconButton'
import Grid from '@material-ui/core/Grid'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import CircularProgress from '@material-ui/core/CircularProgress'

import { Link, Route, Switch, useParams } from 'react-router-dom'

import TopBar from '../../components/TopBar/TopBar'
import PatientHeader from '../../components/Patient/PatientHeader/PatientHeader'
import useStyles, { sidebarWidth } from './styles'
import PatientTimeline from '../../components/Patient/PatientTimeline/PatientTimeline'
import PatientPreview from '../../components/Patient/PatientPreview/PatientPreview'
import PatientDocs from '../../components/Patient/PatientDocs/PatientDocs'
import PatientSidebar from '../../components/Patient/PatientSidebar/PatientSidebar'
import PatientPMSI from '../../components/Patient/PatientPMSI/PatientPMSI'

import { fetchPatient } from '../../services/patient'

const Patient = () => {
  const classes = useStyles()
  const { patientId, tabName } = useParams()

  const cohort = useSelector((state) => state.exploredCohort)

  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, selectTab] = useState(tabName || 'apercu')
  const [isSidebarOpened, setSidebarOpened] = useState(false)
  const [hospit, setHospit] = useState(null)
  const [consult, setConsult] = useState(null)
  const [diagnostic, setDiagnostic] = useState(null)
  const [ghm, setGhm] = useState(null)
  const [documents, setDocuments] = useState([])
  const [documentsTotal, setDocumentsTotal] = useState(0)
  const [deidentifiedBoolean, setDeidentifiedBoolean] = useState(true)

  useEffect(() => {
    selectTab(tabName || 'apercu')
  }, [tabName])

  useEffect(() => {
    fetchPatient(patientId)
      .then(
        ({
          consult,
          hospit,
          diagnostic,
          ghm,
          documents,
          documentsTotal,
          patient
        }) => {
          setConsult(consult)
          setDocuments(documents)
          setDocumentsTotal(documentsTotal)
          setHospit(hospit)
          setPatient(patient)
          setDiagnostic(diagnostic)
          setGhm(ghm)
          setDeidentifiedBoolean(patient.extension[0].valueBoolean)
        }
      )
      .then(() => setLoading(false))
  }, [patientId])

  const open = useSelector((state) => state.drawer)

  return !loading ? (
    <Grid
      container
      direction="column"
      className={clsx(classes.root, classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <TopBar
        title={
          cohort.cohort.isArray || cohort.cohort.name === '-'
            ? '-'
            : cohort.cohort.name
        }
        status={
          cohort.cohort.isArray
            ? 'Visualisation de périmètres'
            : cohort.cohort.name
            ? cohort.cohort.name === '-'
              ? 'Exploration de population'
              : 'Exploration de cohorte '
            : "Visualisation d'un patient"
        }
        patientsNb={cohort.totalPatients}
        access={deidentifiedBoolean ? 'Pseudonymisé' : 'Nominatif'}
      />
      <Grid
        container
        direction="column"
        alignItems="center"
        className={clsx(isSidebarOpened ? classes.contentShift : null)}
      >
        {!isSidebarOpened && (
          <IconButton
            className={classes.sidebarButton}
            onClick={() => setSidebarOpened(true)}
          >
            <MenuOpenIcon fontSize="large" />
          </IconButton>
        )}
        <PatientHeader patient={patient} deidentified={deidentifiedBoolean} />
        <Grid container item md={11}>
          <Tabs value={selectedTab} textColor="primary">
            <Tab
              className={classes.tabTitle}
              label="Aperçu patient"
              value="apercu"
              component={Link}
              to={`/patients/${patientId}/apercu`}
            />
            <Tab
              className={classes.tabTitle}
              label="Parcours patient"
              value="parcours"
              component={Link}
              to={`/patients/${patientId}/parcours`}
            />
            <Tab
              className={classes.tabTitle}
              label="Documents cliniques"
              value="documents-cliniques"
              component={Link}
              to={`/patients/${patientId}/documents-cliniques`}
            />
            <Tab
              className={classes.tabTitle}
              label="PMSI"
              value="pmsi"
              component={Link}
              to={`/patients/${patientId}/pmsi`}
            />
          </Tabs>
        </Grid>
        <Grid className={classes.tabContainer}>
          <Switch>
            <Route path={`/patients/${patientId}/apercu`}>
              <PatientPreview
                patient={patient}
                deidentified={deidentifiedBoolean}
              />
            </Route>
            <Route path={`/patients/${patientId}/parcours`}>
              <PatientTimeline
                documents={documents}
                hospits={hospit}
                consults={consult.entry}
              />
            </Route>
            <Route path={`/patients/${patientId}/documents-cliniques`}>
              <PatientDocs
                patientId={patientId}
                documents={documents}
                total={documentsTotal}
              />
            </Route>
            <Route path={`/patients/${patientId}/pmsi`}>
              <PatientPMSI
                patientId={patientId}
                diagnostic={diagnostic}
                ccam={consult}
                ghm={ghm}
              />
            </Route>
            <Route path={`/patients/${patientId}`}>
              <PatientPreview patient={patient} />
            </Route>
          </Switch>
        </Grid>
        <PatientSidebar
          open={isSidebarOpened}
          groupId={
            Array.isArray(cohort.cohort)
              ? cohort.cohort.map((e) => e.id).join()
              : cohort.cohort.id
              ? cohort.cohort.id
              : null
          }
          patients={cohort.originalPatients}
          total={cohort.totalPatients}
          onClose={() => setSidebarOpened(false)}
          width={sidebarWidth}
        />
      </Grid>
    </Grid>
  ) : (
    <div>
      <CircularProgress className={classes.loading} size={50} />
    </div>
  )
}

export default Patient
