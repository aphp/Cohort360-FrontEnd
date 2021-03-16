import React, { useState } from 'react'
import { Tabs, Tab } from '@material-ui/core'

import useStyles from './styles'

import CcamForm from './components/Form/CCAMForm'
import CcamHierarchy from './components/Hierarchy/CCAMHierarchy'

const defaultProcedure = {
  title: "Critères d'actes CCAM",
  code: [],
  occurrence: 0,
  occurrenceComparator: '<=',
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true
}

const Index = (props: any) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [seletedTab, onChangeTab] = useState<'form' | 'hierarchy'>('hierarchy')
  const [defaultValues, onChangeDefaultValues] = useState(selectedCriteria || defaultProcedure)

  const isEdition = selectedCriteria !== null ? true : false

  const _onChangeSelectedHierarchy = (code: any) => {
    onChangeDefaultValues({
      ...defaultValues,
      code
    })
    onChangeTab('form')
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
          onChangeSelectedCriteria={onChangeSelectedCriteria}
          goBack={goBack}
        />
      ) : (
        <CcamHierarchy
          isEdition={isEdition}
          criteria={criteria}
          selectedCriteria={selectedCriteria}
          onChangeSelectedHierarchy={_onChangeSelectedHierarchy}
          goBack={goBack}
        />
      )}
    </>
  )
}
export default Index
