import React, { useState } from 'react'
import { Tabs, Tab } from '@mui/material'

import useStyles from './styles'

import CcamForm from './components/Form/CCAMForm'
import CcamHierarchy from './components/Hierarchy/CCAMHierarchy'

const defaultProcedure = {
  type: 'Procedure',
  title: "Critères d'actes CCAM",
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
  const [defaultValues, onChangeDefaultValues] = useState(selectedCriteria || defaultProcedure)

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
          <Tab label="Hierarchie" value="hierarchy" />
          <Tab label="Formulaire" value="form" />
        </Tabs>
      </div>

      {seletedTab === 'form' ? (
        <CcamForm
          isEdition={isEdition}
          criteria={criteria}
          selectedCriteria={defaultValues}
          onChangeValue={_onChangeValue}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
          goBack={goBack}
        />
      ) : (
        <CcamHierarchy
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
