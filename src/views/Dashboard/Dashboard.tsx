import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { CONTEXT } from '../../constants'
import { useDispatch } from 'react-redux'
import { Link, useParams, useLocation } from 'react-router-dom'
import { Grid, Tabs, Tab } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

import InclusionExclusionPatientsPanel from '../../components/Cohort/InclusionExclusionPatients/InclusionExclusionPatients'
import RedcapExport from '../../components/RedcapExport/RedcapExport'
import CohortPreview from '../../components/Cohort/Preview/Preview'
import PatientList from '../../components/Cohort/PatientList/PatientList'
import CohortDocuments from '../../components/Cohort/Documents/Documents'
import TopBar from '../../components/TopBar/TopBar'
import CohortCreation from '../../views/CohortCreation/CohortCreation'

import { fetchExploredCohort } from '../../state/exploredCohort'

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
  const [status, setStatus] = useState('')
  const [openRedcapDialog, setOpenRedcapDialog] = useState(false)

  const { open, dashboard, deidentified } = useAppSelector((state) => ({
    open: state.drawer,
    dashboard: state.exploredCohort,
    deidentified: state.me?.deidentified
  }))

  useEffect(() => {
    const id = context === 'cohort' ? cohortId : context === 'perimeters' ? perimetreIds : undefined

    if (context !== 'new_cohort') {
      dispatch(fetchExploredCohort({ context, id }))
    }

    switch (context) {
      case 'patients':
        setStatus('Exploration de population')
        setTabs([
          { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: true },
          { label: 'Aperçu', value: 'apercu', to: '/mes_patients/apercu', disabled: false },
          { label: 'Patients', value: 'patients', to: '/mes_patients/patients', disabled: false },
          { label: 'Documents', value: 'documents', to: '/mes_patients/documents', disabled: false }
        ])
        break
      case 'cohort':
        setStatus('Exploration de cohorte')
        setTabs([
          { label: 'Édition cohorte', value: 'creation', to: `/cohort/${cohortId}/edition`, disabled: true },
          { label: 'Aperçu cohorte', value: 'apercu', to: `/cohort/${cohortId}/apercu`, disabled: false },
          { label: 'Patients', value: 'patients', to: `/cohort/${cohortId}/patients`, disabled: false },
          { label: 'Documents', value: 'documents', to: `/cohort/${cohortId}/documents`, disabled: false }
        ])
        break
      case 'new_cohort':
        setStatus("Création d'un cohorte")
        setTabs([
          { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: true },
          { label: 'Aperçu cohorte', value: 'apercu', to: `/cohort/new/apercu`, disabled: true },
          { label: 'Patients', value: 'patients', to: `/cohort/new/patients`, disabled: true },
          { label: 'Documents', value: 'documents', to: `/cohort/new/documents`, disabled: true }
        ])
        break
      case 'perimeters':
        setStatus('Exploration de périmètres')
        setTabs([
          { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: true },
          { label: 'Aperçu', value: 'apercu', to: `/perimetres/apercu${location.search}`, disabled: false },
          { label: 'Patients', value: 'patients', to: `/perimetres/patients${location.search}`, disabled: false },
          { label: 'Documents', value: 'documents', to: `/perimetres/documents${location.search}`, disabled: false }
        ])
        break
      default:
        break
    }
  }, [context, cohortId]) // eslint-disable-line

  const handleOpenRedcapDialog = () => {
    setOpenRedcapDialog(true)
  }

  const handleCloseRedcapDialog = () => {
    setOpenRedcapDialog(false)
  }

  const handleChangeTabs = (event: object, newTab: string) => {
    selectTab(newTab)
  }

  const _displayGroupName = () => {
    let group: {
      name: string
      perimeters?: string[]
    } = { name: '-', perimeters: [] }
    switch (context) {
      case 'patients':
        group = { name: 'Mes patients' }
        break
      case 'cohort':
        group = { name: dashboard.name ?? '-' }
        break
      case 'perimeters':
        group = {
          name: 'Exploration de périmètres',
          perimeters:
            dashboard.cohort && Array.isArray(dashboard.cohort)
              ? dashboard.cohort.map((p: any) => p.name.replace('Patients passés par: ', ''))
              : []
        }
        break
      default:
        break
    }
    return group
  }

  if (context === 'new_cohort') {
    return <CohortCreation />
  }

  if (dashboard.loading === false && dashboard.totalPatients === 0) {
    return (
      <Alert severity="error" className={classes.alert}>
        Les données ne sont pas encore disponibles, veuillez réessayer ultérieurement.
      </Alert>
    )
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
        title={dashboard.name}
        status={status}
        patientsNb={dashboard.totalPatients || 0}
        access={deidentified === undefined ? '-' : deidentified ? 'Pseudonymisé' : 'Nominatif'}
        openRedcapDialog={handleOpenRedcapDialog}
        fav
        loading={dashboard.loading}
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
            group={_displayGroupName()}
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
            deidentified={deidentified}
            patients={dashboard.originalPatients}
            agePyramidData={dashboard.agePyramidData}
            genderRepartitionMap={dashboard.genderRepartitionMap}
          />
        )}
        {selectedTab === 'documents' && (
          <CohortDocuments
            groupId={cohortId || perimetreIds}
            deidentifiedBoolean={deidentified}
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
