import { ReactNode } from 'react'
import { ScopeElement } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import { Comparators, CriteriaType, ResourceType } from 'types/requestCriterias'
import { SourceType } from 'types/scope'
import { LabelObject } from 'types/searchCriterias'
import { CHIPS_DISPLAY_METHODS } from './mappers/chipDisplayMapper'
import { BUILD_MAPPERS, UNBUILD_MAPPERS } from './mappers/buildMappers'
import { FhirItem, Reference } from 'types/valueSet'

/********************************************************************************/
/*                                  Criteria Types                              */
/********************************************************************************/
// When adding a new criteria type you must complete the following steps:
// 1. **REQUIRED** create a new CriteriaItem type (with required props "type") and then add the new type to the CriteriaItems union type
// 2. Optionnaly create the new data type definition and add it to the DataType union type
// 3. **REQUIRED** Update the DataTypeMapping type with the new type mapping

/****************************************************************/
/*               Criteria Item Definition Types                 */
/****************************************************************/

export type Context = {
  deidentified: boolean
}

type BaseCriteriaItem = {
  label?: string
  labelAltStyle?: boolean
  info?: string
  // these are used to display external label and info on top of the component
  extraLabel?: string | ((data: Record<string, DataTypes>, context: Context) => string)
  extraInfo?: string
  // for conditionnal fields
  displayCondition?: ((data: Record<string, DataTypes>, context: Context) => boolean) | string // the displayCondition is used to hide the field
  disableCondition?: ((data: Record<string, DataTypes>, context: Context) => boolean) | string // the disableCondition is used to disable the field
  displayValueSummary?: (data: DataTypes) => string // the displayValueSummary is used to display a summary of the value
  // for resetting the value of the field
  resetCondition?: ((data: Record<string, DataTypes>, context: Context) => boolean) | string // the resetCondition is used to reset the value of the field
}

type WithLabel = {
  label: string
}

type WithErrorType = {
  errorType: string
}

export type TextCriteriaItem = BaseCriteriaItem & {
  type: 'text'
}

export type TextWithRegexCriteriaItem = BaseCriteriaItem & {
  type: 'textWithRegex'
  regex: string
  checkErrorMessage?: string
  placeholder?: string
  multiline?: boolean
  inverseCheck?: boolean
  displayCheckError?: boolean
  extractValidValues?: boolean
}

export type InfoCriteriaItem = BaseCriteriaItem & {
  type: 'info'
  content: string
  contentType: 'info' | 'warning' | 'error'
}

export type NumberCriteriaItem = BaseCriteriaItem & {
  type: 'number'
  min?: number
}

export type BooleanCriteriaItem = BaseCriteriaItem & {
  type: 'boolean'
}

export type RadioChoiceCriteriaItem = BaseCriteriaItem & {
  type: 'radioChoice'
  choices: LabelObject[]
}

export type NumberWithComparatorCriteriaItem = BaseCriteriaItem & {
  type: 'numberAndComparator'
  withHierarchyInfo?: boolean
  withInfo?: ReactNode
  floatValues?: boolean
  allowBetween?: boolean
}

export type DurationItem = BaseCriteriaItem & {
  type: 'durationRange'
  unit?: string
  includeDays?: boolean
}

export type CalendarItem = BaseCriteriaItem &
  WithErrorType & {
    type: 'calendarRange'
    withOptionIncludeNull?: boolean
  }

export type SelectItem = BaseCriteriaItem & {
  type: 'select'
  choices: LabelObject[]
}

export type AutoCompleteItem = BaseCriteriaItem & {
  type: 'autocomplete'
  noOptionsText: string
  singleChoice?: boolean
  valueSetId: string
  valueSetData?: LabelObject[]
  prependCode?: boolean
  groupBy?: 'system' | 'type'
}

/**
 * Code search criteria item
 */
export type CodeSearchItem = BaseCriteriaItem & {
  type: 'codeSearch'
  noOptionsText: string
  checkIsLeaf?: boolean
  valueSetsInfo: Reference[]
}

