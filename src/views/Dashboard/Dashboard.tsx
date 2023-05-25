import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { Link, useParams, useLocation } from 'react-router-dom'
import { Grid, Tabs, Tab } from '@mui/material'

import CohortPreview from 'components/Dashboard/Preview/Preview'
import PatientList from 'components/Dashboard/PatientList/PatientList'
import Documents from 'components/Dashboard/Documents/Documents'
import TopBar from 'components/TopBar/TopBar'
import CohortCreation from 'views/CohortCreation/CohortCreation'

import CohortRightOrNotExist from 'components/ErrorView/CohortRightOrNotExist'
import CohortNoPatient from 'components/ErrorView/CohortNoPatient'

import { fetchExploredCohort } from 'state/exploredCohort'

import useStyles from './styles'

import { useAppSelector, useAppDispatch } from 'state'

type Tabs = { label: string; value: string; to: string; disabled: boolean | undefined } | undefined

const Dashboard: React.FC<{
  context: 'patients' | 'cohort' | 'perimeters' | 'new_cohort'
}> = ({ context }) => {
  const { cohortId, tabName } = useParams<{
    cohortId?: string | undefined
    tabName?: string | undefined
  }>()

  const dispatch = useAppDispatch()
  const classes = useStyles()
  const location = useLocation()

  const perimetreIds = location.search.substr(1)

  const [selectedTab, selectTab] = useState(tabName || 'preview')
  const [tabs, setTabs] = useState<Tabs[]>([])

  const { open, dashboard } = useAppSelector((state) => ({
    open: state.drawer,
    dashboard: state.exploredCohort
  }))

  const onChangeTabs = () => {
    switch (context) {
      case 'patients':
        setTabs([
          // { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: true },
          { label: 'Aperçu', value: 'preview', to: '/my-patients/preview', disabled: false },
          { label: 'Patients', value: 'patients', to: '/my-patients/patients', disabled: false },
          { label: 'Documents', value: 'documents', to: '/my-patients/documents', disabled: false }
        ])
        break
      case 'cohort':
        setTabs([
          {
            label: 'Modifier la requête',
            value: 'creation',
            to: `/cohort/new/${dashboard.requestId}`,
            disabled: false
          },
          { label: 'Aperçu cohorte', value: 'preview', to: `/cohort/${cohortId}/preview`, disabled: false },
          { label: 'Données patient', value: 'patients', to: `/cohort/${cohortId}/patients`, disabled: false },
          { label: 'Documents cliniques', value: 'documents', to: `/cohort/${cohortId}/documents`, disabled: false }
        ])
        break
      case 'new_cohort':
        setTabs([
          // { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: true },
          { label: 'Aperçu cohorte', value: 'preview', to: `/cohort/new/preview`, disabled: true },
          { label: 'Données patient', value: 'patients', to: `/cohort/new/patients`, disabled: true },
          { label: 'Documents cliniques', value: 'documents', to: `/cohort/new/documents`, disabled: true }
        ])
        break
      case 'perimeters':
        setTabs([
          // { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: true },
          { label: 'Aperçu', value: 'preview', to: `/perimeters/preview${location.search}`, disabled: false },
          {
            label: 'Données patient',
            value: 'patients',
            to: `/perimeters/patients${location.search}`,
            disabled: false
          },
          {
            label: 'Documents cliniques',
            value: 'documents',
            to: `/perimeters/documents${location.search}`,
            disabled: false
          }
        ])
        break
      default:
        break
    }
  }

  useEffect(() => {
    const id = context === 'cohort' ? cohortId : context === 'perimeters' ? perimetreIds : undefined

    if (context !== 'new_cohort') {
      dispatch(fetchExploredCohort({ context, id }))
    }
  }, [context, cohortId]) // eslint-disable-line

  useEffect(() => {
    onChangeTabs()
  }, [dashboard])

  const forceReload = () => {
    const id = context === 'cohort' ? cohortId : context === 'perimeters' ? perimetreIds : undefined
    dispatch(fetchExploredCohort({ context, id, forceReload: true }))
  }

  const handleChangeTabs = (event: React.SyntheticEvent<Element, Event>, newTab: string) => {
    selectTab(newTab)
  }

  if (context === 'new_cohort') {
    return <CohortCreation />
  }

  if (dashboard.loading === false && dashboard.rightToExplore === false) {
    return <CohortRightOrNotExist />
  } else if (dashboard.loading === false && dashboard.totalPatients === 0) {
    return <CohortNoPatient />
  }

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
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

      <Grid container justifyContent="center" className={classes.tabs}>
        <Grid container item xs={11}>
          <Tabs value={selectedTab} onChange={handleChangeTabs} classes={{ indicator: classes.indicator }}>
            {tabs &&
              tabs.map(
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
          </Tabs>
        </Grid>
      </Grid>
      <Grid container xs={11} alignItems="center" direction="column">
        {selectedTab === 'preview' && (
          <CohortPreview
            total={dashboard.totalPatients}
            agePyramidData={dashboard.agePyramidData}
            genderRepartitionMap={dashboard.genderRepartitionMap}
            monthlyVisitData={dashboard.monthlyVisitData}
            visitTypeRepartitionData={dashboard.visitTypeRepartitionData}
            loading={dashboard.loading}
          />
        )}
        {selectedTab === 'patients' && (
          <PatientList
            groupId={cohortId || perimetreIds}
            total={dashboard.totalPatients || 0}
            deidentified={dashboard.deidentifiedBoolean}
            patients={dashboard.originalPatients}
            agePyramidData={dashboard.agePyramidData}
            genderRepartitionMap={dashboard.genderRepartitionMap}
          />
        )}
        {selectedTab === 'documents' && (
          <Documents groupId={cohortId || perimetreIds} deidentifiedBoolean={dashboard.deidentifiedBoolean ?? false} />
        )}
      </Grid>
    </Grid>
  )
}

export default Dashboard
