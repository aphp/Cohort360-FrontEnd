import { SelectedStatus } from 'types'
import { Hierarchy } from 'types/hierarchy'

export const getItemSelectedStatus = <T, S>(item: Hierarchy<T, S>): SelectedStatus => {
  if (item.subItems?.length === 0) return item.status ? SelectedStatus.SELECTED : SelectedStatus.NOT_SELECTED
  if (item.subItems?.every((item) => item.status === SelectedStatus.SELECTED)) return SelectedStatus.SELECTED
  if (item.subItems?.every((item) => item.status === SelectedStatus.NOT_SELECTED)) return SelectedStatus.NOT_SELECTED
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
