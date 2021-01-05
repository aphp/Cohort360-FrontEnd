import React, { useState } from 'react'
import { Tabs, Tab } from '@material-ui/core'

import GHMForm from './components/Form/GhmForm'
import GHMHierarchy from './components/Hierarchy/'

import useStyles from './styles'

const Index = (props: any) => {
  const classes = useStyles()

  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [seletedTab, onChangeTab] = useState<'form' | 'hierarchy'>('form')

  return (
    <>
      <div>
        <Tabs className={classes.tabs} value={seletedTab} onChange={(e, tab) => onChangeTab(tab)}>
          <Tab label="Formulaire" value="form" />
          <Tab label="Hierarchie" value="hierarchy" />
        </Tabs>
      </div>

      {seletedTab === 'form' ? (
        <GHMForm
          criteria={criteria}
          selectedCriteria={selectedCriteria}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
          goBack={goBack}
        />S
      ) : (
        <GHMierarchy
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
