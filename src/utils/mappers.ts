/* eslint-disable @typescript-eslint/no-explicit-any */
import { CriteriaName, ScopeTreeRow, SimpleCodeType } from 'types'
import { DocumentAttachmentMethod, LabelObject } from 'types/searchCriterias'
import {
  convertDurationToString,
  convertDurationToTimestamp,
  convertStringToDuration,
  convertTimestampToDuration
} from './age'
import docTypes from 'assets/docTypes.json'
import { OBSERVATION_VALUE, RequeteurCriteriaType } from './cohortCreation'
import moment from 'moment'
import {
  CcamDataType,
  Cim10DataType,
  Comparators,
  DocumentDataType,
  EncounterDataType,
  GhmDataType,
  HospitDataType,
  ImagingDataType,
  MedicationDataType,
  ObservationDataType,
  PregnancyDataType
} from 'types/requestCriterias'
import { comparatorToFilter, parseOccurence } from './valueComparator'
import services from 'services/aphp'
import extractFilterParams, { FhirFilterValue } from './fhirFilterParser'
import { mapDocumentStatusesFromRequestParam } from 'mappers/filters'

const searchReducer = (accumulator: string, currentValue: string): string =>
  accumulator || !!accumulator === false ? `${accumulator},${currentValue}` : currentValue ? currentValue : accumulator
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

export const buildEncounterServiceFilter = (criterion: ScopeTreeRow[] | undefined) => {
  return criterion && criterion.length > 0 ? `${criterion.map((item) => item.id).reduce(searchReducer)}` : ''
}

export const unbuildEncounterServiceCriterias = async (
  currentCriterion: any,
  filterName: string,
  values?: string | null
) => {
  if (values && values !== null) {
    const isExecutiveUnits = true
    const encounterServices: ScopeTreeRow[] = await services.perimeters.getScopesWithSubItems(
      values,
      undefined,
      undefined,
      isExecutiveUnits
    )
    currentCriterion[filterName] = currentCriterion
      ? [...currentCriterion[filterName], ...encounterServices]
      : encounterServices
  }
}

export const buildDateFilter = (
  criterion: string | null | undefined,
  comparator: 'le' | 'ge',
  removeTimeZone = false
) => {
  return criterion
    ? `${comparator}${moment(criterion).format(`YYYY-MM-DD[T00:00:00${removeTimeZone ? '' : 'Z'}]`)}`
    : ''
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
  const convertedRange = convertDurationToTimestamp(
    convertStringToDuration(age) || { year: comparator === 'ge' ? 0 : 130, month: 0, day: 0 },
    deidentified
  )
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
    .filter((keyValue) => keyValue[0].includes(OBSERVATION_VALUE))
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

export const unbuildAdvancedCriterias = (
  element: RequeteurCriteriaType,
  currentCriterion:
    | CcamDataType
    | Cim10DataType
    | GhmDataType
    | EncounterDataType
    | DocumentDataType
    | MedicationDataType
    | ObservationDataType
    | ImagingDataType
    | PregnancyDataType
    | HospitDataType
) => {
  if (element.occurrence) {
    currentCriterion.occurrence = element.occurrence ? element.occurrence.n : 1
    currentCriterion.occurrenceComparator = element.occurrence
      ? element.occurrence.operator ?? Comparators.GREATER_OR_EQUAL
      : Comparators.GREATER_OR_EQUAL
  }
  if (element.dateRangeList) {
    currentCriterion.startOccurrence = replaceTime(element.dateRangeList[0].minDate)
    currentCriterion.endOccurrence = replaceTime(element.dateRangeList[0].maxDate)
  }
  if (element.encounterDateRange) {
    currentCriterion.encounterStartDate = replaceTime(element.encounterDateRange.minDate)
    currentCriterion.encounterEndDate = replaceTime(element.encounterDateRange.maxDate)
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

export const findQuestionnaireName = (filters: string[]) => {
  for (const item of filters) {
    const match = item.match(/questionnaire.name=(.*)/)
    if (match && match[1]) {
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
