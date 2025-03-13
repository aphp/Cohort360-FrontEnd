import { Cell } from './table'

type Section = {
  id: string
  size: number
  lines: Cell[]
}

export type Card = {
  url?: string
  sections: Section[]
}
