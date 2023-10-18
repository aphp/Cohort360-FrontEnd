import React, { useState, useEffect } from 'react'
import { Tabs, Tab } from '@mui/material'

import useStyles from './styles'

import BiologyForm from './components/Form/BiologyForm'
import BiologyHierarchy from './components/Hierarchy/BiologyHierarchy'
import BiologySearch from './components/BiologySearch/BiologySearch'
import { initSyncHierarchyTableEffect, OBSERVATION, syncOnChangeFormValue } from 'utils/pmsi'
import { PmsiListType } from 'state/pmsi'
import { fetchBiology } from 'state/biology'
import { useAppDispatch, useAppSelector } from 'state'
import { EXPLORATION } from 'utils/constants'

import { Comparators, CriteriaDrawerComponentProps } from 'types'

export const defaultBiology = {
  type: OBSERVATION,
  title: 'Critères de biologie',
  code: [],
  isLeaf: false,
  valueComparator: Comparators.GREATER_OR_EQUAL,
  occurrence: 1,
  occurrenceComparator: '>=',
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true
}

const Index = (props: CriteriaDrawerComponentProps) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const { classes } = useStyles()
  const [selectedTab, setSelectedTab] = useState<'form' | 'hierarchy' | 'search'>(
    selectedCriteria ? 'form' : 'hierarchy'
  )
  const [defaultCriteria, setDefaultCriteria] = useState(selectedCriteria || defaultBiology)

  const isEdition = selectedCriteria !== null
  const dispatch = useAppDispatch()
  const biologyHierarchy = useAppSelector((state) => state.biology.list || {})

  const _onChangeSelectedHierarchy = (newSelectedItems: any, newHierarchy?: PmsiListType[]) => {
    _onChangeFormValue('code', newSelectedItems, newHierarchy)
  }
  const _onChangeFormValue = async (key: string, value: any, newHierarchy: PmsiListType[] = biologyHierarchy) =>
    await syncOnChangeFormValue(
      key,
      value,
      defaultCriteria,
      newHierarchy,
      setDefaultCriteria,
      selectedTab,
      defaultBiology.type,
      dispatch
    )
  const _initSyncHierarchyTableEffect = async () => {
    await initSyncHierarchyTableEffect(
      biologyHierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchBiology,
      defaultBiology.type,
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
        <Tab label="Recherche" value="search" />
        <Tab label="Formulaire" value="form" />
      </Tabs>

      {
        <BiologyForm
          isOpen={selectedTab === 'form'}
          isEdition={isEdition}
          criteria={criteria}
          selectedCriteria={defaultCriteria}
          onChangeValue={_onChangeFormValue}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
          goBack={goBack}
        />
      }
      {selectedTab === 'search' && (
        <BiologySearch
          isEdition={isEdition}
          selectedCriteria={defaultCriteria}
          criteria={criteria}
          onChangeSelectedCriteria={_onChangeSelectedHierarchy}
          onConfirm={() => setSelectedTab('form')}
          goBack={goBack}
        />
      )}
      {
        <BiologyHierarchy
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
