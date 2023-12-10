import React from 'react'
import { Alert, Grid } from '@mui/material'

import PopulationCard from './components/PopulationCard/PopulationCard'
import LogicalOperator from './components/LogicalOperator/LogicalOperator'
import TemporalConstraintCard from './components/TemporalConstraintCard/TemporalConstraintCard'
import CohortCreationBreadcrumbs from './components/Breadcrumbs/Breadcrumbs'

import { useAppSelector } from 'state'

import useStyles from './styles'

const DiagramView: React.FC = () => {
  const { selectedPopulation = [] } = useAppSelector((state) => state.cohortCreation.request || {})
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)

  const { classes } = useStyles()

  return (
    <Grid container className={classes.root}>
      <div style={{ minWidth: 500, paddingRight: 24 }}>
        {maintenanceIsActive && (
          <Alert severity="warning" style={{ marginTop: '-12px', width: '100%', marginBottom: '10px' }}>
            Une maintenance est en cours. Seules les consultations de cohortes, requêtes et données patients sont
            activées. Les créations, éditions et suppressions de cohortes et de requêtes sont désactivées.
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
