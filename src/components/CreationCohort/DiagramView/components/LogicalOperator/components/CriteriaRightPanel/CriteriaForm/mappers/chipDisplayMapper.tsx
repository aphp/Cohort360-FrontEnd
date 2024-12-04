/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { ValueSetStore } from 'state/valueSets'
import {
  AutoCompleteItem,
  CodeSearchItem,
  DataTypes,
  GenericCriteriaItem,
  NewDurationRangeType,
  NumberAndComparatorDataType
} from '../types'
import { ReactNode } from 'react'
import {
  DocumentAttachmentMethod,
  DocumentAttachmentMethodLabel,
  LabelObject,
  SearchByTypes
} from 'types/searchCriterias'
import { Hierarchy } from 'types/hierarchy'
import { ScopeElement } from 'types'
import { Tooltip, Typography } from '@mui/material'
import { Comparators } from 'types/requestCriterias'
import allDocTypes from 'assets/docTypes.json'
import moment from 'moment'
import { getDurationRangeLabel } from 'utils/age'
import { getConfig } from 'config'
import { prepend } from 'ramda'

/************************************************************************************/
/*                        Criteria Form Item Chip Display                           */
/************************************************************************************/
/*
This file contains the list of functions used to display a criteria form item and its corresponding data type into a ReactNode (a chip for now).
Each CriteriaFormItemType and its corresponding DataType should be handled here
The default for each CriteriaFormItemType are specified in the main criteria data mapper file (index.ts)
*/

export type ChipDisplayMethod = (
  val: DataTypes,
  item: GenericCriteriaItem,
  valueSets: ValueSetStore,
  args: Array<ChipDisplayMethod | DataTypes>
) => ReactNode | undefined

const chipForScopeElement = (values: Hierarchy<ScopeElement, string>[] | null) => {
  if (!values) return null
  const labels = values.map((value) => `${value.source_value} - ${value.name}`).join(' - ')
  return labels
}

const chipForDateLabel = (dateRange: NewDurationRangeType, word?: string) => {
  const excludeNullDatesWording = dateRange.includeNull ? ', valeurs nulles incluses' : ''
  let datesLabel = ''
  if (dateRange.start && dateRange.end) {
    datesLabel = `${word ? word + ' entre' : 'Entre'} le ${moment(dateRange.start).format('DD/MM/YYYY')} et le ${moment(
      dateRange.end
    ).format('DD/MM/YYYY')}${excludeNullDatesWording}`
  }
  if (dateRange.start && !dateRange.end) {
    datesLabel = `${word ? word + ' à' : 'À'} partir du ${moment(dateRange.start).format(
      'DD/MM/YYYY'
    )}${excludeNullDatesWording}`
  }
  if (!dateRange.start && dateRange.end) {
    datesLabel = `${word ? word + " jusqu'au" : "jusqu'au"}  ${moment(dateRange.end).format(
      'DD/MM/YYYY'
    )}${excludeNullDatesWording}`
  }

  return (
    <Tooltip title={datesLabel}>
      <Typography style={{ textOverflow: 'ellipsis', overflow: 'hidden', fontSize: 12 }}>{datesLabel}</Typography>
    </Tooltip>
  )
}

const getSearchDocumentLabel = (value: string, searchBy: LabelObject[]) => {
  const loc = searchBy && searchBy.find((l) => l.id === SearchByTypes.TEXT) ? 'document' : 'titre du document'
  return `Contient "${value}" dans le ${loc}`
}

const getDocumentTypesLabel = (values: LabelObject[]) => {
  const allTypes = new Set(allDocTypes.docTypes.map((docType) => docType.type))

  const displayingSelectedDocTypes = values.reduce((acc, selectedDocType) => {
    const numberOfElementFromGroup = selectedDocType.type && allTypes.has(selectedDocType.type) ? allTypes.size : 0
    const numberOfElementSelected = values.filter((doc) => doc.type === selectedDocType.type).length

    if (numberOfElementFromGroup === numberOfElementSelected) {
      return acc
    } else {
      return [...acc, selectedDocType]
    }
  }, [] as LabelObject[])

  const currentDocTypes = displayingSelectedDocTypes.map(({ label }) => label).join(' - ')

  return currentDocTypes
}

