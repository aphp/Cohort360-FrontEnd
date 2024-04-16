import { SelectedStatus } from 'types'

export enum Mode {
  EXPAND,
  SEARCH,
  INIT,
  SELECT,
  UNSELECT,
  SELECT_ALL,
  UNSELECT_ALL
}

export type Hierarchy<T, S> = T & {
  id: S
  above_levels_ids: string
  inferior_levels_ids: string
  status?: SelectedStatus
  subItems?: Hierarchy<T, S>[]
}

export type InfiniteMap = Map<string, InfiniteMap>
