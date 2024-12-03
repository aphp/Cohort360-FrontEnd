import React, { useEffect, useState } from 'react'
import CriteriaLayout from 'components/ui/CriteriaLayout'
import {
  CriteriaForm as CriteriaFormDefinition,
  CriteriaFormItemViewProps,
  NumberAndComparatorDataType,
  NewDurationRangeType,
  CommonCriteriaData,
  DataTypes
} from './types'
import { CFItem, CFSection } from './components'
import FORM_ITEM_RENDERER from './mappers/renderers'
import { useAppSelector } from 'state'
import { LabelObject } from 'types/searchCriterias'
import { isFunction, isString } from 'lodash'

export type CriteriaFormRuntimeProps<T> = {
  goBack: () => void
  data?: T
  updateData: (data: T) => void
  onDataChange?: (data: T) => void
  searchCode: CriteriaFormItemViewProps<never>['searchCode']
}

type CriteriaFormProps<T> = CriteriaFormDefinition<T> & CriteriaFormRuntimeProps<T>

export default function CriteriaForm<T extends CommonCriteriaData>(props: CriteriaFormProps<T>) {
  const [criteriaData, setCriteriaData] = useState<T>(props.data ?? (props.initialData as T))
  const valueSets = useAppSelector((state) => state.valueSets)
  const selectedPopulation = useAppSelector((state) => state.cohortCreation.request.selectedPopulation || [])
  const {
    goBack,
    updateData,
    label,
    title,
    infoAlert,
    warningAlert,
    itemSections,
    errorMessages,
    globalErrorCheck,
    onDataChange
  } = props
  const isEdition = !!props.data
  const [error, setError] = useState<string>()

  const deidentified: boolean =
    selectedPopulation !== null &&
    selectedPopulation
      .map((population) => population && population.access)
      .filter((elem) => elem && elem === 'Pseudonymisé').length > 0

  if (globalErrorCheck) {
    const context = { deidentified }
    let globalError: string | undefined = undefined
    if (isFunction(globalErrorCheck)) {
      globalError = globalErrorCheck(criteriaData as Record<string, DataTypes>, context)
    } else if (isString(globalErrorCheck)) {
      globalError = eval(globalErrorCheck)(criteriaData, context)
    }
    if (globalError !== error) {
      setError(globalError)
    }
  }

  useEffect(() => {
    onDataChange?.(criteriaData)
  }, [criteriaData, onDataChange])

  console.log('rendering form')
  console.log('test itemSections', itemSections)
  return (
    <CriteriaLayout
      criteriaLabel={`${label}`}
      mainTitle={title}
      title={criteriaData.title}
      onChangeTitle={(title) => setCriteriaData({ ...criteriaData, title })}
      isEdition={isEdition}
      goBack={goBack}
      onSubmit={() => updateData(criteriaData)}
      disabled={error !== undefined}
      isInclusive={!!criteriaData.isInclusive}
      onChangeIsInclusive={(isInclusive) => setCriteriaData({ ...criteriaData, isInclusive: isInclusive })}
      infoAlert={infoAlert}
      warningAlert={warningAlert}
      errorAlert={error && errorMessages ? [errorMessages[error]] : undefined}
    >
      {itemSections.map((section, index) => (
        <CFSection
          key={index}
          info={section.info}
          title={section.title}
          defaulCollapsed={section.defaulCollapsed}
          collapsed={section.items.every((item) => {
            if (item.valueKey) {
              const value = criteriaData[item.valueKey]
              let isNull = !value || (Array.isArray(value) && value.length === 0)
              if (item.type === 'numberAndComparator') {
                isNull = isNull || !(value as NumberAndComparatorDataType).value
              } else if (item.type === 'calendarRange' || item.type === 'durationRange') {
                const duration = value as NewDurationRangeType
                isNull = isNull || (duration.start === null && duration.end === null)
              }
              if (!isNull) console.log(isNull, item.valueKey, value)

              return isNull
            }
            return true
          })}
        >
          {section.items.map((item, index) => (
            <CFItem
              key={index}
              {...{
                viewRenderers: FORM_ITEM_RENDERER,
                ...item,
                data: criteriaData,
                getValueSetOptions: (valueSetId) => {
                  return (valueSets.entities[valueSetId]?.options || []) as LabelObject[]
                },
                searchCode: props.searchCode,
                updateData: (newData: T) => {
                  setCriteriaData({ ...criteriaData, ...newData })
                },
                deidentified,
                setError
              }}
            />
          ))}
        </CFSection>
      ))}
    </CriteriaLayout>
  )
}
