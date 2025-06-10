import { SelectedStatus } from 'types/hierarchy'
import { Codes, CodesCache, GroupedBySystem, Hierarchy, InfiniteMap, Mode } from 'types/hierarchy'
import { arrayToMap } from './arrays'
import { HIERARCHY_ROOT, UNKOWN_HIERARCHY_CHAPTER } from 'services/aphp/serviceValueSets'

export const DEFAULT_HIERARCHY_INFO = {
  tree: [],
  count: 0,
  page: 1,
  system: ''
}

export const mapCodesToCache = <T>(codes: Codes<Hierarchy<T>>) => {
  const valueSetOptions: CodesCache<T>[] = []
  codes.forEach((innerMap, outerKey) => {
    const options: Record<string, Hierarchy<T>> = {}
    innerMap.forEach((hierarchy, innerKey) => (options[innerKey] = cleanNode(hierarchy)))
    valueSetOptions.push({
      id: outerKey,
      options
    })
  })
  return valueSetOptions
}

export const mapCacheToCodes = <T>(valueSets: CodesCache<T>[]): Codes<Hierarchy<T>> => {
  const codes: Codes<Hierarchy<T>> = new Map()
  valueSets.forEach((valueSet) => {
    const innerMap: Map<string, Hierarchy<T>> = new Map()
    Object.entries(valueSet.options).forEach(([key, hierarchy]) => innerMap.set(key, hierarchy))
    codes.set(valueSet.id, innerMap)
  })
  return codes
}

export const getHierarchyRootCodes = <T>(tree: Hierarchy<T, string>[]) => {
  let codes: Map<string, Hierarchy<T>> = new Map()
  for (const root of tree) {
    if (root.subItems) {
      codes = new Map([...codes, ...mapHierarchyToMap(root.subItems)])
      const unknownChapter = root.subItems.find((item) => item.id === UNKOWN_HIERARCHY_CHAPTER)
      if (unknownChapter && unknownChapter.subItems)
        codes = new Map([...codes, ...mapHierarchyToMap(unknownChapter.subItems)])
    }
  }
  return codes
}

export const cleanNode = <T>(node: Hierarchy<T, string>) => {
  return { ...node, subItems: undefined, status: undefined }
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

export const getMissingCodesWithSystems = async <T>(
  trees: Map<string, Hierarchy<T, string>[]>,
  groupBySystem: GroupedBySystem<T>[],
  codes: Codes<Hierarchy<T>>,
  fetchHandler: (ids: string, system: string) => Promise<Hierarchy<T, string>[]>
) => {
  const allCodes: Codes<Hierarchy<T>> = new Map(codes)
  for (const group of groupBySystem) {
    const tree = trees.get(group.system) || []
    const codesBySystem = codes.get(group.system) || new Map()
    const newCodes = await getMissingCodes(tree, codesBySystem, group.codes, group.system, Mode.SEARCH, fetchHandler)
    allCodes.set(group.system, newCodes)
  }
  return allCodes
}

export const getMissingCodes = async <T>(
  baseTree: Hierarchy<T, string>[],
  prevCodes: Map<string, Hierarchy<T, string>>,
  newCodes: Hierarchy<T, string>[],
  system: string,
  mode: Mode,
  fetchHandler: (ids: string, system: string) => Promise<Hierarchy<T, string>[]>
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
    const fetched = await fetchHandler(ids, system)
    allCodes = addAllFetchedIds(allCodes, fetched)
  }
  if (mode !== Mode.EXPAND) {
    const children = getInferiorLevels(above.map((key) => allCodes.get(key)!))
    missingIds = getMissingIds(allCodes, arrayToMap(children, null))
    if (missingIds.length) {
      const ids = missingIds.join(',')
      const childrenResponse = await fetchHandler(ids, system)
      allCodes = addAllFetchedIds(allCodes, childrenResponse)
    }
  }
  return allCodes
}

const getMissingNode = <T>(id: string, node: Hierarchy<T, string>, codes: Map<string, Hierarchy<T, string>>) => {
  const code = codes.get(id) ?? null
  if (!node) if (code) node = { ...code }
  return node
}

