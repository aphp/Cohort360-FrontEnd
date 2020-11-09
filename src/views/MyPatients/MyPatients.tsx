import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { CONTEXT } from '../../constants'
import { useDispatch } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { Link, useParams } from 'react-router-dom'

import TopBar from '../../components/TopBar/TopBar'
import CohortPreview from '../../components/Cohort/Preview/Preview'
import PatientList from '../../components/Cohort/PatientList/PatientList'
import CohortDocuments from '../../components/Cohort/Documents/Documents'
import RedcapExport from '../../components/RedcapExport/RedcapExport'

import useStyles from './styles'
import { CircularProgress } from '@material-ui/core'
import { fetchMyPatients } from '../../services/myPatients'

import { setExploredCohort } from '../../state/exploredCohort'
import { useAppSelector } from 'state'

const MyPatients: React.FC<{}> = () => {
  const { tabName } = useParams<{ tabName: string }>()
  const dispatch = useDispatch()
  const classes = useStyles()

  const [selectedTab, selectTab] = useState(tabName || 'apercu')
  const [loading, setLoading] = useState<boolean>(true)
  const [deidentifiedBoolean, setDeidentifiedBoolean] = useState<boolean>(true)
  const [openRedcapDialog, setOpenRedcapDialog] = useState<boolean>(false)
  // FIX arkhn way to retrieve patients
  // const missingEncounters = !!practitioner.patients.find(
  //   (pat) => !pat.encounters
  // )

  const { open, myPatients } = useAppSelector((state) => ({
    open: state.drawer,
    myPatients: state.exploredCohort
  }))

  const handleOpenRedcapDialog = () => setOpenRedcapDialog(true)
  const handleCloseRedcapDialog = () => setOpenRedcapDialog(false)

  const handleTabChange = (event: object, newValue: string): void => {
    selectTab(newValue)
  }

  useEffect(() => selectTab(tabName || 'apercu'), [tabName])

  useEffect(() => {
    fetchMyPatients()
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
  }, []) // eslint-disable-line

  return !loading ? (
    <Grid
      container
      direction="column"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      {CONTEXT === 'arkhn' && myPatients.originalPatients && (
        <RedcapExport
          open={openRedcapDialog}
          onClose={handleCloseRedcapDialog}
          // FIX ARKHN
          patientIds={myPatients.originalPatients.map((patient) => patient.id)}
        />
      )}

      <TopBar
        title={myPatients.name}
        status="Exploration de population"
        patientsNb={myPatients.totalPatients}
        access={deidentifiedBoolean ? 'Pseudonymisé' : 'Nominatif'}
        openRedcapDialog={handleOpenRedcapDialog}
      />
      <Grid container justify="center" className={classes.tabs}>
        <Grid container item xs={11}>
          <Tabs value={selectedTab} onChange={handleTabChange} classes={{ indicator: classes.indicator }}>
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Aperçu"
              value="apercu"
              component={Link}
              to={'/mes_patients/apercu'}
            />
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Patients"
              value="patients"
              component={Link}
              to={'/mes_patients/patients'}
            />
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Documents"
              value="documents"
              component={Link}
              to={'/mes_patients/documents'}
            />
          </Tabs>
        </Grid>
      </Grid>
      <div>
        {selectedTab === 'apercu' && (
          <CohortPreview
            total={myPatients.totalPatients ?? 0}
            group={{ name: 'Mes patients' }}
            agePyramidData={myPatients.agePyramidData}
            genderRepartitionMap={myPatients.genderRepartitionMap}
            monthlyVisitData={myPatients.monthlyVisitData}
            visitTypeRepartitionData={myPatients.visitTypeRepartitionData}
          />
        )}
        {selectedTab === 'patients' && (
          <PatientList
            total={myPatients.totalPatients ?? 0}
            deidentified={deidentifiedBoolean}
            patients={myPatients.originalPatients ?? []}
            agePyramidData={myPatients.agePyramidData}
            genderRepartitionMap={myPatients.genderRepartitionMap}
          />
        )}
        {selectedTab === 'documents' && <CohortDocuments deidentifiedBoolean={deidentifiedBoolean} />}
      </div>
    </Grid>
  ) : (
    <div>
      <CircularProgress className={classes.loading} size={50} />
    </div>
  )
}

export default MyPatients
