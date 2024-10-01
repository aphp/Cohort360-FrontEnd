export const format = (nb: number | null | undefined) => {
  if (nb === null || nb === undefined) return '-'
  return nb.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
