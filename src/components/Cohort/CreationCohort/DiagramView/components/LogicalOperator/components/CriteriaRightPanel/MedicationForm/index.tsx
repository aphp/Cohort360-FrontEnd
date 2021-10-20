import React, { useState } from 'react'
import { Tabs, Tab } from '@material-ui/core'

import MedicationForm from './components/Form/MedicationForm'
import MedicationHierarchy from './components/Hierarchy/MedicationHierarchy'

import { MedicationDataType } from 'types'

import useStyles from './styles'

const defaultMedication: MedicationDataType = {
  type: 'MedicationRequest',
  title: 'Critère de médicament',
  code: [],
  prescriptionType: [],
  administration: [],
  occurrence: 1,
  occurrenceComparator: '>=',
  startOccurrence: null,
  endOccurrence: null,
  isInclusive: true
}

const Index = (props: any) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [seletedTab, onChangeTab] = useState<'form' | 'hierarchy'>(selectedCriteria ? 'form' : 'hierarchy')
  const [defaultValues, onChangeDefaultValues] = useState(selectedCriteria || defaultMedication)

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
        <MedicationForm
          isEdition={isEdition}
          criteria={criteria}
          selectedCriteria={defaultValues}
          onChangeValue={_onChangeValue}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
          goBack={goBack}
        />
      ) : (
        <MedicationHierarchy
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
