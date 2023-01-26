import React, { useEffect, useState } from 'react'
import { Tab, Tabs } from '@material-ui/core'

import MedicationForm from './components/Form/MedicationForm'
import MedicationHierarchy from './components/Hierarchy/MedicationHierarchy'

import { MedicationDataType } from 'types'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { initSyncHierarchyTableEffect, MEDICATION_REQUEST, syncOnChangeFormValue } from 'utils/pmsi'
import { fetchMedication } from 'state/medication'
import { PmsiListType } from 'state/pmsi'

export const defaultMedication: MedicationDataType = {
  type: MEDICATION_REQUEST,
  title: 'Critère de médicament',
  code: [],
  prescriptionType: [],
  administration: [],
  occurrence: 1,
  occurrenceComparator: '>=',
  startOccurrence: '',
  endOccurrence: '',
  encounterEndDate: null,
  encounterStartDate: null,
  isInclusive: true
}

const Index = (props: any) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [selectedTab, setSelectedTab] = useState<'form' | 'hierarchy'>(selectedCriteria ? 'form' : 'hierarchy')
  const [defaultCriteria, setDefaultCriteria] = useState(selectedCriteria || defaultMedication)

  const isEdition = selectedCriteria !== null
  const dispatch = useAppDispatch()
  const medicationHierarchy = useAppSelector((state) => state.medication.list || {})

  const classes = useStyles()

  const _onChangeSelectedHierarchy = (newSelectedItems: any, newHierarchy?: PmsiListType[]) => {
    _onChangeFormValue('code', newSelectedItems, newHierarchy)
  }
  const _onChangeFormValue = (key: string, value: any, hierarchy: PmsiListType[] = medicationHierarchy) =>
    syncOnChangeFormValue(
      key,
      value,
      defaultCriteria,
      hierarchy,
      setDefaultCriteria,
      selectedTab,
      defaultMedication.type,
      dispatch
    )

  const _initSyncHierarchyTableEffect = async () => {
    await initSyncHierarchyTableEffect(
      medicationHierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchMedication,
      defaultMedication.type,
      dispatch
    )
  }
  useEffect(() => {
    _initSyncHierarchyTableEffect()
  }, [])

  return (
    <>
      <div>
        <Tabs className={classes.tabs} value={selectedTab} onChange={(e, tab) => setSelectedTab(tab)}>
          <Tab label="Hiérarchie" value="hierarchy" />
          <Tab label="Formulaire" value="form" />
        </Tabs>
      </div>
      {
        <MedicationForm
          isOpen={selectedTab === 'form'}
          isEdition={isEdition}
          criteria={criteria}
          selectedCriteria={defaultCriteria}
          onChangeValue={_onChangeFormValue}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
          goBack={goBack}
        />
      }
      {
        <MedicationHierarchy
          isOpen={selectedTab === 'hierarchy'}
          isEdition={isEdition}
          selectedCriteria={defaultCriteria}
          onChangeSelectedHierarchy={_onChangeSelectedHierarchy}
          onConfirm={() => setSelectedTab('form')}
          goBack={goBack}
        />
      }
    </>
  )
}
export default Index
