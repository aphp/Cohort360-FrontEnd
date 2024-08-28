import { CriteriaName, ScopeElement, SimpleCodeType } from 'types'
import { DocumentAttachmentMethod, DurationRangeType, LabelObject } from 'types/searchCriterias'
import {
  convertDurationToString,
  convertDurationToTimestamp,
  convertStringToDuration,
  convertTimestampToDuration
} from './age'
import docTypes from 'assets/docTypes.json'
import { RequeteurCriteriaType } from './cohortCreation'
import moment from 'moment'
import {
  Comparators,
  CriteriaType,
  CriteriaTypesWithAdvancedInputs,
  ImagingDataType,
  ObservationDataType,
  SelectedCriteriaTypesWithOccurrences,
  SelectedCriteriaTypesWithAdvancedInputs,
  EncounterDataType
} from 'types/requestCriterias'
import { comparatorToFilter, parseOccurence } from './valueComparator'
import services from 'services/aphp'
import extractFilterParams, { FhirFilterValue } from './fhirFilterParser'
import { Hierarchy } from 'types/hierarchy'
import { EncounterParamsKeys, ObservationParamsKeys, mapDocumentStatusesFromRequestParam } from 'mappers/filters'

const searchReducer = (accumulator: string, currentValue: string): string =>
  accumulator || !!accumulator === false ? `${accumulator},${currentValue}` : currentValue || accumulator
const comparator = /(le|ge)/gi

const replaceTime = (date?: string) => {
  return date?.replace('T00:00:00Z', '') ?? null
}

export const mapToCriteriaName = (criteria: string): CriteriaName => {
  const mapping: { [key: string]: CriteriaName } = {
    diagnostic: CriteriaName.Cim10,
    ghm: CriteriaName.Ghm,
    ccam: CriteriaName.Ccam
  }
  if (criteria in mapping) return mapping[criteria]
  throw new Error(`Unknown criteria ${criteria}`)
}

export const buildLabelObjectFilter = (
  criterion: LabelObject[] | undefined | null,
  hierarchyUrl?: string,
  system?: boolean
) => {
  if (criterion && criterion.length > 0) {
    let filter = ''
    criterion.find((code) => code.id === '*')
      ? (filter = `${hierarchyUrl}|*`)
      : (filter = `${criterion
          .map((item) => (system && item.system ? `${item.system}|${item.id}` : item.id))
          .reduce(searchReducer)}`)
    return filter
  }
  return ''
}

export const unbuildLabelObjectFilter = (currentCriterion: any, filterName: string, values?: string | null) => {
  const valuesIds = values?.split(',') || []
  const newArray = valuesIds?.map((value) => (value.includes('|*') ? { id: '*' } : { id: value }))
  if (newArray) {
    currentCriterion[filterName] = currentCriterion ? [...currentCriterion[filterName], ...newArray] : newArray
  }
}

export const buildEncounterServiceFilter = (criterion?: Hierarchy<ScopeElement, string>[]) => {
  return criterion && criterion.length > 0 ? `${criterion.map((item) => item.id).reduce(searchReducer)}` : ''
}

export const unbuildEncounterServiceCriterias = async (
  currentCriterion: any,
  filterName: string,
  values?: string | null
) => {
  if (values && values !== null) {
    const encounterServices: ScopeElement[] = (await services.perimeters.getPerimeters({ ids: values })).results
    currentCriterion[filterName] = currentCriterion
      ? [...currentCriterion[filterName], ...encounterServices]
      : encounterServices
  }
}

export const buildDateFilter = (
  criterion: string | null | undefined,
  comparator: 'le' | 'ge',
  removeTimeZone = false,
  withSpace = false
) => {
  const _withSpace = withSpace ? ' ' : ''
  const dateFormat = `YYYY-MM-DD[T00:00:00${removeTimeZone ? '' : 'Z'}]`

  return criterion ? `${comparator}${_withSpace}${moment(criterion).format(dateFormat)}` : ''
}

export const unbuildDateFilter = (value: string) => {
  return replaceTime(value.replace(comparator, ''))
}

