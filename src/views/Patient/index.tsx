import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { IconButton, Grid, Tabs as TabsMui, Tab, CircularProgress, Drawer } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import PatientNotExist from 'components/ErrorView/PatientNotExist'
import PatientHeader from 'components/Patient/PatientHeader/PatientHeader'
import PatientPreview from 'components/Patient/PatientPreview/PatientPreview'
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
import { DATA_DISPLAY } from 'types/exploration'

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
  const patient = useAppSelector((state) => state.patient)
  const loading = patient !== null ? patient.loading : false
  const deidentified = patient !== null ? patient.deidentified ?? false : false
  const ODD_MEDICATION = config.features.medication.enabled
  const ODD_BIOLOGY = config.features.observation.enabled
  const ODD_IMAGING = config.features.imaging.enabled
  const ODD_FORMS = config.features.questionnaires.enabled
  const [searchParams] = useSearchParams()
  const groupId = getCleanGroupId(searchParams.get('groupId'))
  const groupIds = useMemo(() => (patient?.groupId ? [patient?.groupId] : []), [patient?.groupId])
  const { patientId, tabName } = useParams<{
    patientId: string
    tabName: ResourceType
  }>()
  const [selectedTab, setSelectedTab] = useState(tabName ?? ResourceType.PREVIEW)
  const [isSidebarOpened, setIsSidebarOpened] = useState(false)
  const sidebarOptions = useMemo(
    () => ({
      myFilters: false,
      filterBy: true,
      criterias: true,
      search: true,
      diagrams: false,
      count: false,
      orderBy: true,
      saveFilters: false,
      display: DATA_DISPLAY.INFO
    }),
    []
  )

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

  const handleChangeTabs = (event: React.SyntheticEvent<Element, Event>, newTab: ResourceType) => {
    setSelectedTab(newTab)
  }
  if (patient === null && !loading) return <PatientNotExist />

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
        <div className={classes.openLeftBar}>
          <IconButton onClick={() => setIsSidebarOpened(true)}>
            <ChevronLeftIcon color="action" width="20px" />
          </IconButton>
        </div>

        <PatientHeader patient={patient?.patientInfo} deidentifiedBoolean={deidentified} />

        <Grid container md={11} className={classes.tabs}>
          <TabsMui value={selectedTab} onChange={handleChangeTabs} classes={{ indicator: classes.indicator }}>
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Aperçu patient"
              value={ResourceType.PREVIEW}
              component={Link}
              to={`/patients/${patientId}/preview${location.search}`}
            />
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Parcours patient"
              value={ResourceType.TIMELINE}
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
          {selectedTab === ResourceType.PREVIEW && (
            <PatientPreview patient={patient?.patientInfo} deidentifiedBoolean={deidentified} />
          )}
          {selectedTab === ResourceType.TIMELINE && (
            <PatientTimeline
              loadingPmsi={(patient?.pmsi?.procedure?.loading || patient?.pmsi?.condition?.loading) ?? false}
              documents={patient?.documents?.list ?? []}
              hospits={patient?.hospits?.list ?? []}
              consults={patient?.pmsi?.procedure?.list ?? []}
              diagnostics={patient?.pmsi?.condition?.list ?? []}
              deidentified={deidentified}
            />
          )}
          {!(selectedTab === ResourceType.PREVIEW || selectedTab === ResourceType.TIMELINE) && (
            <ExplorationBoard
              deidentified={deidentified}
              type={selectedTab}
              messages={getAlertMessages(selectedTab, deidentified)}
              groupId={patient?.groupId ? [patient?.groupId] : []}
              patient={patient}
            />
          )}
        </Grid>

        <Drawer
          anchor="right"
          keepMounted
          sx={{ width: '400px' }}
          classes={{ paper: classes.paper }}
          open={isSidebarOpened}
          onClose={() => setIsSidebarOpened(false)}
        >
          <Grid container padding="10px 10px 0px 10px">
            <ExplorationBoard
              deidentified={deidentified}
              type={ResourceType.PATIENT}
              groupId={groupIds}
              displayOptions={sidebarOptions}
            />
          </Grid>
        </Drawer>
      </Grid>
    </Grid>
  )
}

export default Patient
