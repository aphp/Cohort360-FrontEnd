import { ValidationRules } from 'react-hook-form'

export type FormInput<K extends Record<string, any> = Record<string, any>> = {
  name: keyof K
  label?: string
  options?: ValidationRules
  containerStyle?: React.CSSProperties
} & (LabelInput | TextInput | SelectInput | DateInput | AutocompleteInput | SliderInput)

type LabelInput = {
  label: string
  type: 'label'
}

type TextInput = {
  placeholder?: string
  variant?: 'outlined' | 'filled' | 'standard' | undefined
  type: 'number' | 'text'
}

type SelectInput = {
  type: 'select'
  selectOptions: { id: string; label: string }[]
}

type AutocompleteInput = {
  type: 'autocomplete'
  title?: string
  variant?: 'outlined' | 'filled' | 'standard' | undefined
  autocompleteOptions: { id: string; label: string }[]
}

type DateInput = {
  type: 'date'
}

type SliderInput = {
  type: 'slider'
  minValue?: number
  maxValue?: number
}
