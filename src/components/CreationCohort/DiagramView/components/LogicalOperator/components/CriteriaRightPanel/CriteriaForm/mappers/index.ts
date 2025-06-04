import { Comparators, RequeteurCriteriaType, SelectedCriteriaType } from 'types/requestCriterias'
import { BuildMethodExtraParam, CriteriaForm, CriteriaFormItemType, DataTypes, FhirKey } from '../types'
import { ChipDisplayMethod, CHIPS_DISPLAY_METHODS } from './chipDisplayMapper'
import extractFilterParams, { FhirFilter } from 'utils/fhirFilterParser'
import { CriteriaItemType } from 'types'
import { ValueSetStore } from 'state/valueSets'
import { ReactNode } from 'react'
import { isArray, isFunction, isString } from 'lodash'
import { BUILD_MAPPERS, BuilderMethod, UNBUILD_MAPPERS } from './buildMappers'
import { formatAge } from 'utils/age'

/************************************************************************************/
/*                        Criteria Form Data Mappers                                */
/************************************************************************************/
/*
This file contains 3 main functions:
- constructFhirFilterForType: This function is used to construct FHIR filters for a given criteria type
- unbuildCriteriaDataFromDefinition: This function is used to unbuild criteria data from a fhir filter
- criteriasAsArray: This function is used to convert criteria data to an array of ReactNode (chips to be displayed)
*/

const LINK_ID_PARAM_NAME = 'item.linkId'
const VALUE_PARAM_NAME_PREFIX = 'item.answer.'
const FILTER_PARAM_NAME = '_filter'

function parseExtraArgs<T>(
  extraArg: BuildMethodExtraParam,
  obj: SelectedCriteriaType,
  methods: Record<string, T>
): DataTypes | T {
  if (extraArg.type === 'reference') {
    return obj[extraArg.value as keyof SelectedCriteriaType] || null
  } else if (extraArg.type === 'method') {
    return methods[extraArg.value as keyof typeof methods]
  }
  return extraArg.value
}

const parseFhirKey = (
  fhirKey: Exclude<FhirKey, { id: string; type: string }>,
  deidentified: boolean,
  obj: SelectedCriteriaType
): string => {
  if (isString(fhirKey)) {
    return fhirKey
  }
  if ('deid' in fhirKey) {
    return deidentified ? fhirKey.deid : fhirKey.main
  }
  const arg1 = parseExtraArgs(fhirKey.value1, obj, BUILD_MAPPERS)
  const arg2 = parseExtraArgs(fhirKey.value2, obj, BUILD_MAPPERS)
  const simplifiedArg1 = isArray(arg1) && arg1.length > 0 ? arg1[0] : arg1
  const simplifiedArg2 = isArray(arg2) && arg2.length > 0 ? arg2[0] : arg2
  return simplifiedArg1 === simplifiedArg2 ? fhirKey.main : fhirKey.alt
}

const buildFilter = (fhirKey: string, value?: string | { filterValue: string; filterKey: string } | null): string => {
  if (!value) {
    return ''
  }
  if (isString(value)) {
    return `${fhirKey}=${value}`
  }
  return `${value.filterKey}=${value.filterValue}`
}

const quoteValue = (value: string, type: string) => {
  return ['valueString', 'valueCoding'].includes(type) ? `"${value}"` : value
}

const questionnaireFiltersBuilders = (
  fhirKey: { id: string; type: string },
  value?:
    | string
    | {
        filterValue: string
        filterKey: string
      }
) => {
  const strValue = isString(value) ? value : value?.filterValue
  const slice = strValue?.slice(0, 2)
  const operator = slice === 'ge' || slice === 'le' || slice === 'lt' || slice === 'gt' || slice === 'eq' ? slice : 'eq'
  const _value = slice === 'ge' || slice === 'le' || slice === 'lt' || slice === 'gt' ? strValue?.slice(2) : strValue

  if (fhirKey.type === 'valueBoolean' || fhirKey.type === 'valueCoding') {
    const _code = strValue?.split(',')
    return strValue && _code && _code?.length > 0
      ? `${FILTER_PARAM_NAME}=${LINK_ID_PARAM_NAME} eq ${fhirKey.id} and (${_code
          .map((code) => `${VALUE_PARAM_NAME_PREFIX}${fhirKey.type} eq ${quoteValue(code, fhirKey.type)}`)
          .join(' or ')})`
      : ''
  } else {
    return _value
      ? `${FILTER_PARAM_NAME}=${LINK_ID_PARAM_NAME} eq ${fhirKey.id} and ${VALUE_PARAM_NAME_PREFIX}${
          fhirKey.type
        } ${operator} ${quoteValue(_value, fhirKey.type)}`
      : ''
  }
}

