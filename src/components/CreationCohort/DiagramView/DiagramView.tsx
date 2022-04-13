import React from 'react'
import { Grid } from '@material-ui/core'

import Alert from '@material-ui/lab/Alert'

import PopulationCard from './components/PopulationCard/PopulationCard'
import LogicalOperator from './components/LogicalOperator/LogicalOperator'
// import TemporalConstraintCard from './components/TemporalConstraintCard/TemporalConstraintCard'
import CohortCreationBreadcrumbs from './components/Breadcrumbs/Breadcrumbs'

import { useAppSelector } from 'state'

import useStyles from './styles'

const DiagramView: React.FC = () => {
  const { selectedPopulation = [] } = useAppSelector((state) => state.cohortCreation.request || {})

  const classes = useStyles()

  return (
    <Grid container className={classes.root}>
      <div style={{ minWidth: 500, paddingRight: 24 }}>
        <CohortCreationBreadcrumbs />

        <Alert severity="warning" style={{ marginTop: 16 }}>
          Une anomalie a été détectée sur les contraintes temporelles. Cette fonctionnalité a été désactivée. L'équipe
          Cohort360 met tout en œuvre pour résoudre ce problème.
        </Alert>

        <Grid className={classes.populationContainer}>
          <PopulationCard />
          {/* {selectedPopulation && selectedPopulation.length > 0 ? <TemporalConstraintCard /> : <></>} */}
        </Grid>
        {selectedPopulation && selectedPopulation.length > 0 ? <LogicalOperator /> : <></>}
      </div>
    </Grid>
  )
}

export default DiagramView
