import { SelectedStatus } from 'types'
import { Hierarchy, InfiniteMap } from 'types/hierarchy'

export const getBranch = <T, S>(code: Hierarchy<T, S>, hierarchy: Hierarchy<T, S>[]) => {
  const goThroughBranch = (idsPath: string[], hierarchy: Hierarchy<T, S>[], branch: number[]) => {
    if (!idsPath.length) return
    const currentPathId = idsPath[0]
    const index = hierarchy.findIndex((item) => item.id === currentPathId)
    branch.push(index)
    const subItems = hierarchy[index].subItems
    if (subItems) goThroughBranch(idsPath.slice(1), subItems, branch)
  }
  const branch: number[] = []
  const idsPath = [...(code.above_levels_ids || '').split(',').slice(1), ...[code.id + '']]
  if (idsPath.length && hierarchy.length) goThroughBranch(idsPath, hierarchy, branch)
  return branch
}

export const buildHierarchyFromSelectedIds = async <T, S>(
  selectedCodes: Hierarchy<T, S>[],
  defaultLevels: Hierarchy<T, S>[],
  childrenHandler: (ids: string) => Promise<Hierarchy<T, S>[]>
) => {
  const paths = selectedCodes.map((item) => [...(item.above_levels_ids || '').split(',').slice(1), ...[item.id + '']])
  const uniquePaths = getTreeFromPath(paths)
  const newTree = await buildTree(uniquePaths, defaultLevels, childrenHandler)
  return newTree
}

const buildTree = async <T, S>(
  uniquePaths: InfiniteMap,
  baseLevels: Hierarchy<T, S>[],
  fetchChildren: (ids: string) => Promise<Hierarchy<T, S>[]>
) => {
  const buildBranch = async <T, S>(
    path: [string, InfiniteMap],
    node: Hierarchy<T, S>[],
    fetchChildren: (ids: string) => Promise<Hierarchy<T, S>[]>
  ) => {
    const [key, nextPath] = path
    const currentIndex = node.findIndex((elem) => elem.id === key)
    node[currentIndex].status = nextPath.size ? SelectedStatus.INDETERMINATE : SelectedStatus.SELECTED
    if (!nextPath.size) return
    const childrenIds = node[currentIndex].inferior_levels_ids
    if (childrenIds) {
      const children = await fetchChildren(childrenIds)
      node[currentIndex].subItems = children
      nextPath.forEach((value, key) => buildBranch([key, value], node[currentIndex].subItems || [], fetchChildren))
    }
  }
  const newTree = [...baseLevels]
  for (const path of uniquePaths) {
    await buildBranch(path, newTree, fetchChildren)
  }
  return newTree
}

export const getTreeFromPath = (paths: string[][]): InfiniteMap => {
  const tree = new Map()
  for (const path of paths) {
    let currentNode = tree
    for (const id of path) {
      if (!currentNode.has(id)) {
        currentNode.set(id, new Map())
      }
      currentNode = currentNode.get(id)
    }
  }
  return tree
}

export const getItemSelectedStatus = <T, S>(item: Hierarchy<T, S>): SelectedStatus => {
  if (item.subItems?.every((item) => item.status === SelectedStatus.SELECTED)) return SelectedStatus.SELECTED
  if (item.subItems?.every((item) => item.status === SelectedStatus.NOT_SELECTED || item.status === undefined))
    return SelectedStatus.NOT_SELECTED
  return SelectedStatus.INDETERMINATE
}

export const updateSelectedStatus = <T, S>(path: number[], list: Hierarchy<T, S>[], status: SelectedStatus) => {
  const currentIndex = path[0]
  if (path.length > 1) updateSelectedStatus(path.slice(1), list[currentIndex].subItems || [], status)
  if (path.length === 1) list[currentIndex].status = status
  else list[currentIndex].status = getItemSelectedStatus(list[currentIndex])
  return list
}

export const getSelectedCodes = <T, S>(list: Hierarchy<T, S>, selectedCodes: Hierarchy<T, S>[]) => {
  if (list.status === SelectedStatus.INDETERMINATE)
    list.subItems?.forEach((subItem) => getSelectedCodes(subItem, selectedCodes))
  if (list.status === SelectedStatus.SELECTED) selectedCodes.push(list)
  return selectedCodes
}

export const addSubItems = <T, S>(
  tree: Hierarchy<T, S>[],
  depth: number,
  indices: number[],
  toAdd: Hierarchy<T, S>[]
) => {
  const index = indices[depth]
  if (depth < indices.length - 1) {
    addSubItems(tree[index].subItems || [], depth + 1, indices, toAdd)
  } else {
    tree[index].subItems = toAdd
  }
  return tree
}
