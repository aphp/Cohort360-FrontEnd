import React, { useEffect, useState } from 'react'
import { Tab, Tabs } from '@material-ui/core'

import Cim10Form from './components/Form/Cim10Form'
import Cim10Hierarchy from './components/Hierarchy/Cim10Hierarchy'

import useStyles from './styles'
import { CONDITION, initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchCondition, PmsiListType } from 'state/pmsi'

export const defaultCondition = {
  type: CONDITION,
  title: 'Critère de diagnostic',
  code: [],
  diagnosticType: [],
  occurrence: 1,
  occurrenceComparator: '>=',
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true
}

const Index = (props: any) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [selectedTab, setSelectedTab] = useState<'form' | 'hierarchy'>(selectedCriteria ? 'form' : 'hierarchy')
  const [defaultCriteria, setDefaultCriteria] = useState(selectedCriteria || defaultCondition)

  const isEdition = selectedCriteria !== null
  const dispatch = useAppDispatch()
  const cim10Hierarchy = useAppSelector((state) => state.pmsi.condition.list || {})

  const classes = useStyles()
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
      setDefaultCriteria,
      selectedTab,
      defaultCondition.type,
      dispatch
    )
  const _initSyncHierarchyTableEffect = async () => {
    await initSyncHierarchyTableEffect(
      cim10Hierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchCondition,
      defaultCondition.type,
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
        <Cim10Form
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
