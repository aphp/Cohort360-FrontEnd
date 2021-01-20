export const alphabeticalSort = (a: any, b: any) => {
  if (a.code < b.code) {
    return -1
  }
  if (a.code > b.code) {
    return 1
  }
  return 0
}
