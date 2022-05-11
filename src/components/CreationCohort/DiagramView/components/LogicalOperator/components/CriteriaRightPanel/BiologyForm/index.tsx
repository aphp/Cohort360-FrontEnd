import React, { useState } from 'react'
import { Tabs, Tab } from '@material-ui/core'

import useStyles from './styles'

import BiologyForm from './components/Form/BiologyForm'
import BiologyHierarchy from './components/Hierarchy/BiologyHierarchy'
import BiologySearch from './components/BiologySearch/BiologySearch'

const defaultBiology = {
  type: 'Observation',
  title: 'Critères de biologie',
  code: [],
  isLeaf: false,
  valueMin: 0,
  valueMax: 0,
  valueComparator: '>=',
  occurrence: 1,
  occurrenceComparator: '>=',
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true
}

const Index = (props: any) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [selectedTab, onChangeTab] = useState<'form' | 'hierarchy' | 'search'>(selectedCriteria ? 'form' : 'hierarchy')
  const [defaultValues, onChangeDefaultValues] = useState(selectedCriteria || defaultBiology)

  const isEdition = selectedCriteria !== null ? true : false

  const _onChangeSelectedHierarchy = (code: any) => {
    console.log('code', code)
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
        <Tabs className={classes.tabs} value={selectedTab} onChange={(e, tab) => onChangeTab(tab)}>
          <Tab label="Hiérarchie" value="hierarchy" />
          <Tab label="Recherche" value="search" />
          <Tab label="Formulaire" value="form" />
        </Tabs>
      </div>

      {selectedTab === 'form' && (
        <BiologyForm
          isEdition={isEdition}
          criteria={criteria}
          selectedCriteria={defaultValues}
          onChangeValue={_onChangeValue}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
          goBack={goBack}
        />
      )}
      {selectedTab === 'search' && (
        <BiologySearch
          isEdition={isEdition}
          criteria={criteria}
          goBack={goBack}
          // onChangeValue={_onChangeValue}
          onChangeSelectedCriteria={_onChangeSelectedHierarchy}
          // selectedCriteria={defaultValues}
        />
      )}
      {selectedTab === 'hierarchy' && (
        <BiologyHierarchy
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
