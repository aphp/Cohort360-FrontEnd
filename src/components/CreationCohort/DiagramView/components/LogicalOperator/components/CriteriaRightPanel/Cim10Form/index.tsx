import React, { useEffect, useState } from 'react'
import { Tab, Tabs } from '@mui/material'

import Cim10Hierarchy from './components/Hierarchy/Cim10Hierarchy'

import useStyles from './styles'
import { initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchCondition } from 'state/pmsi'
import { EXPLORATION } from '../../../../../../../../constants'
import { CriteriaDrawerComponentProps } from 'types'
import { Hierarchy } from 'types/hierarchy'
import { Cim10DataType, form } from '../forms/Cim10Form'
import { CriteriaType } from 'types/requestCriterias'
import CriteriaForm from '../CriteriaForm'
import { fetchValueSet } from 'services/aphp/callApi'

const Index = (props: CriteriaDrawerComponentProps) => {
  const { selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [selectedTab, setSelectedTab] = useState<'form' | 'hierarchy'>(selectedCriteria ? 'form' : 'hierarchy')
  const [defaultCriteria, setDefaultCriteria] = useState<Cim10DataType>(
    (selectedCriteria as Cim10DataType) || { ...form().initialData }
  )

  const isEdition = selectedCriteria !== null
  const dispatch = useAppDispatch()
  const cim10Hierarchy = useAppSelector((state) => state.pmsi.condition.list || {})

  const { classes } = useStyles()
  const _onChangeSelectedHierarchy = (
    newSelectedItems: Hierarchy<any, any>[] | null | undefined,
    newHierarchy?: Hierarchy<any, any>[]
  ) => {
    _onChangeFormValue('code', newSelectedItems, newHierarchy)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _onChangeFormValue = async (key: string, value: any, newHierarchy: Hierarchy<any, any>[] = cim10Hierarchy) =>
    await syncOnChangeFormValue(
      key,
      value,
      newHierarchy,
      setDefaultCriteria,
      selectedTab,
      CriteriaType.CONDITION,
      dispatch
    )
  const _initSyncHierarchyTableEffect = async () => {
    await initSyncHierarchyTableEffect(
      cim10Hierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchCondition,
      CriteriaType.CONDITION,
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

      {selectedTab === 'form' && (
        <CriteriaForm
          {...form()}
          updateData={onChangeSelectedCriteria}
          goBack={goBack}
          data={defaultCriteria || undefined}
          searchCode={(code: string, codeSystemUrl: string, abortSignal: AbortSignal) =>
            fetchValueSet(
              codeSystemUrl,
              { valueSetTitle: 'Toute la hiérarchie', search: code, noStar: false },
              abortSignal
            )
          }
        />
      )}
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
