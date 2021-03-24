import React, { useEffect, useState } from 'react'

import { Link, useLocation, useParams } from 'react-router-dom'
import { useAppSelector } from 'state'

import { Backdrop, IconButton, Grid, Tabs, Tab, CircularProgress } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

import PatientDocs from '../../components/Patient/PatientDocs/PatientDocs'
import PatientHeader from '../../components/Patient/PatientHeader/PatientHeader'
import PatientPreview from '../../components/Patient/PatientPreview/PatientPreview'
import PatientPMSI from '../../components/Patient/PatientPMSI/PatientPMSI'
import PatientSidebar from '../../components/Patient/PatientSidebar/PatientSidebar'
import PatientTimeline from '../../components/Patient/PatientTimeline/PatientTimeline'
import TopBar from '../../components/TopBar/TopBar'

import { fetchPatient } from '../../services/patient'

import { CohortPatient, PMSIEntry } from 'types'
import {
  IClaim,
  IComposition,
  ICondition,
  IEncounter,
  IProcedure,
  IDocumentReference
} from '@ahryman40k/ts-fhir-types/lib/R4'

import clsx from 'clsx'
import useStyles from './styles'

const Patient = () => {
  const classes = useStyles()
  const { patientId, tabName } = useParams<{
    patientId: string
    tabName: string
  }>()

  const [patient, setPatient] = useState<CohortPatient | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [selectedTab, selectTab] = useState(tabName || 'apercu')
  const [isSidebarOpened, setSidebarOpened] = useState(false)
  const [hospit, setHospit] = useState<IEncounter[] | undefined>(undefined)
  const [consult, setConsult] = useState<PMSIEntry<IProcedure>[] | undefined>(undefined)
  const [consultTotal, setConsultTotal] = useState(0)
  const [diagnostic, setDiagnostic] = useState<PMSIEntry<ICondition>[] | undefined>(undefined)
  const [diagnosticTotal, setDiagnosticTotal] = useState(0)
  const [ghm, setGhm] = useState<PMSIEntry<IClaim>[] | undefined>(undefined)
  const [ghmTotal, setGhmTotal] = useState(0)
  const [documents, setDocuments] = useState<(IComposition | IDocumentReference)[] | undefined>(undefined)
  const [documentsTotal, setDocumentsTotal] = useState(0)
  const [deidentifiedBoolean, setDeidentifiedBoolean] = useState(true)

  const { open, cohort } = useAppSelector((state) => ({
    open: state.drawer,
    cohort: state.exploredCohort
  }))

  const location = useLocation()
  const search = new URLSearchParams(location.search)
  const groupId = search.get('groupId') ?? undefined

  useEffect(() => {
    selectTab(tabName || 'apercu')
  }, [tabName])

  useEffect(() => {
    setLoading(true)
    fetchPatient(patientId, groupId)
      .then((patientResp) => {
        setHospit(patientResp?.hospit ?? undefined)
        setDocuments(patientResp?.documents ?? undefined)
        setDocumentsTotal(patientResp?.documentsTotal ?? 0)
        setConsult(patientResp?.consult ?? undefined)
        setConsultTotal(patientResp?.consultTotal ?? 0)
        setDiagnostic(patientResp?.diagnostic)
        setDiagnosticTotal(patientResp?.diagnosticTotal ?? 0)
        setGhm(patientResp?.ghm)
        setGhmTotal(patientResp?.ghmTotal ?? 0)
        setPatient(patientResp?.patient)
        setDeidentifiedBoolean(
          patientResp?.patient?.extension?.find((extension) => extension.url === 'deidentified')?.valueBoolean ?? true
        )
      })
      .then(() => setLoading(false))
  }, [patientId, groupId])

  const title = Array.isArray(cohort.cohort) || cohort?.cohort?.name === '-' ? '-' : cohort?.cohort?.name

  const status = Array.isArray(cohort.cohort)
    ? 'Visualisation de périmètres'
    : cohort?.cohort?.name
    ? cohort?.cohort?.name === '-'
      ? 'Exploration de population'
      : 'Exploration de cohorte '
    : "Visualisation d'un patient"

  if (!patient && !loading) {
    return (
      <Alert severity="error" className={classes.alert}>
        Les données de ce patient ne sont pas disponibles, veuillez réessayer ultérieurement.
      </Alert>
    )
  }

  const handleChangeTabs = (event: any, newTab: string) => {
    selectTab(newTab)
  }

  return (
    <>
      {loading && (
        <Backdrop style={{ zIndex: 1201 }} open>
          <CircularProgress className={classes.loading} size={50} />
        </Backdrop>
      )}
      <Grid
        container
        direction="column"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
      >
        <TopBar
          title={title}
          status={status}
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
            <div className={classes.openLeftBar}>
              <IconButton onClick={() => setSidebarOpened(true)}>
                <ChevronLeftIcon color="action" width="20px" />
              </IconButton>
            </div>
          )}
          <PatientHeader patient={patient} deidentified={deidentifiedBoolean} />
          <Grid container item md={11}>
            <Tabs value={selectedTab} onChange={handleChangeTabs} textColor="primary">
              <Tab
                className={classes.tabTitle}
                label="Aperçu patient"
                value="apercu"
                component={Link}
                to={`/patients/${patientId}/apercu${groupId ? `?groupId=${groupId}` : ''}`}
              />
              <Tab
                className={classes.tabTitle}
                label="Parcours patient"
                value="parcours"
                component={Link}
                to={`/patients/${patientId}/parcours${groupId ? `?groupId=${groupId}` : ''}`}
              />
              <Tab
                className={classes.tabTitle}
                label="Documents cliniques"
                value="documents-cliniques"
                component={Link}
                to={`/patients/${patientId}/documents-cliniques${groupId ? `?groupId=${groupId}` : ''}`}
              />
              <Tab
                className={classes.tabTitle}
                label="PMSI"
                value="pmsi"
                component={Link}
                to={`/patients/${patientId}/pmsi${groupId ? `?groupId=${groupId}` : ''}`}
              />
            </Tabs>
          </Grid>
          <Grid className={classes.tabContainer}>
            {selectedTab === 'apercu' && (
              <PatientPreview patient={patient} deidentified={deidentifiedBoolean} mainLoading={loading} />
            )}
            {selectedTab === 'parcours' && (
              <PatientTimeline
                documents={documents}
                hospits={hospit}
                consults={consult}
                deidentified={deidentifiedBoolean}
              />
            )}
            {selectedTab === 'documents-cliniques' && (
              <PatientDocs
                groupId={groupId}
                patientId={patientId}
                documents={documents}
                total={documentsTotal}
                deidentifiedBoolean={deidentifiedBoolean}
                sortBy={'date'}
                sortDirection={'desc'}
              />
            )}
            {selectedTab === 'pmsi' && (
              <PatientPMSI
                groupId={groupId}
                patientId={patientId}
                diagnostic={diagnostic}
                diagnosticTotal={diagnosticTotal}
                ccam={consult}
                ccamTotal={consultTotal}
                ghm={ghm}
                ghmTotal={ghmTotal}
                deidentifiedBoolean={deidentifiedBoolean}
                sortBy={'date'}
                sortDirection={'desc'}
              />
            )}
          </Grid>
          <PatientSidebar
            openDrawer={isSidebarOpened}
            groupId={Array.isArray(cohort.cohort) ? cohort.cohort.map((e: any) => e.id).join() : cohort.cohort?.id}
            patients={cohort.originalPatients}
            total={cohort.totalPatients ?? 0}
            onClose={() => setSidebarOpened(false)}
            deidentifiedBoolean={deidentifiedBoolean}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default Patient
