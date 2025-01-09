import { ReactNode } from 'react'

export enum CellType {
  TEXT,
  CHIP,
  ICON
}

export enum ColumnKey  {
  GENDER,
  LAST_ENCOUNTER,
  VITAL_STATUS,
  BIRTHDATE,
  IPP,
  NAME,
  LASTNAME
}

export type Cell = {
  id: string
  value: string | ReactNode
  type: CellType
  key: ColumnKey
}

export type Row = Cell[]

export type Column =
  | {
      label: string | ReactNode
      code?: string
      align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
      multiple?: undefined
    }
  | {
      multiple: Column[]
    }

export type Table = {
  columns: Column[]
  rows: Row[]
}
