import React from 'react'
import { Grid } from '@material-ui/core'

import PopulationCard from './components/PopulationCard/PopulationCard'
import LogicalOperator from './components/LogicalOperator/LogicalOperator'
// import TemporalConstraintCard from './components/TemporalConstraintCard/TemporalConstraintCard'

import { useAppSelector } from 'state'

import useStyles from './styles'

const DiagramView: React.FC = () => {
  const { selectedPopulation = [] } = useAppSelector((state) => state.cohortCreation.request || {})

  const classes = useStyles()

  return (
    <Grid container className={classes.root}>
      <PopulationCard />
      {selectedPopulation && selectedPopulation.length > 0 ? <LogicalOperator /> : <></>}
    </Grid>
  )
}

export default DiagramView
