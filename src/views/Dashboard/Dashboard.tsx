import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { CONTEXT } from '../../constants'
import { useDispatch } from 'react-redux'
import { Link, useParams, useLocation } from 'react-router-dom'
import { Grid, Tabs, Tab, CircularProgress } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

import InclusionExclusionPatientsPanel from '../../components/Cohort/InclusionExclusionPatients/InclusionExclusionPatients'
import RedcapExport from '../../components/RedcapExport/RedcapExport'
import CohortPreview from '../../components/Cohort/Preview/Preview'
import PatientList from '../../components/Cohort/PatientList/PatientList'
import CohortDocuments from '../../components/Cohort/Documents/Documents'
import TopBar from '../../components/TopBar/TopBar'
import CohortCreation from '../../views/CohortCreation/CohortCreation'

import { fetchCohort } from '../../services/cohortInfos'
import { fetchMyPatients } from '../../services/myPatients'
import { fetchPerimetersInfos } from '../../services/perimeters'

import { setExploredCohort } from '../../state/exploredCohort'

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
  const [loading, setLoading] = useState(true)
  const [deidentifiedBoolean, setDeidentifiedBoolean] = useState<boolean>(true)
  const [openRedcapDialog, setOpenRedcapDialog] = useState(false)

  const { open, dashboard } = useAppSelector((state) => ({
    open: state.drawer,
    dashboard: state.exploredCohort
  }))

  const _saveDashboardElement = (cohortResp: any) => {
    // Save dashboard element
    dispatch(setExploredCohort(cohortResp))

    // Check if access == 'Pseudonymisé' || 'Nominatif'
    const { originalPatients } = cohortResp
    if (!originalPatients || (originalPatients && !originalPatients[0])) return
    const extension: [
      {
        url: string
        valueBoolean: boolean
      }
    ] = originalPatients[0].extension

    if (!extension) return setLoading(false)
    const deidentified = extension.find((data) => data.url === 'deidentified')

    if (!deidentified) return setLoading(false)
    const valueBoolean = deidentified.valueBoolean ?? true

    setDeidentifiedBoolean(valueBoolean)
  }

  const _fetchCohort = async () => {
    if (!cohortId) return setLoading(false)

    const cohortResp = await fetchCohort(cohortId)
    if (cohortResp) {
      _saveDashboardElement(cohortResp)
    }
    setLoading(false)
  }

  const _fetchMyPatients = async () => {
    const cohortResp = await fetchMyPatients()
    if (cohortResp) {
      _saveDashboardElement(cohortResp)
    }
    setLoading(false)
  }

  const _fetchPerimeters = async () => {
    if (!perimetreIds) return setLoading(false)

    const cohortResp = await fetchPerimetersInfos(perimetreIds)
    if (cohortResp) {
      _saveDashboardElement(cohortResp)
    }
    setLoading(false)
  }

  useEffect(() => {
    switch (context) {
      case 'patients':
        _fetchMyPatients()
        setStatus('Exploration de population')
        setTabs([
          { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: false },
          { label: 'Aperçu', value: 'apercu', to: '/mes_patients/apercu', disabled: false },
          { label: 'Patients', value: 'patients', to: '/mes_patients/patients', disabled: false },
          { label: 'Documents', value: 'documents', to: '/mes_patients/documents', disabled: false }
        ])
        break
      case 'cohort':
        _fetchCohort()
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
          { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: false },
          { label: 'Aperçu cohorte', value: 'apercu', to: `/cohort/new/apercu`, disabled: true },
          { label: 'Patients', value: 'patients', to: `/cohort/new/patients`, disabled: true },
          { label: 'Documents', value: 'documents', to: `/cohort/new/documents`, disabled: true }
        ])
        setLoading(false)
        break
      case 'perimeters':
        _fetchPerimeters()
        setStatus('Exploration de périmètres')
        setTabs([
          { label: 'Création cohorte', value: 'creation', to: `/cohort/new`, disabled: false },
          { label: 'Aperçu', value: 'apercu', to: `/perimetres/apercu${location.search}`, disabled: false },
          { label: 'Patients', value: 'patients', to: `/perimetres/patients${location.search}`, disabled: false },
          { label: 'Documents', value: 'documents', to: `/perimetres/documents${location.search}`, disabled: false }
        ])
        break
      default:
        break
    }
  }, []) //eslint-disable-line

  useEffect(() => {
    selectTab(tabName || 'apercu')
  }, [tabName])

  const handleOpenRedcapDialog = () => {
    setOpenRedcapDialog(true)
  }

  const handleCloseRedcapDialog = () => {
    setOpenRedcapDialog(false)
  }

  const handleChangeTabs = (event: object, newTab: string) => {
    selectTab(newTab)
  }

  if (loading) return <CircularProgress className={classes.loading} size={50} />

  if (context === 'new_cohort') {
    return <CohortCreation />
  }

  if (!dashboard.cohort && context !== 'patients') {
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
          patientIds={dashboard.originalPatients.map((p) => p.id)}
        />
      )}
      <TopBar
        title={dashboard.name}
        status={status}
        patientsNb={dashboard.totalPatients || 0}
        access={deidentifiedBoolean ? 'Pseudonymisé' : 'Nominatif'}
        openRedcapDialog={handleOpenRedcapDialog}
        fav
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
                    />
                  )
              )}
          </Tabs>
        </Grid>
      </Grid>
      <div>
        {dashboard.originalPatients && (
          <>
            {selectedTab === 'apercu' && (
              <CohortPreview
                total={dashboard.totalPatients ?? 0}
                group={{ name: dashboard.name ?? '-' }}
                agePyramidData={dashboard.agePyramidData}
                genderRepartitionMap={dashboard.genderRepartitionMap}
                monthlyVisitData={dashboard.monthlyVisitData}
                visitTypeRepartitionData={dashboard.visitTypeRepartitionData}
              />
            )}
            {selectedTab === 'patients' && (
              <PatientList
                groupId={cohortId}
                total={dashboard.totalPatients || 0}
                deidentified={deidentifiedBoolean}
                patients={dashboard.originalPatients}
                agePyramidData={dashboard.agePyramidData}
                genderRepartitionMap={dashboard.genderRepartitionMap}
              />
            )}
            {selectedTab === 'documents' && (
              <CohortDocuments groupId={cohortId || perimetreIds} deidentifiedBoolean={deidentifiedBoolean} />
            )}
            {CONTEXT === 'arkhn' && selectedTab === 'inclusion-exclusion' && (
              <InclusionExclusionPatientsPanel cohort={dashboard} loading={false} />
            )}
          </>
        )}
      </div>
    </Grid>
  )
}

export default Dashboard