const chipForNumberAndComparator = (value: NumberAndComparatorDataType, name: string) => {
  if (value.comparator === Comparators.BETWEEN) {
    return `${name} entre ${value.value} et ${!value.maxValue ? '?' : value.maxValue}`
  }
  return `${name} ${value.comparator} ${+value.value}`
}
const getDocumentStatusLabel = (value: LabelObject[]) => {
  return `Statut de documents : ${value.map((l) => l.id).join(', ')}`
}

const getIdsListLabels = (values: string, name: string) => {
  const labels = values.split(',').join(' - ')
  return `Contient les ${name} : ${labels}`
}

const getAttachmentMethod = (value: LabelObject[], daysOfDelay: string | null) => {
  const documentAttachementMethod = value.at(0)?.id
  if (documentAttachementMethod === DocumentAttachmentMethod.INFERENCE_TEMPOREL) {
    return `Rattachement aux documents par ${DocumentAttachmentMethodLabel.INFERENCE_TEMPOREL.toLocaleLowerCase()}${
      daysOfDelay !== '' && daysOfDelay !== null ? ` de ${daysOfDelay} jour(s)` : ''
    }`
  } else if (documentAttachementMethod === DocumentAttachmentMethod.ACCESS_NUMBER) {
    return `Rattachement aux documents par ${DocumentAttachmentMethodLabel.ACCESS_NUMBER.toLocaleLowerCase()}`
  } else {
    return ''
  }
}

const getLabelsForCodeSearchItem = (
  val: LabelObject[],
  item: CodeSearchItem,
  valueSets: ValueSetStore
): LabelObject[] => {
  return val
    .map((value) => {
      return (
        (value.system ? valueSets.cache[value.system] : item.valueSetIds.flatMap((vid) => valueSets.cache[vid])) || []
      ).find((code) => code && code.id === value.id) as LabelObject
    })
    .filter((code) => code !== undefined)
}

const getLabelsForAutoCompleteItem = (
  val: LabelObject[],
  item: AutoCompleteItem,
  valueSets: ValueSetStore
): LabelObject[] => {
  return val
    .map((value) => {
      return (item.valueSetData || valueSets.entities[item.valueSetId]?.options || []).find(
        (code) => code.id === value.id
      )
    })
    .filter((code) => code !== undefined)
}

const chipFromAutoComplete = (
  val: LabelObject[] | null,
  item: AutoCompleteItem,
  valueSets: ValueSetStore,
  label?: string,
  prependCode?: boolean
) => {
  return chipFromLabelObject(val, item, getLabelsForAutoCompleteItem, valueSets, label, prependCode)
}

const chipFromCodeSearch = (
  val: LabelObject[] | null,
  item: CodeSearchItem,
  valueSets: ValueSetStore,
  label?: string,
  prependCode?: boolean
) => {
  return chipFromLabelObject(val, item, getLabelsForCodeSearchItem, valueSets, label, prependCode)
}

// TODO refacto this to be more generic using config
const displaySystem = (system?: string) => {
  switch (system) {
    case getConfig().features.medication.valueSets.medicationAtc.url:
      return `${getConfig().features.medication.valueSets.medicationAtc.title}: `
    case getConfig().features.medication.valueSets.medicationUcd.url:
      return `${getConfig().features.medication.valueSets.medicationUcd.title}: `
    default:
      return ''
  }
}

const chipFromLabelObject = <T extends AutoCompleteItem | CodeSearchItem>(
  val: LabelObject[] | null,
  item: T,
  getLabel: (val: LabelObject[], item: T, valueSets: ValueSetStore) => LabelObject[],
  valueSets: ValueSetStore,
  label?: string,
  prependCode?: boolean
) => {
  if (val === null) return null
  const labels = getLabel(val, item, valueSets).map(
    (code) => `${displaySystem(code.system)} ${prependCode ? code.id + ' - ' : ''}${code.label}`
  )
  const tooltipTitle = labels.join(' - ')
  return (
    <Tooltip title={tooltipTitle}>
      <Typography style={{ textOverflow: 'ellipsis', overflow: 'hidden', fontSize: 12 }}>
        {label} {tooltipTitle}
      </Typography>
    </Tooltip>
  )
}

