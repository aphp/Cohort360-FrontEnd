import React, { useState, useEffect } from 'react'
import { Tabs, Tab } from '@mui/material'

import MedicationForm from './components/Form/MedicationForm'
import MedicationExploration from './components/Hierarchy/MedicationHierarchy'

import { CriteriaDrawerComponentProps, HierarchyElement } from 'types'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { fetchMedication } from 'state/medication'
import { EXPLORATION } from '../../../../../../../../constants'
import { Comparators, MedicationDataType, CriteriaType } from 'types/requestCriterias'

export const defaultMedication: Omit<MedicationDataType, 'id'> = {
  type: CriteriaType.MEDICATION_REQUEST,
  title: 'Critère de médicament',
  code: [],
  administration: [],
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER_OR_EQUAL,
  startOccurrence: '',
  endOccurrence: '',
  encounterEndDate: null,
  encounterStartDate: null,
  isInclusive: true,
  encounterStatus: []
}

const removeNonCommonFields = (medication: MedicationDataType) => {
  if (medication.type === CriteriaType.MEDICATION_ADMINISTRATION) {
    return { ...medication, prescriptionType: null }
  }
  return medication
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

  const { classes } = useStyles()

  const _onChangeSelectedHierarchy = (
    newSelectedItems: HierarchyElement[] | null | undefined,
    newHierarchy?: HierarchyElement[]
  ) => {
    _onChangeFormValue('code', newSelectedItems, newHierarchy)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _onChangeFormValue = (key: string, value: any, hierarchy: HierarchyElement[] = medicationHierarchy) =>
    syncOnChangeFormValue(
      key,
      value,
      defaultCriteria,
      hierarchy,
      (updatedCriteria) => setDefaultCriteria(removeNonCommonFields(updatedCriteria as MedicationDataType)),
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
      <Tabs
        indicatorColor="secondary"
        className={classes.tabs}
        value={selectedTab}
        onChange={(e, tab) => setSelectedTab(tab)}
      >
        <Tab label={EXPLORATION} value="exploration" />
        <Tab label="Formulaire" value="form" />
      </Tabs>

      {
        <MedicationForm
          isOpen={selectedTab === 'form'}
          isEdition={isEdition}
          criteriaData={criteriaData}
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
