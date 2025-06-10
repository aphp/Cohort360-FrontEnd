import {
  DurationRangeType,
  FilterKeys,
  FilterValue,
  Filters,
  FormNames,
  GenderStatus,
  GenderStatusLabel,
  LabelObject,
  SearchCriteriaKeys,
  SearchCriterias,
  VitalStatus,
  VitalStatusLabel
} from 'types/searchCriterias'
import moment from 'moment'
import { capitalizeFirstLetter } from './capitalize'
import { SimpleCodeType } from 'types'
import { getAgeLabel } from './age'
import { CohortsType, CohortsTypeLabel } from 'types/cohorts'
import { Hierarchy } from 'types/hierarchy'
import labels from 'labels.json'
import { getFullLabelFromCode } from './valueSets'
import { getDurationRangeLabel } from 'mappers/dates'
import { ScopeElement } from 'types/scope'

export const isChecked = <T>(value: T, arr: T[]): boolean => {
  return arr.includes(value)
}

export const removeElementInArray = <T>(arr: Array<T>, value: T): Array<T> => {
  return [...arr.filter((elem) => elem !== value)]
}

export const addElementInArray = <T>(arr: Array<T>, value: T): Array<T> => {
  return [...arr, value]
}

export const toggleFilter = <T>(arr: Array<T>, value: T): Array<T> => {
  if (arr.includes(value)) return removeElementInArray(arr, value)
  return addElementInArray(arr, value)
}

export const removeFilter = <F>(key: FilterKeys, value: FilterValue, filters: F) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const castedFilters = filters as any
  if (filters[key as keyof F] !== undefined) {
    switch (key) {
      case FilterKeys.GENDERS:
      case FilterKeys.VITAL_STATUSES:
      case FilterKeys.DIAGNOSTIC_TYPES:
      case FilterKeys.EXECUTIVE_UNITS:
      case FilterKeys.ADMINISTRATION_ROUTES:
      case FilterKeys.PRESCRIPTION_TYPES:
      case FilterKeys.DOC_STATUSES:
      case FilterKeys.DOC_TYPES:
      case FilterKeys.STATUS:
      case FilterKeys.MODALITY:
      case FilterKeys.CODE:
      case FilterKeys.FORM_NAME:
      case FilterKeys.ENCOUNTER_STATUS:
      case FilterKeys.FAVORITE:
      case FilterKeys.SOURCE:
        castedFilters[key] = removeElementInArray(castedFilters[key], value)
        break
      case FilterKeys.NDA:
      case FilterKeys.IPP:
        castedFilters[key] = removeElementInArray((castedFilters[key] as string).split(','), value as string).join(',')
        break
      case FilterKeys.DURATION_RANGE:
      case FilterKeys.BIRTHDATES:
        castedFilters[key] = [null, null]
        break
      case FilterKeys.START_DATE:
      case FilterKeys.END_DATE:
      case FilterKeys.MIN_PATIENTS:
      case FilterKeys.MAX_PATIENTS:
        castedFilters[key] = null
        break
      case FilterKeys.ONLY_PDF_AVAILABLE:
        castedFilters[key] = false
        break
    }
  }
  return { ...castedFilters }
}

export const getFilterLabel = (key: FilterKeys, value: FilterValue): string => {
  const filterLabelMapper: Partial<Record<FilterKeys, (value: FilterValue) => string>> = {
    [FilterKeys.FAVORITE]: (value) => CohortsTypeLabel[value as CohortsType],
    [FilterKeys.BIRTHDATES]: (value) => getAgeLabel(value as DurationRangeType, 'Âge'),
    [FilterKeys.GENDERS]: (value) => GenderStatusLabel[value as GenderStatus],
    [FilterKeys.FORM_NAME]: (value) => {
      switch (value) {
        case FormNames.HOSPIT:
          return labels.formNames.hospit
        case FormNames.PREGNANCY:
          return labels.formNames.pregnancy
        default:
          return ''
      }
    },
    [FilterKeys.VITAL_STATUSES]: (value) => VitalStatusLabel[value as VitalStatus],
    [FilterKeys.DURATION_RANGE]: (value) => getDurationRangeLabel(value as DurationRangeType),
    [FilterKeys.START_DATE]: (value) => `Après le : ${moment(value as string).format('DD/MM/YYYY')}`,
    [FilterKeys.END_DATE]: (value) => `Avant le : ${moment(value as string).format('DD/MM/YYYY')}`,
    [FilterKeys.NDA]: (value) => `NDA : ${value}`,
    [FilterKeys.IPP]: (value) => `IPP : ${value}`,
    [FilterKeys.CODE]: (value) => `Code : ${getFullLabelFromCode(value as LabelObject)}`,
    [FilterKeys.SOURCE]: (value) => `Source : ${value}`,
    [FilterKeys.EXECUTIVE_UNITS]: (value) =>
      `Unité exécutrice : ${(value as Hierarchy<ScopeElement>).source_value} - ${
        (value as Hierarchy<ScopeElement>).name
      }`,
    [FilterKeys.DOC_STATUSES]: (value) => `Documents : ${(value as LabelObject).label}`,
    [FilterKeys.DOC_TYPES]: (value) => (value as SimpleCodeType).label,
    [FilterKeys.DIAGNOSTIC_TYPES]: (value) => `Type : ${capitalizeFirstLetter((value as LabelObject)?.label ?? '')}`,
    [FilterKeys.ADMINISTRATION_ROUTES]: (value) =>
      `Voie d'administration : ${capitalizeFirstLetter((value as LabelObject)?.label ?? '')}`,
    [FilterKeys.PRESCRIPTION_TYPES]: (value) =>
      `Type de prescription : ${capitalizeFirstLetter((value as LabelObject)?.label ?? '')}`,
    [FilterKeys.STATUS]: (value) => `Statut : ${(value as LabelObject)?.label}`,
    [FilterKeys.MIN_PATIENTS]: (value) => `Au moins ${value} patients`,
    [FilterKeys.MAX_PATIENTS]: (value) => `Jusqu'à ${value} patients`,
    [FilterKeys.MODALITY]: (value) => `Modalités : ${capitalizeFirstLetter((value as LabelObject)?.label ?? '')}`,
    [FilterKeys.ENCOUNTER_STATUS]: (value) =>
      `Statut de la visite associée : ${capitalizeFirstLetter((value as LabelObject)?.label ?? '')}`,
    [FilterKeys.VALIDATED_STATUS]: () => `Analyses dont les résultats ont été validés`,
    [FilterKeys.ONLY_PDF_AVAILABLE]: () => `Documents dont les PDF sont disponibles`
  }

  const filterLabel = filterLabelMapper[key]
  return filterLabel ? filterLabel(value) : ''
}

