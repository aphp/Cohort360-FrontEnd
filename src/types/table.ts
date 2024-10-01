import { Status as StatusType } from 'components/ui/StatusChip'
import { ReactElement } from 'react'

export type Link = {
  url: string
  label?: string
}

export type Status = {
  label: string
  status: StatusType
  icon?: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined
    }
  >
}

export enum CellType {
  TEXT,
  GENDER_ICON,
  STATUS_CHIP,
  LINK
}

export type Cell = {
  id: string
  value: string | Link | Status
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
