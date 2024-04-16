import React, { useEffect, useState } from 'react'
import { Tab, Tabs } from '@mui/material'

import GHMForm from './components/Form/GhmForm'
import GHMHierarchy from './components/Hierarchy/GhmHierarchy'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { fetchClaim } from 'state/pmsi'
import { EXPLORATION } from '../../../../../../../../constants'
import { CriteriaDrawerComponentProps } from 'types'
import { Comparators, GhmDataType, CriteriaType } from 'types/requestCriterias'
import { Hierarchy } from 'types/hierarchy'

export const defaultClaim: Omit<GhmDataType, 'id'> = {
  type: CriteriaType.CLAIM,
  title: 'Critères GHM',
  code: [],
  label: undefined,
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER_OR_EQUAL,
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true,
  encounterStartDate: null,
  encounterEndDate: null,
  encounterStatus: []
}

const Index = (props: CriteriaDrawerComponentProps) => {
  const { criteriaData, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [selectedTab, setSelectedTab] = useState<'form' | 'hierarchy'>(selectedCriteria ? 'form' : 'hierarchy')
  const [defaultCriteria, setDefaultCriteria] = useState<GhmDataType>((selectedCriteria as GhmDataType) || defaultClaim)

  const isEdition = selectedCriteria !== null
  const dispatch = useAppDispatch()
  const ghmState = useAppSelector((state) => state.pmsi.claim || {})
  const ghmHierarchy = ghmState.list

  const { classes } = useStyles()

  const _onChangeSelectedHierarchy = (
    newSelectedItems: Hierarchy<any, any>[] | null | undefined,
    newHierarchy?: Hierarchy<any, any>[]
  ) => {
    _onChangeFormValue('code', newSelectedItems, newHierarchy)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _onChangeFormValue = async (key: string, value: any, newHierarchy: Hierarchy<any, any>[] = ghmHierarchy) =>
    await syncOnChangeFormValue(
      key,
      value,
      defaultCriteria,
      newHierarchy,
      (updatedCriteria) => setDefaultCriteria(updatedCriteria as GhmDataType),
      selectedTab,
      defaultClaim.type,
      dispatch
    )

  const _initSyncHierarchyTableEffect = async () => {
    await initSyncHierarchyTableEffect(
      ghmHierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchClaim,
      defaultClaim.type,
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
        <GHMForm
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
        <GHMHierarchy
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
