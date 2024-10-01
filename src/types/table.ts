export type Link = {
  url: string
  label?: string
}

export enum CellType {
  TEXT,
  CHIP,
  ICON,
  LINK
}

/** Est ce que tous les types de Ressource sont nécessaires? Certaines géénrique (comme TEXT, DATE) pourraient suffire */
export enum ColumnKey {
  GENDER,
  LAST_ENCOUNTER,
  VITAL_STATUS,
  BIRTHDATE,
  IPP,
  NAME,
  LASTNAME,
  NDA,
  DATE,
  TEXT
}

export type Cell = {
  id: string
  value: string | Link
  type: CellType
  key: ColumnKey
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
