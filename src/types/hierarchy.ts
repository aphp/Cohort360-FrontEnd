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

export type AbstractTree<ID = string, DATA = {}> = DATA & {
  id: ID
  subItems?: AbstractTree<ID, DATA>[]
}

export type HierarchyWithLabel<S = {}> = AbstractTree<string, { label: string } & S>

export type HierarchyWithLabelAndSystem<S = {}> = HierarchyWithLabel<{ system: string } & S>

type FhirHierarchyItem = {
  id: string
  label: string
  parentIds?: string[]
  childrenIds?: string[]
  system: string
}

export type FhirHierarchy = AbstractTree<string, FhirHierarchyItem>

export type Hierarchy<T = {}, S = string> = AbstractTree<
  S,
  T & {
    label: string
    above_levels_ids: string
    inferior_levels_ids: string
    status?: SelectedStatus
  }
>

export type HierarchyElementWithSystem = Hierarchy<string, { system?: string; label: string }>

export type InfiniteMap = Map<string, InfiniteMap>

export type HierarchyLoadingStatus = {
  search: LoadingStatus
  expand: LoadingStatus
}

export type UseHierarchy<T> = {
  hierarchyRepresentation: Hierarchy<T, string>[]
  hierarchyDisplay: Hierarchy<T, string>[]
  loadingStatus: HierarchyLoadingStatus
  selectAllStatus: SelectedStatus
  search: (
    searchValue: string,
    page: number,
    fetchSearch: (search: string, page: number) => Promise<Hierarchy<T, string>[]>
  ) => Promise<void>
  select: (node: Hierarchy<T, string>, toAdd: boolean) => void
  selectAll: (toAdd: boolean) => void
  expand: (node: Hierarchy<T, string>) => Promise<void>
  deleteCode: (node: Hierarchy<T, string>) => void
}

export type HierarchyRoots<T, S> = {
  id: string
  baseTree: Hierarchy<T, S>[]
}
