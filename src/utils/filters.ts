import {
  DurationRangeType,
  FilterKeys,
  FilterValue,
  Filters,
  GenderStatus,
  GenderStatusLabel,
  LabelObject,
  VitalStatus,
  VitalStatusLabel
} from 'types/searchCriterias'
import moment from 'moment'
import { capitalizeFirstLetter } from './capitalize'
import { ScopeTreeRow, SimpleCodeType } from 'types'
import { getDurationRangeLabel } from './age'

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
  const castedFilters = filters as any
  if (filters[key as keyof F] !== undefined) {
    switch (key) {
      case FilterKeys.GENDERS:
      case FilterKeys.VITAL_STATUSES:
      case FilterKeys.DIAGNOSTIC_TYPES:
      case FilterKeys.EXECUTIVE_UNITS:
      case FilterKeys.ADMINISTRATION_ROUTES:
      case FilterKeys.PRESCRIPTION_TYPES:
      case FilterKeys.DOC_TYPES:
        castedFilters[key] = removeElementInArray(castedFilters[key], value)
        break
      case FilterKeys.CODE:
      case FilterKeys.NDA:
      case FilterKeys.ANABIO:
      case FilterKeys.LOINC:
      case FilterKeys.IPP:
        castedFilters[key] = removeElementInArray((castedFilters[key] as string).split(','), value as string).join(',')
        break
      case FilterKeys.BIRTHDATES:
        castedFilters[key] = [null, null]
        break
      case FilterKeys.START_DATE:
      case FilterKeys.END_DATE:
        castedFilters[key] = null
        break
    }
  }
  return castedFilters
}

export const getFilterLabel = (key: FilterKeys, value: FilterValue): string => {
  if (key === FilterKeys.BIRTHDATES) {
    return getDurationRangeLabel(value as DurationRangeType, 'Âge')
  }
  if (key === FilterKeys.GENDERS) {
    return GenderStatusLabel[value as GenderStatus]
  }
  if (key === FilterKeys.VITAL_STATUSES) {
    return VitalStatusLabel[value?.toString().toUpperCase()]
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
    return `Code : ${value}`
  }
  if (key === FilterKeys.EXECUTIVE_UNITS) {
    return `Unité exécutrice : ${(value as ScopeTreeRow).name}`
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
  if (key === FilterKeys.ANABIO) {
    return `Code ANABIO : ${value}`
  }
  if (key === FilterKeys.LOINC) {
    return `Code LOINC : ${value}`
  }
  return ''
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
        case FilterKeys.DOC_TYPES:
        case FilterKeys.EXECUTIVE_UNITS:
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
        case FilterKeys.START_DATE:
        case FilterKeys.END_DATE:
          result.push({
            category: key,
            label: getFilterLabel(key, value),
            value: value as FilterValue
          })
          break
        case FilterKeys.NDA:
        case FilterKeys.CODE:
        case FilterKeys.ANABIO:
        case FilterKeys.LOINC:
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
