import React, { useEffect, useState } from 'react'
import { Tab, Tabs } from '@mui/material'

import useStyles from './styles'

import CcamForm from './components/Form/CCAMForm'
import CcamHierarchy from './components/Hierarchy/CCAMHierarchy'
import { initSyncHierarchyTableEffect, PROCEDURE, syncOnChangeFormValue } from 'utils/pmsi'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchProcedure, PmsiListType } from 'state/pmsi'
import { CriteriaDrawerComponentProps } from 'types'

export const defaultProcedure = {
  type: PROCEDURE,
  title: "Critères d'actes CCAM",
  code: [],
  occurrence: 1,
  occurrenceComparator: '>=',
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true
}

const Index = (props: CriteriaDrawerComponentProps) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [selectedTab, setSelectedTab] = useState<'form' | 'hierarchy'>(selectedCriteria ? 'form' : 'hierarchy')
  const [defaultCriteria, setDefaultCriteria] = useState(selectedCriteria || defaultProcedure)

  const isEdition = selectedCriteria !== null
  const dispatch = useAppDispatch()
  const ccamHierarchy = useAppSelector((state) => state.pmsi.procedure.list || {})
  const { classes } = useStyles()

  const _onChangeSelectedHierarchy = (
    newSelectedItems: PmsiListType[] | null | undefined,
    newHierarchy?: PmsiListType[]
  ) => {
    _onChangeFormValue('code', newSelectedItems, newHierarchy)
  }
  const _onChangeFormValue = async (key: string, value: any, newHierarchy: PmsiListType[] = ccamHierarchy) =>
    await syncOnChangeFormValue(
      key,
      value,
      defaultCriteria,
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
        <Tab label="Hiérarchie" value="hierarchy" />
        <Tab label="Formulaire" value="form" />
      </Tabs>

      {
        <CcamForm
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
