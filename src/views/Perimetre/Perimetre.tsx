import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { CONTEXT } from '../../constants'
import { useDispatch } from 'react-redux'
import { Link, useParams, useLocation } from 'react-router-dom'
import { useAppSelector } from 'state'

import { Grid, Tabs, Tab, CircularProgress } from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/lab'

import TopBar from '../../components/TopBar/TopBar'
import CohortPreview from '../../components/Cohort/Preview/Preview'
import RedcapExport from '../../components/RedcapExport/RedcapExport'
import PatientList from '../../components/Cohort/PatientList/PatientList'
import PerimetersDocuments from '../../components/Cohort/Documents/Documents'

import { fetchPerimetersInfos } from '../../services/perimeters'
import { setExploredCohort } from '../../state/exploredCohort'

import useStyles from './styles'

const Perimetre: React.FC<{}> = () => {
  const { tabName } = useParams()
  const classes = useStyles()
  const dispatch = useDispatch()
  const location = useLocation()

  const perimetreIds = location.search.substr(1)

  const [selectedTab, selectTab] = useState(tabName || 'apercu')
  const [loading, setLoading] = useState(true)
  const [openRedcapDialog, setOpenRedcapDialog] = useState(false)
  const [deidentifiedBoolean, setDeidentifiedBoolean] = useState<boolean>(true)

  const { open, myPerimetre } = useAppSelector((state) => ({
    open: state.drawer,
    myPerimetre: state.exploredCohort
  }))

  const handleOpenRedcapDialog = () => setOpenRedcapDialog(true)
  const handleCloseRedcapDialog = () => setOpenRedcapDialog(false)

  useEffect(() => {
    if (!perimetreIds) return setLoading(false)

    fetchPerimetersInfos(perimetreIds)
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
  }, [perimetreIds]) // eslint-disable-line

  useEffect(() => selectTab(tabName || 'apercu'), [tabName])

  if (!loading && myPerimetre.originalPatients?.length === 0) {
    return (
      <Grid
        container
        direction="column"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
      >
        <TopBar
          title="-"
          status="Exploration de périmètres"
          patientsNb={myPerimetre.totalPatients}
          access="-"
          openRedcapDialog={handleOpenRedcapDialog}
        />
        <Alert severity="warning">
          <AlertTitle>Attention</AlertTitle>
          Aucun patient n{"'"}a été trouvé dans ce périmètre.
        </Alert>
      </Grid>
    )
  }

  return !loading ? (
    <Grid
      container
      direction="column"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      {CONTEXT === 'arkhn' && (
        <RedcapExport
          open={openRedcapDialog}
          onClose={handleCloseRedcapDialog}
          // FIX ARKHN
          patientIds={myPerimetre.originalPatients?.map((p) => p.id) ?? []}
          cohortName={myPerimetre.name}
        />
      )}
      <TopBar
        title="-"
        status="Exploration de périmètres"
        patientsNb={myPerimetre.totalPatients}
        access={deidentifiedBoolean ? 'Pseudonymisé' : 'Nominatif'}
        openRedcapDialog={handleOpenRedcapDialog}
      />
      <Grid container justify="center" className={classes.tabs}>
        <Grid container item xs={11}>
          <Tabs value={selectedTab} classes={{ indicator: classes.indicator }}>
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Aperçu cohorte"
              value="apercu"
              component={Link}
              to={`/perimetres/apercu${location.search}`}
            />
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Patients"
              value="patients"
              component={Link}
              to={`/perimetres/patients${location.search}`}
            />
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Documents"
              value="documents"
              component={Link}
              to={`/perimetres/documents${location.search}`}
            />
          </Tabs>
        </Grid>
      </Grid>
      <div>
        {myPerimetre.originalPatients && (
          <>
            {selectedTab === 'apercu' && (
              <CohortPreview
                total={myPerimetre.totalPatients ?? 0}
                group={{
                  name: 'Exploration de périmètres',
                  perimeters:
                    myPerimetre.cohort && Array.isArray(myPerimetre.cohort)
                      ? myPerimetre.cohort.map((p: any) => p.name.replace('Patients passés par: ', ''))
                      : []
                }}
                agePyramidData={myPerimetre.agePyramidData}
                genderRepartitionMap={myPerimetre.genderRepartitionMap}
                monthlyVisitData={myPerimetre.monthlyVisitData}
                visitTypeRepartitionData={myPerimetre.visitTypeRepartitionData}
              />
            )}
            {selectedTab === 'patients' && (
              <PatientList
                groupId={perimetreIds}
                total={myPerimetre.totalPatients ?? 0}
                deidentified={deidentifiedBoolean}
                patients={myPerimetre.originalPatients}
                agePyramidData={myPerimetre.agePyramidData}
                genderRepartitionMap={myPerimetre.genderRepartitionMap}
              />
            )}
            {selectedTab === 'documents' && (
              <PerimetersDocuments groupId={perimetreIds} deidentifiedBoolean={deidentifiedBoolean} />
            )}
          </>
        )}
      </div>
    </Grid>
  ) : (
    <div>
      <CircularProgress className={classes.loading} size={50} />
    </div>
  )
}

export default Perimetre
