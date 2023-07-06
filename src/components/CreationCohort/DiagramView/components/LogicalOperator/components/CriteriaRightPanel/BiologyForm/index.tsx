import React, { useState, useEffect, useCallback } from 'react'
import { Tabs, Tab } from '@mui/material'

import useStyles from './styles'

import BiologyForm from './components/Form/BiologyForm'
import BiologyHierarchy from './components/Hierarchy/BiologyHierarchy'
import BiologySearch from './components/BiologySearch/BiologySearch'
import { initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { PmsiListType } from 'state/pmsi'
import { fetchBiology } from 'state/biology'
import { useAppDispatch, useAppSelector } from 'state'
import { EXPLORATION } from 'utils/constants'
import { Comparators, ObservationDataType, CriteriaType } from 'types/requestCriterias'
import { CriteriaDrawerComponentProps } from 'types'

export const defaultBiology: Omit<ObservationDataType, 'id'> = {
  type: CriteriaType.OBSERVATION,
  title: 'Critères de biologie',
  code: [],
  isLeaf: false,
  valueComparator: Comparators.GREATER_OR_EQUAL,
  searchByValue: [null, null],
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

  const { classes } = useStyles()
  const [selectedTab, setSelectedTab] = useState<'form' | 'hierarchy' | 'search'>(
    selectedCriteria ? 'form' : 'hierarchy'
  )
  const [defaultCriteria, setDefaultCriteria] = useState<ObservationDataType>(
    (selectedCriteria as ObservationDataType) || defaultBiology
  )

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
      (updatedCriteria) => setDefaultCriteria(updatedCriteria as ObservationDataType),
      selectedTab,
      defaultBiology.type,
      dispatch
    )
  const _initSyncHierarchyTableEffect = useCallback(async () => {
    await initSyncHierarchyTableEffect(
      biologyHierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchBiology,
      defaultBiology.type,
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
        <Tab label="Recherche" value="search" />
        <Tab label="Formulaire" value="form" />
      </Tabs>

      {
        <BiologyForm
          isOpen={selectedTab === 'form'}
          isEdition={isEdition}
          criteriaData={criteriaData}
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