export type ExecutiveUnitItem = BaseCriteriaItem &
  WithLabel & {
    type: 'executiveUnit'
    sourceType: SourceType
  }

export type TextWithCheckItem = BaseCriteriaItem &
  WithErrorType & {
    type: 'textWithCheck'
    placeholder: string
  }

// Union of all criteria item types
export type CriteriaItems =
  | CalendarItem
  | SelectItem
  | AutoCompleteItem
  | ExecutiveUnitItem
  | TextWithCheckItem
  | BooleanCriteriaItem
  | TextCriteriaItem
  | NumberCriteriaItem
  | CodeSearchItem
  | NumberWithComparatorCriteriaItem
  | TextWithRegexCriteriaItem
  | RadioChoiceCriteriaItem
  | DurationItem
  | InfoCriteriaItem

/****************************************************************/
/*                     Criteria Data Types                      */
/****************************************************************/

export type NewDurationRangeType = {
  start: string | null
  end: string | null
  includeNull?: boolean
}

export type NumberAndComparatorDataType = {
  value: number
  comparator: Comparators
  maxValue?: number
}

// Union of all criteria data types
export type DataTypes =
  | NewDurationRangeType
  | string
  | string[]
  | LabelObject[]
  | Hierarchy<FhirItem>[]
  | number
  | Hierarchy<ScopeElement, string>[]
  | NumberAndComparatorDataType
  | boolean
  | null

/****************************************************************/
/*                 Type Mapping / Criteria Item type            */
/****************************************************************/

type CriteriaTypeMapping<T extends CriteriaItems, U extends DataTypes> = {
  definition: T
  dataType: U
}

// Mapping of criteria item types to their respective data types and definitions
export type DataTypeMapping = {
  calendarRange: CriteriaTypeMapping<CalendarItem, NewDurationRangeType>
  durationRange: CriteriaTypeMapping<DurationItem, NewDurationRangeType>
  text: CriteriaTypeMapping<TextCriteriaItem, string>
  select: CriteriaTypeMapping<SelectItem, string>
  autocomplete: CriteriaTypeMapping<AutoCompleteItem, string[]>
  number: CriteriaTypeMapping<NumberCriteriaItem, number>
  executiveUnit: CriteriaTypeMapping<ExecutiveUnitItem, Hierarchy<ScopeElement, string>[]>
  numberAndComparator: CriteriaTypeMapping<NumberWithComparatorCriteriaItem, NumberAndComparatorDataType>
  boolean: CriteriaTypeMapping<BooleanCriteriaItem, boolean>
  textWithCheck: CriteriaTypeMapping<TextWithCheckItem, string>
  codeSearch: CriteriaTypeMapping<CodeSearchItem, Hierarchy<FhirItem>[]>
  textWithRegex: CriteriaTypeMapping<TextWithRegexCriteriaItem, string>
  radioChoice: CriteriaTypeMapping<RadioChoiceCriteriaItem, string>
  info: CriteriaTypeMapping<InfoCriteriaItem, string>
}

// List of criteria item types
export type CriteriaFormItemType = keyof DataTypeMapping

export type DataTypeMappings = DataTypeMapping[CriteriaFormItemType]

/********************************************************************************/
/*                                  Criteria Form Types                         */
/********************************************************************************/

/****************************************************************/
/*                     Criteria Form Data                       */
/****************************************************************/

/**
 * Common criteria data for criteria form
 */
export type CommonCriteriaData = {
  /** Criteria id */
  id: number
  /** Type of the criteria */
  type: CriteriaType
  title: string
  isInclusive: boolean
  encounterService: Hierarchy<ScopeElement>[] | null
  error?: boolean
}

// helpers
export type WithOccurenceCriteriaDataType = {
  occurrence: NumberAndComparatorDataType
  startOccurrence: NewDurationRangeType | null
}

export type WithEncounterDateDataType = {
  encounterStartDate: NewDurationRangeType | null
  encounterEndDate: NewDurationRangeType | null
}

export type WithEncounterStatusDataType = {
  encounterStatus: string[]
}

/****************************************************************/
/*                  Criteria Form Definition                    */
/****************************************************************/

