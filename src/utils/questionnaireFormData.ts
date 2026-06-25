import { Extension, Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4'
import { LabelObject } from 'types/searchCriterias'

export type FormItemType = Extract<
  keyof QuestionnaireResponseItemAnswer,
  'valueString' | 'valueCoding' | 'valueBoolean' | 'valueDate' | 'valueDateTime' | 'valueInteger' | 'valueDecimal'
>

export type FormItem = {
  id: string
  formName: string
  linkId: string
  itemType: FormItemType
  title: string
  options?: LabelObject[]
  valueSet?: string
}

export const MAPPING_EXTENSION_URL =
  'https://aphp.fr/ig/fhir/eds/StructureDefinition/aphp-eds-mapping-orbis-data-lake-form'

const TRANSFORMATION_TYPE_URL = 'transformation_type'

const TRANSFORMATION_TYPE_MAPPING: Record<string, FormItemType> = {
  StringText: 'valueString',
  UniqueChoice: 'valueCoding',
  MultipleChoice: 'valueCoding',
  MultipleChoiceCompositeVS: 'valueCoding',
  UniqueChoiceCompositeVS: 'valueCoding',
  ChoiceByBooleans: 'valueCoding',
  Boolean: 'valueBoolean',
  Date: 'valueDate',
  DateTime: 'valueDateTime',
  Integer: 'valueInteger',
  IntegerUnit: 'valueInteger',
  Decimal: 'valueDecimal',
  DecimalUnit: 'valueDecimal'
}

const CONTAINER_TRANSFORMATION_TYPES = new Set(['Group', 'Array', 'SubForm'])

const FHIR_TYPE_MAPPING: Partial<Record<NonNullable<QuestionnaireItem['type']>, FormItemType>> = {
  string: 'valueString',
  text: 'valueString',
  choice: 'valueCoding',
  'open-choice': 'valueCoding',
  boolean: 'valueBoolean',
  date: 'valueDate',
  dateTime: 'valueDateTime',
  integer: 'valueInteger',
  decimal: 'valueDecimal',
  quantity: 'valueDecimal'
}

export const getTransformationType = (item: QuestionnaireItem): string | undefined => {
  const mappingExtension = item.extension?.find((ext) => ext.url === MAPPING_EXTENSION_URL)
  return mappingExtension?.extension?.find((ext: Extension) => ext.url === TRANSFORMATION_TYPE_URL)?.valueCode
}

export const mapToSimpleType = (
  transformationType: string | undefined,
  fhirType: QuestionnaireItem['type'] | undefined
): FormItemType | undefined => {
  const mapped = transformationType ? TRANSFORMATION_TYPE_MAPPING[transformationType] : undefined

  if (mapped) {
    if (fhirType === 'decimal') {
      return 'valueDecimal'
    }
    if (fhirType === 'integer') {
      return 'valueInteger'
    }
    return mapped
  }

  return fhirType ? FHIR_TYPE_MAPPING[fhirType] : undefined
}

export const BOOLEAN_OPTIONS: LabelObject[] = [
  { id: 'true', label: 'Oui' },
  { id: 'false', label: 'Non' }
]

export const extractOptions = (item: QuestionnaireItem): LabelObject[] | undefined => {
  if (!item.answerOption?.length) {
    return undefined
  }
  const options = item.answerOption
    .map((option) => {
      const display = option.valueCoding?.display
      const code = option.valueCoding?.code
      const id = display ?? code
      return id ? { id, label: display ?? code ?? id } : undefined
    })
    .filter((option): option is LabelObject => option !== undefined)

  return options.length > 0 ? options : undefined
}

export const extractFormItems = (questionnaire: Questionnaire, formName: string): FormItem[] => {
  const result: FormItem[] = []

  const walk = (items: QuestionnaireItem[] | undefined) => {
    if (!items) {
      return
    }
    for (const item of items) {
      const transformationType = getTransformationType(item)

      const isContainer =
        (transformationType && CONTAINER_TRANSFORMATION_TYPES.has(transformationType)) || item.type === 'group'
      if (isContainer) {
        walk(item.item)
        continue
      }

      const itemType = mapToSimpleType(transformationType, item.type)
      if (itemType && item.linkId) {
        const options = itemType === 'valueBoolean' ? BOOLEAN_OPTIONS : extractOptions(item)
        result.push({
          id: `${formName}-${item.linkId}`,
          formName,
          linkId: item.linkId,
          itemType,
          title: item.text ?? '',
          valueSet: item.answerValueSet,
          options
        })
      }

      walk(item.item)
    }
  }

  walk(questionnaire.item)
  return result
}
