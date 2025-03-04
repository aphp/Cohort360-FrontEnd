import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { IconButton, Grid, Tabs as TabsMui, Tab, CircularProgress } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import PatientNotExist from 'components/ErrorView/PatientNotExist'
import PatientHeader from 'components/Patient/PatientHeader/PatientHeader'
import PatientPreview from 'components/Patient/PatientPreview/PatientPreview'
import PatientSidebar from 'components/Patient/PatientSidebar/PatientSidebar'
import PatientTimeline from 'components/Patient/PatientTimeline/PatientTimeline'
import TopBar from 'components/TopBar/TopBar'
import useStyles from './styles'
import { useAppSelector, useAppDispatch } from 'state'
import { fetchPatientInfo } from 'state/patient'
import { AppConfig } from 'config'
import { getCleanGroupId } from 'utils/paginationUtils'
import ExplorationBoard from 'components/ExplorationBoard'
import { getAlertMessages } from 'utils/exploration'
import { MedicationLabel, ResourceType } from 'types/requestCriterias'
import Tabs from 'components/ui/Tabs'
import { getMedicationTab, getPMSITab } from 'utils/tabsUtils'
import { MedicationTab, PmsiTab } from 'types'
import { PMSILabel } from 'types/patient'

export const PMSITabs: PmsiTab[] = [
  { label: PMSILabel.DIAGNOSTIC, id: ResourceType.CONDITION },
  { label: PMSILabel.CCAM, id: ResourceType.PROCEDURE },
  { label: PMSILabel.GHM, id: ResourceType.CLAIM }
]

export const medicationTabs: MedicationTab[] = [
  { id: ResourceType.MEDICATION_REQUEST, label: MedicationLabel.PRESCRIPTION },
  { id: ResourceType.MEDICATION_ADMINISTRATION, label: MedicationLabel.ADMINISTRATION }
]

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
  const ODD_FORMS = config.features.questionnaires.enabled

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
    console.log('test tab', newTab)
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

        <Grid container md={11} className={classes.tabs}>
          <TabsMui value={selectedTab} onChange={handleChangeTabs} classes={{ indicator: classes.indicator }}>
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Aperçu patient"
              value="preview"
              component={Link}
              to={`/patients/${patientId}/preview${location.search}`}
            />
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Parcours patient"
              value="timeline"
              component={Link}
              to={`/patients/${patientId}/timeline${location.search}`}
            />
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Documents cliniques"
              value={ResourceType.DOCUMENTS}
              component={Link}
              to={`/patients/${patientId}/documents${location.search}`}
            />
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="PMSI"
              value={ResourceType.CONDITION}
              component={Link}
              to={`/patients/${patientId}/pmsi${location.search}`}
            />
            {ODD_MEDICATION && (
              <Tab
                classes={{ selected: classes.selected }}
                className={classes.tabTitle}
                label="Médicaments"
                value={ResourceType.MEDICATION_REQUEST}
                component={Link}
                to={`/patients/${patientId}/medication${location.search}`}
              />
            )}
            {ODD_BIOLOGY && (
              <Tab
                classes={{ selected: classes.selected }}
                className={classes.tabTitle}
                label="Biologie"
                value={ResourceType.OBSERVATION}
                component={Link}
                to={`/patients/${patientId}/biology${location.search}`}
              />
            )}
            {ODD_IMAGING && (
              <Tab
                classes={{ selected: classes.selected }}
                className={classes.tabTitle}
                label="Imagerie"
                value={ResourceType.IMAGING}
                component={Link}
                to={`/patients/${patientId}/imaging${location.search}`}
              />
            )}
            {ODD_FORMS && !deidentified && (
              <Tab
                classes={{ selected: classes.selected }}
                className={classes.tabTitle}
                label="Formulaires"
                value={ResourceType.QUESTIONNAIRE_RESPONSE}
                component={Link}
                to={`/patients/${patientId}/forms${location.search}`}
              />
            )}
          </TabsMui>
        </Grid>

        <Grid container sm={11} className={classes.tabContainer}>
          {(selectedTab === ResourceType.CONDITION ||
            selectedTab === ResourceType.CLAIM ||
            selectedTab === ResourceType.PROCEDURE) && (
            <Tabs
              values={PMSITabs}
              active={getPMSITab(selectedTab)}
              onchange={(value: PmsiTab) => {
                setSelectedTab(value.id)
                // setSearchParams({ ...searchParams, tabId: value.id })
              }}
            />
          )}
          {(selectedTab === ResourceType.MEDICATION_ADMINISTRATION ||
            selectedTab === ResourceType.MEDICATION_REQUEST) && (
            <Tabs
              values={medicationTabs}
              active={getMedicationTab(selectedTab)}
              onchange={(value: MedicationTab) => {
                setSelectedTab(value.id)
                //setSearchParams({ ...existingParams, tabId: value.id })
              }}
            />
          )}
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
          {(selectedTab === ResourceType.DOCUMENTS ||
            selectedTab === ResourceType.OBSERVATION ||
            selectedTab === ResourceType.IMAGING ||
            selectedTab === ResourceType.CONDITION ||
            selectedTab === ResourceType.PROCEDURE ||
            selectedTab === ResourceType.CLAIM ||
            selectedTab === ResourceType.MEDICATION_ADMINISTRATION ||
            selectedTab === ResourceType.MEDICATION_REQUEST ||
            (selectedTab === ResourceType.QUESTIONNAIRE_RESPONSE && !deidentified)) && (
            <ExplorationBoard
              deidentified={deidentified}
              type={selectedTab}
              messages={getAlertMessages(selectedTab, deidentified)}
              groupId={patient?.groupId ? [patient?.groupId] : []}
              patient={patient}
            />
          )}
          {/*selectedTab === 'documents' && <PatientDocs />*/}
          {/*selectedTab === 'pmsi' && <PatientPMSI />*/}
          {/*ODD_MEDICATION && selectedTab === 'medication' && <PatientMedication />*/}
          {/*ODD_BIOLOGY && selectedTab === 'biology' && <PatientBiology />*/}
          {/*ODD_IMAGING && selectedTab === 'imaging' && <PatientImaging />*/}
          {/*ODD_FORMS && selectedTab === 'forms' && !deidentified && <PatientForms />*/}
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