const matchFhirKey = (key: string, fhirKey?: FhirKey): boolean => {
  if (!fhirKey) {
    return false
  }
  if (isString(fhirKey)) {
    return fhirKey === key
  }
  if ('main' in fhirKey) {
    if ('deid' in fhirKey) return fhirKey.main === key || fhirKey.deid === key
    return fhirKey.main === key || fhirKey.alt === key
  }
  return fhirKey.id === key
}

const extractQuestionnaireFilterParams = (filterElements: Array<FhirFilter>): FhirFilter[] | undefined => {
  const paramKey = filterElements.find((element) => element.param === LINK_ID_PARAM_NAME)
  const paramValues = filterElements.filter((element) => element.param.startsWith(VALUE_PARAM_NAME_PREFIX))
  if (!paramKey || !paramValues) {
    return undefined
  }
  const key = paramKey?.values[0].value
  return [
    {
      param: key,
      values: paramValues.flatMap((element) => element.values)
    }
  ]
}

const DEFAULT_BUILD_METHOD: Record<CriteriaFormItemType, BuilderMethod> = {
  calendarRange: BUILD_MAPPERS.buildDate,
  durationRange: BUILD_MAPPERS.buildDuration,
  text: BUILD_MAPPERS.buildSearch,
  select: BUILD_MAPPERS.buildSelect,
  autocomplete: BUILD_MAPPERS.buildSelect,
  number: BUILD_MAPPERS.buildSearch,
  executiveUnit: BUILD_MAPPERS.buildEncounterService,
  numberAndComparator: BUILD_MAPPERS.buildComparator,
  boolean: BUILD_MAPPERS.buildSearch,
  textWithCheck: BUILD_MAPPERS.buildSearch,
  codeSearch: BUILD_MAPPERS.buildLabelObject,
  textWithRegex: BUILD_MAPPERS.buildRaw,
  radioChoice: BUILD_MAPPERS.buildSearch,
  info: () => undefined
}

const DEFAULT_UNBUILD_METHOD: Record<
  CriteriaFormItemType,
  (
    arg: string,
    deidentified: boolean,
    existingValue: DataTypes,
    fhirKey: string,
    args: Array<DataTypes>
  ) => Promise<DataTypes>
> = {
  calendarRange: UNBUILD_MAPPERS.unbuildDate,
  durationRange: UNBUILD_MAPPERS.unbuildDuration,
  text: UNBUILD_MAPPERS.unbuildSearch,
  select: UNBUILD_MAPPERS.unbuildSearch,
  autocomplete: UNBUILD_MAPPERS.unbuildSelect,
  number: UNBUILD_MAPPERS.unbuildSearch,
  executiveUnit: UNBUILD_MAPPERS.unbuildEncounterService,
  numberAndComparator: UNBUILD_MAPPERS.unbuildComparator,
  boolean: UNBUILD_MAPPERS.unbuildSearch,
  textWithCheck: UNBUILD_MAPPERS.unbuildSearch,
  codeSearch: UNBUILD_MAPPERS.unbuildLabelObject,
  textWithRegex: UNBUILD_MAPPERS.unbuildSearch,
  radioChoice: UNBUILD_MAPPERS.unbuildSearch,
  info: async () => null
}

