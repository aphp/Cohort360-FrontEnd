import React, { useEffect, useState } from 'react'
import { Tab, Tabs } from '@mui/material'

import useStyles from './styles'

import CcamForm from './components/Form/CCAMForm'
import CcamHierarchy from './components/Hierarchy/CCAMHierarchy'
import { initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchProcedure } from 'state/pmsi'
import { EXPLORATION } from '../../../../../../../..//constants'

import { CriteriaDrawerComponentProps } from 'types'
import { CcamDataType, Comparators, CriteriaType } from 'types/requestCriterias'
import { HierarchyElementWithSystem } from 'types/hierarchy'

export const defaultProcedure: Omit<CcamDataType, 'id'> = {
  type: CriteriaType.PROCEDURE,
  title: "Critères d'actes CCAM",
  label: undefined,
  code: [],
  source: 'AREM',
  occurrence: 1,
  hierarchy: undefined,
  occurrenceComparator: Comparators.GREATER_OR_EQUAL,
  startOccurrence: [null, null],
  isInclusive: true,
  encounterStartDate: [null, null],
  encounterEndDate: [null, null],
  encounterStatus: []
}

const Index = (props: CriteriaDrawerComponentProps) => {
  const { criteriaData, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [selectedTab, setSelectedTab] = useState<'form' | 'hierarchy'>(selectedCriteria ? 'form' : 'hierarchy')
  const [defaultCriteria, setDefaultCriteria] = useState<CcamDataType>(
    (selectedCriteria as CcamDataType) || defaultProcedure
  )

  const isEdition = selectedCriteria !== null
  const dispatch = useAppDispatch()
  const ccamHierarchy = useAppSelector((state) => state.pmsi.procedure.list || {})
  const { classes } = useStyles()

  const _onChangeSelectedHierarchy = (
    newSelectedItems: HierarchyElementWithSystem[] | null | undefined,
    newHierarchy?: HierarchyElementWithSystem[]
  ) => {
    _onChangeFormValue('code', newSelectedItems, newHierarchy)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _onChangeFormValue = async (
    key: string,
    value: any,
    newHierarchy: HierarchyElementWithSystem[] = ccamHierarchy
  ) =>
    await syncOnChangeFormValue(
      key,
      value,
      newHierarchy,
      setDefaultCriteria,
      selectedTab,
      defaultProcedure.type,
      dispatch
    )
  const _initSyncHierarchyTableEffect = async () => {
    await initSyncHierarchyTableEffect(
      ccamHierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchProcedure,
      defaultProcedure.type,
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
        <Tab label={EXPLORATION} value="hierarchy" />
        <Tab label="Formulaire" value="form" />
      </Tabs>

      {
        <CcamForm
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
        <CcamHierarchy
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
