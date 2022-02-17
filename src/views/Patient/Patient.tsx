import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { Link, useLocation, useParams } from 'react-router-dom'

import { IconButton, Grid, Tabs, Tab, CircularProgress } from '@material-ui/core'

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

import PatientNotExist from 'components/ErrorView/PatientNotExist'
import PatientDocs from 'components/Patient/PatientDocs/PatientDocs'
import PatientHeader from 'components/Patient/PatientHeader/PatientHeader'
import PatientPreview from 'components/Patient/PatientPreview/PatientPreview'
import PatientSidebar from 'components/Patient/PatientSidebar/PatientSidebar'
import PatientTimeline from 'components/Patient/PatientTimeline/PatientTimeline'
import PatientPMSI from 'components/Patient/PatientPMSI/PatientPMSI'
import PatientMedication from 'components/Patient/PatientMedication/PatientMedication'
import PatientBiology from 'components/Patient/PatientBiology/PatientBiology'
import TopBar from 'components/TopBar/TopBar'

import { useAppSelector } from 'state'
import { fetchPatientInfo } from 'state/patient'

// import { CohortPatient, PMSIEntry } from 'types'
// import {
//   IClaim,
//   IComposition,
//   ICondition,
//   IEncounter,
//   IProcedure,
//   IDocumentReference,
//   IMedicationRequest,
//   IMedicationAdministration,
//   IObservation
// } from '@ahryman40k/ts-fhir-types/lib/R4'

import clsx from 'clsx'
import useStyles from './styles'

const Patient = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const classes = useStyles()

  const { open, cohort, patient } = useAppSelector((state) => ({
    open: state.drawer,
    cohort: state.exploredCohort,
    patient: state.patient
  }))

  const loading = patient !== null ? patient.loading : false
  const deidentified = patient !== null ? patient.deidentified ?? false : false

  const search = new URLSearchParams(location.search)
  const groupId = search.get('groupId') ?? undefined

  const { patientId, tabName } = useParams<{
    patientId: string
    tabName: string
  }>()

  const [selectedTab, selectTab] = useState('apercu')
  const [isSidebarOpened, setSidebarOpened] = useState(false)

  useEffect(() => {
    selectTab(tabName || 'apercu')
  }, [tabName])

  useEffect(() => {
    const _fetchPatient = async () => {
      dispatch<any>(
        fetchPatientInfo({
          patientId,
          groupId
        })
      )
    }

    _fetchPatient()
  }, [patientId, groupId])

  if (patient === null && !loading) {
    return <PatientNotExist />
  }

  const handleChangeTabs = (event: any, newTab: string) => {
    selectTab(newTab)
  }

  return loading ? (
    <CircularProgress className={classes.loading} size={50} />
  ) : (
    <Grid
      container
      direction="column"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <TopBar context="patient_info" access={deidentified ? 'Pseudonymisé' : 'Nominatif'} />

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

        <PatientHeader patient={patient?.patientInfo} deidentifiedBoolean={deidentified} />

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
            <Tab
              className={classes.tabTitle}
              label="Médicaments"
              value="medication"
              component={Link}
              to={`/patients/${patientId}/medication${groupId ? `?groupId=${groupId}` : ''}`}
            />
            <Tab
              className={classes.tabTitle}
              label="Biologie"
              value="biology"
              component={Link}
              to={`/patients/${patientId}/biology${groupId ? `?groupId=${groupId}` : ''}`}
            />
          </Tabs>
        </Grid>
        <Grid className={classes.tabContainer}>
          {selectedTab === 'apercu' && (
            <PatientPreview patient={patient?.patientInfo} deidentifiedBoolean={deidentified} />
          )}
          {selectedTab === 'parcours' && (
            <PatientTimeline
              loadingPmsi={(patient?.pmsi?.ccam?.loading || patient?.pmsi?.diagnostic?.loading) ?? false}
              documents={patient?.documents?.list ?? []}
              hospits={patient?.hospits?.list ?? []}
              consults={patient?.pmsi?.ccam?.list ?? []}
              diagnostics={patient?.pmsi?.diagnostic?.list ?? []}
              deidentified={deidentified}
            />
          )}
          {selectedTab === 'documents-cliniques' && <PatientDocs groupId={groupId} />}
          {selectedTab === 'pmsi' && <PatientPMSI groupId={groupId} />}
          {selectedTab === 'medication' && <PatientMedication groupId={groupId} />}
          {selectedTab === 'biology' && <PatientBiology groupId={groupId} />}
        </Grid>

        <PatientSidebar
          openDrawer={isSidebarOpened}
          patients={cohort.originalPatients}
          total={cohort.totalPatients ?? 0}
          onClose={() => setSidebarOpened(false)}
          deidentifiedBoolean={deidentified}
        />
      </Grid>
    </Grid>
  )
}

export default Patient
