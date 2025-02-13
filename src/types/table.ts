import { Status as StatusType } from 'components/ui/StatusChip'
import { Paragraph } from 'components/ui/Paragraphs'
import { Theme } from '@emotion/react'
import { SxProps } from '@mui/material'

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

export type Line = {
  name: string
  value: string
}

export type Document = {
  id: string
  deidentified: boolean
}

export enum CellType {
  TEXT,
  GENDER_ICON,
  STATUS_CHIP,
  LINK,
  MODAL,
  LINES,
  DOCUMENT_VIEWER,
  SUBARRAY
}

export type Cell = {
  id: string
  value: string | Link | Document | Table | Line[] | Paragraph[] | Status
  type: CellType
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
  sx?: SxProps<Theme>
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
