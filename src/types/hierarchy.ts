import { LoadingStatus } from 'types'

export enum SelectedStatus {
  NOT_SELECTED,
  SELECTED,
  INDETERMINATE
}

export enum Mode {
  EXPAND,
  SEARCH,
  INIT,
  SELECT,
  UNSELECT,
  SELECT_ALL,
  UNSELECT_ALL
}

export type HierarchyInfo<T> = {
  tree: Hierarchy<T>[]
  count: number
  page: number
  system: string
}

export type AbstractTree<ID = string, DATA = {}> = DATA & {
  id: ID
  subItems?: AbstractTree<ID, DATA>[]
}

export type Hierarchy<T = {}, S = string> = AbstractTree<
  S,
  T & {
    label: string
    above_levels_ids: string
    inferior_levels_ids: string
    system: string
    status?: SelectedStatus
    statTotal?: number
    statTotalUnique?: number
  }
>

export type InfiniteMap = Map<string, InfiniteMap>

export type HierarchyLoadingStatus = {
  init: LoadingStatus
  search: LoadingStatus
  expand: LoadingStatus
}

export type GroupedBySystem<T> = {
  system: string
  codes: Hierarchy<T>[]
}

export type Codes<T> = Map<string, Map<string, Hierarchy<T>>>

export type CodesCache<T> = {
  id: string
  options: { [key: string]: Hierarchy<T> }
}

export enum SearchMode {
  EXPLORATION,
  RESEARCH
}

export enum SearchModeLabel {
  EXPLORATION = 'Exploration',
  RESEARCH = 'Recherche'
}