const getMissingSubItems = <T>(node: Hierarchy<T, string>, codes: Map<string, Hierarchy<T, string>>) => {
  const subItems: Hierarchy<T, string>[] = []
  const levels = node.inferior_levels_ids?.split(',') || []
  levels.forEach((key) => {
    const foundCode = codes.get(key)
    if (foundCode) subItems.push({ ...foundCode })
  })
  return subItems.length ? subItems : []
}

export const buildMultipleTrees = <T>(
  trees: Map<string, Hierarchy<T, string>[]>,
  groupBySystem: GroupedBySystem<T>[],
  codes: Codes<Hierarchy<T>>,
  selected: Codes<Hierarchy<T>>,
  mode: Mode
) => {
  for (const group of groupBySystem) {
    const tree = trees.get(group.system) || []
    const codesBySystem = codes.get(group.system) || new Map()
    const selectedBySystem = selected.get(group.system) || new Map()
    const newTree = buildTree([...tree], group.system, group.codes, codesBySystem, selectedBySystem, mode)
    trees.set(group.system, newTree)
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
  codes: Map<string, Hierarchy<T, string>>,
  selected: Map<string, Hierarchy<T, string>>,
  mode: Mode
) => {
  const buildBranch = <T>(
    node: Hierarchy<T, string>,
    system: string,
    path: [string, InfiniteMap],
    codes: Map<string, Hierarchy<T, string>>,
    selected: Map<string, Hierarchy<T, string>>,
    mode: Mode
  ) => {
    const [currentPath, nextPath] = path
    node = getMissingNode(currentPath, node, codes)
    if (nextPath.size) {
      if (!node.subItems) node.subItems = getMissingSubItems(node, codes)
      for (const [nextKey, nextValue] of nextPath) {
        const index = node.subItems.findIndex((elem) => elem.id === nextKey)
        if (index > -1) {
          const item = buildBranch(node.subItems[index], system, [nextKey, nextValue], codes, selected, mode)
          node.subItems[index] = item
        }
        node.status = getItemSelectedStatus(node)
      }
    } else {
      if (mode === Mode.EXPAND && !node.subItems) node.subItems = getMissingSubItems(node, codes)
      if (mode === Mode.SELECT) node.status = SelectedStatus.SELECTED
      if (mode === Mode.UNSELECT) node.status = SelectedStatus.NOT_SELECTED
      if (mode !== Mode.SEARCH && mode !== Mode.INIT) updateBranchStatus(node, node.status)
    }
    if ((mode === Mode.SEARCH || mode === Mode.INIT) && (selected.get(currentPath) || selected.get(HIERARCHY_ROOT))) {
      node.status = SelectedStatus.SELECTED
      updateBranchStatus(node, SelectedStatus.SELECTED)
    }
    return node
  }
  const paths = getPaths(baseTree, endCodes)
  let uniquePaths = getUniquePath(paths)
  if (mode === Mode.SELECT || mode === Mode.UNSELECT) uniquePaths = getPathsForSelection(uniquePaths, endCodes)
  if (mode === Mode.INIT) baseTree = []
  if (mode === Mode.SELECT_ALL) mode = Mode.SELECT
  if (mode === Mode.UNSELECT_ALL) mode = Mode.UNSELECT
  for (const [key, value] of uniquePaths) {
    const index = baseTree.findIndex((elem) => elem.id === key)
    const branch = buildBranch(baseTree[index] || null, system, [key, value], codes, selected, mode)
    if (branch && index > -1) baseTree[index] = branch
    else if (index === -1) baseTree.push(branch)
  }
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

export const getDisplayFromTree = <T>(toDisplay: Hierarchy<T>[], tree: Hierarchy<T>[]) => {
  let branches: Hierarchy<T, string>[] = []
  if (toDisplay.length && tree.length)
    branches = toDisplay.map((item) => {
      let path = item.above_levels_ids ? [...getAboveLevelsWithRights(item, tree), ...[item.id]] : [item.id]
      path = updateUnknownChapter(tree, path)
      return findBranch(path, tree)
    })
  return branches
}

export const getDisplayFromTrees = <T>(
  toDisplay: Hierarchy<T, string>[],
  trees: Map<string, Hierarchy<T, string>[]>
) => {
  const branches: Hierarchy<T, string>[] = []
  toDisplay.forEach((node) => {
    const currentTree = trees.get(node.system)
    if (currentTree) {
      const foundNode = getDisplayFromTree([node], currentTree)[0]
      branches.push(foundNode)
    }
  })
  return branches
}

const findBranch = <T>(path: string[], tree: Hierarchy<T, string>[]): Hierarchy<T, string> => {
  let branch: Hierarchy<T, string> = { id: `${path}-empty`, label: `ERROR | ${path}---------------` } as Hierarchy<
    T,
    string
  >
  const key = path[0]
  const index = tree.findIndex((item) => item.id === key)
  const next = tree[index]
  if (path.length === 1) {
    branch = next
  } else if (next && next.subItems) branch = findBranch(path.slice(1), next.subItems)
  return branch
}

const updateUnknownChapter = <T>(baseTree: Hierarchy<T, string>[], path: string[]) => {
  const unknownChapterFound = baseTree[0]?.subItems?.find((chapter) => chapter.id === UNKOWN_HIERARCHY_CHAPTER)
  const childrenIds = unknownChapterFound?.inferior_levels_ids.split(',') || []
  if (path?.[1] !== UNKOWN_HIERARCHY_CHAPTER && childrenIds.includes(path?.[1]))
    path.splice(1, 0, UNKOWN_HIERARCHY_CHAPTER)
  return path
}

const getPaths = <T>(baseTree: Hierarchy<T, string>[], endCodes: Hierarchy<T, string>[]) => {
  let paths = endCodes.map((item) =>
    item.above_levels_ids ? [...getAboveLevelsWithRights(item, baseTree), ...[item.id]] : [item.id]
  )
  paths = paths.map((path) => updateUnknownChapter(baseTree, path))
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

const getPathsForSelection = <T>(paths: InfiniteMap, endCodes: Hierarchy<T>[]): InfiniteMap => {
  const codesMap = mapHierarchyToMap(endCodes)
  for (const [key, values] of paths) {
    if (codesMap.get(key)) paths.set(key, new Map())
    else getPathsForSelection(values, endCodes)
  }
  return paths
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

export const getSelectedCodesFromTree = <T>(tree: Hierarchy<T, string>[]) => {
  const get = <T>(node: Hierarchy<T, string>, selectedCodes: Hierarchy<T>[]) => {
    if (node.status === SelectedStatus.INDETERMINATE || node.id === UNKOWN_HIERARCHY_CHAPTER)
      node.subItems?.forEach((subItem) => get(subItem, selectedCodes))
    if (node.status === SelectedStatus.SELECTED && node.id !== UNKOWN_HIERARCHY_CHAPTER) selectedCodes.push(node)
    return selectedCodes
  }
  const selectedCodes = mapHierarchyToMap(tree.flatMap((hierarchy) => get(hierarchy, [])))
  return selectedCodes
}

export const getSelectedCodesFromTrees = <T>(
  trees: Map<string, Hierarchy<T>[]>,
  prevCodes: Codes<T>,
  system?: string
) => {
  const selectedCodes: Codes<Hierarchy<T>> = new Map()
  trees.forEach((tree, key) => {
    const isFound = prevCodes.get(key)
    if (system !== key && isFound && isFound.get(HIERARCHY_ROOT)) selectedCodes.set(key, isFound)
    else selectedCodes.set(key, getSelectedCodesFromTree(tree))
  })
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
    return [...getAboveLevelsWithRights(item, baseTree)].filter(
      (level) => level && level !== 'null' && level !== 'undefined'
    )
  })
}

const getInferiorLevels = <T>(hierarchy: Hierarchy<T, string>[]) => {
  return hierarchy.flatMap((item) =>
    (item?.inferior_levels_ids || '').split(',').filter((level) => level && level !== 'null' && level !== 'undefined')
  )
}

export const createHierarchyRoot = (system: string, status?: SelectedStatus) => {
  return {
    id: HIERARCHY_ROOT,
    label: 'Toute la hiérarchie',
    above_levels_ids: '',
    inferior_levels_ids: '',
    system,
    status
  }
}
