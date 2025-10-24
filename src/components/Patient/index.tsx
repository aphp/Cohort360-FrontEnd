import React, { useContext, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Grid, Tab } from '@mui/material'
import PatientHeader from 'components/Patient/PatientHeader/PatientHeader'
import PatientPreview from 'components/Patient/PatientPreview/PatientPreview'
import PatientTimeline from 'components/Patient/PatientTimeline'
import { AppConfig } from 'config'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ExplorationBoard from 'components/ExplorationBoard'
import { MedicationLabel, ResourceType } from 'types/requestCriterias'
import { PMSILabel } from 'types/patient'
import { TabsWrapper } from 'components/ui/Tabs'
import { SidebarButton, SidebarWrapper } from 'components/ui/Sidebar/style'
import { buildExplorationConfig, ExplorationResourceType } from 'components/ExplorationBoard/config/config'
import { Patient as PatientType } from 'types/exploration'
import { useTabs } from 'hooks/tabs/useTabs'
import CohortRightOrNotExist from 'components/ErrorView/CohortRightOrNotExist'

const SIDEBAR_OPTONS = {
  myFilters: false,
  filterBy: true,
  criterias: true,
  search: true,
  diagrams: false,
  count: false,
  orderBy: true,
  saveFilters: false,
  sidebar: true
}

type PatientBoardProps = {
  patient: PatientType
}

const PatientBoard = ({ patient }: PatientBoardProps) => {
  const config = useContext(AppConfig)
  const [isSidebarOpened, setIsSidebarOpened] = useState(false)

  const tabConfig = useMemo(
    () => [
      { label: 'Aperçu patient', value: ResourceType.PREVIEW, show: true },
      { label: 'Parcours patient', value: ResourceType.TIMELINE, show: true },
      {
        label: 'Documents cliniques',
        value: ResourceType.DOCUMENTS,
        show: config.features.documentReference.enabled && !patient.deidentified
      },
      {
        label: 'PMSI',
        value: ResourceType.CONDITION,
        show: true,
        subs: [
          { label: PMSILabel.DIAGNOSTIC, value: ResourceType.CONDITION },
          { label: PMSILabel.CCAM, value: ResourceType.PROCEDURE }
          // { label: PMSILabel.GHM, value: ResourceType.CLAIM }
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
        label: 'Dossiers de Spécialité',
        value: ResourceType.QUESTIONNAIRE_RESPONSE,
        show: config.features.questionnaires.enabled && !patient.deidentified,
        subs: [{ label: 'Maternité', value: ResourceType.QUESTIONNAIRE_RESPONSE }]
      }
    ],
    [config, patient]
  )
  const { availableTabs, subTabs, selectedTab, selectedSubTab, handleChangeTab, handleChangeSubTab } =
    useTabs(tabConfig)

  const expConfig = useMemo(() => {
    const groupIds = patient?.groupId ? [patient?.groupId] : []
    return buildExplorationConfig(!!patient.deidentified, patient, groupIds)
  }, [patient])

  const sidebarConfig = useMemo(() => expConfig.get(ResourceType.PATIENT, SIDEBAR_OPTONS), [expConfig])
  const selectedConfig = useMemo(
    () => expConfig.get((selectedSubTab ?? selectedTab) as ExplorationResourceType),
    [expConfig, selectedSubTab, selectedTab]
  )

  if (
    patient &&
    ((selectedTab === ResourceType.DOCUMENTS && patient.deidentified) || selectedTab === ResourceType.CLAIM)
  )
    return <CohortRightOrNotExist />

  return (
    <>
      <SidebarButton role="button" onClick={() => setIsSidebarOpened(true)}>
        <ChevronLeftIcon color="action" width="20px" />
      </SidebarButton>
      <PatientHeader patient={patient} groupId={patient.groupId} />
      <Grid container sx={{ flexDirection: 'column', alignItems: 'center', backgroundColor: '#E6F1FD' }}>
        <Grid container size={11}>
          <TabsWrapper
            value={selectedTab}
            onChange={(_, tab) => handleChangeTab(tab)}
            id="mainTabs"
            scrollButtons={'auto'}
            variant="scrollable"
          >
            {availableTabs.map((tab) => {
              const groupIdParam = patient.groupId ? `groupId=${patient.groupId}&` : ''
              const defaultSubTab = tab.subs?.[0]?.value
              const subtabParam = defaultSubTab ? `subtab=${defaultSubTab}` : ''
              return (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                  component={Link}
                  to={`/patients/${patient.id}/${tab.value}?${groupIdParam}${subtabParam}`}
                />
              )
            })}
          </TabsWrapper>
        </Grid>
      </Grid>
      <Grid container sx={{ justifyContent: 'center' }}>
        <Grid container size={11}>
          {subTabs && (
            <Grid container sx={{ borderBottom: '1px solid #848484' }}>
              <TabsWrapper
                customVariant="secondary"
                value={selectedSubTab}
                onChange={(_, newSubTab) => handleChangeSubTab(newSubTab)}
              >
                {subTabs.map((subTab) => {
                  return (
                    <Tab
                      sx={{ fontSize: 12 }}
                      key={subTab.value}
                      label={subTab.label}
                      value={subTab.value}
                      component={Link}
                      to={`/patients/${patient.id}/${selectedTab}?${patient.groupId ? `${patient.groupId}&` : ''}subtab=${subTab.value}`}
                    />
                  )
                })}
              </TabsWrapper>
            </Grid>
          )}
          {selectedTab === ResourceType.PREVIEW && <PatientPreview patient={patient} />}
          {selectedTab === ResourceType.TIMELINE && (
            <PatientTimeline
              hospits={patient.infos.hospits}
              procedures={patient.infos.procedures}
              diagnostics={patient.infos.diagnostics}
              deidentified={patient.deidentified}
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
    </>
  )
}

export default PatientBoard