const DEFAULT_CHIPS_DISPLAY_METHODS: Record<CriteriaFormItemType, ChipDisplayMethod> = {
  calendarRange: CHIPS_DISPLAY_METHODS.calendarRange,
  durationRange: CHIPS_DISPLAY_METHODS.durationRange,
  text: CHIPS_DISPLAY_METHODS.raw,
  select: CHIPS_DISPLAY_METHODS.autocomplete,
  autocomplete: CHIPS_DISPLAY_METHODS.autocomplete,
  number: CHIPS_DISPLAY_METHODS.raw,
  executiveUnit: CHIPS_DISPLAY_METHODS.executiveUnit,
  numberAndComparator: CHIPS_DISPLAY_METHODS.numberAndComparator,
  boolean: CHIPS_DISPLAY_METHODS.raw,
  textWithCheck: CHIPS_DISPLAY_METHODS.raw,
  codeSearch: CHIPS_DISPLAY_METHODS.codeSearch,
  textWithRegex: CHIPS_DISPLAY_METHODS.raw,
  radioChoice: CHIPS_DISPLAY_METHODS.raw,
  info: () => null
}

export const constructFhirFilterForType = <T extends SelectedCriteriaType>(
  criteria: T,
  deidentified: boolean,
  criteriaForm: CriteriaForm<T>
): string => {
  return criteriaForm.itemSections
    .flatMap((section) => section.items)
    .filter((item) => !!item.valueKey)
    .map((item) => {
      const buildInfo = item.buildInfo
      if (buildInfo?.fhirKey === undefined || item.valueKey === undefined) {
        return ''
      }
      const fhirKey =
        isString(buildInfo.fhirKey) || 'main' in buildInfo.fhirKey
          ? parseFhirKey(buildInfo.fhirKey, deidentified, criteria)
          : buildInfo.fhirKey
      const buildMethod = buildInfo.buildMethod ? BUILD_MAPPERS[buildInfo.buildMethod] : DEFAULT_BUILD_METHOD[item.type]
      let value = criteria[item.valueKey] as DataTypes
      if (buildInfo.ignoreIf) {
        const ignore = isFunction(buildInfo.ignoreIf)
          ? buildInfo.ignoreIf(criteria)
          : eval(buildInfo.ignoreIf)(criteria)
        if (ignore) {
          value = null
        }
      }
      const filterValues = buildMethod(
        value,
        fhirKey,
        deidentified,
        (buildInfo.buildMethodExtraArgs || []).map((arg) => parseExtraArgs(arg, criteria, BUILD_MAPPERS))
      )
      if (filterValues === undefined) {
        return ''
      }

      const filterValuesArray = Array.isArray(filterValues) ? filterValues : [filterValues]
      return filterValuesArray
        .map((val) => (isString(fhirKey) ? buildFilter(fhirKey, val) : questionnaireFiltersBuilders(fhirKey, val)))
        .join('&')
    })
    .filter((elem) => !!elem)
    .reduce(
      (accumulator: string, currentValue: string): string =>
        accumulator ? `${accumulator}&${currentValue}` : currentValue,
      criteriaForm.buildInfo.defaultFilter ?? ''
    )
}