export const buildDurationFilter = (
  age: string | null | undefined,
  fhirKey: string,
  comparator: 'le' | 'ge',
  deidentified?: boolean
) => {
  const convertedRange = convertDurationToTimestamp(convertStringToDuration(age), deidentified)
  if (convertedRange === null) return ''
  return `${fhirKey}=${comparator}${convertedRange}`
}

export const unbuildDurationFilter = (value: string, deidentified?: boolean) => {
  const cleanValue = value?.replace(comparator, '')
  return convertDurationToString(convertTimestampToDuration(+cleanValue, deidentified))
}

export const buildSearchFilter = (criterion: string) => {
  return criterion ? `${encodeURIComponent(criterion)}` : ''
}

export const unbuildSearchFilter = (value: string | null) => {
  return value !== null ? decodeURIComponent(value) : ''
}

export const buildObservationValueFilter = (criterion: ObservationDataType, fhirKey: string) => {
  const valueComparatorFilter = comparatorToFilter(criterion.valueComparator)
  if (
    criterion.isLeaf &&
    criterion.code &&
    criterion.code.length === 1 &&
    criterion.valueComparator &&
    (typeof criterion.searchByValue[0] === 'number' || typeof criterion.searchByValue[1] === 'number')
  ) {
    if (criterion.valueComparator === Comparators.BETWEEN && criterion.searchByValue[1]) {
      return `${fhirKey}=le${criterion.searchByValue[1]}&${fhirKey}=ge${criterion.searchByValue[0]}`
    } else {
      return `${fhirKey}=${valueComparatorFilter}${criterion.searchByValue[0]}`
    }
  }
  return `${fhirKey}=le0,ge0`
}

export const unbuildObservationValueFilter = (filters: string[][], currentCriterion: ObservationDataType) => {
  const valueQuantities = filters
    .filter((keyValue) => keyValue[0].includes(ObservationParamsKeys.VALUE))
    ?.map((value) => value[1])
  if (valueQuantities[0] === 'le0,ge0') return null
  if (valueQuantities.length === 0) {
    currentCriterion['valueComparator'] = Comparators.GREATER_OR_EQUAL
  } else if (valueQuantities.length === 1) {
    const parsedOccurence = parseOccurence(valueQuantities[0])
    currentCriterion['valueComparator'] = parsedOccurence.comparator
    currentCriterion['searchByValue'] = [parsedOccurence.value, null]
  } else if (valueQuantities.length === 2) {
    currentCriterion['valueComparator'] = Comparators.BETWEEN
    currentCriterion['searchByValue'] = [
      parseOccurence(valueQuantities.find((value) => value.startsWith('ge')) ?? '').value,
      parseOccurence(valueQuantities.find((value) => value.startsWith('le')) ?? '').value
    ]
  }
}

export const buildComparatorFilter = (criterion: number, comparator: Comparators) => {
  return criterion ? `${comparatorToFilter(comparator)}${criterion}` : ''
}

export const buildWithDocumentFilter = (criterion: ImagingDataType, fhirKey: string) => {
  if (criterion.withDocument !== DocumentAttachmentMethod.NONE) {
    return `${fhirKey}=${
      criterion.withDocument === DocumentAttachmentMethod.ACCESS_NUMBER
        ? DocumentAttachmentMethod.ACCESS_NUMBER
        : `INFERENCE_TEMPOREL${
            criterion.daysOfDelay !== null && criterion.daysOfDelay !== '' ? `_${criterion.daysOfDelay}_J` : ''
          }`
    }`
  }
  return ''
}

export const unbuildDocTypesFilter = (currentCriterion: any, filterName: string, values?: string | null) => {
  const valuesIds = values?.split(',') || []
  const newArray = docTypes.docTypes.filter((docType: SimpleCodeType) =>
    valuesIds?.find((docTypeId) => docTypeId === docType.code)
  )
  if (newArray) {
    currentCriterion[filterName] = currentCriterion ? [...currentCriterion[filterName], ...newArray] : newArray
  }
}

