import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { IconButton, Grid, Tabs, Tab, CircularProgress } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import PatientNotExist from 'components/ErrorView/PatientNotExist'
import PatientDocs from 'components/Patient/PatientDocs'
import PatientHeader from 'components/Patient/PatientHeader/PatientHeader'
import PatientPreview from 'components/Patient/PatientPreview/PatientPreview'
import PatientSidebar from 'components/Patient/PatientSidebar/PatientSidebar'
import PatientTimeline from 'components/Patient/PatientTimeline/PatientTimeline'
import PatientMedication from 'components/Patient/PatientMedication'
import PatientBiology from 'components/Patient/PatientBiology'
import PatientImaging from 'components/Patient/PatientImaging'
import PatientPMSI from 'components/Patient/PatientPMSI'
import PatientForms from 'components/Patient/PatientForms'
import TopBar from 'components/TopBar/TopBar'
import useStyles from './styles'
import { useAppSelector, useAppDispatch } from 'state'
import { fetchPatientInfo } from 'state/patient'
import { AppConfig } from 'config'
import { getCleanGroupId } from 'utils/paginationUtils'

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

  const [searchParams] = useSearchParams()
  const groupId = getCleanGroupId(searchParams.get('groupId'))

  const { patientId, tabName } = useParams<{
    patientId: string
    tabName: string
  }>()

  const [selectedTab, setSelectedTab] = useState(tabName ?? 'preview')
  const [isSidebarOpened, setIsSidebarOpened] = useState(false)

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
    setSelectedTab(newTab)
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
            <IconButton onClick={() => setIsSidebarOpened(true)}>
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
              to={`/patients/${patientId}/preview${location.search}`}
            />
            <Tab
              className={classes.tabTitle}
              label="Parcours patient"
              value="timeline"
              component={Link}
              to={`/patients/${patientId}/timeline${location.search}`}
            />
            <Tab
              className={classes.tabTitle}
              label="Documents cliniques"
              value="documents"
              component={Link}
              to={`/patients/${patientId}/documents${location.search}`}
            />
            <Tab
              className={classes.tabTitle}
              label="PMSI"
              value="pmsi"
              component={Link}
              to={`/patients/${patientId}/pmsi${location.search}`}
            />
            {ODD_MEDICATION && (
              <Tab
                className={classes.tabTitle}
                label="Médicaments"
                value="medication"
                component={Link}
                to={`/patients/${patientId}/medication${location.search}`}
              />
            )}
            {ODD_BIOLOGY && (
              <Tab
                className={classes.tabTitle}
                label="Biologie"
                value="biology"
                component={Link}
                to={`/patients/${patientId}/biology${location.search}`}
              />
            )}
            {ODD_IMAGING && (
              <Tab
                className={classes.tabTitle}
                label="Imagerie"
                value="imaging"
                component={Link}
                to={`/patients/${patientId}/imaging${location.search}`}
              />
            )}
            {config.features.questionnaires.enabled && !deidentified && (
              <Tab
                className={classes.tabTitle}
                label="Dossiers de Spécialité"
                value="forms"
                component={Link}
                to={`/patients/${patientId}/forms${location.search}`}
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
          {selectedTab === 'documents' && <PatientDocs />}
          {selectedTab === 'pmsi' && <PatientPMSI />}
          {ODD_MEDICATION && selectedTab === 'medication' && <PatientMedication />}
          {ODD_BIOLOGY && selectedTab === 'biology' && <PatientBiology />}
          {ODD_IMAGING && selectedTab === 'imaging' && <PatientImaging />}
          {config.features.questionnaires.enabled && selectedTab === 'forms' && !deidentified && <PatientForms />}
        </Grid>

        <PatientSidebar
          openDrawer={isSidebarOpened}
          patients={cohort.originalPatients}
          total={cohort.totalPatients ?? 0}
          onClose={() => setIsSidebarOpened(false)}
          deidentifiedBoolean={deidentified}
        />
      </Grid>
    </Grid>
  )
}

export default Patient
