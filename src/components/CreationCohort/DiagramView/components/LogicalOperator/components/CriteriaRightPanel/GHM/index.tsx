import React, { useState } from 'react'
import { Tabs, Tab } from '@mui/material'

import GHMForm from './components/Form/GhmForm'
import GHMHierarchy from './components/Hierarchy/GhmHierarchy'

import useStyles from './styles'

const defaultDemographic = {
  type: 'Claim',
  title: 'Critères GHM',
  code: [],
  occurrence: 1,
  occurrenceComparator: '>=',
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true
}

const Index = (props: any) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [seletedTab, onChangeTab] = useState<'form' | 'hierarchy'>(selectedCriteria ? 'form' : 'hierarchy')
  const [defaultValues, onChangeDefaultValues] = useState(selectedCriteria || defaultDemographic)

  const isEdition = selectedCriteria !== null ? true : false

  const _onChangeSelectedHierarchy = (code: any) => {
    onChangeDefaultValues({
      ...defaultValues,
      code
    })
    onChangeTab('form')
  }

  const _onChangeValue = (key: string, value: any) => {
    const _defaultValues = defaultValues ? { ...defaultValues } : {}
    _defaultValues[key] = value
    onChangeDefaultValues(_defaultValues)
  }

  const classes = useStyles()

  return (
    <>
      <div>
        <Tabs className={classes.tabs} value={seletedTab} onChange={(e, tab) => onChangeTab(tab)}>
          <Tab label="Hiérarchie" value="hierarchy" />
          <Tab label="Formulaire" value="form" />
        </Tabs>
      </div>

      {seletedTab === 'form' ? (
        <GHMForm
          isEdition={isEdition}
          criteria={criteria}
          selectedCriteria={defaultValues}
          onChangeValue={_onChangeValue}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
          goBack={goBack}
        />
      ) : (
        <GHMHierarchy
          isEdition={isEdition}
          selectedCriteria={selectedCriteria}
          onChangeSelectedHierarchy={_onChangeSelectedHierarchy}
          goBack={goBack}
        />
      )}
    </>
  )
}
export default Index
