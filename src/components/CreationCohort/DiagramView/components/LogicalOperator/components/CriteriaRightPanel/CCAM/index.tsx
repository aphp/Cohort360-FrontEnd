import React, { useEffect, useState } from 'react'
import { Tab, Tabs } from '@mui/material'

import useStyles from './styles'

import CcamHierarchy from './components/Hierarchy/CCAMHierarchy'
import { initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchProcedure } from 'state/pmsi'
import { EXPLORATION } from '../../../../../../../..//constants'

import { CriteriaDrawerComponentProps } from 'types'
import { CriteriaType } from 'types/requestCriterias'
import { Hierarchy } from 'types/hierarchy'
import { CcamDataType, form } from '../forms/CCAMForm'
import CriteriaForm from '../CriteriaForm'
import { fetchValueSet } from 'services/aphp/callApi'

const Index = (props: CriteriaDrawerComponentProps) => {
  const { selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [selectedTab, setSelectedTab] = useState<'form' | 'hierarchy'>(selectedCriteria ? 'form' : 'hierarchy')
  const [defaultCriteria, setDefaultCriteria] = useState<CcamDataType>(
    (selectedCriteria as CcamDataType) || { ...form().initialData }
  )

  const isEdition = selectedCriteria !== null
  const dispatch = useAppDispatch()
  const ccamHierarchy = useAppSelector((state) => state.pmsi.procedure.list || {})
  const { classes } = useStyles()

  const _onChangeSelectedHierarchy = (
    newSelectedItems: Hierarchy<any, any>[] | null | undefined,
    newHierarchy?: Hierarchy<any, any>[]
  ) => {
    _onChangeFormValue('code', newSelectedItems, newHierarchy)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _onChangeFormValue = async (key: string, value: any, newHierarchy: Hierarchy<any, any>[] = ccamHierarchy) =>
    await syncOnChangeFormValue(
      key,
      value,
      newHierarchy,
      setDefaultCriteria,
      selectedTab,
      CriteriaType.PROCEDURE,
      dispatch
    )
  const _initSyncHierarchyTableEffect = async () => {
    await initSyncHierarchyTableEffect(
      ccamHierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchProcedure,
      CriteriaType.PROCEDURE,
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