export const CHIPS_DISPLAY_METHODS = {
  calendarRange: (
    val: DataTypes,
    item: GenericCriteriaItem,
    valueSets: ValueSetStore,
    args: Array<ChipDisplayMethod | DataTypes>
  ) => chipForDateLabel(val as NewDurationRangeType, args[0] as string),
  durationRange: (
    val: DataTypes,
    item: GenericCriteriaItem,
    valueSets: ValueSetStore,
    args: Array<ChipDisplayMethod | DataTypes>
  ) => {
    const typedVal = val as NewDurationRangeType
    return getDurationRangeLabel([typedVal.start, typedVal.end], args[0] as string)
  },
  raw: (
    val: DataTypes,
    item: GenericCriteriaItem,
    valueSets: ValueSetStore,
    args: Array<ChipDisplayMethod | DataTypes>
  ) => `${args[0] ? args[0] : ''} ${val as string}`,
  autocomplete: (
    val: DataTypes,
    item: GenericCriteriaItem,
    valueSets: ValueSetStore,
    args: Array<ChipDisplayMethod | DataTypes>
  ) =>
    chipFromAutoComplete(
      val as LabelObject[],
      item as AutoCompleteItem,
      valueSets,
      args[0] as string,
      args[1] as boolean
    ),
  executiveUnit: (
    val: DataTypes,
    item: GenericCriteriaItem,
    valueSets: ValueSetStore,
    args: Array<ChipDisplayMethod | DataTypes>
  ) => chipForScopeElement(val as Hierarchy<ScopeElement, string>[]),
  numberAndComparator: (
    val: DataTypes,
    item: GenericCriteriaItem,
    valueSets: ValueSetStore,
    args: Array<ChipDisplayMethod | DataTypes>
  ) => chipForNumberAndComparator(val as NumberAndComparatorDataType, args[0] as string),
  codeSearch: (
    val: DataTypes,
    item: GenericCriteriaItem,
    valueSets: ValueSetStore,
    args: Array<ChipDisplayMethod | DataTypes>
  ) =>
    chipFromCodeSearch(val as LabelObject[], item as CodeSearchItem, valueSets, args[0] as string, args[1] as boolean),
  idListLabel: (
    val: DataTypes,
    item: GenericCriteriaItem,
    valueSets: ValueSetStore,
    args: Array<ChipDisplayMethod | DataTypes>
  ) => getIdsListLabels(val as string, args[0] as string),
  getAttachmentMethod: (
    val: DataTypes,
    item: GenericCriteriaItem,
    valueSets: ValueSetStore,
    args: Array<ChipDisplayMethod | DataTypes>
  ) => getAttachmentMethod(val as LabelObject[], args[0] as string),
  getSearchDocumentLabel: (
    val: DataTypes,
    item: GenericCriteriaItem,
    valueSets: ValueSetStore,
    args: Array<ChipDisplayMethod | DataTypes>
  ) => getSearchDocumentLabel(val as string, args[0] as LabelObject[]),
  getDocumentTypesLabel: (
    val: DataTypes,
    item: GenericCriteriaItem,
    valueSets: ValueSetStore,
    args: Array<ChipDisplayMethod | DataTypes>
  ) => getDocumentTypesLabel(val as LabelObject[]),
  getDocumentStatusLabel: (
    val: DataTypes,
    item: GenericCriteriaItem,
    valueSets: ValueSetStore,
    args: Array<ChipDisplayMethod | DataTypes>
  ) => getDocumentStatusLabel(val as LabelObject[]),
  altArgs: (
    val: DataTypes,
    item: GenericCriteriaItem,
    valueSets: ValueSetStore,
    args: Array<ChipDisplayMethod | DataTypes>
  ) => {
    return args[1] === args[2]
      ? (args[0] as ChipDisplayMethod)(args.slice(3).find((arg, i) => i % 2 === 0) as DataTypes, item, valueSets, [])
      : (args[0] as ChipDisplayMethod)(args.slice(3).find((arg, i) => i % 2 === 1) as DataTypes, item, valueSets, [])
  },
  noop: () => undefined
}
