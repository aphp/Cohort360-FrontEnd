import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { CONTEXT } from '../../constants'
import { useDispatch } from 'react-redux'
import { Link, useParams, useLocation } from 'react-router-dom'
import { Grid, Tabs, Tab } from '@material-ui/core'
import { IExtension } from '@ahryman40k/ts-fhir-types/lib/R4'

import InclusionExclusionPatientsPanel from 'components/Cohort/InclusionExclusionPatients/InclusionExclusionPatients'
import RedcapExport from 'components/RedcapExport/RedcapExport'
import CohortPreview from 'components/Cohort/Preview/Preview'
import PatientList from 'components/Cohort/PatientList/PatientList'
import Documents from 'components/Cohort/Documents/Documents'
import TopBar from 'components/TopBar/TopBar'
import CohortCreation from 'views/CohortCreation/CohortCreation'

import CohortRightOrNotExist from 'components/ErrorView/CohortRightOrNotExist'
import CohortNoPatient from 'components/ErrorView/CohortNoPatient'

import { fetchExploredCohort } from 'state/exploredCohort'

import useStyles from './styles'

import { useAppSelector } from 'state'

type Tabs = { label: string; value: string; to: string; disabled: boolean | undefined } | undefined

const Dashboard: React.FC<{
  context: 'patients' | 'cohort' | 'perimeters' | 'new_cohort'
}> = ({ context }) => {
  const { cohortId, tabName } = useParams<{
    cohortId?: string | undefined
    tabName?: string | undefined
  }>()

  const dispatch = useDispatch()
  const classes = useStyles()
  const location = useLocation()

  const perimetreIds = location.search.substr(1)

  const [selectedTab, selectTab] = useState(tabName || 'apercu')
  const [tabs, setTabs] = useState<Tabs[]>([])
  const [deidentifiedBoolean, setDeidentifiedBoolean] = useState<boolean | null>(null)
  const [openRedcapDialog, setOpenRedcapDialog] = useState(false)

  const { open, dashboard } = useAppSelector((state) => ({
    open: state.drawer,
    dashboard: state.exploredCohort
  }))

  const checkDeindentifiedStatus = (_dashboard: any) => {
    // Check if access == 'Pseudonymisé' || 'Nominatif'
    const { originalPatients } = _dashboard
    if (!originalPatients || (originalPatients && !originalPatients[0])) return
    const extension: IExtension[] | undefined = originalPatients[0].extension

    const deidentified = extension?.find((data) => data.url === 'deidentified')
    const valueBoolean = deidentified ? deidentified.valueBoolean : true

    setDeidentifiedBoolean(!!valueBoolean)
  }

  const onChangeTabs = () => {
    switch (context) {
      case 'patients':
        setTabs([
          // { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: true },
          { label: 'Aperçu', value: 'apercu', to: '/mes_patients/apercu', disabled: false },
          { label: 'Patients', value: 'patients', to: '/mes_patients/patients', disabled: false },
          { label: 'Documents', value: 'documents', to: '/mes_patients/documents', disabled: false }
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
          { label: 'Aperçu cohorte', value: 'apercu', to: `/cohort/${cohortId}/apercu`, disabled: false },
          { label: 'Données patient', value: 'patients', to: `/cohort/${cohortId}/patients`, disabled: false },
          { label: 'Documents cliniques', value: 'documents', to: `/cohort/${cohortId}/documents`, disabled: false }
        ])
        break
      case 'new_cohort':
        setTabs([
          // { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: true },
          { label: 'Aperçu cohorte', value: 'apercu', to: `/cohort/new/apercu`, disabled: true },
          { label: 'Données patient', value: 'patients', to: `/cohort/new/patients`, disabled: true },
          { label: 'Documents cliniques', value: 'documents', to: `/cohort/new/documents`, disabled: true }
        ])
        break
      case 'perimeters':
        setTabs([
          // { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: true },
          { label: 'Aperçu', value: 'apercu', to: `/perimetres/apercu${location.search}`, disabled: false },
          {
            label: 'Données patient',
            value: 'patients',
            to: `/perimetres/patients${location.search}`,
            disabled: false
          },
          {
            label: 'Documents cliniques',
            value: 'documents',
            to: `/perimetres/documents${location.search}`,
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
      dispatch<any>(fetchExploredCohort({ context, id }))
    }
  }, [context, cohortId]) // eslint-disable-line

  useEffect(() => {
    checkDeindentifiedStatus(dashboard)
    onChangeTabs()
  }, [dashboard])

  const forceReload = () => {
    const id = context === 'cohort' ? cohortId : context === 'perimeters' ? perimetreIds : undefined
    dispatch<any>(fetchExploredCohort({ context, id, forceReload: true }))
  }

  const handleCloseRedcapDialog = () => {
    setOpenRedcapDialog(false)
  }

  const handleChangeTabs = (event: any, newTab: string) => {
    selectTab(newTab)
  }

  if (context === 'new_cohort') {
    return <CohortCreation />
  }

  if (
    dashboard.loading === false &&
    dashboard.cohort &&
    Array.isArray(dashboard.cohort) &&
    dashboard.cohort.length === 0
  ) {
    return <CohortRightOrNotExist />
  } else if (dashboard.loading === false && dashboard.totalPatients === 0) {
    return <CohortNoPatient />
  }

  return (
    <Grid
      container
      direction="column"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      {CONTEXT === 'arkhn' && dashboard.originalPatients && (
        <RedcapExport
          open={openRedcapDialog}
          onClose={handleCloseRedcapDialog}
          // FIX ARKHN: originalPatient only contains paginated results, not the whole group.
          // we need to find a way to tell redcap which patients we need depending on then context
          patientIds={dashboard.originalPatients.map((p: any) => p.id)}
        />
      )}

      <TopBar
        context={context}
        access={deidentifiedBoolean === null ? '-' : deidentifiedBoolean ? 'Pseudonymisé' : 'Nominatif'}
        afterEdit={() => forceReload()}
      />

      <Grid container justify="center" className={classes.tabs}>
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
      <div>
        {selectedTab === 'apercu' && (
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
            deidentified={deidentifiedBoolean}
            patients={dashboard.originalPatients}
            agePyramidData={dashboard.agePyramidData}
            genderRepartitionMap={dashboard.genderRepartitionMap}
          />
        )}
        {selectedTab === 'documents' && (
          <Documents
            groupId={cohortId || perimetreIds}
            deidentifiedBoolean={deidentifiedBoolean}
            sortBy={'date'}
            sortDirection={'desc'}
          />
        )}
        {CONTEXT === 'arkhn' && selectedTab === 'inclusion-exclusion' && <InclusionExclusionPatientsPanel />}
      </div>
    </Grid>
  )
}

export default Dashboard
