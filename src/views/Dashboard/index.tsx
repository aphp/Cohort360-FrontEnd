import React, { useState, useEffect, useContext } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Grid, Tabs as TabsMui, Tab } from '@mui/material'

import CohortPreview from 'components/Dashboard/Preview/Preview'
import PatientList from 'components/Dashboard/PatientList'
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
import PMSIList from 'components/Dashboard/PMSIList'
import MedicationList from 'components/Dashboard/MedicationList'
import BiologyList from 'components/Dashboard/BiologyList'
import FormsList from 'components/Dashboard/FormsList'
import { getCleanGroupId } from 'utils/paginationUtils'
import ExplorationBoard from 'components/ExplorationBoard'
import { ResourceType } from 'types/requestCriterias'
import { PmsiTab } from 'types'
import { PMSILabel } from 'types/patient'
import Tabs from 'components/ui/Tabs'
import { getPMSITab } from 'utils/tabsUtils'

type Tabs = { label: string; value: string; to: string; disabled?: boolean } | undefined

export const PMSITabs: PmsiTab[] = [
  { label: PMSILabel.DIAGNOSTIC, id: ResourceType.CONDITION },
  { label: PMSILabel.CCAM, id: ResourceType.PROCEDURE },
  { label: PMSILabel.GHM, id: ResourceType.CLAIM }
]

