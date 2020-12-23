import React, { useState } from 'react'
import { Tabs, Tab } from '@material-ui/core'

import useStyles from './styles'

import CcamForm from './components/Form/CCAMForm'
import CcamHierarchy from './components/Hierarchy/CCAMHierarchy'

const Index = (props: any) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [seletedTab, onChangeTab] = useState<'form' | 'hierarchy'>('form')

  const classes = useStyles()

  return (
    <>
      <div>
        <Tabs className={classes.tabs} value={seletedTab} onChange={(e, tab) => onChangeTab(tab)}>
          <Tab label="Formulaire" value="form" />
          <Tab label="Hierarchie" value="hierarchy" />
        </Tabs>
      </div>

      {seletedTab === 'form' ? (
        <CcamForm
          criteria={criteria}
          selectedCriteria={selectedCriteria}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
          goBack={goBack}
        />
      ) : (
        <CcamHierarchy
          criteria={criteria}
          selectedCriteria={selectedCriteria}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
          goBack={goBack}
        />
      )}
    </>
  )
}
export default Index
