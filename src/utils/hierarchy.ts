import { SelectedStatus } from 'types'
import { Hierarchy, InfiniteMap, Mode } from 'types/hierarchy'
import { arrayToMap } from './arrays'

export const cleanNodes = <T>(nodes: Hierarchy<T, string>[]) => {
  return nodes.map((item) => ({ ...item, subItems: undefined, status: undefined }))
}

export const mapHierarchyToMap = <T>(hierarchy: Hierarchy<T, string>[]) => {
  return hierarchy.reduce((resultMap: Map<string, Hierarchy<T, string>>, item) => {
    resultMap.set(item.id, item)
    return resultMap
  }, new Map())
}

const getMissingIds = <T>(prevCodes: Map<string, Hierarchy<T, string>>, codes: Map<string, null>) => {
  const missingCodes: string[] = []
  for (const [key] of codes) {
    const isFound = prevCodes.get(key)
    if (!isFound) missingCodes.push(key)
  }
  return missingCodes
}

const addAllFetchedIds = <T>(codes: Map<string, Hierarchy<T, string>>, results: Hierarchy<T, string>[]) => {
  const resultsMap = mapHierarchyToMap(results)
  return new Map([...codes, ...resultsMap])
}

export const getMissingCodes = async <T>(
  baseTree: Hierarchy<T, string>[],
  prevCodes: Map<string, Hierarchy<T, string>>,
  newCodes: Hierarchy<T, string>[],
  mode: Mode,
  fetchHandler: (ids: string) => Promise<Hierarchy<T, string>[]>
) => {
  const newCodesMap = mapHierarchyToMap(newCodes)
  let allCodes = new Map([...prevCodes, ...newCodesMap])
  let missingIds: string[] = []
  let above: string[] = []
  if (mode === Mode.EXPAND) missingIds = getMissingIds(allCodes, arrayToMap(getInferiorLevels(newCodes), null))
  else {
    above = getAboveLevels(newCodes, baseTree)
    missingIds = getMissingIds(allCodes, arrayToMap(above, null))
  }
  if (missingIds.length) {
    const ids = missingIds.join(',')
    const fetched = await fetchHandler(ids)
    allCodes = addAllFetchedIds(allCodes, fetched)
  }
  if (mode !== Mode.EXPAND) {
    const children = getInferiorLevels(above.map((id) => allCodes.get(id)!))
    missingIds = getMissingIds(allCodes, arrayToMap(children, null))
    if (missingIds.length) {
      const ids = missingIds.join(',')
      const childrenResponse = await fetchHandler(ids)
      allCodes = addAllFetchedIds(allCodes, childrenResponse)
    }
  }
  return allCodes
}

const getMissingNode = <T>(key: string, node: Hierarchy<T, string>, codes: Map<string, Hierarchy<T, string>>) => {
  const code = codes.get(key) ?? null
  if (!node) if (code) node = { ...code }
  return node
}

const getMissingSubItems = <T>(node: Hierarchy<T, string>, codes: Map<string, Hierarchy<T, string>>) => {
  const subItems: Hierarchy<T, string>[] = []
  const levels = node.inferior_levels_ids?.split(',')
  levels.forEach((id) => {
    const foundCode = codes.get(id)
    if (foundCode) subItems.push({ ...foundCode })
  })
  return subItems.length ? subItems : []
}

export const buildHierarchy = <T>(
  baseTree: Hierarchy<T, string>[],
  endCodes: Hierarchy<T, string>[],
  codes: Map<string, Hierarchy<T, string>>,
  selected: Hierarchy<T, string>[],
  mode: Mode
) => {
  const buildBranch = <T>(
    node: Hierarchy<T, string>,
    path: [string, InfiniteMap],
    codes: Map<string, Hierarchy<T, string>>,
    selected: Map<string, Hierarchy<T, string>>,
    mode: Mode
  ) => {
    const [key, nextPath] = path
    node = getMissingNode(key, node, codes)
    if (nextPath.size) {
      if (!node.subItems) node.subItems = getMissingSubItems(node, codes)
      for (const [nextKey, nextValue] of nextPath) {
        const index = node.subItems.findIndex((elem) => elem.id === nextKey)
        if (index !== undefined && index > -1) {
          const item = buildBranch(node.subItems[index], [nextKey, nextValue], codes, selected, mode)
          node.subItems[index] = item
        }
        node.status = getItemSelectedStatus(node)
      }
    } else {
      if (mode === Mode.EXPAND && !node.subItems) node.subItems = getMissingSubItems(node, codes)
      if (mode === Mode.SELECT || mode === Mode.SELECT_ALL) node.status = SelectedStatus.SELECTED
      if (mode === Mode.UNSELECT || mode === Mode.UNSELECT_ALL) node.status = SelectedStatus.NOT_SELECTED
      if (mode !== Mode.SEARCH && mode !== Mode.INIT) updateBranchStatus(node, node.status)
    }
    if ((mode === Mode.SEARCH || mode === Mode.INIT) && selected.get(key)) {
      node.status = SelectedStatus.SELECTED
      updateBranchStatus(node, SelectedStatus.SELECTED)
    }
    return node
  }

  const paths = getPaths(baseTree, endCodes, mode === Mode.UNSELECT_ALL || mode === Mode.SELECT_ALL)
  const uniquePaths = getUniquePath(paths)
  if (mode === Mode.INIT) baseTree = []
  for (const [key, value] of uniquePaths) {
    const index = baseTree.findIndex((elem) => elem.id === key)
    const branch = buildBranch(baseTree[index] || null, [key, value], codes, mapHierarchyToMap(selected), mode)
    if (branch && index > -1) baseTree[index] = branch
    else baseTree.push(branch)
  }
  return [...baseTree]
}

