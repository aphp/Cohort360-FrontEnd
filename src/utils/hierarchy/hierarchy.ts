import { SelectedStatus } from 'types'
import { CodeKey, GroupedBySystem, Hierarchy, InfiniteMap, Mode } from 'types/hierarchy'
import { arrayToMap } from '../arrays'

export const cleanNodes = <T>(nodes: Hierarchy<T, string>[]) => {
  return nodes.map((item) => ({ ...item, subItems: undefined, status: undefined }))
}

export const mapHierarchyToMap = <T>(hierarchy: Hierarchy<T, string>[]) => {
  return hierarchy.reduce((resultMap: Map<CodeKey, Hierarchy<T, string>>, item) => {
    resultMap.set(`${item.system}|${item.id}`, item)
    return resultMap
  }, new Map())
}

const getMissingIds = <T>(prevCodes: Map<CodeKey, Hierarchy<T, string>>, codes: Map<CodeKey, null>) => {
  const missingCodes: CodeKey[] = []
  for (const [key] of codes) {
    const isFound = prevCodes.get(key)
    if (!isFound) missingCodes.push(key)
  }
  return missingCodes
}

const addAllFetchedIds = <T>(codes: Map<CodeKey, Hierarchy<T, string>>, results: Hierarchy<T, string>[]) => {
  const resultsMap = mapHierarchyToMap(results)
  return new Map([...codes, ...resultsMap])
}

export const getMissingCodesWithSystems = async <T>(
  trees: Map<string, Hierarchy<T, string>[]>,
  groupBySystem: GroupedBySystem<T>[],
  prevCodes: Map<CodeKey, Hierarchy<T, string>>,
  fetchHandler: (ids: string, system: string) => Promise<Hierarchy<T, string>[]>
) => {
  let allCodes: Map<CodeKey, Hierarchy<T, string>> = new Map()
  for (const group of groupBySystem) {
    const tree = trees.get(group.system)
    if (tree) {
      const newCodes = await getMissingCodes(tree, prevCodes, group.codes, group.system, Mode.SEARCH, fetchHandler)
      allCodes = new Map([...allCodes, ...newCodes])
    }
  }
  return allCodes
}

export const getMissingCodes = async <T>(
  baseTree: Hierarchy<T, string>[],
  prevCodes: Map<CodeKey, Hierarchy<T, string>>,
  newCodes: Hierarchy<T, string>[],
  system: string,
  mode: Mode,
  fetchHandler: (ids: string, system: string) => Promise<Hierarchy<T, string>[]>
) => {
  const newCodesMap = mapHierarchyToMap(newCodes)
  let allCodes = new Map([...prevCodes, ...newCodesMap])
  let missingIds: CodeKey[] = []
  let above: CodeKey[] = []
  if (mode === Mode.EXPAND) missingIds = getMissingIds(allCodes, arrayToMap(getInferiorLevels(newCodes), null))
  else {
    above = getAboveLevels(newCodes, baseTree)
    missingIds = getMissingIds(allCodes, arrayToMap(above, null))
    //console.log('test search prev', newCodes, baseTree)
    //console.log('test search above', above)
    //console.log('test search missing', missingIds)
  }
  if (missingIds.length) {
    const ids = missingIds.map((id) => id.split('|')[1]).join(',')
    const fetched = await fetchHandler(ids, system)
    allCodes = addAllFetchedIds(allCodes, fetched)
  }
  if (mode !== Mode.EXPAND) {
    const children = getInferiorLevels(above.map((key) => allCodes.get(key)!))
    missingIds = getMissingIds(allCodes, arrayToMap(children, null))
    if (missingIds.length) {
      const ids = missingIds.map((id) => id.split('|')[1]).join(',')
      const childrenResponse = await fetchHandler(ids, system)
      allCodes = addAllFetchedIds(allCodes, childrenResponse)
    }
  }
  //console.log('test search allCodes', allCodes)
  return allCodes
}

export const getMissingNode = <T>(
  system: string,
  id: string,
  node: Hierarchy<T, string>,
  codes: Map<CodeKey, Hierarchy<T, string>>
) => {
  const code = codes.get(`${system}|${id}`) ?? null
  if (!node) if (code) node = { ...code }
  return node
}

export const getMissingSubItems = <T>(node: Hierarchy<T, string>, codes: Map<CodeKey, Hierarchy<T, string>>) => {
  const subItems: Hierarchy<T, string>[] = []
  const levels = node.inferior_levels_ids?.split(',').map((id) => `${node.system}|${id}`)
  levels.forEach((key) => {
    const foundCode = codes.get(key)
    // console.log("test search find node", id, foundCode)
    if (foundCode) subItems.push({ ...foundCode })
  })
  return subItems.length ? subItems : []
}

