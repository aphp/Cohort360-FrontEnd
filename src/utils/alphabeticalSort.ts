import moment from 'moment'

export const codeSort = (a: any, b: any): number => {
  if (a.code < b.code) {
    return -1
  }
  if (a.code > b.code) {
    return 1
  }
  return 0
}

export const displaySort = (a: any, b: any): number => {
  if (a.display < b.display) {
    return -1
  }
  if (a.display > b.display) {
    return 1
  }
  return 0
}

export const targetDisplaySort = (a: any, b: any): number => {
  if (a.target?.[0].display < b.target?.[0].display) {
    return -1
  }
  if (a.target?.[0].display > b.target?.[0].display) {
    return 1
  }
  return 0
}

export const descendingComparator = (a: any, b: any, orderBy: any): number => {
  const dateA = moment(new Date(a[orderBy]))
  const dateB = moment(new Date(b[orderBy]))

  if (dateA.isValid() && dateB.isValid()) {
    return dateA.isSameOrBefore(dateB) ? -1 : 1
  }
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

export const getComparator = (order: any, orderBy: any): ((a: any, b: any) => number) => {
  return order === 'desc'
    ? (a: any, b: any): number => descendingComparator(a, b, orderBy)
    : (a: any, b: any): number => -descendingComparator(a, b, orderBy)
}

export const stableSort = (array: any[], comparator: any): any[] => {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}