export const getHierarchyDisplay = <T>(defaultLevels: Hierarchy<T, string>[], tree: Hierarchy<T, string>[]) => {
  let branches: Hierarchy<T, string>[] = []
  if (defaultLevels.length && tree.length)
    branches = defaultLevels.map((item) => {
      const path = item.above_levels_ids ? [...getAboveLevelsWithRights(item, tree), ...[item.id]] : [item.id]
      return findBranch(path, tree) || { id: 'notFound' }
    })
  return branches
}

const findBranch = <T>(path: string[], tree: Hierarchy<T, string>[]): Hierarchy<T, string> => {
  let branch: Hierarchy<T, string> = { id: 'empty' } as Hierarchy<T, string>
  const key = path[0]
  const index = tree.findIndex((item) => item.id === key)
  const next = tree[index]
  if (path.length === 1) {
    branch = next
  } else if (next && next.subItems) {
    if (next.status !== SelectedStatus.INDETERMINATE)
      next.subItems = next.subItems.map((item) => ({ ...item, status: next.status }))
    branch = findBranch(path.slice(1), next.subItems)
  }
  return branch
}

const getPaths = <T>(baseTree: Hierarchy<T, string>[], endCodes: Hierarchy<T, string>[], selectAll: boolean) => {
  let paths = endCodes.map((item) =>
    item.above_levels_ids ? [...getAboveLevelsWithRights(item, baseTree), ...[item.id]] : [item.id]
  )
  if (selectAll) {
    for (const path of paths) {
      const lastId = path[path.length - 1]
      paths = paths.filter((path) => {
        const index = path.findIndex((id) => id === lastId)
        if (index < 0 || index === path.length - 1) return true
        return false
      })
    }
  }
  return paths
}

const getUniquePath = (paths: string[][]): InfiniteMap => {
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

const updateBranchStatus = <T>(node: Hierarchy<T, string>, status: SelectedStatus | undefined) => {
  if (status !== undefined && status !== SelectedStatus.INDETERMINATE && node.subItems) {
    for (const subItem of node.subItems) {
      subItem.status = status === SelectedStatus.SELECTED ? SelectedStatus.SELECTED : SelectedStatus.NOT_SELECTED
      updateBranchStatus(subItem, status)
    }
  }
  return node
}

export const getItemSelectedStatus = <T, S>(item: Hierarchy<T, S>): SelectedStatus => {
  if (item.subItems?.every((item) => item.status === SelectedStatus.SELECTED)) return SelectedStatus.SELECTED
  if (item.subItems?.every((item) => item.status === SelectedStatus.NOT_SELECTED || item.status === undefined))
    return SelectedStatus.NOT_SELECTED
  return SelectedStatus.INDETERMINATE
}

export const getSelectedCodes = <T>(list: Hierarchy<T, string>[]) => {
  const get = <T>(hierarchy: Hierarchy<T, string>, selectedCodes: Hierarchy<T, string>[]) => {
    if (hierarchy.status === SelectedStatus.INDETERMINATE)
      hierarchy.subItems?.forEach((subItem) => get(subItem, selectedCodes))
    if (hierarchy.status === SelectedStatus.SELECTED) selectedCodes.push(hierarchy)
    return selectedCodes
  }
  const selectedCodes = list.flatMap((hierarchy) => get(hierarchy, []))
  return selectedCodes
}

const getAboveLevelsWithRights = <T>(item: Hierarchy<T, string>, baseTree: Hierarchy<T, string>[]) => {
  const levels = (item.above_levels_ids || '').split(',')
  if (baseTree.find((item) => item.id === levels[0])) return levels
  const ids = baseTree.map((code) => code.id)
  const startIndex = levels.findIndex((level) => ids.includes(level))
  if (startIndex > -1) return levels.slice(startIndex)
  return []
}

const getAboveLevels = <T>(hierarchy: Hierarchy<T, string>[], baseTree: Hierarchy<T, string>[]) => {
  return hierarchy.flatMap((item) =>
    [...getAboveLevelsWithRights(item, baseTree)].filter((item) => item && item !== 'null' && item !== 'undefined')
  )
}

const getInferiorLevels = <T>(hierarchy: Hierarchy<T, string>[]) => {
  return hierarchy
    .flatMap((item) => (item.inferior_levels_ids || '').split(','))
    .filter((item) => item && item !== 'null' && item !== 'undefined')
}
