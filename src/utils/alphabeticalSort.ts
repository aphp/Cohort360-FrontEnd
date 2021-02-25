export const codeSort = (a: any, b: any) => {
  if (a.code < b.code) {
    return -1
  }
  if (a.code > b.code) {
    return 1
  }
  return 0
}

export const displaySort = (a: any, b: any) => {
  if (a.display < b.display) {
    return -1
  }
  if (a.display > b.display) {
    return 1
  }
  return 0
}
