import React, { useCallback, useEffect, useState } from 'react'
import { Tab, Tabs } from '@mui/material'

import Cim10Form from './components/Form/Cim10Form'
import Cim10Hierarchy from './components/Hierarchy/Cim10Hierarchy'

import useStyles from './styles'
import { initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchCondition, PmsiListType } from 'state/pmsi'
import { EXPLORATION } from 'utils/constants'
import { CriteriaDrawerComponentProps } from 'types'
import { Cim10DataType, Comparators, CriteriaType } from 'types/requestCriterias'

export const defaultCondition: Omit<Cim10DataType, 'id'> = {
  type: CriteriaType.CONDITION,
  title: 'Critère de diagnostic',
  code: [],
  label: undefined,
  diagnosticType: [],
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER_OR_EQUAL,
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true,
  encounterStartDate: null,
  encounterEndDate: null
}

const Index = (props: CriteriaDrawerComponentProps) => {
  const { criteriaData, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [selectedTab, setSelectedTab] = useState<'form' | 'hierarchy'>(selectedCriteria ? 'form' : 'hierarchy')
  const [defaultCriteria, setDefaultCriteria] = useState<Cim10DataType>(
    (selectedCriteria as Cim10DataType) || defaultCondition
  )

  const isEdition = selectedCriteria !== null
  const dispatch = useAppDispatch()
  const cim10Hierarchy = useAppSelector((state) => state.pmsi.condition.list || {})

  const { classes } = useStyles()
  const _onChangeSelectedHierarchy = (
    newSelectedItems: PmsiListType[] | null | undefined,
    newHierarchy?: PmsiListType[]
  ) => {
    _onChangeFormValue('code', newSelectedItems, newHierarchy)
  }
  const _onChangeFormValue = async (key: string, value: any, newHierarchy: PmsiListType[] = cim10Hierarchy) =>
    await syncOnChangeFormValue(
      key,
      value,
      defaultCriteria,
      newHierarchy,
      (updatedCriteria) => setDefaultCriteria(updatedCriteria as Cim10DataType),
      selectedTab,
      defaultCondition.type,
      dispatch
    )
  const _initSyncHierarchyTableEffect = useCallback(async () => {
    await initSyncHierarchyTableEffect(
      cim10Hierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchCondition,
      defaultCondition.type,
      dispatch
    )
    // TODO fix initSyncHierarchyTableEffect, because it's mess in there
    // it shouldn't depends on the hierarchy or selectedCriteria or defaultCriteria since it's changing it everytime
    // also PmsiListType type should be renamed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  useEffect(() => {
    _initSyncHierarchyTableEffect()
  }, [_initSyncHierarchyTableEffect])

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
        <Cim10Form
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
        <Cim10Hierarchy
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
