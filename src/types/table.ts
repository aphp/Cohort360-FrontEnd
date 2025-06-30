import React from 'react'
import { ChipStatus } from 'components/ui/StatusChip'
import { Paragraph } from 'components/ui/Paragraphs'
import { SubItemType } from './cohorts'

export type Action = {
  title: string
  icon: React.ElementType
  onClick: () => void
  disabled?: boolean
}

export type Link = {
  url: string
  label?: string
}

export type Favorite = {
  onClick: () => void
  isFavorite: boolean
  disabled: boolean
}

export type CheckboxAction = {
  onClick: () => void
  isChecked: boolean
  disabled?: boolean
}

export type SubItem = {
  label: SubItemType
  total: number
  onClick: () => void
}

export type Status = {
  label: string
  status: ChipStatus
  icon?: React.ElementType
  tooltip?: string
}

export type Line = {
  name: string
  value: string
}

export type Document = {
  id: string
  deidentified: boolean
}

export enum CellType {
  ACTIONS,
  TEXT,
  GENDER_ICON,
  FAV_ICON,
  SUB_ITEM,
  STATUS_CHIP,
  LINK,
  MODAL,
  LINES,
  DOCUMENT_VIEWER,
  SUBARRAY,
  PARAGRAPHS,
  DOCUMENT_CONTENT,
  CHECKBOX
}

export type Cell = {
  id: string
  value:
    | string
    | Link
    | Document
    | Table
    | Line[]
    | Paragraph[]
    | Status
    | Favorite
    | SubItem
    | Element
    | Action[]
    | CheckboxAction
  type: CellType
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
  sx?: React.CSSProperties
  isHidden?: boolean
}

export type Row = Cell[] & {
  _onClick?: () => void
}

export type Column = {
  label: React.ReactNode
  code?: string
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
  tooltip?: string
  isCheckbox?: boolean
  checkboxProps?: { isChecked: boolean; isIndeterminate: boolean; onSelectAll: () => void }
}

export type Table = {
  columns: Column[]
  rows: Row[]
}
