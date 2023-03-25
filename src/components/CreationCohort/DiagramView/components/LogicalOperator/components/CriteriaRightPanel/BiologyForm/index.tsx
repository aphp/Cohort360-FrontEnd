import React, { useState, useEffect } from 'react'
import { Tabs, Tab } from '@mui/material'

import useStyles from './styles'

import BiologyForm from './components/Form/BiologyForm'
import BiologyHierarchy from './components/Hierarchy/BiologyHierarchy'
import BiologySearch from './components/BiologySearch/BiologySearch'
import { initSyncHierarchyTableEffect, OBSERVATION, syncOnChangeFormValue } from 'utils/pmsi'
import { fetchProcedure, PmsiListType } from 'state/pmsi'
import { useAppDispatch, useAppSelector } from 'state'

export const defaultBiology = {
  type: OBSERVATION,
  title: 'Critères de biologie',
  code: [],
  isLeaf: false,
  valueMin: 0,
  valueMax: 0,
  valueComparator: '>=',
  occurrence: 1,
  occurrenceComparator: '>=',
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true
}

const Index = (props: any) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const classes = useStyles()
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
      fetchProcedure,
      defaultBiology.type,
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
          <Tab label="Recherche" value="search" />
          <Tab label="Formulaire" value="form" />
        </Tabs>
      </div>

      {selectedTab === 'form' && (
        <BiologyForm
          isOpen={selectedTab === 'form'}
          isEdition={isEdition}
          criteria={criteria}
          selectedCriteria={defaultCriteria}
          onChangeValue={_onChangeFormValue}
          onChangeSelectedCriteria={onChangeSelectedCriteria}
          goBack={goBack}
        />
      )}
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
          onConfirm={() => setSelectedTab('search')}
          goBack={goBack}
        />
      }
    </>
  )
}
export default Index
