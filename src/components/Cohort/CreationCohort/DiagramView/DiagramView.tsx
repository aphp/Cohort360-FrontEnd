import React from 'react'

import PopulationCard from './components/PopulationCard/PopulationCard'
import GroupCard from './components/GroupCard/GroupCard'

import { useAppSelector } from 'state'

import useStyles from './styles'

const DiagramView: React.FC = () => {
  const { selectedPopulation = [] } = useAppSelector((state) => state.cohortCreation.request || {})

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <PopulationCard />
      {selectedPopulation && selectedPopulation.length > 0 ? <GroupCard /> : <></>}
    </div>
  )
}

export default DiagramView
