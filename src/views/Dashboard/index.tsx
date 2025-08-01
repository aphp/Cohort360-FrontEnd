import React, { useState, useEffect, useContext, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Grid, Tab } from '@mui/material'
import CohortPreview from 'components/Dashboard/Preview/Preview'
import TopBar from 'components/TopBar/TopBar'
import CohortRightOrNotExist from 'components/ErrorView/CohortRightOrNotExist'
import CohortNoPatient from 'components/ErrorView/CohortNoPatient'
import { fetchExploredCohort } from 'state/exploredCohort'
import { useAppSelector, useAppDispatch } from 'state'
import { AppConfig } from 'config'
import { getCleanGroupId } from 'utils/paginationUtils'
import ExplorationBoard from 'components/ExplorationBoard'
import { MedicationLabel, ResourceType } from 'types/requestCriterias'
import { PMSILabel } from 'types/patient'
import { DISPLAY_OPTIONS, URLS } from 'types/exploration'
import { TabsWrapper } from 'components/ui/Tabs'
import { buildExplorationConfig, ExplorationResourceType } from 'components/ExplorationBoard/config/config'
import { useValidatedSubtab } from 'components/ExplorationBoard/useValidatedSubTab'
import { useCleanSearchParams } from 'components/ExplorationBoard/useCleanSearchParams'
import { AccessLevel } from 'components/ui/AccessBadge'
import PageContainer from 'components/ui/PageContainer'

type DashboardProps = {
  context: URLS
}

