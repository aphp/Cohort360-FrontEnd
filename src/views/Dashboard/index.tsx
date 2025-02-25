import React, { useState, useEffect, useContext, useMemo } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Grid, Tabs as TabsMui, Tab } from '@mui/material'
import CohortPreview from 'components/Dashboard/Preview/Preview'
import Documents from 'components/Dashboard/Documents'
import TopBar from 'components/TopBar/TopBar'
import CohortCreation from 'views/CohortCreation/CohortCreation'
import CohortRightOrNotExist from 'components/ErrorView/CohortRightOrNotExist'
import CohortNoPatient from 'components/ErrorView/CohortNoPatient'
import { fetchExploredCohort } from 'state/exploredCohort'
import useStyles from './styles'
import { useAppSelector, useAppDispatch } from 'state'
import ImagingList from 'components/Dashboard/ImagingList'
import { AppConfig } from 'config'
import MedicationList from 'components/Dashboard/MedicationList'
import BiologyList from 'components/Dashboard/BiologyList'
import FormsList from 'components/Dashboard/FormsList'
import { getCleanGroupId } from 'utils/paginationUtils'
import ExplorationBoard from 'components/ExplorationBoard'
import { MedicationLabel, ResourceType } from 'types/requestCriterias'
import { MedicationTab, PmsiTab, TabType } from 'types'
import { PMSILabel } from 'types/patient'
import Tabs from 'components/ui/Tabs'
import { getMedicationTab, getPMSITab } from 'utils/tabsUtils'
import { getAlertMessages } from 'utils/exploration'
import { URLS } from 'types/exploration'

type Tabs = { label: string; value: string; to: string; disabled?: boolean } | undefined

export const PMSITabs: PmsiTab[] = [
  { label: PMSILabel.DIAGNOSTIC, id: ResourceType.CONDITION },
  { label: PMSILabel.CCAM, id: ResourceType.PROCEDURE },
  { label: PMSILabel.GHM, id: ResourceType.CLAIM }
]

export const medicationTabs: MedicationTab[] = [
  { id: ResourceType.MEDICATION_REQUEST, label: MedicationLabel.PRESCRIPTION },
  { id: ResourceType.MEDICATION_ADMINISTRATION, label: MedicationLabel.ADMINISTRATION }
]

type DashboardProps = {
  context: URLS
}

