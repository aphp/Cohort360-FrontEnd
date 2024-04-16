import { SelectedStatus } from 'types'

export type Hierarchy<T, S> = T & {
  id: S
  status?: SelectedStatus
  subItems?: Hierarchy<T, S>[]
}

export type InfiniteMap = Map<string, InfiniteMap>
