import { ChipStatus } from 'components/ui/StatusChip'
import { Paragraph } from 'components/ui/Paragraphs'

export type Link = {
  url: string
  label?: string
}

export type Status = {
  label: string
  status: ChipStatus
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
  SUBARRAY,
  PARAGRAPHS,
  DOCUMENT_CONTENT
}

export type Cell = {
  id: string
  value: string | Link | Document | Table | Line[] | Paragraph[] | Status
  type: CellType
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
  sx?: React.CSSProperties
  isHidden?: boolean
}

export type Row = Cell[]

export type Column = {
  label: string
  code?: string
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
}

export type Table = {
  columns: Column[]
  rows: Row[]
}
