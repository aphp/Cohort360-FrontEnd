import { getConfig } from 'config'
import { store } from 'state/store'
import { selectFormItemByName } from 'state/questionnairesFormData'
import { LabelObject } from 'types/searchCriterias'

export type FormItemValueSetMeta = {
  valueSetId: string
  valueSetData?: LabelObject[]
}

export const getFormItemValueSetMeta = (
  formName: string,
  linkId: string,
  fallback: FormItemValueSetMeta = { valueSetId: '' }
): FormItemValueSetMeta => {
  const formItem = selectFormItemByName(store.getState(), formName, linkId)
  if (!formItem) {
    return fallback
  }
  if (formItem.valueSet) {
    return { valueSetId: formItem.valueSet, valueSetData: formItem.options ?? fallback.valueSetData }
  }
  if (formItem.options?.length) {
    return { valueSetId: formItem.id, valueSetData: formItem.options }
  }
  return fallback
}

export const configValueSetFallback = (
  key: keyof ReturnType<typeof getConfig>['features']['questionnaires']['valueSets']
): FormItemValueSetMeta => {
  const entry = getConfig().features.questionnaires.valueSets[key]
  return { valueSetId: entry?.url ?? '', valueSetData: entry?.data }
}
