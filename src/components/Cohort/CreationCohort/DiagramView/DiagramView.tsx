import React from 'react'

import PopulationCard from './components/PopulationCard/PopulationCard'
import CriteriaCard from './components/CriteriaCard/CriteriaCard'

import { ScopeTreeRow, SelectedCriteriaType } from 'types'

import { useAppSelector } from 'state'

import useStyles from './styles'

type DiagramViewProps = {
  onChangeSelectedPopulation: (item: ScopeTreeRow[] | null) => void
  onChangeSelectedCriteria: (item: SelectedCriteriaType[]) => void
}

const DiagramView: React.FC<DiagramViewProps> = (props) => {
  const { onChangeSelectedPopulation, onChangeSelectedCriteria } = props
  const { selectedPopulation = [] } = useAppSelector((state) => state.cohortCreation.request || {})

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <PopulationCard onChangeSelectedPopulation={onChangeSelectedPopulation} />
      {selectedPopulation && selectedPopulation.length > 0 ? (
        <CriteriaCard onChangeSelectedCriteria={onChangeSelectedCriteria} />
      ) : (
        <></>
      )}
    </div>
  )
}

export default DiagramView
