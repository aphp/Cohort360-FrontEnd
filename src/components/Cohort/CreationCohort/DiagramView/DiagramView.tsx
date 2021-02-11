import React from 'react'
import { Grid } from '@material-ui/core'

import PopulationCard from './components/PopulationCard/PopulationCard'
import GroupCard from './components/GroupCard/GroupCard'
// import TemporalConstraintCard from './components/TemporalConstraintCard/TemporalConstraintCard'

import { useAppSelector } from 'state'

import useStyles from './styles'

const DiagramView: React.FC = () => {
  const { selectedPopulation = [] } = useAppSelector((state) => state.cohortCreation.request || {})

  const classes = useStyles()

  return (
    <Grid container className={classes.root}>
      {/* <Grid item>
        <TemporalConstraintCard />
      </Grid> */}
      <Grid item>
        <PopulationCard />
        {selectedPopulation && selectedPopulation.length > 0 ? <GroupCard /> : <></>}
      </Grid>
    </Grid>
  )
}

export default DiagramView