export const buildMultipleTrees = <T>(
  trees: Map<string, Hierarchy<T, string>[]>,
  groupBySystem: GroupedBySystem<T>[],
  codes: Map<CodeKey, Hierarchy<T, string>>,
  selected: Hierarchy<T, string>[],
  mode: Mode
) => {
  for (const group of groupBySystem) {
    const tree = trees.get(group.system)
    if (tree) {
      const newTree = buildTree([...tree], group.system, group.codes, codes, selected, mode)
      trees.set(group.system, newTree)
    }
  }
  return new Map(trees)
}

/**
 * @template T - The type of the data stored in the hierarchy nodes.
 * @param {Hierarchy<T, string>[]} baseTree - The base tree structure to build upon.
 * @param {Hierarchy<T, string>[]} endCodes - The end codes used for building the tree.
 * @param {Map<string, Hierarchy<T, string>>} codes - A map of codes to hierarchy nodes.
 * @param {Hierarchy<T, string>[]} selected - A list of selected hierarchy nodes.
 * @param {Mode} mode - The mode to operate in, affecting how the tree is built and updated.
 * @returns {Hierarchy<T, string>[]} The built tree structure.
 */
export const buildTree = <T>(
  baseTree: Hierarchy<T, string>[],
  system: string,
  endCodes: Hierarchy<T, string>[],
  codes: Map<CodeKey, Hierarchy<T, string>>,
  selected: Hierarchy<T, string>[],
  mode: Mode
) => {
  const buildBranch = <T>(
    node: Hierarchy<T, string>,
    system: string,
    path: [string, InfiniteMap],
    codes: Map<CodeKey, Hierarchy<T, string>>,
    selected: Map<CodeKey, Hierarchy<T, string>>,
    mode: Mode
  ) => {
    const [currentPath, nextPath] = path
    node = getMissingNode(system, currentPath, node, codes)

    if (nextPath.size) {
      if (!node.subItems) node.subItems = getMissingSubItems(node, codes)
      for (const [nextKey, nextValue] of nextPath) {
        const index = node.subItems.findIndex((elem) => elem.id === nextKey)
        if (index !== undefined && index > -1) {
          const item = buildBranch(node.subItems[index], system, [nextKey, nextValue], codes, selected, mode)
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
    if ((mode === Mode.SEARCH || mode === Mode.INIT) && selected.get(`${system}|${currentPath}`)) {
      node.status = SelectedStatus.SELECTED
      updateBranchStatus(node, SelectedStatus.SELECTED)
    }
    return node
  }
  const paths = getPaths(baseTree, endCodes, mode === Mode.UNSELECT_ALL || mode === Mode.SELECT_ALL)
  const uniquePaths = getUniquePath(paths)
  //console.log('test search endCodes', endCodes)
  //console.log('test search paths', uniquePaths)
  if (mode === Mode.INIT) baseTree = []
  for (const [key, value] of uniquePaths) {
    const index = baseTree.findIndex((elem) => elem.id === key)
    //console.log('test search index', index)
    const branch = buildBranch(baseTree[index] || null, system, [key, value], codes, mapHierarchyToMap(selected), mode)
    //console.log('test search branch', branch)
    if (branch && index > -1) baseTree[index] = branch
    else if (index === -1) baseTree.push(branch)
    //if (branch && index === -1) baseTree.push(branch)
  }
  //console.log("test search baseTree", baseTree)
  return [...baseTree]
}

export const groupBySystem = <T>(codes: Hierarchy<T, string>[]) => {
  const systemMap = new Map<string, Hierarchy<T, string>[]>()
  for (const hierarchy of codes) {
    const system = hierarchy.system
    if (!systemMap.has(system)) {
      systemMap.set(system, [])
    }
    systemMap.get(system)!.push(hierarchy)
  }
  const groupedHierarchies: GroupedBySystem<T>[] = []
  systemMap.forEach((codes, system) => {
    groupedHierarchies.push({ system, codes })
  })
  return groupedHierarchies
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

export const getListDisplay = <T>(toDisplay: Hierarchy<T, string>[], trees: Map<string, Hierarchy<T, string>[]>) => {
  let branches: Hierarchy<T, string>[] = []
  toDisplay.forEach((node) => {
    const currentTree = trees.get(node.system)
    if (currentTree) {
      const foundNode = getHierarchyDisplay([node], currentTree)[0]
      branches.push(foundNode)
    }
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

export const updateBranchStatus = <T>(node: Hierarchy<T, string>, status: SelectedStatus | undefined) => {
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
  return hierarchy.flatMap((item) => {
    return [...getAboveLevelsWithRights(item, baseTree)]
      .filter((level) => level && level !== 'null' && level !== 'undefined')
      .map((level) => `${item.system}|${level}`)
  })
}

const getInferiorLevels = <T>(hierarchy: Hierarchy<T, string>[]) => {
  return hierarchy.flatMap((item) =>
    (item.inferior_levels_ids || '')
      .split(',')
      .filter((level) => level && level !== 'null' && level !== 'undefined')
      .map((level) => `${item.system}|${level}`)
  )
}
