import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { IconButton, Grid, Tabs, Tab, CircularProgress } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import PatientNotExist from 'components/ErrorView/PatientNotExist'
import PatientDocs from 'components/Patient/PatientDocs/PatientDocs'
import PatientHeader from 'components/Patient/PatientHeader/PatientHeader'
import PatientPreview from 'components/Patient/PatientPreview/PatientPreview'
import PatientSidebar from 'components/Patient/PatientSidebar/PatientSidebar'
import PatientTimeline from 'components/Patient/PatientTimeline/PatientTimeline'
import PatientMedication from 'components/Patient/PatientMedication/PatientMedication'
import PatientBiology from 'components/Patient/PatientBiology/PatientBiology'
import PatientImaging from 'components/Patient/PatientImaging/PatientImaging'
import PatientPMSI from 'components/Patient/PatientPMSI/PatientPMSI'
import PatientForms from 'components/Patient/PatientForms'
import TopBar from 'components/TopBar/TopBar'
import useStyles from './styles'
import { useAppSelector, useAppDispatch } from 'state'
import { fetchPatientInfo } from 'state/patient'
import { AppConfig } from 'config'

const Patient = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { classes, cx } = useStyles()
  const config = useContext(AppConfig)
  const open = useAppSelector((state) => state.drawer)
  const cohort = useAppSelector((state) => state.exploredCohort)
  const patient = useAppSelector((state) => state.patient)
  const loading = patient !== null ? patient.loading : false
  const deidentified = patient !== null ? patient.deidentified ?? false : false
  const ODD_MEDICATION = config.features.medication.enabled
  const ODD_BIOLOGY = config.features.observation.enabled
  const ODD_IMAGING = config.features.imaging.enabled

  const search = new URLSearchParams(location.search)
  const groupId = search.get('groupId') ?? undefined

  const { patientId, tabName } = useParams<{
    patientId: string
    tabName: string
  }>()

  const [selectedTab, selectTab] = useState('preview')
  const [isSidebarOpened, setSidebarOpened] = useState(false)

  useEffect(() => {
    selectTab(tabName || 'preview')
  }, [tabName])

  useEffect(() => {
    const _fetchPatient = async () => {
      dispatch(
        fetchPatientInfo({
          // @ts-ignore
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

  const handleChangeTabs = (event: React.SyntheticEvent<Element, Event>, newTab: string) => {
    selectTab(newTab)
  }

  return loading ? (
    <CircularProgress className={classes.loading} size={50} />
  ) : (
    <Grid
      container
      direction="column"
      className={cx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <TopBar context="patient_info" access={deidentified ? 'Pseudonymisé' : 'Nominatif'} />

      <Grid
        container
        direction="column"
        alignItems="center"
        className={cx(isSidebarOpened ? classes.contentShift : null)}
      >
        {!isSidebarOpened && (
          <div className={classes.openLeftBar}>
            <IconButton onClick={() => setSidebarOpened(true)}>
              <ChevronLeftIcon color="action" width="20px" />
            </IconButton>
          </div>
        )}

        <PatientHeader patient={patient?.patientInfo} deidentifiedBoolean={deidentified} />

        <Grid container md={11}>
          <Tabs value={selectedTab} onChange={handleChangeTabs} textColor="primary" indicatorColor="secondary">
            <Tab
              className={classes.tabTitle}
              label="Aperçu patient"
              value="preview"
              component={Link}
              to={`/patients/${patientId}/preview${groupId ? `?groupId=${groupId}` : ''}`}
            />
            <Tab
              className={classes.tabTitle}
              label="Parcours patient"
              value="timeline"
              component={Link}
              to={`/patients/${patientId}/timeline${groupId ? `?groupId=${groupId}` : ''}`}
            />
            <Tab
              className={classes.tabTitle}
              label="Documents cliniques"
              value="clinical-documents"
              component={Link}
              to={`/patients/${patientId}/clinical-documents${groupId ? `?groupId=${groupId}` : ''}`}
            />
            <Tab
              className={classes.tabTitle}
              label="PMSI"
              value="pmsi"
              component={Link}
              to={`/patients/${patientId}/pmsi${groupId ? `?groupId=${groupId}` : ''}`}
            />
            {ODD_MEDICATION && (
              <Tab
                className={classes.tabTitle}
                label="Médicaments"
                value="medication"
                component={Link}
                to={`/patients/${patientId}/medication${groupId ? `?groupId=${groupId}` : ''}`}
              />
            )}
            {ODD_BIOLOGY && (
              <Tab
                className={classes.tabTitle}
                label="Biologie"
                value="biology"
                component={Link}
                to={`/patients/${patientId}/biology${groupId ? `?groupId=${groupId}` : ''}`}
              />
            )}
            {ODD_IMAGING && (
              <Tab
                className={classes.tabTitle}
                label="Imagerie"
                value="imaging"
                component={Link}
                to={`/patients/${patientId}/imaging${groupId ? `?groupId=${groupId}` : ''}`}
              />
            )}
            {config.features.questionnaires.enabled && !deidentified && (
              <Tab
                className={classes.tabTitle}
                label="Formulaires"
                value="forms"
                component={Link}
                to={`/patients/${patientId}/forms${groupId ? `?groupId=${groupId}` : ''}`}
              />
            )}
          </Tabs>
        </Grid>
        <Grid container sm={11} className={classes.tabContainer}>
          {selectedTab === 'preview' && (
            <PatientPreview patient={patient?.patientInfo} deidentifiedBoolean={deidentified} />
          )}
          {selectedTab === 'timeline' && (
            <PatientTimeline
              loadingPmsi={(patient?.pmsi?.procedure?.loading || patient?.pmsi?.condition?.loading) ?? false}
              documents={patient?.documents?.list ?? []}
              hospits={patient?.hospits?.list ?? []}
              consults={patient?.pmsi?.procedure?.list ?? []}
              diagnostics={patient?.pmsi?.condition?.list ?? []}
              deidentified={deidentified}
            />
          )}
          {selectedTab === 'clinical-documents' && <PatientDocs groupId={groupId} />}
          {selectedTab === 'pmsi' && <PatientPMSI groupId={groupId} />}
          {ODD_MEDICATION && selectedTab === 'medication' && <PatientMedication groupId={groupId} />}
          {ODD_BIOLOGY && selectedTab === 'biology' && <PatientBiology groupId={groupId} />}
          {ODD_IMAGING && selectedTab === 'imaging' && <PatientImaging groupId={groupId} />}
          {config.features.questionnaires.enabled && selectedTab === 'forms' && !deidentified && (
            <PatientForms groupId={groupId} />
          )}
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
