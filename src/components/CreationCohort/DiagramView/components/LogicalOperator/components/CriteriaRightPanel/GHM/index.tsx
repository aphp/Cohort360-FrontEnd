import React, { useEffect, useState } from 'react'
import { Tab, Tabs } from '@mui/material'

import GHMHierarchy from './components/Hierarchy/GhmHierarchy'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { fetchClaim } from 'state/pmsi'
import { EXPLORATION } from '../../../../../../../../constants'
import { CriteriaDrawerComponentProps } from 'types'
import { Hierarchy } from 'types/hierarchy'
import { form, GhmDataType } from '../forms/GHMForm'
import { CriteriaType } from 'types/requestCriterias'
import { fetchValueSet } from 'services/aphp/callApi'
import CriteriaForm from '../CriteriaForm'

const Index = (props: CriteriaDrawerComponentProps) => {
  const { selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [selectedTab, setSelectedTab] = useState<'form' | 'hierarchy'>(selectedCriteria ? 'form' : 'hierarchy')
  const [defaultCriteria, setDefaultCriteria] = useState<GhmDataType>(
    (selectedCriteria as GhmDataType) || { ...form().initialData }
  )

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
    await syncOnChangeFormValue(key, value, newHierarchy, setDefaultCriteria, selectedTab, CriteriaType.CLAIM, dispatch)

  const _initSyncHierarchyTableEffect = async () => {
    await initSyncHierarchyTableEffect(
      ghmHierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchClaim,
      CriteriaType.CLAIM,
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

      {selectedTab === 'form' ? (
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
      ) : null}
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
