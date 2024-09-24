/* eslint-disable @typescript-eslint/no-unused-vars */
import { ScopeElement } from 'types'
import { DocumentAttachmentMethod, LabelObject } from 'types/searchCriterias'
import {
  convertDurationToString,
  convertDurationToTimestamp,
  convertStringToDuration,
  convertTimestampToDuration
} from 'utils/age'
import moment from 'moment'
import { Comparators } from 'types/requestCriterias'
import { comparatorToFilter, parseOccurence } from 'utils/valueComparator'
import services from 'services/aphp'
import { Hierarchy } from 'types/hierarchy'
import { DataTypes, FhirKey, NewDurationRangeType, NumberAndComparatorDataType } from '../types'

/************************************************************************************/
/*                        Criteria Form Item Mappers                                */
/************************************************************************************/
/*
This file contains the list of functions used to build and unbuild criteria data from a fhir filter.
Each CriteriaFormItemType and its corresponding DataType should be handled here
The default for each CriteriaFormItemType are specified in the main criteria data mapper file (index.ts)
*/

export type BuilderMethod = (
  arg: DataTypes,
  fhirKey: FhirKey,
  deidentified: boolean,
  args: Array<DataTypes | BuilderMethod>
) => string | string[] | undefined | { filterValue: string; filterKey: string }

const searchReducer = (accumulator: string, currentValue: string): string => {
  if (currentValue === '') {
    return accumulator
  }
  return !!accumulator ? `${accumulator},${currentValue}` : currentValue || accumulator
}

const COMPARATORS_REGEX = /(le|ge)/gi

const replaceTime = (date?: string) => {
  return date?.replace('T00:00:00Z', '') ?? null
}

const buildLabelObjectFilter = (
  criterion: LabelObject[] | undefined | null,
  hierarchyUrl?: string,
  system?: boolean
) => {
  if (criterion && criterion.length > 0) {
    const filter = criterion.find((code) => code.id === '*')
      ? `${hierarchyUrl}|*`
      : `${criterion
          .map((item) =>
            system && (item.system || hierarchyUrl) ? `${item.system ?? hierarchyUrl}|${item.id}` : item.id
          )
          .reduce(searchReducer, '')}`
    return filter
  }
  return ''
}

const unbuildLabelObjectFilterValue = (values: string | null, prevValues: LabelObject[] | null) => {
  const valuesIds = values?.split(',') || []
  const newArray = valuesIds?.map((value) => (value.includes('|*') ? { id: '*', label: '' } : { id: value, label: '' }))
  if (newArray) {
    return [...(prevValues || []), ...newArray]
  }
  return prevValues
}

const buildEncounterServiceFilter = (criterion?: Hierarchy<ScopeElement, string>[] | null) => {
  return criterion && criterion.length > 0 ? `${criterion.map((item) => item.id).reduce(searchReducer, '')}` : ''
}

const unbuildEncounterServiceFilter = async (
  value: string | null,
  existingValue?: Hierarchy<ScopeElement, string>[]
) => {
  if (value) {
    const encounterServices: ScopeElement[] = (await services.perimeters.getPerimeters({ ids: value })).results
    return encounterServices.concat(existingValue || [])
  }
  return Promise.resolve(existingValue || [])
}

const buildDateFilter = (
  dateRange: NewDurationRangeType | null,
  fhirKey: FhirKey,
  removeTimeZone = false,
  whithSpace = false
): string[] | undefined | { filterValue: string; filterKey: string } => {
  const fhirKeyString = typeof fhirKey === 'string' ? fhirKey : 'id' in fhirKey ? fhirKey.id : fhirKey.main
  if (dateRange?.includeNull && (dateRange?.start || dateRange?.end)) {
    let dateFilter = ''
    if (dateRange.start && dateRange.end) {
      dateFilter = `${fhirKeyString} ${buildDateFilterValue(
        dateRange.start,
        'ge',
        false,
        true
      )} and ${fhirKeyString} ${buildDateFilterValue(dateRange.end, 'le', false, true)}`
    } else {
      dateFilter = `${fhirKeyString} ${
        dateRange.start
          ? buildDateFilterValue(dateRange.start, 'ge', false, true)
          : buildDateFilterValue(dateRange.end, 'le', false, true)
      }`
    }
    return { filterKey: '_filter', filterValue: `(${dateFilter}) or not (${fhirKeyString} eq "*")` }
  } else {
    const filterValues = []
    if (dateRange?.start) {
      filterValues.push(buildDateFilterValue(dateRange.start, 'ge', removeTimeZone, whithSpace))
    }
    if (dateRange?.end) {
      filterValues.push(buildDateFilterValue(dateRange.end, 'le', removeTimeZone, whithSpace))
    }
    return filterValues
  }
}

const buildDateFilterValue = (
  criterion: string | null | undefined,
  comparator: 'le' | 'ge',
  removeTimeZone = false,
  withSpace = false
) => {
  const _withSpace = withSpace ? ' ' : ''
  const dateFormat = `YYYY-MM-DD[T00:00:00${removeTimeZone ? '' : 'Z'}]`

  return criterion ? `${comparator}${_withSpace}${moment(criterion).format(dateFormat)}` : ''
}

const unbuildDateFilter = (value: string, existingValue?: NewDurationRangeType) => {
  const date = replaceTime(value.replace(COMPARATORS_REGEX, ''))
  const updatedValue = existingValue || { start: null, end: null, includeNull: false }
  if (value.includes('ge')) {
    updatedValue.start = date
  } else if (value.includes('le')) {
    updatedValue.end = date
  } else if (value.includes('not*')) {
    updatedValue.includeNull = true
  }
  return updatedValue
}

