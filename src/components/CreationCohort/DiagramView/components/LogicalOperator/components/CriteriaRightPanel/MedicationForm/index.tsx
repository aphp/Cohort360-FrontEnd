import React, { useState, useEffect } from 'react'
import { Tabs, Tab } from '@mui/material'

import MedicationExploration from './components/Hierarchy/MedicationHierarchy'

import { CriteriaDrawerComponentProps } from 'types'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { initSyncHierarchyTableEffect, syncOnChangeFormValue } from 'utils/pmsi'
import { fetchMedication } from 'state/medication'
import { EXPLORATION } from '../../../../../../../../constants'
import { Hierarchy } from 'types/hierarchy'
import { MedicationDataType, form } from '../forms/MedicationForm'
import { CriteriaType } from 'types/requestCriterias'
import CriteriaForm from '../CriteriaForm'
import { fetchValueSet } from 'services/aphp/callApi'

const Index = (props: CriteriaDrawerComponentProps) => {
  const { selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [selectedTab, setSelectedTab] = useState<'form' | 'exploration'>(selectedCriteria ? 'form' : 'exploration')
  const [defaultCriteria, setDefaultCriteria] = useState<MedicationDataType>(
    (selectedCriteria as MedicationDataType) || { ...form().initialData }
  )

  const isEdition = selectedCriteria !== null
  const dispatch = useAppDispatch()
  const medicationHierarchy = useAppSelector((state) => state.medication.list || {})

  const { classes } = useStyles()

  const _onChangeSelectedHierarchy = (
    newSelectedItems: Hierarchy<any, any>[] | null | undefined,
    newHierarchy?: Hierarchy<any, any>[]
  ) => {
    _onChangeFormValue('code', newSelectedItems, newHierarchy)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _onChangeFormValue = (key: string, value: any, hierarchy: Hierarchy<any, any>[] = medicationHierarchy) =>
    syncOnChangeFormValue(
      key,
      value,
      hierarchy,
      setDefaultCriteria,
      selectedTab,
      CriteriaType.MEDICATION_REQUEST,
      dispatch
    )

  const _initSyncHierarchyTableEffect = async () => {
    await initSyncHierarchyTableEffect(
      medicationHierarchy,
      selectedCriteria,
      defaultCriteria && defaultCriteria.code ? defaultCriteria.code : [],
      fetchMedication,
      CriteriaType.MEDICATION_REQUEST,
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
        <Tab label={EXPLORATION} value="exploration" />
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
        <MedicationExploration
          isOpen={selectedTab === 'exploration'}
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
