import { SelectedStatus } from 'types'

export type Hierarchy<T, S> = T & {
  id: S
  status?: SelectedStatus
  above_levels_ids?: string
  inferior_levels_ids?: string
  subItems?: Hierarchy<T, S>[]
}

export type InfiniteMap = Map<string, InfiniteMap>
