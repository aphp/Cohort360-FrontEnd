import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { CONTEXT } from '../../constants'
import { useDispatch } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { Grid, Tabs, Tab, CircularProgress } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

// import InclusionExclusionPatientsPanel from '../../components/Cohort/InclusionExclusionPatients/InclusionExclusionPatients'
import RedcapExport from '../../components/RedcapExport/RedcapExport'
import CohortPreview from '../../components/Cohort/Preview/Preview'
// import PatientList from '../../components/Cohort/PatientList/PatientList'
import CohortDocuments from '../../components/Cohort/Documents/Documents'
import TopBar from '../../components/TopBar/TopBar'

import { fetchCohort } from '../../services/cohortInfos'
import { setExploredCohort } from '../../state/exploredCohort'

import useStyles from './styles'

import { useAppSelector } from 'state'

const Cohort: React.FC<{}> = () => {
  const { cohortId, tabName } = useParams()

  const dispatch = useDispatch()

  const [selectedTab, selectTab] = useState(tabName || 'apercu')
  const [loading, setLoading] = useState(true)
  const [deidentifiedBoolean, setDeidentifiedBoolean] = useState<boolean>(true)
  const [openRedcapDialog, setOpenRedcapDialog] = useState(false)
  const handleOpenRedcapDialog = () => {
    setOpenRedcapDialog(true)
  }
  const handleCloseRedcapDialog = () => {
    setOpenRedcapDialog(false)
  }

  const { open, cohort } = useAppSelector((state) => ({
    open: state.drawer,
    cohort: state.exploredCohort
  }))

  // Update cohort
  useEffect(() => {
    fetchCohort(cohortId)
      .then((cohortResp) => {
        if (cohortResp) {
          dispatch(setExploredCohort(cohortResp))
          if (cohortResp.originalPatients?.[0]) {
            setDeidentifiedBoolean(
              cohortResp.originalPatients?.[0].extension?.filter((data) => data.url === 'deidentified')?.[0]
                .valueBoolean ?? true
            )
          }
        }
      })
      .then(() => setLoading(false))
  }, [cohortId]) // eslint-disable-line

  useEffect(() => {
    selectTab(tabName || 'apercu')
  }, [tabName])

  const classes = useStyles()

  if (loading) return <CircularProgress className={classes.loading} size={50} />

  if (!cohort.cohort) {
    return (
      <Alert severity="error" className={classes.alert}>
        Les données ne sont pas encore disponibles, veuillez réessayer ultérieurement.
      </Alert>
    )
  }

  const handleChangeTabs = (event: object, newTab: string) => {
    selectTab(newTab)
  }

  return (
    <Grid
      container
      direction="column"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      {CONTEXT === 'arkhn' && cohort.originalPatients && (
        <RedcapExport
          open={openRedcapDialog}
          onClose={handleCloseRedcapDialog}
          // FIX ARKHN: originalPatient only contains paginated results, not the whole group.
          // we need to find a way to tell redcap which patients we need depending on then context
          patientIds={cohort.originalPatients.map((p) => p.id)}
        />
      )}
      <TopBar
        title={cohort.name}
        status="Exploration de cohorte"
        patientsNb={cohort.totalPatients || 0}
        access={deidentifiedBoolean ? 'Pseudonymisé' : 'Nominatif'}
        openRedcapDialog={handleOpenRedcapDialog}
        fav
      />
      <Grid container justify="center" className={classes.tabs}>
        <Grid container item xs={11}>
          <Tabs value={selectedTab} onChange={handleChangeTabs} classes={{ indicator: classes.indicator }}>
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Aperçu cohorte"
              value="apercu"
              component={Link}
              to={`/cohort/${cohortId}/apercu`}
            />
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Patients"
              value="patients"
              component={Link}
              to={`/cohort/${cohortId}/patients`}
            />
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Documents"
              value="documents"
              component={Link}
              to={`/cohort/${cohortId}/documents`}
            />
            {CONTEXT === 'arkhn' && (
              <Tab
                classes={{ selected: classes.selected }}
                className={classes.tabTitle}
                label="Inclure/exclure"
                value="inclusion-exclusion"
                component={Link}
                to={`/cohort/${cohortId}/inclusion-exclusion`}
              />
            )}
          </Tabs>
        </Grid>
      </Grid>
      <div>
        {cohort.originalPatients && (
          <>
            {selectedTab === 'apercu' && (
              <CohortPreview
                total={cohort.totalPatients ?? 0}
                group={{ name: cohort.name ?? '-' }}
                agePyramidData={cohort.agePyramidData}
                genderRepartitionMap={cohort.genderRepartitionMap}
                monthlyVisitData={cohort.monthlyVisitData}
                visitTypeRepartitionData={cohort.visitTypeRepartitionData}
              />
            )}
            {/* {selectedTab === 'patients' && (
              <PatientList
                groupId={cohortId}
                total={cohort.totalPatients}
                deidentified={deidentifiedBoolean}
                patients={cohort.originalPatients}
                agePyramidData={cohort.agePyramidData}
                genderRepartitionMap={cohort.genderRepartitionMap}
              />
            )} */}
            {selectedTab === 'documents' && (
              <CohortDocuments groupId={cohortId} deidentifiedBoolean={deidentifiedBoolean} />
            )}
            {/* {CONTEXT === 'arkhn' && selectedTab === 'inclusion-exclusion' && (
              <InclusionExclusionPatientsPanel cohort={cohort} />
            )} */}
          </>
        )}
      </div>
    </Grid>
  )
}

export default Cohort