const Dashboard: React.FC<{
  context: 'patients' | 'cohort' | 'perimeters' | 'new_cohort'
}> = ({ context }) => {
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

  const [selectedTab, setSelectedTab] = useState(tabName ?? 'preview')
  const [tabs, setTabs] = useState<Tabs[]>([])

  const open = useAppSelector((state) => state.drawer)
  const dashboard = useAppSelector((state) => state.exploredCohort)
  const me = useAppSelector((state) => state.me)

  const onChangeTabs = () => {
    switch (context) {
      case 'patients':
        setTabs([
          // { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: true },
          { label: 'Aperçu', value: 'preview', to: '/my-patients/preview', disabled: false },
          { label: 'Patients', value: 'patients', to: '/my-patients/patients', disabled: false },
          ...(ODD_DOCUMENT_REFERENCE
            ? [{ label: 'Documents', value: 'documents', to: '/my-patients/documents', disabled: false }]
            : []),
          { label: 'PMSI', value: 'pmsi', to: '/my-patients/pmsi', disabled: false },
          { label: 'Médicaments', value: 'medication', to: '/my-patients/medication', disabled: false },
          { label: 'Biologie', value: 'biology', to: '/my-patients/biology', disabled: false },
          ...(ODD_IMAGING
            ? [{ label: 'Imagerie', value: 'imaging', to: '/my-patients/imaging', disabled: false }]
            : []),
          ...(ODD_QUESTIONNAIRES && !dashboard.deidentifiedBoolean
            ? [{ label: 'Formulaires', value: 'forms', to: `/my-patients/forms`, disabled: false }]
            : [])
        ])
        break
      case 'cohort':
        setTabs([
          {
            label: 'Modifier la requête',
            value: 'creation',
            to: `/cohort/new/${dashboard.requestId}/${dashboard.snapshotId}`
          },
          { label: 'Aperçu cohorte', value: 'preview', to: `/cohort/preview?groupId=${groupIds}` },
          { label: 'Données patient', value: 'patients', to: `/cohort/patients${location.search}` },
          ...(ODD_DOCUMENT_REFERENCE
            ? [
                {
                  label: 'Documents cliniques',
                  value: 'documents',
                  to: `/cohort/documents${location.search}`,
                  disabled: false
                }
              ]
            : []),
          { label: 'PMSI', value: 'pmsi', to: `/cohort/pmsi${location.search}` },
          { label: 'Médicaments', value: 'medication', to: `/cohort/medication${location.search}` },
          { label: 'Biologie', value: 'biology', to: `/cohort/biology${location.search}` },
          ...(ODD_IMAGING ? [{ label: 'Imagerie', value: 'imaging', to: `/cohort/imaging${location.search}` }] : []),
          ...(ODD_QUESTIONNAIRES && !dashboard.deidentifiedBoolean
            ? [{ label: 'Formulaires', value: 'forms', to: `/cohort/forms${location.search}` }]
            : [])
        ])
        break
      case 'new_cohort':
        setTabs([
          // { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: true },
          { label: 'Aperçu cohorte', value: 'preview', to: `/cohort/new/preview`, disabled: true },
          { label: 'Données patient', value: 'patients', to: `/cohort/new/patients`, disabled: true },
          ...(ODD_DOCUMENT_REFERENCE
            ? [{ label: 'Documents cliniques', value: 'documents', to: `/cohort/new/documents`, disabled: true }]
            : []),
          { label: 'PMSI', value: 'pmsi', to: `/cohort/new/pmsi` },
          { label: 'Médicaments', value: 'medication', to: `/cohort/new/medication` },
          { label: 'Biologie', value: 'biology', to: `/cohort/new/biology` },
          ...(ODD_IMAGING ? [{ label: 'Imagerie', value: 'imaging', to: `/cohort/new/imaging`, disabled: true }] : []),
          ...(ODD_QUESTIONNAIRES && !dashboard.deidentifiedBoolean
            ? [{ label: 'Formulaires', value: 'forms', to: `/cohort/new/forms` }]
            : [])
        ])
        break
      case 'perimeters': {
        setTabs([
          // { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: true },
          { label: 'Aperçu', value: 'preview', to: `/perimeters/preview?groupId=${groupIds}` },
          {
            label: 'Données patient',
            value: 'patients',
            to: `/perimeters/patients${location.search}`
          },
          ...(ODD_DOCUMENT_REFERENCE
            ? [
                {
                  label: 'Documents cliniques',
                  value: 'documents',
                  to: `/perimeters/documents${location.search}`,
                  disabled: false
                }
              ]
            : []),
          { label: 'PMSI', value: 'Condition', to: `/perimeters/pmsi${location.search}` },
          {
            label: 'Médicaments',
            value: 'medication',
            to: `/perimeters/medication${location.search}`
          },
          { label: 'Biologie', value: 'biology', to: `/perimeters/biology${location.search}` },
          ...(ODD_IMAGING
            ? [{ label: 'Imagerie', value: 'imaging', to: `/perimeters/imaging${location.search}` }]
            : []),
          ...(ODD_QUESTIONNAIRES && !dashboard.deidentifiedBoolean
            ? [{ label: 'Formulaires', value: 'forms', to: `/perimeters/forms${location.search}` }]
            : [])
        ])
        break
      }
      default:
        break
    }
  }

  useEffect(() => {
    if (context !== 'new_cohort') {
      dispatch(fetchExploredCohort({ context, id: groupIds }))
    }
  }, [context, groupIds]) // eslint-disable-line

  useEffect(() => {
    onChangeTabs()
  }, [dashboard])

  const forceReload = () => {
    dispatch(fetchExploredCohort({ context, id: groupIds, forceReload: true }))
  }

  const handleChangeTabs = (event: React.SyntheticEvent<Element, Event>, newTab: string) => {
    setSelectedTab(newTab)
  }

  if (context === 'new_cohort') {
    return <CohortCreation />
  }

  if (dashboard.loading === false && dashboard.rightToExplore === false) {
    return <CohortRightOrNotExist />
  } else if (dashboard.loading === false && dashboard.totalPatients === 0) {
    return <CohortNoPatient />
  }

  const getResourceTypeFromTab = (tab: string) => {
    switch (tab) {
      case 'Condition':
        return ResourceType.CONDITION
      case 'Procedure':
        return ResourceType.PROCEDURE
      case 'Claim':
        return ResourceType.CLAIM
      case 'patients':
        return ResourceType.PATIENT
      case 'biology':
        return ResourceType.OBSERVATION
      default:
        return ResourceType.DOCUMENTS
    }
  }

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
          {(selectedTab === 'Condition' || selectedTab === 'Claim' || selectedTab === 'Procedure') && (
            <Tabs
              values={PMSITabs}
              active={getPMSITab(selectedTab)}
              onchange={(value: PmsiTab) => {
                setSelectedTab(value.id)
                // setSearchParams({ ...searchParams, tabId: value.id })
              }}
            />
          )}
        </Grid>
      </Grid>
      <Grid container xs={12} alignItems="center" direction="column">
        {selectedTab === 'preview' && (
          <CohortPreview
            cohortId={
              context === 'cohort' || context === 'perimeters'
                ? groupIds
                : context === 'patients'
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
        )}
        {(selectedTab === 'patients' ||
          selectedTab === 'Condition' ||
          selectedTab === 'Procedure' ||
          selectedTab === 'Claim' ||
          selectedTab === 'biology') && (
          <ExplorationBoard deidentified={dashboard.deidentifiedBoolean} type={getResourceTypeFromTab(selectedTab)} />
        )}

        {selectedTab === 'documents' && <Documents deidentified={dashboard.deidentifiedBoolean ?? false} />}
        {/*selectedTab === 'pmsi' && <PMSIList deidentified={dashboard.deidentifiedBoolean ?? false} />*/}
        {selectedTab === 'medication' && <MedicationList deidentified={dashboard.deidentifiedBoolean ?? false} />}
        {/*selectedTab === 'biology' && <BiologyList deidentified={dashboard.deidentifiedBoolean ?? false} />*/}
        {selectedTab === 'imaging' && <ImagingList deidentified={dashboard.deidentifiedBoolean ?? false} />}
        {ODD_QUESTIONNAIRES && !dashboard.deidentifiedBoolean && selectedTab === 'forms' && <FormsList />}
      </Grid>
    </Grid>
  )
}

export default Dashboard
