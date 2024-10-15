import { LoadingStatus, SelectedStatus } from 'types'

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
}

export type AbstractTree<ID = string, DATA = {}> = DATA & {
  id: ID
  subItems?: AbstractTree<ID, DATA>[]
}

export type HierarchyWithLabel<S = {}> = AbstractTree<string, { label: string } & S>

export type HierarchyWithLabelAndSystem<S = {}> = HierarchyWithLabel<{ system: string } & S>

export type FhirItem = {
  id: string
  label: string
  parentIds?: string[]
  childrenIds?: string[]
  system: string
}

export type FhirHierarchy = AbstractTree<string, FhirItem>

export type Hierarchy<T = {}, S = string> = AbstractTree<
  S,
  T & {
    label: string
    above_levels_ids: string
    inferior_levels_ids: string
    system: string
    status?: SelectedStatus
  }
>

export type HierarchyElementWithSystem = Hierarchy<string, { system?: string; label: string }>

export type InfiniteMap = Map<string, InfiniteMap>

export type HierarchyLoadingStatus = {
  init: LoadingStatus
  search: LoadingStatus
  expand: LoadingStatus
}

export type GroupedBySystem<T> = {
  system: string
  codes: Hierarchy<T, string>[]
}

export type CodeKey = string

export type Codes<T> = Map<string, Map<CodeKey, Hierarchy<T>>>
