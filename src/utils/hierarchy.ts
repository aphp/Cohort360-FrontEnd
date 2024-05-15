import { SelectedStatus } from 'types'
import { Hierarchy, InfiniteMap } from 'types/hierarchy'

const mapInfiniteMapToList = (map: InfiniteMap): string[] => {
  let allValues: string[] = []
  map.forEach((value, key) => {
    allValues.push(key)
    if (value instanceof Map) {
      allValues = allValues.concat(mapInfiniteMapToList(value))
    }
  })
  return allValues
}
export const mapHierarchyToMap = <T>(hierarchy: Hierarchy<T, string>[]) => {
  return hierarchy.reduce((resultMap: Map<string, Hierarchy<T, string>>, item) => {
    resultMap.set(item.id, item)
    return resultMap
  }, new Map())
}

const createBranchFromInfo = <T>(
  path: [string, InfiniteMap],
  results: Map<string, Hierarchy<T, string>>,
  node: Hierarchy<T, string> | null,
  status: SelectedStatus | null
) => {
  const [key, nextPath] = path
  node = results.get(key) || null
  if (node) {
    if (nextPath.size) {
      const inferiorLevels = node.inferior_levels_ids?.split(',')
      const childrenToAdd =
        inferiorLevels?.map((id) => {
          const elem = results.get(id)
          return elem ? { ...elem, status: node?.status } : ({ id: 'last: ' + id } as Hierarchy<T, string>)
        }) || []
      node.subItems = []
      node.subItems.push(...childrenToAdd)
      for (const [nextKey, next] of nextPath) {
        const index = node.subItems.findIndex((elem) => elem.id === nextKey)
        const nextNode = createBranchFromInfo([nextKey, next], results, node.subItems[index], status)
        if (nextNode) node.subItems[index] = nextNode
      }
      if (status !== null) node.status = getItemSelectedStatus(node)
    } else if (status !== null) node.status = status
  }
  return node
}

const getBranchMissingInfo = async <T>(
  path: [string, InfiniteMap],
  codes: Map<string, Hierarchy<T, string>>,
  fetchHandler: (ids: string) => Promise<Hierarchy<T, string>[]>,
  status: SelectedStatus | null
) => {
  const [key, nextPath] = path
  const parentsKeysList = mapInfiniteMapToList(nextPath)
  const parentsUniqueKeysList = [key, ...parentsKeysList.filter((elem) => !codes.has(elem))].join(',')
  const parents = await fetchHandler(parentsUniqueKeysList)
  const codesInferiorIds = Array.from(codes.values()).flatMap((item) => item.inferior_levels_ids?.split(',') || [])
  const parentsInferiorIds = parents.flatMap((item) => item.inferior_levels_ids?.split(',') || [])
  const childrenUniqueKeysList = [...parentsInferiorIds, ...codesInferiorIds]
    .filter((elem) => elem && !codes.has(elem) && !parentsUniqueKeysList.split(',').includes(elem))
    .join(',')
  const children = await fetchHandler(childrenUniqueKeysList)
  const results = mapHierarchyToMap([...parents, ...children, ...codes.values()])
  const branch = createBranchFromInfo(path, results, null, status)
  return branch
}

export const buildBranch = async <T>(
  node: Hierarchy<T, string>,
  path: [string, InfiniteMap],
  codes: Map<string, Hierarchy<T, string>>,
  fetchHandler: (ids: string) => Promise<Hierarchy<T, string>[]>,
  status: SelectedStatus | null,
  toAdd = false
) => {
  const [, nextPath] = path
  if (nextPath.size && (!node || !codes.get(node.id))) {
    if (!node || !node.subItems) {
      const branch = await getBranchMissingInfo(path, codes, fetchHandler, status)
      if (branch) node = branch
    } else {
      for (const [nextKey, next] of nextPath) {
        const index = node.subItems.findIndex((elem) => elem.id === nextKey)
        const item = await buildBranch(node.subItems[index], [nextKey, next], codes, fetchHandler, status, toAdd)
        node.subItems[index] = item
      }
    }
    if (status !== null) node.status = getItemSelectedStatus(node)
  } else {
    if (toAdd && node.inferior_levels_ids) {
      const children = await fetchHandler(node.inferior_levels_ids)
      status = node.status === SelectedStatus.SELECTED ? SelectedStatus.SELECTED : SelectedStatus.NOT_SELECTED
      node.subItems = children
    }
    if (status !== null) {
      node.status = status
      updateBranchStatus(node, status)
    }
  }
  return node
}

export const buildHierarchy = async <T>(
  selectedCodes: Hierarchy<T, string>[],
  defaultLevels: Hierarchy<T, string>[],
  fetchHandler: (ids: string) => Promise<Hierarchy<T, string>[]>,
  status: SelectedStatus | null
) => {
  const paths = selectedCodes.map((item) =>
    item.above_levels_ids ? [...(item.above_levels_ids || '').split(','), ...[item.id]] : [item.id]
  )
  const uniquePaths = getUniquePath(paths)
  const selectedCodesMap = selectedCodes.reduce((resultMap, item) => {
    resultMap.set(item.id, item)
    return resultMap
  }, new Map())
  for (const [key, value] of uniquePaths) {
    const index = defaultLevels.findIndex((elem) => elem.id === key)
    const branch = await buildBranch(defaultLevels[index], [key, value], selectedCodesMap, fetchHandler, status)
    index > -1 ? (defaultLevels[index] = branch) : defaultLevels.push(branch)
  }
  return [...defaultLevels]
}

export const getHierarchyDisplay = <T>(defaultLevels: Hierarchy<T, string>[], tree: Hierarchy<T, string>[]) => {
  const branches = defaultLevels.map((item) => {
    const path = [...(item.above_levels_ids || '').split(',').filter((elem) => elem !== ''), ...[item.id + '']]
    return findBranch(path, tree)
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
  } else if (next.subItems) {
    if (next.status !== SelectedStatus.INDETERMINATE)
      next.subItems = next.subItems.map((item) => ({ ...item, status: next.status }))
    branch = findBranch(path.slice(1), next.subItems)
  }
  return branch
}

export const getUniquePath = (paths: string[][]): InfiniteMap => {
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

const updateBranchStatus = <T>(node: Hierarchy<T, string>, status: SelectedStatus) => {
  if (node.subItems) {
    node.subItems.forEach((subItem) => {
      subItem.status = status === SelectedStatus.SELECTED ? SelectedStatus.SELECTED : SelectedStatus.NOT_SELECTED
      updateBranchStatus(subItem, status)
    })
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
