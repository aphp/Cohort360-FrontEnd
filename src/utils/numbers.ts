export const format = (nb: number | null | undefined) => {
  if (nb === null || nb === undefined) return '-'
  return nb.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export const displayCount = (criteriaCount: number) => {
  if (criteriaCount < 1000) {
    return criteriaCount.toString() // Normal values (less than 1,000)
  } else if (criteriaCount < 1000000) {
    return `~${Math.round(criteriaCount / 1000)}k` // Thousands
  } else if (criteriaCount < 1000000000) {
    return `~${Math.round(criteriaCount / 1000000)}M` // Millions
  } else if (criteriaCount < 1000000000000) {
    return `~${Math.round(criteriaCount / 1000000000)}B` // Billions
  }
  return `~${Math.round(criteriaCount / 1000000000000)}T` // Trillions
}
