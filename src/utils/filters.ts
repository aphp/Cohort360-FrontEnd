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
  if (key === FilterKeys.FAVORITE) {
    return CohortsTypeLabel[value as CohortsType]
  }
  if (key === FilterKeys.BIRTHDATES) {
    return getAgeLabel(value as DurationRangeType, 'Âge')
  }
  if (key === FilterKeys.GENDERS) {
    return GenderStatusLabel[value as GenderStatus]
  }
  if (key === FilterKeys.FORM_NAME) {
    if (value === FormNames.HOSPIT) {
      return labels.formNames.hospit
    } else if (value === FormNames.PREGNANCY) {
      return labels.formNames.pregnancy
    }
  }
  if (key === FilterKeys.VITAL_STATUSES) {
    return VitalStatusLabel[value as VitalStatus]
  }
  if (key === FilterKeys.DURATION_RANGE) {
    return getDurationRangeLabel(value as DurationRangeType)
  }
  if (key === FilterKeys.START_DATE) {
    return `Après le : ${moment(value as string).format('DD/MM/YYYY')}`
  }
  if (key === FilterKeys.END_DATE) {
    return `Avant le : ${moment(value as string).format('DD/MM/YYYY')}`
  }
  if (key === FilterKeys.NDA) {
    return `NDA : ${value}`
  }
  if (key === FilterKeys.IPP) {
    return `IPP : ${value}`
  }
  if (key === FilterKeys.CODE) {
    return `Code : ${getFullLabelFromCode(value as LabelObject)}`
  }
  if (key === FilterKeys.SOURCE) {
    return `Source : ${value}`
  }
  if (key === FilterKeys.EXECUTIVE_UNITS) {
    return `Unité exécutrice :  ${(value as Hierarchy<ScopeElement>).source_value} - ${
      (value as Hierarchy<ScopeElement>).name
    }`
  }
  if (key === FilterKeys.DOC_STATUSES) {
    return `Documents :  ${(value as LabelObject).label}`
  }
  if (key === FilterKeys.DOC_TYPES) {
    return (value as SimpleCodeType).label
  }
  if (key === FilterKeys.DIAGNOSTIC_TYPES) {
    return `Type : ${capitalizeFirstLetter((value as LabelObject)?.label as string)}`
  }
  if (key === FilterKeys.ADMINISTRATION_ROUTES) {
    return `Voie d'administration : ${capitalizeFirstLetter((value as LabelObject)?.label as string)}`
  }
  if (key === FilterKeys.PRESCRIPTION_TYPES) {
    return `Type de prescription : ${capitalizeFirstLetter((value as LabelObject)?.label as string)}`
  }
  if (key === FilterKeys.STATUS) {
    return `Statut : ${(value as LabelObject)?.label}`
  }
  if (key === FilterKeys.MIN_PATIENTS) {
    return `Au moins ${value} patients`
  }
  if (key === FilterKeys.MAX_PATIENTS) {
    return `Jusqu'à ${value} patients`
  }
  if (key === FilterKeys.MODALITY) {
    return `Modalités : ${capitalizeFirstLetter((value as LabelObject)?.label as string)}`
  }
  if (key === FilterKeys.ENCOUNTER_STATUS) {
    return `Statut de la visite associée : ${capitalizeFirstLetter((value as LabelObject)?.label as string)}`
  }
  if (key === FilterKeys.VALIDATED_STATUS) {
    return `Analyses dont les résultats ont été validés`
  }
  if (key === FilterKeys.ONLY_PDF_AVAILABLE) {
    return `Documents dont les PDF sont disponibles`
  }
  return ''
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
