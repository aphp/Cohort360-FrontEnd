import React, { useState } from 'react'

import MedicationForm from './components/Form/MedicationForm'
import MedicationExploration from './components/Hierarchy/MedicationHierarchy'

import { CriteriaDrawerComponentProps } from 'types'

import { useAppDispatch, useAppSelector } from 'state'
import { initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { EXPLORATION } from '../../../../../../../../constants'
import { Comparators, MedicationDataType, CriteriaType } from 'types/requestCriterias'
import { HierarchyElementWithSystem } from 'types/hierarchy'

export const defaultMedication: Omit<MedicationDataType, 'id'> = {
  type: CriteriaType.MEDICATION_REQUEST,
  title: 'Critère de médicament',
  code: [],
  administration: [],
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER_OR_EQUAL,
  startOccurrence: [null, null],
  endOccurrence: [null, null],
  encounterEndDate: [null, null],
  encounterStartDate: [null, null],
  isInclusive: true,
  encounterStatus: []
}

const Index = (props: CriteriaDrawerComponentProps) => {
  const { criteriaData, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [selectedTab, setSelectedTab] = useState<'form' | 'exploration'>(selectedCriteria ? 'form' : 'exploration')
  const [defaultCriteria, setDefaultCriteria] = useState<MedicationDataType>(
    (selectedCriteria as MedicationDataType) || defaultMedication
  )

  const isEdition = selectedCriteria !== null
  const dispatch = useAppDispatch()
  const medicationHierarchy = useAppSelector((state) => state.medication.list || {})

  const _onChangeSelectedHierarchy = (
    newSelectedItems: HierarchyElementWithSystem[] | null | undefined,
    newHierarchy?: HierarchyElementWithSystem[]
  ) => {
    _onChangeFormValue('code', newSelectedItems, newHierarchy)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _onChangeFormValue = (key: string, value: any, hierarchy: HierarchyElementWithSystem[] = medicationHierarchy) =>

    syncOnChangeFormValue(key, value, hierarchy, setDefaultCriteria, selectedTab, defaultMedication.type, dispatch)

  /*const _initSyncHierarchyTableEffect = async () => {
    await initSyncHierarchyTableEffect(
      medicationHierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchMedication,
      defaultMedication.type,
      dispatch,
      true
    )
  }
  useEffect(() => {
    _initSyncHierarchyTableEffect()
  }, [])*/

  return (
    <>
      <MedicationForm
        isEdition={isEdition}
        criteriaData={criteriaData}
        selectedCriteria={defaultCriteria}
        onChangeValue={_onChangeFormValue}
        onChangeSelectedCriteria={onChangeSelectedCriteria}
        goBack={goBack}
      />
      {/*
        <MedicationExploration
          isOpen={selectedTab === 'exploration'}
          isEdition={isEdition}
          selectedCriteria={defaultCriteria}
          onChangeSelectedHierarchy={_onChangeSelectedHierarchy}
          onConfirm={() => setSelectedTab('form')}
          goBack={goBack}
        />
    */}
    </>
  )
}
export default Index
