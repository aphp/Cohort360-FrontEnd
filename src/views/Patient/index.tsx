import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Grid, Tabs, Tab, CircularProgress } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import PatientNotExist from 'components/ErrorView/PatientNotExist'
import PatientHeader from 'components/Patient/PatientHeader/PatientHeader'
import PatientPreview from 'components/Patient/PatientPreview/PatientPreview'
import PatientTimeline from 'components/Patient/PatientTimeline/PatientTimeline'
import TopBar from 'components/TopBar/TopBar'
import { useAppSelector, useAppDispatch } from 'state'
import { fetchPatientInfo } from 'state/patient'
import { AppConfig } from 'config'
import { getCleanGroupId } from 'utils/paginationUtils'
import ExplorationBoard from 'components/ExplorationBoard'
import { MedicationLabel, ResourceType } from 'types/requestCriterias'
import { PMSILabel } from 'types/patient'
import { URLS } from 'types/exploration'
import sideBarTransition from 'styles/sideBarTransition'
import { MainTabsWrapper } from 'components/ui/Tabs/style'
import { SidebarButton, SidebarWrapper } from 'components/ui/Sidebar/style'
import { buildExplorationConfig, ExplorationConfigFor } from 'components/ExplorationBoard/config/config'

const SIDEBAR_OPTONS = {
  myFilters: false,
  filterBy: true,
  criterias: true,
  search: true,
  diagrams: false,
  count: false,
  orderBy: true,
  saveFilters: false
}

