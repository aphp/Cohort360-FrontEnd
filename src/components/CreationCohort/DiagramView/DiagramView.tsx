import React from 'react'
import { Grid } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

import PopulationCard from './components/PopulationCard/PopulationCard'
import LogicalOperator from './components/LogicalOperator/LogicalOperator'
import TemporalConstraintCard from './components/TemporalConstraintCard/TemporalConstraintCard'
import CohortCreationBreadcrumbs from './components/Breadcrumbs/Breadcrumbs'

import { useAppSelector } from 'state'
import { MeState } from 'state/me'

import useStyles from './styles'

const DiagramView: React.FC = () => {
  const { selectedPopulation = [] } = useAppSelector((state) => state.cohortCreation.request || {})
  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))

  const maintenanceIsActive = meState?.maintenance?.active

  const classes = useStyles()

  return (
    <Grid container className={classes.root}>
      <div style={{ minWidth: 500, paddingRight: 24 }}>
        {maintenanceIsActive && (
          <Alert severity="warning" style={{ marginTop: '-12px', width: '100%', marginBottom: '10px' }}>
            Une maintenance est en cours. Seule la consultation des cohorts, requetes et données patients est activée.
            Toute création, édition et suppression de cohort/requete est desactivées.
          </Alert>
        )}
        <CohortCreationBreadcrumbs />

        <Grid className={classes.populationContainer}>
          <PopulationCard />
          {selectedPopulation && selectedPopulation.length > 0 ? <TemporalConstraintCard /> : <></>}
        </Grid>
        {selectedPopulation && selectedPopulation.length > 0 ? <LogicalOperator /> : <></>}
      </div>
    </Grid>
  )
}

export default DiagramView
