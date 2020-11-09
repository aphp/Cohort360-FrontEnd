import React from 'react'

import PopulationCard from './components/PopulationCard/PopulationCard'
import CriteriaCard from './components/CriteriaCard/CriteriaCard'

import { ScopeTreeRow, CriteriaItemType, SelectedCriteriaType } from 'types'

import useStyles from './styles'

type DiagramViewProps = {
  criteria: CriteriaItemType[]
  selectedPopulation: ScopeTreeRow[] | null
  selectedCriteria: SelectedCriteriaType[]
  onChangeSelectedPopulation: (item: ScopeTreeRow[] | null) => void
  onChangeSelectedCriteria: (item: SelectedCriteriaType[]) => void
}

const DiagramView: React.FC<DiagramViewProps> = (props) => {
  const { criteria, selectedPopulation, selectedCriteria, onChangeSelectedPopulation, onChangeSelectedCriteria } = props

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <PopulationCard selectedPopulation={selectedPopulation} onChangeSelectedPopulation={onChangeSelectedPopulation} />
      {selectedPopulation && selectedPopulation.length > 0 ? (
        <CriteriaCard
          criteria={criteria}
          selectedCriteria={selectedCriteria}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
        />
      ) : (
        <></>
      )}
    </div>
  )
}

export default DiagramView