const Patient = () => {
  const dispatch = useAppDispatch()
  const { classes, cx } = sideBarTransition()
  const config = useContext(AppConfig)
  const open = useAppSelector((state) => state.drawer)
  const patient = useAppSelector((state) => state.patient)
  const loading = patient !== null ? patient.loading : false
  const deidentified = patient !== null ? patient.deidentified ?? false : false
  const [searchParams] = useSearchParams()
  const subtab = searchParams.get('subtab') as ResourceType
  const groupId = useMemo(() => getCleanGroupId(searchParams.get('groupId')), [searchParams])
  const groupIds = useMemo(() => (patient?.groupId ? [patient?.groupId] : []), [patient?.groupId])
  const { patientId, tabName } = useParams<{
    patientId?: string
    tabName?: ResourceType
  }>()
  const [selectedTab, setSelectedTab] = useState<ResourceType>(tabName ?? ResourceType.PREVIEW)
  const [selectedSubTab, setSelectedSubTab] = useState<ResourceType | null>(null)
  const [isSidebarOpened, setIsSidebarOpened] = useState(false)
  const expConfig = useMemo(
    () => buildExplorationConfig(deidentified, patient, groupIds),
    [deidentified, groupIds, patient]
  )
  const [selectedConfig, setSelectedConfig] = useState<ExplorationConfigFor<ResourceType> | null>(
    expConfig.get(subtab ?? tabName)
  )
  const sidebarConfig = useMemo(() => expConfig.get(ResourceType.PATIENT, SIDEBAR_OPTONS), [expConfig])

  useEffect(() => {
    setSelectedSubTab(subtab)
  }, [subtab])

  const availableTabs = useMemo(
    () =>
      [
        { label: 'Aperçu patient', value: ResourceType.PREVIEW, show: true },
        { label: 'Parcours patient', value: ResourceType.TIMELINE, show: true },
        { label: 'Documents cliniques', value: ResourceType.DOCUMENTS, show: true },
        {
          label: 'PMSI',
          value: ResourceType.CONDITION,
          show: true,
          subs: [
            { label: PMSILabel.DIAGNOSTIC, value: ResourceType.CONDITION },
            { label: PMSILabel.CCAM, value: ResourceType.PROCEDURE },
            { label: PMSILabel.GHM, value: ResourceType.CLAIM }
          ]
        },
        {
          label: 'Médicaments',
          value: ResourceType.MEDICATION_REQUEST,
          show: config.features.medication.enabled,
          subs: [
            { label: MedicationLabel.PRESCRIPTION, value: ResourceType.MEDICATION_REQUEST },
            { label: MedicationLabel.ADMINISTRATION, value: ResourceType.MEDICATION_ADMINISTRATION }
          ]
        },
        { label: 'Biologie', value: ResourceType.OBSERVATION, show: config.features.observation.enabled },
        { label: 'Imagerie', value: ResourceType.IMAGING, show: config.features.imaging.enabled },
        {
          label: 'Formulaires',
          value: ResourceType.QUESTIONNAIRE_RESPONSE,
          show: config.features.questionnaires.enabled && !!!deidentified
        }
      ].filter((tab) => tab.show),
    [config, deidentified]
  )
  const subTabs = useMemo(
    () => availableTabs.find((elem) => elem.value === selectedTab)?.subs ?? null,
    [selectedTab, availableTabs]
  )

  useEffect(() => {
    const _fetchPatient = async () => {
      if (patientId)
        dispatch(
          fetchPatientInfo({
            patientId,
            groupId
          })
        )
    }
    _fetchPatient()
  }, [patientId, groupId, dispatch])

  const handleChangeTab = (newTab: ResourceType) => {
    setSelectedTab(newTab)
    setSelectedSubTab(null)
    setSelectedConfig(expConfig.get(newTab))
  }

  const handleChangeSubTab = (newTab: ResourceType) => {
    setSelectedSubTab(newTab)
    setSelectedConfig(expConfig.get(newTab))
  }

  if (patient === null && !loading) return <PatientNotExist />

  return loading ? (
    <Grid container>
      <CircularProgress size={50} />
    </Grid>
  ) : (
    <Grid container direction="column" className={cx(classes.appBar, { [classes.appBarShift]: open })}>
      <TopBar context={URLS.PATIENT} access={deidentified ? 'Pseudonymisé' : 'Nominatif'} />
      <SidebarButton role="button" onClick={() => setIsSidebarOpened(true)}>
        <ChevronLeftIcon color="action" width="20px" />
      </SidebarButton>
      <Grid container direction="column" alignItems="center" gap="25px">
        <PatientHeader patient={patient?.patientInfo} deidentifiedBoolean={deidentified} />
        <Grid container md={11}>
          <MainTabsWrapper value={selectedTab} onChange={(_, tab) => handleChangeTab(tab)}>
            {availableTabs.map((tab) => {
              const groupIdParam = groupId ? `groupId=${groupId}` : ''
              const defaultSubTab = tab.subs?.[0]?.value
              const subtabParam = defaultSubTab ? `&subtab=${defaultSubTab}` : ''
              return (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                  component={Link}
                  to={`/patients/${patientId}/${tab.value}?${groupIdParam}${subtabParam}`}
                />
              )
            })}
          </MainTabsWrapper>
        </Grid>
        <Grid container sm={11}>
          {subTabs && (
            <Tabs value={selectedSubTab} onChange={(_, newSubTab) => handleChangeSubTab(newSubTab)}>
              {subTabs.map((subTab) => {
                const groupIdParam = groupId ? `groupId=${groupId}` : ''
                return (
                  <Tab
                    sx={{ fontSize: 12 }}
                    key={subTab.value}
                    label={subTab.label}
                    value={subTab.value}
                    component={Link}
                    to={`/patients/${patientId}/${selectedTab}?${groupIdParam}&subtab=${subTab.value}`}
                  />
                )
              })}
            </Tabs>
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
            <>{selectedConfig && <ExplorationBoard config={selectedConfig} />}</>
          )}
        </Grid>

        <SidebarWrapper anchor="right" keepMounted open={isSidebarOpened} onClose={() => setIsSidebarOpened(false)}>
          <Grid container padding="10px 10px 0px 10px">
            {sidebarConfig && <ExplorationBoard config={sidebarConfig} />}
          </Grid>
        </SidebarWrapper>
      </Grid>
    </Grid>
  )
}

export default Patient