export type BuildMethodExtraParam =
  | {
      type: 'string'
      value: string
    }
  | {
      type: 'number'
      value: number
    }
  | {
      type: 'boolean'
      value: boolean
    }
  | {
      type: 'null'
      value: null
    }
  | {
      type: 'method'
      value: keyof typeof BUILD_MAPPERS | keyof typeof UNBUILD_MAPPERS | keyof typeof CHIPS_DISPLAY_METHODS
    }
  | {
      type: 'reference'
      value: string
    }

export type FhirKey =
  | string
  | { id: string; type: string }
  | { main: string; deid: string }
  | { main: string; alt: string; value1: BuildMethodExtraParam; value2: BuildMethodExtraParam }

export type CriteriaItemBuildInfo = {
  buildInfo?: {
    fhirKey?: FhirKey // the key (fhir param name) to use in the fhir filter
    buildMethod?: keyof typeof BUILD_MAPPERS // one of the build mappers, if not provided the default build method for this type of criteria will be used
    buildMethodExtraArgs?: Array<BuildMethodExtraParam> // extra arguments to pass to the build method
    ignoreIf?: ((data: Record<string, DataTypes>) => boolean) | string // if true, the criteria value will be set to null and therefore ignored in the build / chip display process
    unbuildMethod?: keyof typeof UNBUILD_MAPPERS // one of the unbuild mappers, if not provided the default unbuild method for this type of criteria will be used
    unbuildMethodExtraArgs?: Array<DataTypes> // extra arguments to pass to the unbuild method
    unbuildIgnoreValues?: DataTypes[] // if the filter raw value is found in this list, unbuilding (setting the value to the criteria data object from the filter) will be ignored for this criteria. It is mainly used to match default values
    chipDisplayMethod?: keyof typeof CHIPS_DISPLAY_METHODS // one of the chip display mappers, if not provided the default chip display method for this type of criteria will be used
    chipDisplayMethodExtraArgs?: Array<BuildMethodExtraParam> // extra arguments to pass to the chip display method
  }
}

export type GenericCriteriaItem = CriteriaItems & CriteriaItemBuildInfo

export type WithBuildInfo<T extends DataTypeMappings> = T extends CriteriaTypeMapping<
  infer DefinitionType,
  // Used to be useful for the buildInfo type but not anymore, though didn't find a typing replacement to extract the DefintionType without The DataType
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  infer DataType
>
  ? DefinitionType & CriteriaItemBuildInfo
  : never

/**
 * Criteria item definition
 */
export type CriteriaItem<T, U extends DataTypeMappings> = {
  /** key of the related value in the data object */
  valueKey?: keyof T
} & WithBuildInfo<U>

// Criteria section listing criteria items
export type CriteriaSection<T> = {
  title?: string
  info?: string
  defaulCollapsed?: boolean
  items: CriteriaItem<T, DataTypeMappings>[]
}

// Criteria form definition
export type CriteriaForm<T> = {
  label: string
  title: string
  infoAlert?: ReactNode[]
  warningAlert?: ReactNode[]
  initialData: Omit<T, 'id'>
  errorMessages?: { [key: string]: string }
  buildInfo: {
    defaultFilter?: string
    type: Partial<Record<ResourceType, CriteriaType>>
    // should return true if the criteria is to be unbuild for the current fhir filter
    subType?: string
  }
  globalErrorCheck?: ((data: Record<string, DataTypes>, context: Context) => string | undefined) | string
  itemSections: CriteriaSection<T>[]
}

/****************************************************************/
/*                     Criteria Item Render                     */
/****************************************************************/

export type CriteriaFormItemViewProps<T extends CriteriaFormItemType> = {
  value: DataTypeMapping[T]['dataType']
  definition: DataTypeMapping[T]['definition']
  disabled: boolean
  getValueSetOptions: (valueSetId: string) => LabelObject[]
  updateData: (value: DataTypeMapping[T]['dataType'] | null) => void
  setError: (error?: string) => void
  deidentified: boolean
}

export type CriteriaFormItemView<T extends CriteriaFormItemType> = React.FC<CriteriaFormItemViewProps<T>>