export const selectFiltersAsArray = (filters: Filters, searchInput: string | undefined) => {
  const result: { value: FilterValue; category: FilterKeys | SearchCriteriaKeys; label: string; disabled?: boolean }[] =
    []

  if (searchInput)
    result.push({
      category: SearchCriteriaKeys.SEARCH_INPUT,
      value: searchInput,
      label: `Recherche de : "${searchInput}"`
    })
  for (const key in filters) {
    const value = filters[key as keyof Filters]
    if (value) {
      switch (key) {
        case FilterKeys.GENDERS:
        case FilterKeys.VITAL_STATUSES:
        case FilterKeys.DIAGNOSTIC_TYPES:
        case FilterKeys.ADMINISTRATION_ROUTES:
        case FilterKeys.PRESCRIPTION_TYPES:
        case FilterKeys.DOC_STATUSES:
        case FilterKeys.DOC_TYPES:
        case FilterKeys.EXECUTIVE_UNITS:
        case FilterKeys.STATUS:
        case FilterKeys.MODALITY:
        case FilterKeys.CODE:
        case FilterKeys.FORM_NAME:
        case FilterKeys.ENCOUNTER_STATUS:
        case FilterKeys.FAVORITE:
        case FilterKeys.SOURCE:
          ;(value as []).forEach((elem) => {
            if (elem) result.push({ category: key, label: getFilterLabel(key, elem), value: elem })
          })
          break
        case FilterKeys.BIRTHDATES:
        case FilterKeys.DURATION_RANGE:
          if (value[0] || value[1]) {
            result.push({
              category: key,
              label: getFilterLabel(key, value),
              value: value as FilterValue
            })
          }
          break
        case FilterKeys.START_DATE:
        case FilterKeys.END_DATE:
        case FilterKeys.MIN_PATIENTS:
        case FilterKeys.MAX_PATIENTS:
          result.push({
            category: key,
            label: getFilterLabel(key, value),
            value: value as FilterValue
          })
          break
        case FilterKeys.NDA:
        case FilterKeys.IPP:
          ;(value as string).split(',').forEach((elem) =>
            result.push({
              category: key,
              label: getFilterLabel(key, elem),
              value: elem
            })
          )
          break
        case FilterKeys.VALIDATED_STATUS:
          result.push({
            category: key,
            value: value as FilterValue,
            label: getFilterLabel(key, value),
            disabled: true
          })
          break
        case FilterKeys.ONLY_PDF_AVAILABLE:
          result.push({
            category: key,
            value: value as FilterValue,
            label: getFilterLabel(key, value)
          })
      }
    }
  }
  return result
}

export const atLeastOneSearchCriteria = (searchCriterias: SearchCriterias<Filters>) => {
  const { searchInput, filters } = searchCriterias

  return (
    !!searchInput ||
    ('ipp' in filters && !!filters.ipp) ||
    ('nda' in filters && !!filters.nda) ||
    ('durationRange' in filters && (!!filters.durationRange?.[0] || !!filters.durationRange?.[1])) ||
    ('birthdatesRanges' in filters && (!!filters.birthdatesRanges?.[0] || !!filters.birthdatesRanges?.[1])) ||
    ('genders' in filters && filters.genders?.length > 0) ||
    ('vitalStatuses' in filters && filters.vitalStatuses?.length > 0) ||
    ('executiveUnits' in filters && filters.executiveUnits?.length > 0) ||
    ('encounterStatus' in filters && filters.encounterStatus?.length > 0) ||
    ('code' in filters && filters.code?.length > 0) ||
    ('modality' in filters && filters.modality?.length > 0) ||
    ('docTypes' in filters && filters.docTypes?.length > 0) ||
    ('docStatuses' in filters && filters.docStatuses?.length > 0) ||
    ('onlyPdfAvailable' in filters && !!filters.onlyPdfAvailable) ||
    ('formName' in filters && filters.formName.length > 0) ||
    ('administrationRoutes' in filters && filters.administrationRoutes && filters.administrationRoutes.length > 0) ||
    ('prescriptionTypes' in filters && filters.prescriptionTypes && filters.prescriptionTypes.length > 0) ||
    ('diagnosticTypes' in filters && filters.diagnosticTypes && filters.diagnosticTypes.length > 0) ||
    ('source' in filters && filters.source && filters.source.length > 0)
  )
}
