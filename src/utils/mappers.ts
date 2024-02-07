import { CriteriaNameType, CriteriaName, ScopeTreeRow } from 'types'
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
  DocType,
  DocumentDataType,
  EncounterDataType,
  GhmDataType,
  ImagingDataType,
  MedicationDataType,
  ObservationDataType
} from 'types/requestCriterias'
import { comparatorToFilter, parseOccurence } from './valueComparator'
import services from 'services/aphp'

const searchReducer = (accumulator: any, currentValue: any): string =>
  accumulator || accumulator === false ? `${accumulator},${currentValue}` : currentValue ? currentValue : accumulator
const comparator = /(le|ge)/gi

const replaceTime = (date?: string) => {
  return date?.replace('T00:00:00Z', '') ?? null
}

export const mapToCriteriaName = (criteria: string): CriteriaNameType => {
  const mapping: { [key: string]: CriteriaNameType } = {
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
      : (filter = `${criterion.map((item) => (system ? `${item.system}|${item.id}` : item.id)).reduce(searchReducer)}`)
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
    const encounterServices: ScopeTreeRow[] = await services.perimeters.getScopesWithSubItems(values)
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
  return ''
}

export const unbuildObservationValueFilter = (filters: string[][], currentCriterion: any) => {
  const valueQuantities = filters
    .filter((keyValue) => keyValue[0].includes(OBSERVATION_VALUE))
    ?.map((value) => value[1])

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
  const newArray = docTypes.docTypes.filter((docType: DocType) =>
    valuesIds?.find((docTypeId) => docTypeId === docType.code)
  )
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

export const questionnaireFiltersBuilders = (fhirKey: { id: string; type: string }, value?: string) => {
  const slice = value?.slice(0, 2)
  const operator = slice === 'ge' || slice === 'le' || slice === 'lt' || slice === 'gt' || slice === 'eq' ? slice : 'eq'
  const _value = slice === 'ge' || slice === 'le' || slice === 'lt' || slice === 'gt' ? value?.slice(2) : value
  return value ? `_filter=item.linkId eq ${fhirKey.id} and item.answer.${fhirKey.type} ${operator} ${_value}` : ''
}

export const findQuestionnaireRessource = (filters: string[]) => {
  for (const item of filters) {
    const match = item.match(/questionnaire=([^']*)/)
    if (match && match[1]) {
      return match[1]
    }
  }
}

export const unbuildQuestionnaireFilters = (filters: string[]) => {
  const regex = /linkId eq (\S+) and item\.answer\.\S+ (\S+) (\S+)/

  return filters
    .map((str) => {
      const match = str.match(regex)
      if (match) {
        const [, linkId, operator, value] = match
        return [linkId, operator, value]
      }
    })
    .filter((elem) => elem)
}

export const filtersBuilders = (fhirKey: string, value?: string) => {
  return value ? `${fhirKey}=${value}` : ''
}
