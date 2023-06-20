import React, { useState, useEffect } from 'react'
import { Tabs, Tab } from '@mui/material'

import MedicationForm from './components/Form/MedicationForm'
import MedicationExploration from './components/Hierarchy/MedicationHierarchy'

import { CriteriaDrawerComponentProps } from 'types'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { fetchMedication } from 'state/medication'
import { PmsiListType } from 'state/pmsi'
import { EXPLORATION } from 'utils/constants'
import { Comparators, MedicationDataType, RessourceType } from 'types/requestCriterias'

export const defaultMedication: MedicationDataType = {
  type: RessourceType.MEDICATION_REQUEST,
  title: 'Critère de médicament',
  code: [],
  prescriptionType: [],
  administration: [],
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER_OR_EQUAL,
  startOccurrence: '',
  endOccurrence: '',
  encounterEndDate: null,
  encounterStartDate: null,
  isInclusive: true
}

const Index = (props: CriteriaDrawerComponentProps) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [selectedTab, setSelectedTab] = useState<'form' | 'exploration'>(selectedCriteria ? 'form' : 'exploration')
  const [defaultCriteria, setDefaultCriteria] = useState(selectedCriteria || defaultMedication)

  const isEdition = selectedCriteria !== null
  const dispatch = useAppDispatch()
  const medicationHierarchy = useAppSelector((state) => state.medication.list || {})

  const { classes } = useStyles()

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
      dispatch,
      criteria !== null && criteria.data?.atcHierarchy !== 'loading'
    )
  }
  useEffect(() => {
    _initSyncHierarchyTableEffect()
  }, [])

  return (
    <>
      <Tabs
        indicatorColor="secondary"
        className={classes.tabs}
        value={selectedTab}
        onChange={(e, tab) => setSelectedTab(tab)}
      >
        <Tab label={EXPLORATION} value="hierarchy" />
        <Tab label="Formulaire" value="form" />
      </Tabs>

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
        <MedicationExploration
          isOpen={selectedTab === 'exploration'}
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
