import React, { useState, useEffect, useContext } from 'react'
import { Tabs, Tab } from '@mui/material'

import useStyles from './styles'

import BiologyHierarchy from './components/Hierarchy/BiologyHierarchy'
import BiologySearch from './components/BiologySearch/BiologySearch'
import { initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { fetchBiology } from 'state/biology'
import { useAppDispatch, useAppSelector } from 'state'
import { CriteriaType } from 'types/requestCriterias'
import { CriteriaDrawerComponentProps } from 'types'
import { Hierarchy } from 'types/hierarchy'
import { AppConfig } from 'config'
import { ObservationDataType, form } from '../forms/BiologyForm'
import { fetchValueSet } from 'services/aphp/callApi'
import CriteriaForm from '../CriteriaForm'

const Index = (props: CriteriaDrawerComponentProps) => {
  const { selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const config = useContext(AppConfig)
  const { classes } = useStyles()
  const [selectedTab, setSelectedTab] = useState<'form' | 'hierarchy' | 'search'>(
    selectedCriteria ? 'form' : 'hierarchy'
  )
  const [defaultCriteria, setDefaultCriteria] = useState<ObservationDataType>(
    (selectedCriteria as ObservationDataType) || { ...form().initialData }
  )

  const isEdition = selectedCriteria !== null
  const dispatch = useAppDispatch()
  const biologyHierarchy = useAppSelector((state) => state.biology.list || {})

  const _onChangeSelectedHierarchy = (
    newSelectedItems: Hierarchy<any, any>[] | null | undefined,
    newHierarchy?: Hierarchy<any, any>[]
  ) => {
    _onChangeFormValue('code', newSelectedItems, newHierarchy)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _onChangeFormValue = async (key: string, value: any, newHierarchy: Hierarchy<any, any>[] = biologyHierarchy) =>
    await syncOnChangeFormValue(
      key,
      value,
      newHierarchy,
      setDefaultCriteria,
      selectedTab,
      CriteriaType.OBSERVATION,
      dispatch
    )
  const _initSyncHierarchyTableEffect = async () => {
    await initSyncHierarchyTableEffect(
      biologyHierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchBiology,
      CriteriaType.OBSERVATION,
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
        <Tab label={config.labels.exploration} value="hierarchy" />
        <Tab label="Recherche" value="search" />
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