export const unbuildDocStatusesFilter = (currentCriterion: any, filterName: string, values?: string | null) => {
  const newArray = values?.split(',').map((value) => mapDocumentStatusesFromRequestParam(value.split('|')[1]))

  if (newArray) {
    currentCriterion[filterName] = currentCriterion ? [...currentCriterion[filterName], ...newArray] : newArray
  }
}

export const unbuildOccurrence = (
  element: RequeteurCriteriaType,
  currentCriterion: SelectedCriteriaTypesWithOccurrences
) => {
  if (element.occurrence) {
    currentCriterion.occurrence = element.occurrence ? element.occurrence.n : 1
    currentCriterion.occurrenceComparator = element.occurrence
      ? element.occurrence.operator ?? Comparators.GREATER_OR_EQUAL
      : Comparators.GREATER_OR_EQUAL
  }
  return currentCriterion
}

export const buildSimpleFilter = (criterion: string, fhirKey: string, url?: string) => {
  return criterion ? `${fhirKey}=${url ? `${url}|` : ''}${criterion}` : ''
}

const LINK_ID_PARAM_NAME = 'item.linkId'
const VALUE_PARAM_NAME_PREFIX = 'item.answer.'
const FILTER_PARAM_NAME = '_filter'

const quoteValue = (value: string, type: string) => {
  return ['valueString', 'valueCoding'].includes(type) ? `"${value}"` : value
}

