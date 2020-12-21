import React, { useState } from 'react'
import { Tabs, Tab } from '@material-ui/core'

import CCAMForm from './components/Form/CCAMForm'
import CCAMHierarchy from './components/Hierarchy/CCAMHierarchy'

const Index = (props: any) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [seletedTab, onChangeTab] = useState<'form' | 'hierarchy'>('form')

  return (
    <>
      <div>
        <Tabs value={seletedTab} onChange={(e, tab) => onChangeTab(tab)}>
          <Tab label="Form" value="form" />
          <Tab label="Hierarchy" value="hierarchy" />
        </Tabs>
      </div>

      {seletedTab === 'form' ? (
        <CCAMForm
          criteria={criteria}
          selectedCriteria={selectedCriteria}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
          goBack={goBack}
        />
      ) : (
        <CCAMHierarchy />
      )}
    </>
  )
}
export default Index