const buildDurationFilters = (duration: NewDurationRangeType | null, deidentified?: boolean) => {
  const filterValues = []
  const convertedRange = convertDurationToTimestamp(convertStringToDuration(duration?.start), deidentified)
  if (convertedRange !== null) {
    filterValues.push(`ge${convertedRange}`)
  }
  const convertedRangeEnd = convertDurationToTimestamp(convertStringToDuration(duration?.end), deidentified)
  if (convertedRangeEnd !== null) {
    filterValues.push(`le${convertedRangeEnd}`)
  }
  return filterValues
}

const unbuildDurationFilter = (value: string, deid: boolean, existingValue?: NewDurationRangeType) => {
  const cleanValue = value?.replace(COMPARATORS_REGEX, '')
  const duration = convertDurationToString(convertTimestampToDuration(+cleanValue, deid))
  const updatedValue = existingValue || { start: null, end: null, includeNull: false }
  if (value.includes('ge')) {
    updatedValue.start = duration
  } else if (value.includes('le')) {
    updatedValue.end = duration
  }
  return updatedValue
}

const buildSearchFilter = (criterion: string) => {
  return criterion ? `${encodeURIComponent(criterion)}` : ''
}

const unbuildSearchFilter = (value: string | null) => {
  return value !== null ? decodeURIComponent(value) : ''
}

const buildNumberComparatorFilter = (
  numberAndComparator: NumberAndComparatorDataType | null,
  defaultValue?: string
) => {
  if (!numberAndComparator) {
    return defaultValue ?? ''
  }
  if (numberAndComparator.comparator === Comparators.BETWEEN) {
    if (numberAndComparator.maxValue) {
      return `ge${numberAndComparator.value}&le${numberAndComparator.maxValue}`
    } else {
      console.error('Missing max value for between comparator')
      return `ge${numberAndComparator.value}`
    }
  }
  return `${comparatorToFilter(numberAndComparator.comparator)}${numberAndComparator.value}`
}

const buildWithDocumentFilter = (withDocument: LabelObject[], daysOfDelay: number | null) => {
  if (withDocument && withDocument.length === 1 && withDocument.at(0)?.id !== DocumentAttachmentMethod.NONE) {
    return `${
      withDocument.at(0)?.id === DocumentAttachmentMethod.ACCESS_NUMBER
        ? DocumentAttachmentMethod.ACCESS_NUMBER
        : `INFERENCE_TEMPOREL${daysOfDelay ? `_${daysOfDelay}_J` : ''}`
    }`
  }
  return ''
}

/********************************************************************************************* */
/*                                Item mapper list                                             */
/********************************************************************************************* */

export const UNBUILD_MAPPERS = {
  unbuildLabelObject: async (val: string, deid: boolean, existingValue?: DataTypes) =>
    Promise.resolve(unbuildLabelObjectFilterValue(val, existingValue as LabelObject[])),
  unbuildEncounterService: async (val: string, deid: boolean, existingValue?: DataTypes) =>
    unbuildEncounterServiceFilter(val, existingValue as Hierarchy<ScopeElement, string>[]),
  unbuildDate: async (val: string, deid: boolean, existingValue?: DataTypes) =>
    Promise.resolve(unbuildDateFilter(val, existingValue as NewDurationRangeType)),
  unbuildDuration: async (val: string, deid: boolean, existingValue?: DataTypes) =>
    Promise.resolve(unbuildDurationFilter(val, deid, existingValue as NewDurationRangeType)),
  unbuildSearch: async (val: string, deid: boolean, existingValue?: DataTypes) =>
    Promise.resolve(unbuildSearchFilter(val)),
  unbuildComparator: async (val: string, deid: boolean, existingValue?: DataTypes) =>
    Promise.resolve(parseOccurence(val))
}

export const BUILD_MAPPERS = {
  buildLabelObject: (val: DataTypes, key: FhirKey, deidentified: boolean, args: Array<DataTypes | BuilderMethod>) =>
    buildLabelObjectFilter(val as LabelObject[], args[0] as string, args[1] as boolean),
  buildEncounterService: (
    val: DataTypes,
    key: FhirKey,
    deidentified: boolean,
    args: Array<DataTypes | BuilderMethod>
  ) => buildEncounterServiceFilter(val as Hierarchy<ScopeElement, string>[]),
  buildDate: (val: DataTypes, key: FhirKey, deidentified: boolean, args: Array<DataTypes | BuilderMethod>) =>
    buildDateFilter(val as NewDurationRangeType, key, args[0] as boolean, args[1] as boolean),
  buildDuration: (val: DataTypes, key: FhirKey, deidentified: boolean, args: Array<DataTypes | BuilderMethod>) =>
    buildDurationFilters(val as NewDurationRangeType, deidentified),
  buildSearch: (val: DataTypes, key: FhirKey, deidentified: boolean, args: Array<DataTypes | BuilderMethod>) =>
    buildSearchFilter(val as string),
  buildComparator: (val: DataTypes, key: FhirKey, deidentified: boolean, args: Array<DataTypes | BuilderMethod>) =>
    buildNumberComparatorFilter(val as NumberAndComparatorDataType, args[0] as string),
  buildWithDocument: (val: DataTypes, key: FhirKey, deidentified: boolean, args: Array<DataTypes | BuilderMethod>) =>
    buildWithDocumentFilter(val as LabelObject[], args[0] as number | null),
  // utility meta functions
  skipIf: (val: DataTypes, key: FhirKey, deidentified: boolean, args: Array<DataTypes | BuilderMethod>) => {
    return args[1] === args[2] ? undefined : (args[0] as BuilderMethod)(val, key, deidentified, args.slice(3))
  }
}