export const questionnaireFiltersBuilders = (fhirKey: { id: string; type: string }, value?: string) => {
  const slice = value?.slice(0, 2)
  const operator = slice === 'ge' || slice === 'le' || slice === 'lt' || slice === 'gt' || slice === 'eq' ? slice : 'eq'
  const _value = slice === 'ge' || slice === 'le' || slice === 'lt' || slice === 'gt' ? value?.slice(2) : value

  if (fhirKey.type === 'valueBoolean' || fhirKey.type === 'valueCoding') {
    const _code = value?.split(',')
    return value && _code && _code?.length > 0
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

export const buildEncounterDateFilter = (
  criterionType: CriteriaTypesWithAdvancedInputs | CriteriaType.ENCOUNTER,
  includeNullDates?: boolean,
  encounterDate?: DurationRangeType,
  startDate?: boolean
) => {
  const encounterDateExists = !!encounterDate && (!!encounterDate[0] || !!encounterDate[1])
  const criteriaFilterPrefix =
    criterionType === CriteriaType.ENCOUNTER ? '' : `${getCriterionDateFilterName(criterionType)}.`
  const criterionDateFilterName = `${criteriaFilterPrefix}${
    startDate ? EncounterParamsKeys.START_DATE : EncounterParamsKeys.END_DATE
  }`

  if (includeNullDates && encounterDateExists) {
    const dateFilter = `(${getDateFilters(
      encounterDate,
      criterionDateFilterName.replace('-', '.')
    )}) or not (${criterionDateFilterName.replace('-', '.')} eq "*")`

    return filtersBuilders(FILTER_PARAM_NAME, dateFilter)
  } else if (encounterDateExists) {
    if (encounterDate[0] && encounterDate[1]) {
      const startDateFilter = filtersBuilders(criterionDateFilterName, buildDateFilter(encounterDate[0], 'ge'))
      const endDateFilter = filtersBuilders(criterionDateFilterName, buildDateFilter(encounterDate[1], 'le'))

      return `${startDateFilter}&${endDateFilter}`
    } else {
      const dateFilter = encounterDate[0]
        ? buildDateFilter(encounterDate[0], 'ge')
        : buildDateFilter(encounterDate[1], 'le')

      return filtersBuilders(criterionDateFilterName, dateFilter)
    }
  } else return ''
}

export const getDateFilters = (dates: DurationRangeType, criterionDateFilterName: string) => {
  if (dates[0] && dates[1]) {
    return `${criterionDateFilterName} ${buildDateFilter(
      dates[0],
      'ge',
      false,
      true
    )} and ${criterionDateFilterName} ${buildDateFilter(dates[1], 'le', false, true)}`
  } else {
    return `${criterionDateFilterName} ${
      dates[0] ? buildDateFilter(dates[0], 'ge', false, true) : buildDateFilter(dates[1], 'le', false, true)
    }`
  }
}

export const getCriterionDateFilterName = (criterion: CriteriaTypesWithAdvancedInputs) => {
  const mapping = {
    [CriteriaType.DOCUMENTS]: 'encounter',
    [CriteriaType.CONDITION]: 'encounter',
    [CriteriaType.PROCEDURE]: 'encounter',
    [CriteriaType.CLAIM]: 'encounter',
    [CriteriaType.MEDICATION_REQUEST]: 'encounter',
    [CriteriaType.MEDICATION_ADMINISTRATION]: 'context',
    [CriteriaType.OBSERVATION]: 'encounter',
    [CriteriaType.IMAGING]: 'encounter'
  }
  return mapping[criterion]
}

export const unbuildEncounterDatesFilters = (
  criterion: SelectedCriteriaTypesWithAdvancedInputs | EncounterDataType,
  value: string | null
) => {
  if (value?.includes(EncounterParamsKeys.START_DATE.replace('-', '.'))) {
    criterion.encounterStartDate = unbuildEncounterDateFilters(value)
    criterion.includeEncounterStartDateNull = true
  } else if (value?.includes(EncounterParamsKeys.END_DATE.replace('-', '.'))) {
    criterion.encounterEndDate = unbuildEncounterDateFilters(value)
    criterion.includeEncounterEndDateNull = true
  }

  return criterion
}

export const unbuildEncounterDateFilters = (filter: string) => {
  const datesRegex = /(le|ge)\s(\d{4})-(\d{2})-(\d{2})/g // matches dates
  const dates = filter.match(datesRegex)
  let formattedDates: DurationRangeType

  if (dates && dates.length > 1) {
    formattedDates = [unbuildDateFilter(dates[0].split(' ').join('')), unbuildDateFilter(dates[1].split(' ').join(''))]
  } else if (dates && dates.length === 1) {
    const formattedDate = unbuildDateFilter(dates[0].split(' ').join(''))
    formattedDates = dates[0].includes('ge') ? [formattedDate, null] : [null, formattedDate]
  } else {
    formattedDates = [null, null]
  }

  return formattedDates
}

export const findQuestionnaireName = (filters: string[]) => {
  for (const item of filters) {
    const match = item.match(/questionnaire.name=(.*)/)
    if (match?.[1]) {
      return match[1]
    }
  }
}

export const unbuildQuestionnaireFilters = (
  filters: string[]
): Array<{ key: string; values: Array<FhirFilterValue> }> => {
  const specialFilters = filters
    .filter((filter) => filter.startsWith(`${FILTER_PARAM_NAME}=`))
    .map((filter) => {
      const filterContent = filter.split(`${FILTER_PARAM_NAME}=`)[1]
      const filterElements = extractFilterParams(filterContent, { omitOperatorEq: true })
      if (filterElements) {
        // should check that this param exist and does not have multiple values
        // and raise an error (but errors should be properly handled in the unbuildRequest function)
        const paramKey = filterElements.find((element) => element.param === LINK_ID_PARAM_NAME)
        const paramValues = filterElements.filter((element) => element.param.startsWith(VALUE_PARAM_NAME_PREFIX))
        const key = paramKey?.values[0].value
        return {
          key: key,
          values: paramValues.flatMap((element) => element.values)
        }
      }
    })
    .filter((filter) => filter !== undefined) as Array<{ key: string; values: Array<FhirFilterValue> }>
  const standardFilters = filters
    .filter((filter) => !filter.startsWith(`${FILTER_PARAM_NAME}=`))
    .map((filter) => {
      const [key, value] = filter.split('=')
      return {
        key: key,
        values: [{ value: value, operator: 'undefined' }]
      }
    })
  return specialFilters.concat(standardFilters)
}

export const filtersBuilders = (fhirKey: string, value?: string) => {
  return value ? `${fhirKey}=${value}` : ''
}
