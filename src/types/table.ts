export type Link = {
  url: string
  label?: string
}

export enum CellType {
  TEXT,
  GENDER_ICON,
  VITALSTATUS_CHIP,
  LINK
}

export type Cell = {
  id: string
  value: string | Link
  type: CellType
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
}

export type Row = Cell[]

export type Column = {
  label: string
  code?: string
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
  multiple?: Column[]
}

export type Table = {
  columns: Column[]
  rows: Row[]
}
