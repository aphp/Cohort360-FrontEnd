import React, { useState } from 'react'
import { Grid, Tabs, Tab } from '@material-ui/core'

import CCAMForm from './components/Form/CCAMForm'
import CCAMHierarchy from './components/Hierarchy/CCAMHierarchy'

const index: React.FC = () => {
  const [selectedTab, onChangeTab] = useState<'form' | 'hierarchy'>('form')

  return (
    <Grid>
      <Tabs value={selectedTab} onchange={(e, tab) => onChangeTab(tab)}>
        <Tab label="form" value="form" />
        <Tab label="hierarchy" value="hierarchy" />
      </Tabs>
      {selectedTab === 'form' ? (
        <CCAMForm
          criteria={criteria}
          selectedCriteria={selectedCriteria}
          goBack={goBack}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
        />
      ) : (
        <CCAMHierarchy />
      )}
    </Grid>
  )
}

export default index