export const unbuildCriteriaDataFromDefinition = async <T extends SelectedCriteriaType>(
  element: RequeteurCriteriaType,
  criteriaDefinition: CriteriaForm<T>
): Promise<SelectedCriteriaType> => {
  const emptyCriterion: T = { ...criteriaDefinition.initialData } as T
  emptyCriterion.id = element._id
  emptyCriterion.type = criteriaDefinition.buildInfo.type[element.resourceType] as SelectedCriteriaType['type']
  emptyCriterion.title = element.name ?? criteriaDefinition.title
  emptyCriterion.isInclusive = element.isInclusive

  if (element.occurrence && 'occurrence' in emptyCriterion) {
    emptyCriterion.occurrence = {
      value: element.occurrence.n ?? 1,
      comparator: element.occurrence.operator ?? Comparators.GREATER_OR_EQUAL
    }
  }

  if (element.patientAge && 'encounterAgeRange' in emptyCriterion) {
    emptyCriterion.encounterAgeRange = {
      start: element.patientAge.minAge ? formatAge(element.patientAge.minAge, 'YY-MM-DD', 'DD/MM/YY') : null,
      end: element.patientAge.maxAge ? formatAge(element.patientAge.maxAge, 'YY-MM-DD', 'DD/MM/YY') : null
    }
  }

  const criteriaItems = criteriaDefinition.itemSections.flatMap((section) => section.items)
  if (element.filterFhir) {
    const filters = element.filterFhir.split('&').map((elem) => elem.split('='))
    try {
      const allFilters = filters.flatMap((filter) => {
        if (filter[0] === FILTER_PARAM_NAME) {
          const filterContent = filter[1]
          const extractedFilterElements = extractFilterParams(filterContent, { omitOperatorEq: true })
          if (extractedFilterElements) {
            return (extractQuestionnaireFilterParams(extractedFilterElements) || extractedFilterElements).map(
              (filterParam) => {
                return [
                  filterParam.param,
                  filterParam.values.map((val) => `${val.operator ?? ''}${val.value}`).join(',')
                ]
              }
            )
          }
          return []
        }
        return [filter]
      })
      for (const filter of allFilters) {
        const key = filter[0] ?? null
        const value = filter[1] ?? null
        if (key !== null) {
          const matchingItems = criteriaItems.filter((item) => matchFhirKey(key, item.buildInfo?.fhirKey))
          for (const item of matchingItems) {
            if (item?.buildInfo?.fhirKey && item?.valueKey) {
              if (
                item.buildInfo.unbuildIgnoreValues &&
                item.buildInfo.unbuildIgnoreValues.find(
                  (ignoreValue) => JSON.stringify(ignoreValue) === JSON.stringify(value)
                )
              ) {
                continue
              }
              const unbuildMethod = item.buildInfo.unbuildMethod
                ? UNBUILD_MAPPERS[item.buildInfo.unbuildMethod]
                : DEFAULT_UNBUILD_METHOD[item.type]
              const dataValue = await unbuildMethod(
                value,
                !isString(item.buildInfo.fhirKey) &&
                  'deid' in item.buildInfo.fhirKey &&
                  item.buildInfo?.fhirKey.deid === key,
                emptyCriterion[item.valueKey] as DataTypes,
                key,
                item.buildInfo.unbuildMethodExtraArgs || []
              )
              emptyCriterion[item.valueKey] = dataValue as T[keyof T]
            }
          }
        }
      }
    } catch (error) {
      console.error(error)
      emptyCriterion.error = true
    }
  }
  return emptyCriterion
}

export const criteriasAsArray = (
  selectedCriteria: SelectedCriteriaType,
  criteriaDefinitions: CriteriaItemType[],
  valuesets: ValueSetStore
): ReactNode[] => {
  const criteriaDef = criteriaDefinitions.find((criterion) =>
    Object.values(criterion.formDefinition?.buildInfo?.type || {}).includes(selectedCriteria.type)
  )?.formDefinition
  if (!criteriaDef) return []

  const chips = criteriaDef.itemSections
    .flatMap((section) => section.items)
    .map((item) => {
      if (!item.valueKey) return null
      let val = selectedCriteria[item.valueKey as keyof typeof selectedCriteria]
      if (item.buildInfo && item.buildInfo.ignoreIf) {
        const ignore = isFunction(item.buildInfo.ignoreIf)
          ? item.buildInfo.ignoreIf(selectedCriteria)
          : eval(item.buildInfo.ignoreIf)(selectedCriteria)
        if (ignore) {
          val = null
        }
      }
      if (!val || (isArray(val) && val.length === 0)) return null
      const chipBuilder = item.buildInfo?.chipDisplayMethod
        ? CHIPS_DISPLAY_METHODS[item.buildInfo?.chipDisplayMethod]
        : DEFAULT_CHIPS_DISPLAY_METHODS[item.type]
      const extraArgs = (item.buildInfo?.chipDisplayMethodExtraArgs || []).map((arg) =>
        parseExtraArgs(arg, selectedCriteria, CHIPS_DISPLAY_METHODS)
      )
      return chipBuilder(val, item, valuesets, extraArgs)
    })
    .filter((label) => !!label)
  return chips
}
