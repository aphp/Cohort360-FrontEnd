import {
  DurationRangeType,
  FilterKeys,
  FilterValue,
  Filters,
  FormNames,
  GenderStatus,
  GenderStatusLabel,
  LabelObject,
  VitalStatus,
  VitalStatusLabel,
  mapGenderStatusToLabel
} from 'types/searchCriterias'
import moment from 'moment'
import { capitalizeFirstLetter } from './capitalize'
import { ScopeElement, SimpleCodeType, ValueSet } from 'types'
import { getDurationRangeLabel } from './age'
import { CohortsType, CohortsTypeLabel } from 'types/cohorts'
import { Hierarchy } from 'types/hierarchy'
import labels from 'labels.json'
import { getFullLabelFromCode } from './valueSets'
import { perimeterDisplay } from './perimeters'

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
      case FilterKeys.BIRTHDATES:
        castedFilters[key] = [null, null]
        break
      case FilterKeys.START_DATE:
      case FilterKeys.END_DATE:
      case FilterKeys.MIN_PATIENTS:
      case FilterKeys.MAX_PATIENTS:
      case FilterKeys.SOURCE:
        castedFilters[key] = null
        break
    }
  }
  return castedFilters
}

export const getFilterLabel = (key: FilterKeys, value: FilterValue): string => {
  const filterLabelFunctions: Partial<Record<FilterKeys, (value: FilterValue) => string>> = {
    [FilterKeys.FAVORITE]: (value) => CohortsTypeLabel[value as CohortsType],
    [FilterKeys.BIRTHDATES]: (value) => getDurationRangeLabel(value as DurationRangeType, 'Âge'),
    [FilterKeys.GENDERS]: (value) => mapGenderStatusToLabel(value as GenderStatus),
    [FilterKeys.FORM_NAME]: (value) => {
      if (value === FormNames.HOSPIT) return labels.formNames.hospit
      if (value === FormNames.PREGNANCY) return labels.formNames.pregnancy
      return ''
    },
    [FilterKeys.VITAL_STATUSES]: (value) => VitalStatusLabel[value as VitalStatus],
    [FilterKeys.START_DATE]: (value) => `Après le : ${moment(value as string).format('DD/MM/YYYY')}`,
    [FilterKeys.END_DATE]: (value) => `Avant le : ${moment(value as string).format('DD/MM/YYYY')}`,
    [FilterKeys.NDA]: (value) => `NDA : ${value}`,
    [FilterKeys.IPP]: (value) => `IPP : ${value}`,
    [FilterKeys.CODE]: (value) => `Code : ${getFullLabelFromCode(value as LabelObject)}`,
    [FilterKeys.SOURCE]: (value) => `Source : ${value}`,
    [FilterKeys.EXECUTIVE_UNITS]: (value) => {
      const hierarchy = value as Hierarchy<ScopeElement>
      return `Unité exécutrice : ${perimeterDisplay(hierarchy.source_value, hierarchy.name)}`
    },
    [FilterKeys.DOC_STATUSES]: (value) => `Documents : ${value}`,
    [FilterKeys.DOC_TYPES]: (value) => (value as SimpleCodeType).label,
    [FilterKeys.DIAGNOSTIC_TYPES]: (value) =>
      `Type : ${capitalizeFirstLetter((value as LabelObject)?.label as string)}`,
    [FilterKeys.ADMINISTRATION_ROUTES]: (value) =>
      `Voie d'administration : ${capitalizeFirstLetter((value as LabelObject)?.label as string)}`,
    [FilterKeys.PRESCRIPTION_TYPES]: (value) =>
      `Type de prescription : ${capitalizeFirstLetter((value as LabelObject)?.label as string)}`,
    [FilterKeys.STATUS]: (value) => `Statut : ${(value as ValueSet)?.display}`,
    [FilterKeys.MIN_PATIENTS]: (value) => `Au moins ${value} patients`,
    [FilterKeys.MAX_PATIENTS]: (value) => `Jusqu'à ${value} patients`,
    [FilterKeys.MODALITY]: (value) => `Modalités : ${capitalizeFirstLetter((value as LabelObject)?.label as string)}`,
    [FilterKeys.ENCOUNTER_STATUS]: (value) =>
      `Statut de la visite associée : ${capitalizeFirstLetter((value as LabelObject)?.label as string)}`
  }

  return filterLabelFunctions[key]?.(value) ?? ''
}

export const selectFiltersAsArray = (filters: Filters) => {
  const result: { value: FilterValue; category: FilterKeys; label: string }[] = []

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
          ;(value as []).forEach((elem) => {
            result.push({ category: key, label: getFilterLabel(key, elem), value: elem })
          })
          break
        case FilterKeys.DOC_TYPES:
        case FilterKeys.EXECUTIVE_UNITS:
        case FilterKeys.STATUS:
        case FilterKeys.MODALITY:
        case FilterKeys.CODE:
        case FilterKeys.FORM_NAME:
        case FilterKeys.ENCOUNTER_STATUS:
        case FilterKeys.FAVORITE:
          ;(value as []).forEach((elem) =>
            result.push({ category: key, label: getFilterLabel(key, elem), value: elem })
          )
          break
        case FilterKeys.BIRTHDATES:
          if (value[0] || value[1]) {
            result.push({
              category: key,
              label: getFilterLabel(key, value),
              value: value as FilterValue
            })
          }
          break
        case FilterKeys.SOURCE:
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
      }
    }
  }
  return result
}