const Dashboard = ({ context }: DashboardProps) => {
  const { tabName } = useParams<{
    tabName?: string
  }>()

  const dispatch = useAppDispatch()
  const { classes, cx } = useStyles()
  const location = useLocation()
  const appConfig = useContext(AppConfig)
  const ODD_IMAGING = appConfig.features.imaging.enabled
  const ODD_QUESTIONNAIRES = appConfig.features.questionnaires.enabled
  const ODD_DOCUMENT_REFERENCE = appConfig.features.documentReference.enabled

  const [searchParams] = useSearchParams()
  const groupIds = getCleanGroupId(searchParams.get('groupId'))

  const [selectedTab, setSelectedTab] = useState((tabName as ResourceType) ?? ResourceType.PREVIEW)

  const open = useAppSelector((state) => state.drawer)
  const dashboard = useAppSelector((state) => state.exploredCohort)
  const me = useAppSelector((state) => state.me)

  const tabs: Tabs[] = useMemo(() => {
    switch (context) {
      case URLS.PATIENTS:
        return [
          { label: 'Aperçu', value: ResourceType.PREVIEW, to: '/my-patients/preview' },
          { label: 'Patients', value: ResourceType.PATIENT, to: '/my-patients/patients' },
          ODD_DOCUMENT_REFERENCE && { label: 'Documents', value: ResourceType.DOCUMENTS, to: '/my-patients/documents' },
          { label: 'PMSI', value: ResourceType.CONDITION, to: '/my-patients/pmsi' },
          { label: 'Médicaments', value: ResourceType.MEDICATION_REQUEST, to: '/my-patients/medication' },
          { label: 'Biologie', value: ResourceType.OBSERVATION, to: '/my-patients/biology' },
          ODD_IMAGING && { label: 'Imagerie', value: ResourceType.IMAGING, to: '/my-patients/imaging' },
          !dashboard.deidentifiedBoolean && {
            label: 'Formulaires',
            value: ResourceType.QUESTIONNAIRE_RESPONSE,
            to: `/my-patients/forms`
          }
        ].filter((e) => e) as Tabs[]
      case URLS.COHORT:
        return [
          {
            label: 'Modifier la requête',
            value: 'creation',
            to: `/cohort/new/${dashboard.requestId}/${dashboard.snapshotId}`
          },
          { label: 'Aperçu cohorte', value: ResourceType.PREVIEW, to: `/cohort/preview?groupId=${groupIds}` },
          { label: 'Données patient', value: ResourceType.PATIENT, to: `/cohort/patients${location.search}` },
          ODD_DOCUMENT_REFERENCE && {
            label: 'Documents cliniques',
            value: ResourceType.DOCUMENTS,
            to: `/cohort/documents${location.search}`
          },
          { label: 'PMSI', value: ResourceType.CONDITION, to: `/cohort/pmsi${location.search}` },
          { label: 'Médicaments', value: ResourceType.MEDICATION_REQUEST, to: `/cohort/medication${location.search}` },
          { label: 'Biologie', value: ResourceType.OBSERVATION, to: `/cohort/biology${location.search}` },
          ODD_IMAGING && { label: 'Imagerie', value: ResourceType.IMAGING, to: `/cohort/imaging${location.search}` },
          ODD_QUESTIONNAIRES &&
            !dashboard.deidentifiedBoolean && {
              label: 'Formulaires',
              value: ResourceType.QUESTIONNAIRE_RESPONSE,
              to: `/cohort/forms${location.search}`
            }
        ].filter((e) => e) as Tabs[]
      case URLS.NEW_COHORT:
        return [
          { label: 'Aperçu cohorte', value: ResourceType.PREVIEW, to: `/cohort/new/preview`, disabled: true },
          { label: 'Données patient', value: ResourceType.PATIENT, to: `/cohort/new/patients`, disabled: true },
          ODD_DOCUMENT_REFERENCE && {
            label: 'Documents cliniques',
            value: ResourceType.DOCUMENTS,
            to: `/cohort/new/documents`,
            disabled: true
          },
          { label: 'PMSI', value: ResourceType.CONDITION, to: `/cohort/new/pmsi` },
          { label: 'Médicaments', value: ResourceType.MEDICATION_REQUEST, to: `/cohort/new/medication` },
          { label: 'Biologie', value: ResourceType.OBSERVATION, to: `/cohort/new/biology` },
          ODD_IMAGING && { label: 'Imagerie', value: ResourceType.IMAGING, to: `/cohort/new/imaging`, disabled: true },
          ODD_QUESTIONNAIRES &&
            !dashboard.deidentifiedBoolean && {
              label: 'Formulaires',
              value: ResourceType.QUESTIONNAIRE_RESPONSE,
              to: `/cohort/new/forms`
            }
        ].filter((e) => e) as Tabs[]
      case URLS.PERIMETERS: {
        return [
          { label: 'Aperçu', value: ResourceType.PREVIEW, to: `/perimeters/preview?groupId=${groupIds}` },
          { label: 'Données patient', value: ResourceType.PATIENT, to: `/perimeters/patients${location.search}` },
          ODD_DOCUMENT_REFERENCE && {
            label: 'Documents cliniques',
            value: ResourceType.DOCUMENTS,
            to: `/perimeters/documents${location.search}`
          },
          { label: 'PMSI', value: ResourceType.CONDITION, to: `/perimeters/pmsi${location.search}` },
          {
            label: 'Médicaments',
            value: ResourceType.MEDICATION_REQUEST,
            to: `/perimeters/medication${location.search}`
          },
          { label: 'Biologie', value: ResourceType.OBSERVATION, to: `/perimeters/biology${location.search}` },
          ODD_IMAGING && {
            label: 'Imagerie',
            value: ResourceType.IMAGING,
            to: `/perimeters/imaging${location.search}`
          },
          ODD_QUESTIONNAIRES &&
            !dashboard.deidentifiedBoolean && {
              label: 'Formulaires',
              value: ResourceType.QUESTIONNAIRE_RESPONSE,
              to: `/perimeters/forms${location.search}`
            }
        ].filter((e) => e) as Tabs[]
      }
    }
  }, [dashboard])

  useEffect(() => {
    if (context !== URLS.NEW_COHORT) {
      dispatch(fetchExploredCohort({ context, id: groupIds }))
    }
  }, [context, groupIds]) // eslint-disable-line

  const forceReload = () => {
    dispatch(fetchExploredCohort({ context, id: groupIds, forceReload: true }))
  }

  const handleChangeTabs = (event: React.SyntheticEvent<Element, Event>, newTab: ResourceType) => {
    setSelectedTab(newTab)
  }

  if (context === 'new_cohort') {
    return <CohortCreation />
  }

  if (dashboard.loading === false && dashboard.rightToExplore === false) return <CohortRightOrNotExist />
  else if (dashboard.loading === false && dashboard.totalPatients === 0) return <CohortNoPatient />
  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      className={cx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      {
        <TopBar
          context={context}
          access={
            dashboard.deidentifiedBoolean === undefined
              ? '-'
              : dashboard.deidentifiedBoolean
              ? 'Pseudonymisé'
              : 'Nominatif'
          }
          afterEdit={() => forceReload()}
        />
      }

      <Grid container justifyContent="center" className={classes.tabs}>
        <Grid container item xs={11} minHeight={'96px'}>
          <Grid item xs={12}>
            <TabsMui value={selectedTab} onChange={handleChangeTabs} classes={{ indicator: classes.indicator }}>
              {tabs.map(
                (tab) =>
                  tab && (
                    <Tab
                      disabled={tab.disabled}
                      classes={{ selected: classes.selected }}
                      className={classes.tabTitle}
                      label={tab.label}
                      value={tab.value}
                      component={Link}
                      to={tab.to}
                      key={tab.value}
                    />
                  )
              )}
            </TabsMui>
          </Grid>
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
        </Grid>
      </Grid>
      <Grid container xs={12} alignItems="center" direction="column">
        {selectedTab === ResourceType.PREVIEW ? (
          <CohortPreview
            cohortId={
              context === URLS.COHORT || context === URLS.PERIMETERS
                ? groupIds
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
          <ExplorationBoard
            deidentified={!!dashboard.deidentifiedBoolean}
            type={selectedTab}
            messages={getAlertMessages(selectedTab, !!dashboard.deidentifiedBoolean)}
            groupId={groupIds}
          />
        )}
        {/*(selectedTab === ResourceType.PATIENT ||
          selectedTab === 'MedicationAdministration' ||
          selectedTab === 'MedicationRequest' ||
          selectedTab === 'Condition' ||
          selectedTab === 'Procedure' ||
          selectedTab === 'Claim' ||
          selectedTab === ResourceType.IMAGING ||
          selectedTab === ResourceType.OBSERVATION ||
          selectedTab === ResourceType.DOCUMENTS ||
          (selectedTab === ResourceType.QUESTIONNAIRE_RESPONSE && ODD_QUESTIONNAIRES && !dashboard.deidentifiedBoolean)) && (
          <ExplorationBoard
            deidentified={dashboard.deidentifiedBoolean}
            type={selectedTab}
            messages={getAlertMessages(selectedTab)}
          />
          )*/}

        {/*selectedTab === ResourceType.DOCUMENTS && <Documents deidentified={dashboard.deidentifiedBoolean ?? false} />*/}
        {/*selectedTab === ResourceType.CONDITION && <PMSIList deidentified={dashboard.deidentifiedBoolean ?? false} />*/}
        {/*selectedTab === ResourceType.MEDICATION_REQUEST && <MedicationList deidentified={dashboard.deidentifiedBoolean ?? false} />*/}
        {/*ODD_QUESTIONNAIRES && !dashboard.deidentifiedBoolean && selectedTab === ResourceType.QUESTIONNAIRE_RESPONSE && <FormsList />*/}
        {/*selectedTab === ResourceType.IMAGING && <ImagingList deidentified={dashboard.deidentifiedBoolean ?? false} />*/}
        {/*selectedTab === ResourceType.OBSERVATION && <BiologyList deidentified={dashboard.deidentifiedBoolean ?? false} />*/}
      </Grid>
    </Grid>
  )
}

export default Dashboard
