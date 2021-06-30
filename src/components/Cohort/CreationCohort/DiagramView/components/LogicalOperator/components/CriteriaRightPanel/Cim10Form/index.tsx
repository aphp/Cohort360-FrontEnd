import React, { useState } from 'react'
import { Tabs, Tab } from '@material-ui/core'

import Cim10Form from './components/Form/Cim10Form'
import Cim10Hierarchy from './components/Hierarchy/Cim10Hierarchy'

import useStyles from './styles'

const defaultCondition = {
  type: 'Condition',
  title: 'Critère de diagnostic',
  code: [],
  diagnosticType: [],
  occurrence: 1,
  occurrenceComparator: '>=',
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true
}

const Index = (props: any) => {
  const classes = useStyles()

  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [seletedTab, onChangeTab] = useState<'form' | 'hierarchy'>(selectedCriteria ? 'form' : 'hierarchy')
  const [defaultValues, onChangeDefaultValues] = useState(selectedCriteria || defaultCondition)
  console.log('defaultValues :>> ', defaultValues)
  console.log('selectedCriteria :>> ', selectedCriteria)

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

  return (
    <>
      <div>
        <Tabs className={classes.tabs} value={seletedTab} onChange={(e, tab) => onChangeTab(tab)}>
          <Tab label="Hierarchie" value="hierarchy" />
          <Tab label="Formulaire" value="form" />
        </Tabs>
      </div>

      {seletedTab === 'form' ? (
        <Cim10Form
          isEdition={isEdition}
          criteria={criteria}
          selectedCriteria={defaultValues}
          onChangeValue={_onChangeValue}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
          goBack={goBack}
        />
      ) : (
        <Cim10Hierarchy
          isEdition={isEdition}
          criteria={criteria}
          selectedCriteria={defaultValues}
          onChangeSelectedHierarchy={_onChangeSelectedHierarchy}
          goBack={goBack}
        />
      )}
    </>
  )
}
export default Index
