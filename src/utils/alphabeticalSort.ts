/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from 'moment'
import { Direction } from 'types/searchCriterias'

export const descendingComparator = (a: any, b: any, orderBy: string | ((obj: any) => any)): number => {
  const fieldExtractor =
    typeof orderBy === 'string' || orderBy instanceof String ? (obj: any) => obj[orderBy as string] : orderBy
  const dateA = moment(new Date(fieldExtractor(a)))
  const dateB = moment(new Date(fieldExtractor(b)))

  if (dateA.isValid() && dateB.isValid()) {
    return dateA.isSameOrBefore(dateB) ? -1 : 1
  }
  if (fieldExtractor(b) < fieldExtractor(a)) {
    return -1
  }
  if (fieldExtractor(b) > fieldExtractor(a)) {
    return 1
  }
  return 0
}

export const getComparator = (
  order: Direction,
  orderBy: string | ((obj: any) => any)
): ((a: any, b: any) => number) => {
  return order === Direction.DESC
    ? (a: any, b: any): number => descendingComparator(a, b, orderBy)
    : (a: any, b: any): number => -descendingComparator(a, b, orderBy)
}

export const displaySort = getComparator(Direction.DESC, (obj: any) => obj.display)

export const idSort = getComparator(Direction.ASC, (obj: any) => obj.id)

export const labelSort = getComparator(Direction.ASC, (obj: any) => obj.label)

export const stableSort = (array: any[], comparator: any): any[] => {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}