const Dashboard = ({ context }: DashboardProps) => {
  useCleanSearchParams()
  const dispatch = useAppDispatch()
  const appConfig = useContext(AppConfig)
  const [searchParams] = useSearchParams()
  const subtab = searchParams.get('subtab') as ResourceType
  const groupId = useMemo(() => getCleanGroupId(searchParams.get('groupId')), [searchParams])
  const { tabName } = useParams<{ tabName?: ResourceType }>()
  const [selectedSubTab, setSelectedSubTab] = useState<ResourceType | null>(null)
  const [selectedTab, setSelectedTab] = useState(
    (tabName ?? appConfig.core.fhir.facetsExtensions) ? ResourceType.PREVIEW : ResourceType.PATIENT
  )
  const open = useAppSelector((state) => state.drawer)
  const dashboard = useAppSelector((state) => state.exploredCohort)
  const me = useAppSelector((state) => state.me)
  const config = useMemo(
    () => buildExplorationConfig(!!dashboard.deidentifiedBoolean, null, groupId ? [groupId] : []),
    [dashboard.deidentifiedBoolean, groupId]
  )

  const selectedConfig = useMemo(
    () =>
      config.get(
        (selectedSubTab ?? selectedTab) as ExplorationResourceType,
        selectedSubTab === ResourceType.PATIENT || selectedTab === ResourceType.PATIENT
          ? { ...DISPLAY_OPTIONS, diagrams: true }
          : undefined
      ),
    [config, selectedSubTab, selectedTab]
  )

  useEffect(() => {
    setSelectedSubTab(subtab)
  }, [subtab])

  useEffect(() => {
    setSelectedTab(tabName ?? ResourceType.PREVIEW)
  }, [tabName])

  const handleChangeTab = (newTab: ResourceType) => {
    setSelectedTab(newTab)
    setSelectedSubTab(null)
  }

  const availableTabs = useMemo(() => {
    const baseTabs = [
      ...(appConfig.core.fhir.facetsExtensions
        ? [
            {
              label: 'Aperçu',
              value: ResourceType.PREVIEW,
              to: `/${context}/${ResourceType.PREVIEW}`,
              show: true
            }
          ]
        : []),
      { label: 'Patients', value: ResourceType.PATIENT, to: `/${context}/${ResourceType.PATIENT}`, show: true },
      {
        label: 'Documents',
        value: ResourceType.DOCUMENTS,
        to: `/${context}/${ResourceType.DOCUMENTS}`,
        show: appConfig.features.documentReference.enabled
      },
      {
        label: 'PMSI',
        value: ResourceType.CONDITION,
        to: `/${context}/${ResourceType.CONDITION}`,
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
        to: `/${context}/${ResourceType.MEDICATION_REQUEST}`,
        show: true,
        subs: [
          { label: MedicationLabel.PRESCRIPTION, value: ResourceType.MEDICATION_REQUEST },
          { label: MedicationLabel.ADMINISTRATION, value: ResourceType.MEDICATION_ADMINISTRATION }
        ]
      },
      { label: 'Biologie', value: ResourceType.OBSERVATION, to: `/${context}/${ResourceType.OBSERVATION}`, show: true },
      {
        label: 'Imagerie',
        value: ResourceType.IMAGING,
        to: `/${context}/${ResourceType.IMAGING}`,
        show: appConfig.features.imaging.enabled
      },
      {
        label: 'Dossiers de Spécialité',
        value: ResourceType.QUESTIONNAIRE_RESPONSE,
        to: `/${context}/${ResourceType.QUESTIONNAIRE_RESPONSE}`,
        show: appConfig.features.questionnaires.enabled && !dashboard.deidentifiedBoolean
      }
    ]
    return baseTabs.filter((tab) => tab.show)
  }, [context, appConfig, dashboard])

  const subTabs = useMemo(
    () => availableTabs.find((elem) => elem.value === selectedTab)?.subs ?? null,
    [selectedTab, availableTabs]
  )
  const validatedSubtab = useValidatedSubtab(subTabs)

  useEffect(() => {
    setSelectedSubTab(validatedSubtab)
  }, [validatedSubtab])

  useEffect(() => {
    dispatch(fetchExploredCohort({ context, id: groupId }))
  }, [context, groupId, dispatch])

  if (dashboard.loading === false && dashboard.rightToExplore === false) return <CohortRightOrNotExist />
  else if (dashboard.loading === false && dashboard.totalPatients === 0) return <CohortNoPatient />
  return (
    <PageContainer alignItems="center">
      <TopBar
        context={context}
        access={dashboard.deidentifiedBoolean ? AccessLevel.DEIDENTIFIED : AccessLevel.NOMINATIVE}
      />
      <Grid container size={12} display="flex" sx={{ justifyContent: 'center' }}>
        <Grid container size={12} display="flex" sx={{ justifyContent: 'center' }}>
          <Grid container display="flex" size={12} sx={{ justifyContent: 'center', backgroundColor: '#e6f1fd' }}>
            <Grid size={11}>
              <TabsWrapper
                id="mainTabs"
                scrollButtons={'auto'}
                variant="scrollable"
                value={selectedTab}
                onChange={(_, tab) => handleChangeTab(tab)}
              >
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
                      to={`${tab.to}?${groupIdParam}${subtabParam}`}
                    />
                  )
                })}
              </TabsWrapper>
            </Grid>
          </Grid>
          {subTabs && (
            <Grid size={11} sx={{ borderBottom: '1px solid #848484' }}>
              <TabsWrapper
                id="subTabs"
                value={selectedSubTab}
                onChange={(_, newSubTab) => setSelectedSubTab(newSubTab)}
                customVariant="secondary"
              >
                {subTabs.map((subTab) => {
                  const groupIdParam = groupId ? `groupId=${groupId}` : ''
                  return (
                    <Tab
                      sx={{ fontSize: 12 }}
                      key={subTab.value}
                      label={subTab.label}
                      value={subTab.value}
                      component={Link}
                      to={`/${context}/${selectedTab}?${groupIdParam}&subtab=${subTab.value}`}
                    />
                  )
                })}
              </TabsWrapper>
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid container size={11} sx={{ alignItems: 'center', flexDirection: 'column' }}>
        {selectedTab === ResourceType.PREVIEW ? (
          <CohortPreview
            cohortId={
              context === URLS.COHORT || context === URLS.PERIMETERS
                ? groupId
                : context === URLS.PATIENTS
                  ? me?.topLevelCareSites?.join(',')
                  : undefined
            }
            total={dashboard.totalPatients}
            agePyramidData={dashboard.agePyramidData}
            genderRepartitionMap={dashboard.genderRepartitionMap}
            monthlyVisitData={dashboard.monthlyVisitData}
            visitTypeRepartitionData={dashboard.visitTypeRepartitionData}
            loading={dashboard.loading}
          />
        ) : (
          <>{selectedConfig && <ExplorationBoard config={selectedConfig} />}</>
        )}
      </Grid>
    </PageContainer>
  )
}

export default Dashboard
